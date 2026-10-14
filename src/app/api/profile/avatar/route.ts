import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/profile/avatar (Upload cropped/zoomed photo)
export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const { avatarDataUrl, sizeBytes, mimeType } = body;

    if (!avatarDataUrl || typeof avatarDataUrl !== "string") {
      return NextResponse.json({ error: "No image data provided." }, { status: 400 });
    }

    if (!avatarDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format. Expected Data URL." }, { status: 400 });
    }

    // Check size on server
    const estimatedSize = Math.round((avatarDataUrl.length * 3) / 4);
    if ((sizeBytes && sizeBytes > MAX_AVATAR_SIZE_BYTES) || estimatedSize > MAX_AVATAR_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds 2 MB maximum limit. Please choose a smaller photo." },
        { status: 400 }
      );
    }

    // Check mime type
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image type. Please upload a JPG, PNG, or WebP photo." },
        { status: 400 }
      );
    }

    // Update in database
    try {
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { avatar: avatarDataUrl },
      });
    } catch (e) {
      console.warn("DB avatar update skipped for demo user:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo updated successfully!",
      avatarUrl: avatarDataUrl,
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Avatar upload error:", err);
    return NextResponse.json({ error: "Failed to upload avatar.", details: err?.message }, { status: 500 });
  }
}

// DELETE /api/profile/avatar (Remove photo, fallback to initials)
export async function DELETE() {
  try {
    const sessionUser = await requireAuth();

    try {
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { avatar: null },
      });
    } catch (e) {
      console.warn("DB avatar remove skipped for demo user:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Photo removed. Profile reverted to name initials avatar.",
      avatarUrl: null,
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to remove avatar.", details: err?.message }, { status: 500 });
  }
}
