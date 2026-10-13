import { HomeQuickLogin } from "@/components/auth/HomeQuickLogin";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Public Top Navigation */}
      <nav className="h-18 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-base shadow-md">
            C
          </div>
          <div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              CampusConnect
            </span>
            <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
              Premier Institute of Technology
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Sign In to Campus
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 sm:py-24 space-y-16 text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-400 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Next-Gen Campus Experience 2026
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Academic Operations <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Meets Vibrant Campus Life
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A single, intelligent digital headquarters connecting 4,000+ students, faculty, and administrators. 
            Smart attendance tracking, weekly timetables, digital fees, campus clubs, and QR event ticketing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-600/20 transition-all hover:scale-105 active:scale-95"
            >
              {user ? "Open Dashboard" : "Launch Demo Portal (Instant Login)"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-800 transition-all"
            >
              Credentials Login View
            </Link>
          </div>

          {/* 1-Click Persona Portals Quick Launch */}
          <HomeQuickLogin />
        </div>

        {/* Core Pillars Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Attendance Tracker</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Faculty take daily attendance in seconds. Students get real-time percentage gauges with automatic red warning highlights whenever attendance dips below 75%.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Timetable & LMS</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Live weekly calendar mapping course, room, and faculty. Digital repository for lecture notes, problem sets, and faculty grading portals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Digital Fees & Student ID</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Seamless mock fee payment gateway for tuition, hostel, and exams with instantaneous receipt generation and encrypted QR-enabled digital student ID cards.
            </p>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-wrap items-center justify-around gap-6 text-slate-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>4 Specialized Departments</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>5 Core User Roles Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Mobile Responsive</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>High-Contrast Light/Dark Themes</span>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
        © 2026 CampusConnect Platform. Designed for modern higher education institutions.
      </footer>
    </div>
  );
}
