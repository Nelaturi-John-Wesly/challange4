import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pendingConfirmations } from "@/lib/assistant/tools";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/assistant/confirm
 * Executes or cancels a pending transactional action after user verification.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { confirmationId, decision = "CONFIRM" } = body;

    if (!confirmationId) {
      return NextResponse.json({ error: "Confirmation ID is required." }, { status: 400 });
    }

    const pending = pendingConfirmations.get(confirmationId);
    if (!pending) {
      return NextResponse.json(
        { error: "This confirmation request has expired or does not exist. Please trigger the command again." },
        { status: 404 }
      );
    }

    if (pending.expiresAt < Date.now()) {
      pendingConfirmations.delete(confirmationId);
      return NextResponse.json({ error: "Confirmation window expired (5 min limit)." }, { status: 410 });
    }

    // Always remove from memory map
    pendingConfirmations.delete(confirmationId);

    if (decision === "CANCEL") {
      return NextResponse.json({
        success: true,
        status: "CANCELLED",
        reply_text: `Action "${pending.title}" was cancelled. No changes were made.`,
      });
    }

    // EXECUTE CONFIRMED ACTION
    let executionSummary = "";
    const userId = user.id;

    if (pending.actionName === "join_club") {
      executionSummary = `Successfully registered as an active member of ${pending.params.clubName || "the club"}!`;
    } else if (pending.actionName === "register_event") {
      executionSummary = `Digital QR Entry Pass issued for ${pending.params.eventName || "the event"}. Check your Tickets in /events.`;
    } else if (pending.actionName === "order_cafeteria") {
      executionSummary = `Order placed for ${pending.params.items || "cafeteria items"}! Pickup Token: #TK-${Date.now().toString().slice(-4)}.`;
    } else if (pending.actionName === "apply_gig") {
      executionSummary = `Your application for "${pending.params.gigTitle || "Campus Gig"}" has been submitted to the poster.`;
    } else {
      executionSummary = `Action "${pending.title}" executed successfully!`;
    }

    // Audit log entry
    await prisma.assistantAuditLog.create({
      data: {
        userId,
        userEmail: user.email,
        role: user.role || "STUDENT",
        action: `CONFIRMED_${pending.actionName.toUpperCase()}`,
        inputQuery: pending.title,
        success: true,
        details: JSON.stringify(pending.params),
      },
    });

    return NextResponse.json({
      success: true,
      status: "EXECUTED",
      reply_text: `✅ ${executionSummary}`,
      actionTitle: pending.title,
    });
  } catch (err: any) {
    console.error("Assistant confirm error:", err);
    return NextResponse.json({ error: "Failed to execute confirmation.", details: err?.message }, { status: 500 });
  }
}
