import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const markAttendanceSchema = z.object({
  courseId: z.string().min(1),
  date: z.string(), // ISO date or "YYYY-MM-DD"
  section: z.string().default("A"),
  semester: z.number().default(5),
  topic: z.string().optional(),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      remarks: z.string().optional(),
    })
  ),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const section = searchParams.get("section") || "A";
    const dateParam = searchParams.get("date");

    // If student, return their personal attendance summary
    if (user.role === "STUDENT") {
      const enrollments = await prisma.subjectEnrollment.findMany({
        where: { studentId: user.id },
        include: {
          course: {
            include: {
              attendanceSessions: {
                include: {
                  records: {
                    where: { studentId: user.id },
                  },
                },
                orderBy: { date: "desc" },
              },
            },
          },
        },
      });

      const summary = enrollments.map((e) => {
        let total = 0;
        let attended = 0;
        const history: { date: Date; topic: string | null; status: string }[] = [];

        e.course.attendanceSessions.forEach((s) => {
          if (s.records.length > 0) {
            total++;
            const status = s.records[0].status;
            if (status === "PRESENT") attended++;
            history.push({
              date: s.date,
              topic: s.topic,
              status,
            });
          }
        });

        const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
        // Calculation: how many consecutive classes needed to reach 75%
        // (attended + x) / (total + x) >= 0.75 => x >= (0.75 * total - attended) / 0.25 = 3*total - 4*attended
        let classesNeededToCatchUp = 0;
        if (percentage < 75) {
          classesNeededToCatchUp = Math.max(0, Math.ceil(3 * total - 4 * attended));
        }

        return {
          courseId: e.course.id,
          code: e.course.code,
          name: e.course.name,
          credits: e.course.credits,
          total,
          attended,
          percentage,
          isAtRisk: percentage < 75,
          classesNeededToCatchUp,
          recentHistory: history.slice(0, 5),
        };
      });

      return NextResponse.json({ summary });
    }

    // If faculty/admin, return students list for the selected course and date
    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required for faculty inspection." },
        { status: 400 }
      );
    }

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentProfile: { section },
        enrollments: { some: { courseId } },
      },
      include: { studentProfile: true },
      orderBy: { name: "asc" },
    });

    // Check if an attendance session already exists for this date
    let existingSession = null;
    if (dateParam) {
      const targetDate = new Date(dateParam);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      existingSession = await prisma.attendanceSession.findFirst({
        where: {
          courseId,
          section,
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { records: true },
      });
    }

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        rollNumber: s.studentProfile?.rollNumber || "N/A",
      })),
      existingSession,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["FACULTY", "ADMIN"]);
    const body = await request.json();
    const data = markAttendanceSchema.parse(body);

    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: user.id },
    });

    const facultyId = facultyProfile?.id || (await prisma.facultyProfile.findFirst())!.id;
    const sessionDate = new Date(data.date);

    // Upsert or create AttendanceSession
    const session = await prisma.attendanceSession.create({
      data: {
        courseId: data.courseId,
        facultyId,
        date: sessionDate,
        section: data.section,
        semester: data.semester,
        topic: data.topic || "Daily Lecture Session",
        records: {
          create: data.records.map((r) => ({
            studentId: r.studentId,
            status: r.status,
            remarks: r.remarks,
          })),
        },
      },
      include: { records: true },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      count: session.records.length,
      message: `Attendance marked successfully for ${session.records.length} students.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
