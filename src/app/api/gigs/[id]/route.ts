import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gig = await prisma.campusGig.findUnique({
      where: { id },
      include: {
        applications: true,
        submissions: true,
        ratings: true,
        transactions: true,
      },
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    return NextResponse.json({ gig });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch gig details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    const existing = await prisma.campusGig.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // Role check: Only ADMIN or the original poster can update status
    if (user.role !== "ADMIN" && existing.postedById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.campusGig.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || undefined,
      },
    });

    return NextResponse.json({ success: true, gig: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update gig" },
      { status: 500 }
    );
  }
}
