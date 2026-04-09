import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { gatherAIContext } from "@/lib/ai-context";
import { buildSystemPrompt } from "@/lib/ai-system-prompt";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let message: string;
  let pageContext: string | undefined;
  try {
    const body = await request.json();
    message = body.message;
    pageContext = body.pageContext;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const liveContext = await gatherAIContext();
  const systemPrompt = buildSystemPrompt(liveContext, pageContext);

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: message }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Make sure the SDK has finalized; surfaces any late errors.
        await anthropicStream.finalMessage();
      } catch (err) {
        console.error("AI stream error:", err);
        const msg =
          err instanceof Anthropic.APIError
            ? `Anthropic API error (${err.status}): ${err.message}`
            : "An unexpected error occurred while contacting the AI service.";
        controller.enqueue(encoder.encode(`\n\n[${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
