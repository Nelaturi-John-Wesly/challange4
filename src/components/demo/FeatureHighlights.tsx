"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Briefcase,
  Compass,
  MapPin,
  Mic,
  Play,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

export function FeatureHighlights() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const features = [
    {
      title: "Voice Commands",
      description: "Operate any portal module hands-free in English, Telugu, or Hindi.",
      icon: Mic,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Smart Global Search",
      description: "Instant semantic search across notices, events, placements, and clubs.",
      icon: Search,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Attendance Insights",
      description: "Proactive warnings and catch-up formulas for the 75% threshold.",
      icon: Zap,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "Interactive Campus Map",
      description: "Instant location highlights and walking skywalk blueprints.",
      icon: MapPin,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    },
    {
      title: "Campus Gigs Marketplace",
      description: "Anti-scam part-time work-study tasks with verified institutional rewards.",
      icon: Briefcase,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "AI Study Helper & Quizzes",
      description: "Concept simplifications, instant quizzes, and exam study schedules.",
      icon: BookOpen,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* 6 Feature Icon Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${f.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                {f.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3-Step "How It Works" Row */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 text-center">
          How It Works in 3 Steps
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold inline-flex items-center justify-center">
              1
            </span>
            <div className="font-bold text-white text-xs mt-1">Speak or Type</div>
            <p className="text-[11px] text-slate-400">
              Press the floating AI mic or press Ctrl+K to ask any question in your preferred language.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold inline-flex items-center justify-center">
              2
            </span>
            <div className="font-bold text-white text-xs mt-1">Campus AI Understands</div>
            <p className="text-[11px] text-slate-400">
              AETHER processes the query securely, matches your verified role, and queries allowlisted tools.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold inline-flex items-center justify-center">
              3
            </span>
            <div className="font-bold text-white text-xs mt-1">Portal Does It For You</div>
            <p className="text-[11px] text-slate-400">
              The portal executes the navigation, shows live cards, or asks for confirmation before data actions.
            </p>
          </div>
        </div>

        {/* Watch 60-Second Demo Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Watch 60-Second Demo Walkthrough
          </button>
        </div>
      </div>

      {/* Video / Animated Walkthrough Modal */}
      {videoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Campus AI 60-Second Feature Tour
              </h3>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Placeholder Box */}
            <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3 relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 animate-pulse">
                <Play className="w-6 h-6 fill-cyan-400 translate-x-0.5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">Interactive Walkthrough Showcase</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Demonstrating voice recognition in Telugu, Hindi, and English, smart attendance recovery, and cafeteria pre-orders.
                </p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Asset Path: /videos/campus-ai-demo.mp4 (Placeholder ready for deployment)
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
