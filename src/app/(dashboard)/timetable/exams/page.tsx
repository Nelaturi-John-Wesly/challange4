import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamSchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch all scheduled exams
  const exams = await prisma.examSchedule.findMany({
    include: { course: true },
    orderBy: { examDate: "asc" },
  });

  const midTermExams = exams.filter((e) => e.examType === "MID_TERM");
  const practicalExams = exams.filter((e) => e.examType === "PRACTICAL");
  const finalExams = exams.filter((e) => e.examType === "SEMESTER_FINAL");

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/timetable"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-sky-500" />
              Examination Schedules
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-9">
            Mid-term continuous evaluations, laboratory practical assessments, and university finals.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {/* 1. Mid-Term Tests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Badge variant="warning">Internal Evaluation</Badge>
              Mid-Semester Sessional Tests
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Weightage: 30% of final grade
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {midTermExams.map((exam) => (
              <Card key={exam.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {exam.course.code}
                  </Badge>
                  <span className="text-xs font-bold text-amber-500">
                    Max: {exam.maxMarks} Marks
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {exam.course.name}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(exam.examDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime} – {exam.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Venue: {exam.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 2. Practical Exams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Badge variant="info">Hands-on Labs</Badge>
              Laboratory Practical Examinations
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live Coding & Viva Voce
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {practicalExams.map((exam) => (
              <Card key={exam.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {exam.course.code}
                  </Badge>
                  <span className="text-xs font-bold text-sky-500">
                    Max: {exam.maxMarks} Marks
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {exam.course.name} (Lab Assessment)
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(exam.examDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime} – {exam.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>Venue: {exam.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 3. University Final Examinations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Badge variant="success">End Semester</Badge>
              University Final Theory Examinations
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hall Ticket & Digital ID Required
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Course Code</th>
                  <th className="px-5 py-3.5">Course Title</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Assigned Hall</th>
                  <th className="px-5 py-3.5">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {finalExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {exam.course.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                      {exam.course.name}
                    </td>
                    <td className="px-5 py-3.5">{formatDate(exam.examDate)}</td>
                    <td className="px-5 py-3.5">{exam.startTime} – {exam.endTime}</td>
                    <td className="px-5 py-3.5 font-semibold">{exam.roomNumber}</td>
                    <td className="px-5 py-3.5 font-mono font-bold">{exam.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
