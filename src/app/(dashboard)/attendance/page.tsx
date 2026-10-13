import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // If faculty or admin, redirect them directly to the attendance marking grid
  if (user.role === "FACULTY" || user.role === "ADMIN") {
    redirect("/attendance/mark");
  }

  // Student Attendance Calculation
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

  const subjectSummary = enrollments.map((e) => {
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
    let classesNeeded = 0;
    if (percentage < 75) {
      classesNeeded = Math.max(0, Math.ceil(3 * total - 4 * attended));
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
      classesNeeded,
      recentHistory: history.slice(0, 5),
    };
  });

  const atRiskCount = subjectSummary.filter((s) => s.isAtRisk).length;
  const grandTotal = subjectSummary.reduce((acc, s) => acc + s.total, 0);
  const grandAttended = subjectSummary.reduce((acc, s) => acc + s.attended, 0);
  const grandPercentage =
    grandTotal > 0 ? Math.round((grandAttended / grandTotal) * 100) : 100;

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Smart Attendance Tracker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time session logs, institutional 75% threshold monitoring, and recovery projections.
          </p>
        </div>
      </div>

      {/* Critical Alert Banner if any subject is < 75% */}
      {atRiskCount > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/70 border-2 border-rose-600 text-rose-100 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-rose-900 text-rose-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide">
                  CRITICAL HALL-TICKET THRESHOLD ALERT
                </span>
                <Badge variant="danger">{atRiskCount} Subject(s) Below 75%</Badge>
              </div>
              <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
                You are currently barred from appearing in end-semester examinations for courses highlighted in red below. 
                Attend the specified makeup classes consecutively to restore your eligibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Overall Attendance"
          value={`${grandPercentage}%`}
          subtitle={`${grandAttended} of ${grandTotal} cumulative sessions`}
          variant={grandPercentage < 75 ? "danger" : "success"}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Eligible Subjects"
          value={`${subjectSummary.length - atRiskCount} of ${subjectSummary.length}`}
          subtitle="Meets 75% Exam Minimum"
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="At-Risk Subjects"
          value={atRiskCount}
          subtitle={atRiskCount > 0 ? "Requires Immediate Makeup" : "Safe Zone"}
          variant={atRiskCount > 0 ? "danger" : "default"}
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* Subject-Wise Detailed Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Subject-Wise Evaluation & Recovery Matrix
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Credits</th>
                <th className="px-5 py-4">Attended / Total</th>
                <th className="px-5 py-4">Attendance %</th>
                <th className="px-5 py-4">Status & Action</th>
                <th className="px-5 py-4">Recent Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {subjectSummary.map((sub) => {
                const isRed = sub.isAtRisk;

                return (
                  <tr
                    key={sub.courseId}
                    className={
                      isRed
                        ? "bg-rose-500/10 dark:bg-rose-950/30 border-l-4 border-l-rose-600"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }
                  >
                    {/* Subject info */}
                    <td className="px-5 py-4 font-medium">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{sub.name}</span>
                        {isRed && (
                          <Badge variant="danger" className="text-[10px]">
                            Below 75%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Code: {sub.code}
                      </div>
                    </td>

                    {/* Credits */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {sub.credits} Credits
                    </td>

                    {/* Attended / Total */}
                    <td className="px-5 py-4 font-mono font-semibold">
                      {sub.attended} / {sub.total}
                    </td>

                    {/* Attendance percentage bar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-32">
                        <span
                          className={`font-extrabold text-sm ${
                            isRed
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {sub.percentage}%
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isRed ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, sub.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status & recovery projection */}
                    <td className="px-5 py-4">
                      {isRed ? (
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            Hall Ticket Disqualified
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            Must attend next <b>{sub.classesNeeded}</b> classes to reach 75%
                          </div>
                        </div>
                      ) : (
                        <Badge variant="success">Eligible</Badge>
                      )}
                    </td>

                    {/* Recent 5 session chips */}
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 items-center">
                        {sub.recentHistory.map((h, i) => (
                          <span
                            key={i}
                            title={`${formatDate(h.date)}: ${h.status} - ${h.topic || "Lecture"}`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              h.status === "PRESENT"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {h.status === "PRESENT" ? "P" : "A"}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
