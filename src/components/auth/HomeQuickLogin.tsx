"use client";

import { Award, Coffee, GraduationCap, Loader2, Shield, UserCheck, Users } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ROLES = [
  {
    role: "Student (Ananya)",
    name: "Ananya Reddy (22ECE1047)",
    email: "ananya@college.edu",
    password: "Student@123",
    icon: GraduationCap,
    desc: "Attendance ring, timetable, event tickets & food pre-orders",
    accent: "hover:border-sky-500/80 bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
  {
    role: "Student (Karthik)",
    name: "Karthik Varma (22CSE0231)",
    email: "karthik@college.edu",
    password: "Student@123",
    icon: GraduationCap,
    desc: "CSE semester portal, club memberships & placement tracker",
    accent: "hover:border-sky-500/80 bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
  {
    role: "Admin (Dean)",
    name: "Dr. S. Prakash (Dean)",
    email: "admin@college.edu",
    password: "Admin@123",
    icon: Shield,
    desc: "Institutional stats, fee metrics & campus control center",
    accent: "hover:border-amber-500/80 bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  {
    role: "Club Lead",
    name: "Priya Sharma (Robotics Lead)",
    email: "club@college.edu",
    password: "Club@123",
    icon: Users,
    desc: "Manage club join requests, organize events & QR check-in",
    accent: "hover:border-purple-500/80 bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
  {
    role: "Cafeteria Staff",
    name: "Chef Ramesh (Central Canteen)",
    email: "canteen@college.edu",
    password: "Staff@123",
    icon: Coffee,
    desc: "Live order queue, token preparation & menu item availability",
    accent: "hover:border-emerald-500/80 bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  {
    role: "Alumni",
    name: "Vikramaditya Rao (Google)",
    email: "alumni@college.edu",
    password: "Alumni@123",
    icon: UserCheck,
    desc: "Mentorship sessions, alumni directory & research showcase",
    accent: "hover:border-rose-500/80 bg-rose-500/10 border-rose-500/30 text-rose-300",
  },
];

export function HomeQuickLogin() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const handleQuickLogin = async (acc: typeof ROLES[0]) => {
    setActiveRole(acc.role);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: acc.email,
        password: acc.password,
      });

      if (!res?.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Authentication failed: " + res.error);
        setActiveRole(null);
      }
    } catch (e) {
      alert("Login error: " + String(e));
      setActiveRole(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-6 pb-2 text-left space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          ⚡ 1-Click Persona Portals (Instant Launch — No Typing Required)
        </span>
        <span className="text-[11px] text-slate-400">Select any role to test its custom permissions</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ROLES.map((acc) => {
          const Icon = acc.icon;
          const isLoading = activeRole === acc.role;

          return (
            <button
              key={acc.role}
              type="button"
              disabled={activeRole !== null}
              onClick={() => handleQuickLogin(acc)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 relative group ${acc.accent}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/30">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">
                    {acc.role}
                  </span>
                </div>
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                    Enter →
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                {acc.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-snug line-clamp-1 mt-0.5">
                {acc.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
