import { describe, expect, it } from "vitest";
import {
  type ActorPolicy,
  MOM_DEFAULT_POLICY,
  STAFF_DEFAULT_POLICY,
  routeToolCall,
} from "./router";

const OWNER_LOOSE: ActorPolicy = {
  role: "owner",
  confirm_money_actions: false,
  confirm_destructive: false,
  auto_approve_money_limit_cents: 2500,
};

const VIEWER: ActorPolicy = {
  role: "viewer",
  confirm_money_actions: true,
  confirm_destructive: true,
};

describe("routeToolCall", () => {
  it("denies unknown tools", () => {
    const d = routeToolCall("not_a_tool", {}, MOM_DEFAULT_POLICY);
    expect(d.kind).toBe("deny");
  });

  it("always executes readonly tools, even for viewers", () => {
    expect(routeToolCall("list_orders", {}, VIEWER).kind).toBe("execute_now");
    expect(routeToolCall("list_orders", {}, MOM_DEFAULT_POLICY).kind).toBe(
      "execute_now",
    );
  });

  it("denies viewers from any mutation", () => {
    const d = routeToolCall("refund_order", { amount_cents: 100 }, VIEWER);
    expect(d.kind).toBe("deny");
  });

  it("gates destructive tools regardless of policy", () => {
    const d = routeToolCall(
      "archive_product",
      { product_id: "abc" },
      OWNER_LOOSE,
    );
    expect(d.kind).toBe("require_approval");
    if (d.kind === "require_approval") expect(d.risk).toBe("destructive");
  });

  it("gates money tools by default", () => {
    const d = routeToolCall(
      "refund_order",
      { order_id: "o", amount_cents: 1000 },
      MOM_DEFAULT_POLICY,
    );
    expect(d.kind).toBe("require_approval");
    if (d.kind === "require_approval") expect(d.risk).toBe("money");
  });

  it("auto-approves money under cap when owner opts out", () => {
    const d = routeToolCall(
      "refund_order",
      { order_id: "o", amount_cents: 2000 },
      OWNER_LOOSE,
    );
    expect(d.kind).toBe("execute_now");
  });

  it("still gates money over cap even when owner opts out", () => {
    const d = routeToolCall(
      "refund_order",
      { order_id: "o", amount_cents: 9000 },
      OWNER_LOOSE,
    );
    expect(d.kind).toBe("require_approval");
  });

  it("gates money when amount is not knowable from input", () => {
    // refund_order without amount_cents = unknown amount = must gate
    const d = routeToolCall("refund_order", { order_id: "o" }, OWNER_LOOSE);
    expect(d.kind).toBe("require_approval");
  });

  it("staff default: normal edits auto-approve, money still gates", () => {
    const moneyCall = routeToolCall(
      "refund_order",
      { order_id: "o", amount_cents: 100 },
      STAFF_DEFAULT_POLICY,
    );
    expect(moneyCall.kind).toBe("require_approval");
  });
});
