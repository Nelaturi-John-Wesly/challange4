import { executeGlobalSearch } from "@/lib/assistant/search";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=
 * Global multi-module semantic search endpoint.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const results = await executeGlobalSearch(query);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Global search API error:", err);
    return NextResponse.json({ error: "Failed to execute global search", details: err?.message }, { status: 500 });
  }
}
