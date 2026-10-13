import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const assignments = await prisma.assignment.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: true,
        faculty: { include: { user: true } },
        submissions: {
          include: { student: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ assignments });
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
    const description = formData.get("description") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const maxMarks = parseInt((formData.get("maxMarks") as string) || "100", 10);
    const file = formData.get("file") as File | null;

    if (!courseId || !title || !description || !dueDateStr) {
      return NextResponse.json(
        { error: "courseId, title, description, and dueDate are required." },
        { status: 400 }
      );
    }

    let attachmentUrl = null;
    if (file && typeof file.arrayBuffer === "function") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await storage.uploadFile(buffer, file.name, "assignments_spec");
      attachmentUrl = upload.url;
    }

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: user.id },
    });
    const facultyId = faculty?.id || (await prisma.facultyProfile.findFirst())!.id;

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        facultyId,
        title,
        description,
        attachmentUrl,
        dueDate: new Date(dueDateStr),
        maxMarks,
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
