import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, FileText, MapPin, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
];

export default async function TimetablePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Determine user's student or faculty profile to customize timetable
  let section = "A";
  let semester = 5;

  if (user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      section = profile.section;
      semester = profile.semester;
    }
  }

  // Fetch all timetable slots for this section and semester
  const slots = await prisma.timetableSlot.findMany({
    where: { section, semester },
    include: {
      course: true,
      faculty: { include: { user: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  // Current system day (1 = Mon ... 5 = Fri)
  const currentDay = new Date().getDay() || 1;

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              Dynamic Weekly Timetable
            </h2>
            <Badge variant="outline">
              CSE · Sem {semester} (Sec {section})
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live schedule mapped to designated lecture halls, laboratory centers, and faculty cabins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/timetable/exams">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4 text-sky-500" />
              View Exam Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Day by Day Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === day.id);
          const isToday = currentDay === day.id;

          return (
            <div
              key={day.id}
              className={`space-y-3 rounded-2xl p-4 transition-all ${
                isToday
                  ? "bg-amber-500/5 border-2 border-amber-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {day.name}
                </span>
                {isToday && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-bold">
                    Today
                  </Badge>
                )}
              </div>

              {daySlots.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No classes
                </div>
              ) : (
                <div className="space-y-2.5">
                  {daySlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className="p-3.5 hover:border-amber-500/40 transition-colors shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {slot.roomNumber}
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                          {slot.course.code}: {slot.course.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{slot.faculty.user.name}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
