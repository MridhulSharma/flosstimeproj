import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gatherAIContext } from "@/lib/ai-context";
import { generateAIResponse } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const context = await gatherAIContext();
    const fullResponse = generateAIResponse(message, context);

    // Stream the response token-by-token (word chunks) so the UI can render
    // the typing/cursor states described in the spec.
    const encoder = new TextEncoder();
    const tokens = fullResponse.match(/\S+\s*|\s+/g) ?? [fullResponse];

    const stream = new ReadableStream({
      async start(controller) {
        // Small initial latency so the "thinking dots" state is visible.
        await new Promise((r) => setTimeout(r, 250));
        for (const token of tokens) {
          controller.enqueue(encoder.encode(token));
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
