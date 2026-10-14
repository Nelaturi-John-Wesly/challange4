import { checkRateLimit, processAssistantQuery } from "@/lib/assistant/llm";
import { AssistantContext } from "@/lib/assistant/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/demo/assistant
 * Public, rate-limited sandbox assistant endpoint for unauthenticated evaluation.
 * Safe, read-only mock data. Never writes to DB or touches real student data.
 */
export async function POST(req: Request) {
  try {
    const isDemoEnabled = process.env.DEMO_MODE_ENABLED !== "false";
    if (!isDemoEnabled) {
      return NextResponse.json({ error: "Demo mode is disabled in production." }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anon-client";
    if (!checkRateLimit(`demo_${ip}`, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: "Demo sandbox rate limit reached. Please wait a moment before trying another command." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { text, language = "en-IN" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Query text is required." }, { status: 400 });
    }

    const context: AssistantContext = {
      userName: "Demo Visitor",
      userRole: "STUDENT",
      departmentCode: "CSE",
      language,
      isSandbox: true,
    };

    const response = await processAssistantQuery(text, context);

    return NextResponse.json({
      success: true,
      sandbox: true,
      reply_text: response.replyText,
      language: response.language,
      understood_query: response.understoodQuery,
      actions: response.actions,
      results: response.results,
      needs_confirmation: null, // Sandbox actions never trigger real mutations
      notice: "Demo sandbox data only. Sign in to CampusConnect to access your actual student records.",
    });
  } catch (err: any) {
    console.error("Demo assistant error:", err);
    return NextResponse.json({ error: "Failed to process sandbox query.", details: err?.message }, { status: 500 });
  }
}
