"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { CampusAILogo } from "./CampusAILogo";
import { useAssistant } from "./AssistantContext";

export function AIInsightsCard() {
  const { data: session } = useSession();
  const { setIsOpen, sendMessage } = useAssistant();

  const userName = session?.user?.name?.split(" ")[0] || "Student";
  const userRole = session?.user?.role || "STUDENT";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-cyan-500/30 p-5 sm:p-6 shadow-xl backdrop-blur-md text-left">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <CampusAILogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base tracking-tight">
                AETHER AI Insights
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                DAILY INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Good morning {userName}! Here is your real-time campus briefing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            sendMessage("What is my daily briefing and schedule?");
          }}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask Assistant
        </button>
      </div>

      {/* Grid of Intelligent Suggestions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4 text-xs">
        {/* 1. Attendance Catch-Up Warning */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-rose-300">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Attendance Risk Alert
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 font-bold">72%</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            You need to attend <strong className="text-white">3 more consecutive classes</strong> in{" "}
            <span className="text-rose-200 font-medium">Computer Networks</span> to cross the mandatory 75% exam threshold.
          </p>
          <Link
            href="/attendance"
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 pt-1"
          >
            <span>View Recovery Strategy</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Schedule & Deadlines */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-300">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Upcoming Priority
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">09:00 AM</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Next: <strong className="text-white">Database Management Systems</strong> in Room 302, Academic Block B.
            Mid-term examinations start in 18 days.
          </p>
          <Link
            href="/timetable"
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 pt-1"
          >
            <span>Open Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. Personalized Gig & Hackathon Match */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Recommended
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">94% Match</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-white">National AI Hackathon</strong> &amp; Python Lab Assistant Gig match your skills in React and Python.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/gigs"
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Explore Gigs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/events"
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>View Hackathons</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
