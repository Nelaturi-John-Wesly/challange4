import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, processAssistantQuery } from "@/lib/assistant/llm";
import { AssistantContext } from "@/lib/assistant/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/assistant/message
 * Authenticated conversational query endpoint.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to access Campus AI." }, { status: 401 });
    }

    const body = await req.json();
    const { text, language = "en-IN", current_page = "/dashboard" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Valid text query is required." }, { status: 400 });
    }

    const userId = user.id;
    const rateLimitKey = `user_${userId}`;
    if (!checkRateLimit(rateLimitKey, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many voice/text queries. Please wait a moment before sending another command." },
        { status: 429 }
      );
    }

    const context: AssistantContext = {
      userId,
      userEmail: user.email || undefined,
      userName: user.name || "Student",
      userRole: user.role || "STUDENT",
      currentPage: current_page,
      language,
      isSandbox: false,
    };

    const response = await processAssistantQuery(text, context);

    return NextResponse.json({
      success: true,
      reply_text: response.replyText,
      language: response.language,
      understood_query: response.understoodQuery,
      actions: response.actions,
      results: response.results,
      needs_confirmation: response.needsConfirmation,
      provider: response.providerUsed,
    });
  } catch (err: any) {
    console.error("Assistant message error:", err);
    return NextResponse.json({ error: "Failed to process assistant request.", details: err?.message }, { status: 500 });
  }
}
