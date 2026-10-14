"use client";

import React, { useState } from "react";
import { Check, Copy, GraduationCap, ShieldCheck, UserCheck } from "lucide-react";

interface DemoLoginButtonsProps {
  onQuickLogin: (email: string, pass: string, name: string) => void;
  isLoading: boolean;
}

export function DemoLoginButtons({ onQuickLogin, isLoading }: DemoLoginButtonsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const demoPresets = [
    {
      role: "Student",
      title: "Login as Demo Student",
      name: "Ananya Reddy (22ECE1047)",
      email: "ananya@college.edu",
      password: "Student@123",
      icon: GraduationCap,
      color: "bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25",
    },
    {
      role: "Faculty",
      title: "Login as Demo Faculty",
      name: "Prof. Sana Iqbal (CSE)",
      email: "faculty@college.edu",
      password: "Faculty@123",
      icon: UserCheck,
      color: "bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25",
    },
    {
      role: "Admin",
      title: "Login as Demo Admin",
      name: "Dr. S. Prakash (Dean)",
      email: "admin@college.edu",
      password: "Admin@123",
      icon: ShieldCheck,
      color: "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25",
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4 text-left">
      {/* 3 Quick Action Buttons */}
      <div className="grid sm:grid-cols-3 gap-3">
        {demoPresets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.email}
              type="button"
              disabled={isLoading}
              onClick={() => onQuickLogin(preset.email, preset.password, preset.name)}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 text-left cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${preset.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  {preset.role}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">1-Click</span>
              </div>
              <span className="font-extrabold text-white text-xs">{preset.title}</span>
              <span className="text-[10px] text-slate-300 truncate">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Clearly Labeled Credentials Box with Copy */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider mr-2">
            Demo accounts, for testing only
          </span>
          <span className="text-slate-300 text-xs">
            Student: <code className="text-amber-400">ananya@college.edu</code> / <code className="text-amber-400">Student@123</code>
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleCopy("ananya@college.edu / Student@123", "cred")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedKey === "cred" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedKey === "cred" ? "Copied" : "Copy Credentials"}
        </button>
      </div>
    </div>
  );
}
