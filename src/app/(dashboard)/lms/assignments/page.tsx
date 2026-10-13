import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AssignmentClientActions } from "./AssignmentClientActions";

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch all assignments
  const assignments = await prisma.assignment.findMany({
    include: {
      course: true,
      faculty: { include: { user: true } },
      submissions: {
        include: { student: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/lms"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-500" />
              Coursework & Assignments Portal
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-9">
            Problem prompts, submission deadlines, code artifact uploads, and faculty evaluation grades.
          </p>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-6">
        {assignments.map((assign) => {
          const mySubmission = assign.submissions.find(
            (s) => s.studentId === user.id
          );
          const isOverdue = new Date() > assign.dueDate;

          return (
            <Card key={assign.id} className="p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs font-bold">
                      {assign.course.code}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Instructor: {assign.faculty.user.name}
                    </span>
                    {isOverdue && !mySubmission && (
                      <Badge variant="danger" className="text-[10px]">
                        Deadline Passed
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {assign.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Deadline:
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatDate(assign.dueDate)}
                    </div>
                  </div>
                  <Badge variant="info" className="text-xs">
                    Max: {assign.maxMarks} pts
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {assign.description}
              </p>

              {/* Action and Status Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs">
                  {assign.attachmentUrl && (
                    <a
                      href={assign.attachmentUrl}
                      download
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Problem Specification PDF
                    </a>
                  )}
                </div>

                {/* Interactive client component for Student submission & Faculty grading */}
                <AssignmentClientActions
                  assignment={assign}
                  mySubmission={mySubmission}
                  userRole={user.role}
                />
              </div>

              {/* Graded Feedback Box (if already graded) */}
              {mySubmission && mySubmission.status === "GRADED" && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Evaluated Grade:
                    </span>
                    <span className="text-sm font-extrabold text-emerald-300 font-mono">
                      {mySubmission.marks} / {assign.maxMarks} Marks
                    </span>
                  </div>
                  {mySubmission.feedback && (
                    <p className="text-slate-300 italic pt-1">
                      Faculty Feedback: "{mySubmission.feedback}"
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
