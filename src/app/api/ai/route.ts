import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response:
          `[AI is not configured yet]\n\nTo enable the AI assistant, add your ANTHROPIC_API_KEY to your environment variables.\n\nYour prompt: "${prompt}"`,
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system:
          "You are the AI assistant for Lace by La Luz, a luxury veil brand with a buy-one-give-one mission. You help write product descriptions, social media posts, customer emails, and marketing copy. Keep the tone warm, elegant, faith-inspired, and empowering. The brand voice is sacred femininity meets luxury — think Victoria's Secret elegance for church women who want to feel beautiful and purposeful. Products are handcrafted Bali lace veils priced around $49-58. Every purchase gifts a veil to a sister in need at a church community.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Claude API error:", errorData);
      return NextResponse.json(
        { error: "AI request failed. Check your API key." },
        { status: 500 }
      );
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "No response generated.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "AI assistant is temporarily unavailable." },
      { status: 500 }
    );
  }
}
