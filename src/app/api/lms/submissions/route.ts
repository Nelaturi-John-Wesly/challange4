import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit assignments." }, { status: 403 });
    }

    const formData = await request.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const notes = (formData.get("notes") as string) || "";
    const file = formData.get("file") as File | null;

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required." }, { status: 400 });
    }

    let fileUrl = "/uploads/sample_submission.zip";
    if (file && typeof file.arrayBuffer === "function") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await storage.uploadFile(buffer, file.name, "student_submissions");
      fileUrl = upload.url;
    }

    // Check assignment due date to set LATE status
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    const isLate = assignment && new Date() > assignment.dueDate;

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
      update: {
        fileUrl,
        notes,
        submittedAt: new Date(),
        status: isLate ? "LATE" : "SUBMITTED",
      },
      create: {
        assignmentId,
        studentId: user.id,
        fileUrl,
        notes,
        status: isLate ? "LATE" : "SUBMITTED",
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["FACULTY", "ADMIN"]);
    const body = await request.json();
    const { submissionId, marks, feedback } = body;

    if (!submissionId || marks === undefined) {
      return NextResponse.json({ error: "submissionId and marks are required." }, { status: 400 });
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: parseFloat(marks),
        feedback: feedback || null,
        status: "GRADED",
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
