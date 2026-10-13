"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const DEMO_ACCOUNTS = [
  {
    role: "Student",
    name: "Kiran Kumar (CSE 3rd Yr)",
    email: "student@college.edu",
    password: "Student@123",
    badge: "Student View",
    color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    role: "Faculty",
    name: "Prof. Sana Iqbal (CSE)",
    email: "faculty@college.edu",
    password: "Faculty@123",
    badge: "Faculty View",
    color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  },
  {
    role: "Admin",
    name: "Dr. Anita Rao (Dean)",
    email: "admin@college.edu",
    password: "Admin@123",
    badge: "Admin Access",
    color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    role: "Recruiter",
    name: "Google Campus Relations",
    email: "recruiter@college.edu",
    password: "Recruiter@123",
    badge: "Hiring Portal",
    color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  },
  {
    role: "Alumni",
    name: "Rahul Mehta (Microsoft)",
    email: "alumni@college.edu",
    password: "Alumni@123",
    badge: "Mentorship",
    color: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@college.edu");
  const [password, setPassword] = useState("Student@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: accEmail,
        password: accPass,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            C
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">
              CampusConnect
            </span>
            <div className="text-[11px] text-slate-400">Institutional Portal</div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Login Split Box */}
      <div className="max-w-4xl w-full mx-auto my-8 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Details */}
        <div className="lg:col-span-5 space-y-5 text-left">
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-400 bg-amber-500/10 px-3 py-1 font-semibold"
          >
            Spring 2026 Academic Session
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            One Unified Platform for Campus Life.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            From smart real-time attendance tracking and weekly lecture schedules to
            student clubs, QR ticketing, and digital fee settlements.
          </p>

          {/* Quick Demo Chips */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ⚡ 1-Click Instant Demo Portals (Instant Launch)
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(acc.email, acc.password)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all text-left flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 ${acc.color}`}
                >
                  <span className="font-bold">{acc.role}</span>
                  <span className="text-[10px] opacity-75">({acc.badge})</span>
                  <span className="text-[10px] ml-1">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-bold text-white">Sign In to Campus</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your institutional credentials or click a demo button above.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <span>✕</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2 font-bold py-2.5"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Dashboard
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400">
        Institutional Campus ERP & Life Platform · All data encrypted with role-level isolation.
      </div>
    </div>
  );
}
