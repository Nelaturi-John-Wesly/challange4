import { getCurrentUser } from "@/lib/auth";
import { containsProhibitedFeeKeywords } from "@/lib/gigs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (category && category !== "All") {
      whereClause.category = category;
    }
    if (status) {
      whereClause.status = status;
    }

    const gigs = await prisma.campusGig.findMany({
      where: whereClause,
      include: {
        applications: true,
        submissions: true,
        ratings: true,
        transactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ gigs });
  } catch (error: any) {
    console.error("Failed to fetch gigs from Prisma:", error);
    return NextResponse.json(
      { error: "Failed to fetch gigs", fallback: true },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category = "OTHER",
      rewardType = "CASH",
      rewardAmount,
      rewardDescription,
      numberOfSlots = 1,
      deadline,
      estimatedHours = 5.0,
      location = "ON_CAMPUS",
      locationDetails,
      requiredSkills = [],
    } = body;

    if (!title || !description || !rewardDescription || !deadline) {
      return NextResponse.json(
        { error: "Missing required gig fields." },
        { status: 400 }
      );
    }

    // Anti-scam fee verification
    if (containsProhibitedFeeKeywords(`${title} ${description}`)) {
      return NextResponse.json(
        { error: "Prohibited: Gigs requesting student payment or registration fees are forbidden." },
        { status: 400 }
      );
    }

    const requiresApproval = user.role === "STUDENT";
    const status = requiresApproval ? "PENDING_APPROVAL" : "OPEN";

    const newGig = await prisma.campusGig.create({
      data: {
        title,
        description,
        category,
        postedById: user.id,
        posterName: user.name,
        posterRole: user.role,
        posterDepartment: user.departmentCode || "CAMPUS",
        posterVerified: user.role !== "STUDENT",
        rewardType,
        rewardAmount: rewardAmount ? parseFloat(rewardAmount) : null,
        rewardDescription,
        numberOfSlots: parseInt(numberOfSlots, 10),
        deadline: new Date(deadline),
        estimatedHours: parseFloat(estimatedHours),
        location,
        locationDetails,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.join(", ") : requiredSkills,
        status,
      },
    });

    return NextResponse.json({ success: true, gig: newGig });
  } catch (error: any) {
    console.error("Failed to create gig:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create gig" },
      { status: 500 }
    );
  }
}
