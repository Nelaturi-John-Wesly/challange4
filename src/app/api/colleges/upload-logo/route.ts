import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Maximum 2MB file limit
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Verify user is ADMIN or FACULTY or authorized lead
    if (user.role !== "ADMIN" && user.role !== "FACULTY") {
      return NextResponse.json(
        { error: "Only College Administrators or Faculty can upload the institutional logo." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { collegeId, dataUrl, mimeType, sizeBytes } = body;

    if (!collegeId) {
      return NextResponse.json({ error: "College ID is required." }, { status: 400 });
    }

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Please provide a valid image file." }, { status: 400 });
    }

    if (sizeBytes && sizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file size exceeds the 2 MB limit." },
        { status: 400 }
      );
    }

    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: JPG, PNG, WebP, SVG." },
        { status: 400 }
      );
    }

    // Save directly to college.logoUrl in SQLite database
    const updatedCollege = await prisma.college.update({
      where: { id: collegeId },
      data: {
        logoUrl: dataUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Official college emblem updated successfully!",
      college: updatedCollege,
    });
  } catch (err: any) {
    console.error("Upload college logo error:", err);
    return NextResponse.json(
      { error: "Failed to upload official college emblem.", details: err?.message },
      { status: 500 }
    );
  }
}
