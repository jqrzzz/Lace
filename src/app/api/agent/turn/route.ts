// ─────────────────────────────────────────────────────────────
// POST /api/agent/turn
//
// One turn of the agent loop:
//
//   1. Receive { sessionId, userText, actor }
//   2. Append the user message to the store
//   3. Call Claude with the full tool catalog + prior turns
//   4. For each tool call Claude returns:
//        - router decides: execute_now | require_approval | deny
//        - readonly tools run via executeReadonly() and feed
//          results back to Claude for a follow-up turn
//        - mutation tools write an approval row and short-circuit
//          (we tell Claude "approval pending" and stop)
//   5. Append the final assistant message(s) and return them.
//
// If ANTHROPIC_API_KEY is missing we fall back to a canned demo
// reply so the UI stays functional in zero-config dev.
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { ALL_TOOLS, getTool, toolsForClaude } from "@/lib/agent/tools";
import { routeToolCall, MOM_DEFAULT_POLICY } from "@/lib/agent/router";
import { buildSystemPrompt } from "@/lib/agent/knowledge";
import { getDemoReply } from "@/lib/agent/demo-replies";
import { humanSummary } from "@/lib/agent/format";
import { fail, ok } from "@/lib/api";
import {
  appendMessage,
  createApproval,
  listMessagesStore,
} from "@/lib/agent/store";
import {
  actorLabel as buildActorLabel,
  getAdminActor,
} from "@/lib/admin-auth";
import type { AgentMessage } from "@/lib/lace/types";
import {
  getOrder,
  getTodayBriefing,
  listCustomers,
  listInbox,
  listMissionRecipients,
  listOrders,
} from "@/lib/lace/queries";

// Claude API types we care about (trimmed).
interface ClaudeContentBlock {
  type: "text" | "tool_use";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface ClaudeResponse {
  content: ClaudeContentBlock[];
  stop_reason: string;
}

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const MAX_TOOL_HOPS = 4;

export async function POST(req: NextRequest) {
  try {
    const actor = await getAdminActor(req);
    if (!actor) return fail("Not signed in.", { status: 401 });
    const body = await req.json();
    const sessionId: string = body.sessionId;
    const userText: string = body.userText;
    const actorLabel: string = buildActorLabel(actor);
    if (!sessionId || !userText) {
      return fail("sessionId and userText are required.", { status: 400 });
    }

    const priorMessages = await listMessagesStore(sessionId);
    const turn = (priorMessages.at(-1)?.turn ?? 0) + 1;
    await appendMessage({
      session_id: sessionId,
      turn,
      role: "user",
      content: userText,
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const msg = await appendMessage({
        session_id: sessionId,
        turn: turn + 1,
        role: "assistant",
        content: getDemoReply("agent", userText),
        tool_name: null,
        tool_input: null,
        tool_output: null,
        approval_id: null,
      });
      return ok({ messages: [msg] }, { mode: "demo" });
    }

    // Real Claude call with tool use.
    const system = buildSystemPrompt({
      actorLabel,
      channel: "console",
      today: new Date().toISOString().slice(0, 10),
    });

    // Build the Claude message history from our stored turns.
    const history: Array<{ role: "user" | "assistant"; content: unknown }> = (
      await listMessagesStore(sessionId)
    ).map(claudeMessageFromTurn);

    const newMessages: AgentMessage[] = [];
    let nextTurn = turn + 1;

    // Tool-use loop. We hop up to MAX_TOOL_HOPS times to let Claude
    // chain read tools (e.g. list_orders → get_order).
    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const resp = await callClaude(apiKey, {
        system,
        messages: history,
        tools: toolsForClaude(),
      });

      // Separate text vs tool_use blocks.
      const textBlocks = resp.content.filter((b) => b.type === "text");
      const toolBlocks = resp.content.filter((b) => b.type === "tool_use");

      // Any text the model emitted becomes an assistant message.
      const textContent = textBlocks
        .map((b) => b.text ?? "")
        .join("\n")
        .trim();

      if (toolBlocks.length === 0) {
        // Pure text reply — append and exit.
        if (textContent) {
          newMessages.push(
            await appendMessage({
              session_id: sessionId,
              turn: nextTurn++,
              role: "assistant",
              content: textContent,
              tool_name: null,
              tool_input: null,
              tool_output: null,
              approval_id: null,
            })
          );
        }
        break;
      }

      // Persist the assistant turn that issued the tool calls.
      // We save the FIRST tool call's metadata on the message so the
      // UI can render the "called tool_name" chip; subsequent tool
      // calls in the same block each get their own placeholder row.
      // Simpler for now: one message per tool call.
      const history_assistant_content: ClaudeContentBlock[] = [
        ...(textContent ? [{ type: "text" as const, text: textContent }] : []),
        ...toolBlocks,
      ];
      history.push({ role: "assistant", content: history_assistant_content });

      // Run each tool through the router.
      const toolResults: {
        type: "tool_result";
        tool_use_id: string;
        content: string;
        is_error?: boolean;
      }[] = [];
      let approvalShortCircuit = false;

      for (const tb of toolBlocks) {
        const name = tb.name ?? "";
        const input = tb.input ?? {};
        const tool = getTool(name);
        const decision = routeToolCall(name, input, MOM_DEFAULT_POLICY);

        if (decision.kind === "deny" || !tool) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tb.id ?? "",
            content: `Tool denied: ${decision.kind === "deny" ? decision.reason : "unknown tool"}`,
            is_error: true,
          });
          continue;
        }

        if (decision.kind === "execute_now") {
          const result = await executeReadonly(name, input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tb.id ?? "",
            content: JSON.stringify(result).slice(0, 4000),
          });
          newMessages.push(
            await appendMessage({
              session_id: sessionId,
              turn: nextTurn++,
              role: "tool",
              content: null,
              tool_name: name,
              tool_input: input,
              tool_output: result as Record<string, unknown>,
              approval_id: null,
            })
          );
          continue;
        }

        // require_approval → write pending row, stop the loop.
        const summary = humanSummary(tool, input);
        const approval = await createApproval({
          session_id: sessionId,
          action_type: name,
          action_payload: input,
          human_summary: summary,
          risk: decision.risk,
          requested_by_label: "Agent",
        });

        newMessages.push(
          await appendMessage({
            session_id: sessionId,
            turn: nextTurn++,
            role: "assistant",
            content:
              textContent ||
              `I'd like to ${summary.toLowerCase()} Waiting on your approval — tap the card in Approvals when you're ready.`,
            tool_name: name,
            tool_input: input,
            tool_output: null,
            approval_id: approval.id,
          })
        );

        approvalShortCircuit = true;
        break;
      }

      if (approvalShortCircuit) break;

      history.push({ role: "user", content: toolResults });
    }

    return ok({ messages: newMessages }, { mode: "live" });
  } catch (error) {
    console.error("Agent turn error:", error);
    return fail("Agent turn failed.");
  }
}

// ── Helpers ────────────────────────────────────────────────────

async function callClaude(
  apiKey: string,
  opts: {
    system: string;
    messages: unknown[];
    tools: unknown[];
  }
): Promise<ClaudeResponse> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: opts.system,
      tools: opts.tools,
      messages: opts.messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude ${res.status}: ${text.slice(0, 400)}`);
  }
  return (await res.json()) as ClaudeResponse;
}

/** Translate one of our stored AgentMessage rows into a Claude message. */
function claudeMessageFromTurn(m: AgentMessage) {
  if (m.role === "user") {
    return { role: "user" as const, content: m.content ?? "" };
  }
  if (m.role === "assistant") {
    if (m.tool_name && m.tool_input) {
      return {
        role: "assistant" as const,
        content: [
          ...(m.content ? [{ type: "text" as const, text: m.content }] : []),
          {
            type: "tool_use" as const,
            id: m.id,
            name: m.tool_name,
            input: m.tool_input,
          },
        ],
      };
    }
    return { role: "assistant" as const, content: m.content ?? "" };
  }
  if (m.role === "tool") {
    return {
      role: "user" as const,
      content: [
        {
          type: "tool_result" as const,
          tool_use_id: m.id,
          content: JSON.stringify(m.tool_output ?? {}).slice(0, 4000),
        },
      ],
    };
  }
  return { role: "user" as const, content: m.content ?? "" };
}

/**
 * Runs a readonly tool. Everything here is safe — if it mutates state,
 * it belongs in the approval gate, not this function.
 */
async function executeReadonly(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "list_orders":
      return listOrders({
        status: input.status as never,
        limit: (input.limit as number) ?? 10,
      });
    case "get_order":
      return getOrder(String(input.order_number));
    case "list_customers":
      return listCustomers({
        search: input.search as string | undefined,
        limit: (input.limit as number) ?? 10,
      });
    case "list_inbox":
      return listInbox(input.status as never);
    case "list_mission_recipients":
      return listMissionRecipients();
    case "briefing_today":
      return getTodayBriefing();
    default:
      return { error: `No executor for ${name}` };
  }
}

// ALL_TOOLS is referenced to keep bundler from tree-shaking the catalog.
void ALL_TOOLS;
