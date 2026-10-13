import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  IdCard,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch Role-Specific Dashboard Data
  if (user.role === "STUDENT") {
    // 1. Fetch Student Profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { user: { include: { department: true } } },
    });

    // 2. Fetch Enrollments & Attendance
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
            },
          },
        },
      },
    });

    // Calculate Subject-wise Attendance
    const subjectAttendance = enrollments.map((e) => {
      let total = 0;
      let attended = 0;

      e.course.attendanceSessions.forEach((s) => {
        if (s.records.length > 0) {
          total++;
          if (s.records[0].status === "PRESENT") attended++;
        }
      });

      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
      return {
        courseId: e.course.id,
        code: e.course.code,
        name: e.course.name,
        total,
        attended,
        percentage,
        isAtRisk: percentage < 75,
      };
    });

    const atRiskCount = subjectAttendance.filter((s) => s.isAtRisk).length;
    const overallTotal = subjectAttendance.reduce((acc, s) => acc + s.total, 0);
    const overallAttended = subjectAttendance.reduce((acc, s) => acc + s.attended, 0);
    const overallPercentage =
      overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

    // 3. Fetch Pending Fees
    const pendingFees = await prisma.feeInvoice.findMany({
      where: { studentId: user.id, status: "PENDING" },
    });
    const totalPendingFee = pendingFees.reduce((acc, f) => acc + f.amount, 0);

    // 4. Fetch Active Assignments
    const activeAssignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: enrollments.map((e) => e.courseId) },
      },
      include: {
        course: true,
        submissions: {
          where: { studentId: user.id },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 4,
    });

    // 5. Today's Timetable (assume Wednesday/day 3 for demonstration)
    const dayOfWeek = new Date().getDay() || 1; // 1 to 5
    const todaySlots = await prisma.timetableSlot.findMany({
      where: {
        section: studentProfile?.section || "A",
        semester: studentProfile?.semester || 5,
        dayOfWeek: dayOfWeek > 5 ? 1 : dayOfWeek, // Fallback to Monday if weekend
      },
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return (
      <div className="space-y-8 text-left">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-amber-600/5 border border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Welcome back, {user.name}!
              </h2>
              <Badge variant="success">Active Student</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Roll No: <b>{studentProfile?.rollNumber}</b> · Year {studentProfile?.year}, Sem {studentProfile?.semester} (Sec {studentProfile?.section}) · CGPA: <b>{studentProfile?.cgpa}</b>
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/id-card">
              <Button variant="outline" size="sm" className="gap-2">
                <IdCard className="w-4 h-4 text-amber-500" />
                Digital Student ID
              </Button>
            </Link>
          </div>
        </div>

        {/* Critical Attendance Alert if < 75% in any subject */}
        {atRiskCount > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-rose-900/80 text-rose-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-rose-100 flex items-center gap-2">
                <span>ATTENDANCE WARNING:</span>
                <Badge variant="danger">{atRiskCount} Subject(s) Below 75%</Badge>
              </h4>
              <p className="text-xs text-rose-300 mt-1">
                Institutional regulations require a minimum 75% attendance for semester examination hall-ticket eligibility. 
                Please review your attendance records and schedule makeup tutorials.
              </p>
              <div className="mt-3">
                <Link href="/attendance">
                  <Button variant="danger" size="sm">
                    View Attendance Breakdown
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Overall Attendance"
            value={`${overallPercentage}%`}
            subtitle={`${overallAttended} of ${overallTotal} lectures attended`}
            variant={overallPercentage < 75 ? "danger" : "success"}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            title="Enrolled Subjects"
            value={enrollments.length}
            subtitle="Semester 5 Core Modules"
            icon={<BookOpen className="w-5 h-5 text-sky-500" />}
          />
          <StatCard
            title="Pending Dues"
            value={formatCurrency(totalPendingFee)}
            subtitle={pendingFees.length > 0 ? "1 Fee Invoice due" : "All cleared"}
            variant={totalPendingFee > 0 ? "warning" : "success"}
            icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
          />
          <StatCard
            title="Cumulative GPA"
            value={studentProfile?.cgpa || "8.42"}
            subtitle="Rank #4 in Department"
            icon={<Award className="w-5 h-5 text-purple-500" />}
          />
        </div>

        {/* 2-Column Split: Timetable & Assignments */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Today's Lecture Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Section A · 5th Semester
                </p>
              </div>
              <Link href="/timetable" className="text-xs font-semibold text-amber-500 hover:underline">
                Full Weekly View →
              </Link>
            </div>

            <div className="space-y-3">
              {todaySlots.length === 0 ? (
                <Card className="p-8 text-center text-slate-400 text-sm">
                  No classes scheduled for today. Enjoy your study day!
                </Card>
              ) : (
                todaySlots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="p-4 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-20">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {slot.startTime}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          to {slot.endTime}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {slot.course.code}: {slot.course.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Faculty: {slot.faculty.user.name} · Room: <b>{slot.roomNumber}</b>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      Lecture
                    </Badge>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Active Assignments & Fee Notice */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  Upcoming Assignments
                </h3>
                <Link href="/lms/assignments" className="text-xs font-semibold text-amber-500 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {activeAssignments.map((a) => {
                  const isSubmitted = a.submissions.length > 0;
                  return (
                    <Card key={a.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1">
                            {a.course.code}
                          </Badge>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {a.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Due: {formatDate(a.dueDate)} · Max: {a.maxMarks} marks
                          </p>
                        </div>
                        {isSubmitted ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </Badge>
                        ) : (
                          <Link href={`/lms/assignments/${a.id}`}>
                            <Button size="sm" variant="outline" className="text-xs py-1">
                              Submit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Fee Notice */}
            {pendingFees.length > 0 && (
              <Card className="p-5 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="warning">Action Required</Badge>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                      {pendingFees[0].title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Amount Due: <b>{formatCurrency(pendingFees[0].amount)}</b> (Due: {formatDate(pendingFees[0].dueDate)})
                    </p>
                  </div>
                  <Link href={`/fees/pay/${pendingFees[0].id}`}>
                    <Button variant="primary" size="sm">
                      Pay Now
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FACULTY DASHBOARD VIEW
  // -------------------------------------------------------------
  if (user.role === "FACULTY") {
    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: user.id },
      include: {
        teachingSlots: { include: { course: true } },
        materials: true,
        assignments: { include: { submissions: true } },
      },
    });

    const coursesTaught = await prisma.course.findMany({
      where: {
        timetableSlots: {
          some: { facultyId: faculty?.id },
        },
      },
    });

    return (
      <div className="space-y-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-emerald-600/5 border border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Welcome, {user.name}
              </h2>
              <Badge variant="success">Faculty Portal</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {faculty?.designation} · {faculty?.cabinNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/attendance/mark">
              <Button variant="primary" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Mark Today's Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Courses Under Instruction"
            value={coursesTaught.length}
            subtitle="Semester 5 CSE"
            icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
          />
          <StatCard
            title="Lecture Sessions Conducted"
            value="42"
            subtitle="Academic Term to Date"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            title="Active Assignments"
            value={faculty?.assignments.length || 0}
            subtitle="Submissions Awaiting Review"
            icon={<FileText className="w-5 h-5 text-sky-500" />}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/attendance/mark">
            <Card className="p-5 hover:border-amber-500/40 transition-all hover:scale-102">
              <Clock className="w-8 h-8 text-amber-500 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Mark Student Attendance
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select subject, section, and date with 1-click batch marking.
              </p>
            </Card>
          </Link>
          <Link href="/lms">
            <Card className="p-5 hover:border-sky-500/40 transition-all hover:scale-102">
              <BookOpen className="w-8 h-8 text-sky-500 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Upload Course Materials
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload lecture slides, syllabi, notes, and problem sets.
              </p>
            </Card>
          </Link>
          <Link href="/lms/assignments">
            <Card className="p-5 hover:border-purple-500/40 transition-all hover:scale-102">
              <FileText className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Grade Submissions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review submitted code/PDFs and record marks & feedback.
              </p>
            </Card>
          </Link>
          <Link href="/timetable">
            <Card className="p-5 hover:border-emerald-500/40 transition-all hover:scale-102">
              <Calendar className="w-8 h-8 text-emerald-500 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                View Weekly Schedule
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Track room bookings and designated laboratory slots.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN & OTHER ROLES DASHBOARD VIEW
  // -------------------------------------------------------------
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalFaculty = await prisma.user.count({ where: { role: "FACULTY" } });
  const totalCourses = await prisma.course.count();
  const totalDepartments = await prisma.department.count();

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Institutional Admin Hub
            </h2>
            <Badge variant="warning">{user.role}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as {user.name} ({user.email})
          </p>
        </div>
        <Link href="/admin">
          <Button variant="primary" size="sm">
            Admin Control Center
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Enrolled Students"
          value={totalStudents}
          subtitle="Active Campus Cohort"
          icon={<Users className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Faculty Members"
          value={totalFaculty}
          subtitle="Across 4 Departments"
          icon={<GraduationCap className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Active Courses"
          value={totalCourses}
          subtitle="Curriculum Modules"
          icon={<BookOpen className="w-5 h-5 text-sky-500" />}
        />
        <StatCard
          title="Departments"
          value={totalDepartments}
          subtitle="CSE, ECE, MECH, IT"
          icon={<Award className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Link href="/attendance">
          <Card className="p-6 hover:border-amber-500 transition-all">
            <Clock className="w-8 h-8 text-amber-500 mb-2" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Institutional Attendance Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect student-wise attendance records and verify classes below 75%.
            </p>
          </Card>
        </Link>
        <Link href="/timetable">
          <Card className="p-6 hover:border-sky-500 transition-all">
            <Calendar className="w-8 h-8 text-sky-500 mb-2" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Department Master Timetables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review room allocations, slots, and upcoming examination dates.
            </p>
          </Card>
        </Link>
        <Link href="/fees">
          <Card className="p-6 hover:border-emerald-500 transition-all">
            <CreditCard className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Fee Collections & Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit tuition, hostel, and exam fee reconciliations and transactions.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
