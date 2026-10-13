import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const materials = await prisma.courseMaterial.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["FACULTY", "ADMIN"]);
    const formData = await request.formData();

    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const file = formData.get("file") as File | null;

    if (!courseId || !title) {
      return NextResponse.json(
        { error: "courseId and title are required." },
        { status: 400 }
      );
    }

    let fileUrl = "/uploads/sample_material.pdf";
    let fileType = "pdf";

    if (file && typeof file.arrayBuffer === "function") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await storage.uploadFile(buffer, file.name, "course_materials");
      fileUrl = upload.url;
      fileType = file.name.split(".").pop() || "pdf";
    }

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: user.id },
    });
    const facultyId = faculty?.id || (await prisma.facultyProfile.findFirst())!.id;

    const material = await prisma.courseMaterial.create({
      data: {
        courseId,
        facultyId,
        title,
        description,
        fileUrl,
        fileType,
      },
      include: { course: true },
    });

    return NextResponse.json({ success: true, material });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
