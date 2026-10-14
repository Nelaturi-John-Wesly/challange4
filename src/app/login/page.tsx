"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/shared/Toast";
import {
  Briefcase,
  CheckCircle2,
  Coffee,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Phone,
  School,
  Send,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Required Seed Demo Accounts for instantaneous 1-click evaluation
const DEMO_ACCOUNTS = [
  {
    role: "Student",
    name: "Ananya Reddy (22ECE1047)",
    email: "ananya@college.edu",
    password: "Student@123",
    badge: "ECE 3rd Yr",
    color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    role: "Student",
    name: "Karthik Varma (22CSE0231)",
    email: "karthik@college.edu",
    password: "Student@123",
    badge: "CSE 3rd Yr",
    color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    role: "Admin",
    name: "Dr. S. Prakash (Dean)",
    email: "admin@college.edu",
    password: "Admin@123",
    badge: "Institutional Admin",
    color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    role: "Club Lead",
    name: "Priya Sharma (Robotics Lead)",
    email: "club@college.edu",
    password: "Club@123",
    badge: "Guild President",
    color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  },
  {
    role: "Cafeteria Staff",
    name: "Chef Ramesh (Central Canteen)",
    email: "canteen@college.edu",
    password: "Staff@123",
    badge: "Kitchen & Orders",
    color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  },
  {
    role: "Faculty",
    name: "Prof. Sana Iqbal",
    email: "faculty@college.edu",
    password: "Faculty@123",
    badge: "CSE Dept",
    color: "border-teal-500/40 text-teal-400 bg-teal-500/10",
  },
  {
    role: "Alumni",
    name: "Vikramaditya Rao (Google)",
    email: "alumni@college.edu",
    password: "Alumni@123",
    badge: "Mentor Network",
    color: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  },
];

const DEFAULT_DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "IT", name: "Information Technology" },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("ananya@college.edu");
  const [loginPassword, setLoginPassword] = useState("Student@123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration Form States
  const [regRole, setRegRole] = useState<"STUDENT" | "ADMIN" | "ALUMNI" | "CLUB_LEAD" | "CAFETERIA_STAFF">("STUDENT");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRollNumber, setRegRollNumber] = useState("");
  const [regDepartment, setRegDepartment] = useState("CSE");
  const [regYear, setRegYear] = useState("3");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Email OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Departments list & feedback
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/register")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      })
      .catch(() => {});
  }, []);

  // Send Mock Email OTP with interactive Toast
  const handleSendOtp = () => {
    if (!regEmail || !regEmail.includes("@")) {
      toast({
        title: "Valid Email Required",
        description: "Please enter your college email address before requesting an OTP.",
        variant: "warning",
      });
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      const generatedCode = "849201";
      setMockOtp(generatedCode);
      setOtpSent(true);
      setIsSendingOtp(false);

      toast({
        title: "📬 Verification Code Dispatched!",
        description: `Your institutional OTP is ${generatedCode}. Enter it below to verify your email.`,
        variant: "info",
        duration: 9000,
      });
    }, 600);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      if (res?.error) {
        setLoginError(res.error);
        setIsLoginLoading(false);
        toast({
          title: "Authentication Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Authenticated successfully. Redirecting to your portal...",
          variant: "success",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected authentication error occurred.");
      setIsLoginLoading(false);
    }
  };

  // Handle 1-Click Quick Demo Login
  const handleQuickLogin = async (accEmail: string, accPass: string, roleName: string) => {
    setLoginEmail(accEmail);
    setLoginPassword(accPass);
    setIsLoginLoading(true);
    setLoginError(null);

    toast({
      title: `Signing In as ${roleName}`,
      description: `Authenticating ${accEmail}...`,
      variant: "info",
    });

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: accEmail,
        password: accPass,
      });

      if (res?.error) {
        setLoginError(res.error);
        setIsLoginLoading(false);
        toast({
          title: "Authentication Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: `Welcome, ${roleName}!`,
          description: "Role permissions loaded.",
          variant: "success",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected error occurred during demo login.");
      setIsLoginLoading(false);
    }
  };

  // Handle Registration Submit with OTP Verification
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    // 1. Password check
    if (regPassword !== regConfirmPassword) {
      const msg = "Passwords do not match. Please verify both password fields.";
      setRegError(msg);
      setIsRegLoading(false);
      toast({ title: "Password Mismatch", description: msg, variant: "error" });
      return;
    }

    if (regPassword.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setRegError(msg);
      setIsRegLoading(false);
      toast({ title: "Weak Password", description: msg, variant: "warning" });
      return;
    }

    // 2. OTP Verification check
    if (!otpSent) {
      const msg = "Please click 'Send Verification OTP' to verify your college email.";
      setRegError(msg);
      setIsRegLoading(false);
      toast({ title: "Email Verification Required", description: msg, variant: "warning" });
      return;
    }

    if (enteredOtp.trim() !== mockOtp) {
      const msg = "Invalid OTP code. Please enter the 6-digit code shown in the toast (849201).";
      setRegError(msg);
      setIsRegLoading(false);
      toast({ title: "Invalid Code", description: msg, variant: "error" });
      return;
    }

    // 3. API Payload
    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole,
        departmentCode: regDepartment,
        rollNumber: regRollNumber || `ID-${Date.now().toString().slice(-5)}`,
        year: parseInt(regYear, 10),
        semester: (parseInt(regYear, 10) - 1) * 2 + 1,
        batch: "2023-2027",
        section: "A",
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data.error || "Registration failed. Please check details.";
        setRegError(errorText);
        setIsRegLoading(false);
        toast({ title: "Registration Error", description: errorText, variant: "error" });
        return;
      }

      setRegSuccess("Verified & Registered! Signing you in automatically...");
      toast({
        title: "Account Created!",
        description: `Welcome to CampusConnect, ${regName.split(" ")[0]}!`,
        variant: "success",
      });

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: regEmail,
        password: regPassword,
      });

      if (signInRes?.error) {
        setLoginEmail(regEmail);
        setLoginPassword(regPassword);
        setAuthMode("login");
        setIsRegLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setRegError("Server connection error during registration.");
      setIsRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
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

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto my-6 grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Hero */}
        <div className="lg:col-span-5 space-y-5 text-left pt-2">
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-400 bg-amber-500/10 px-3 py-1 font-semibold"
          >
            Academic Year 2025–2026
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Institutional Campus ERP & Student Life.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Role-isolated access for Students, Campus Club Leads, Cafeteria Staff, Alumni Mentors, and Institutional Administrators.
          </p>

          {/* Quick Demo Credentials */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                ⚡ 1-Click Instant Demo Portals
              </p>
              <span className="text-[10px] text-amber-400">Pre-seeded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoginLoading || isRegLoading}
                  onClick={() => {
                    setAuthMode("login");
                    handleQuickLogin(acc.email, acc.password, acc.name);
                  }}
                  className={`text-xs p-2.5 rounded-xl border transition-all text-left flex flex-col gap-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 ${acc.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{acc.role}</span>
                    <span className="text-[10px] opacity-75">{acc.badge}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Box */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-md">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === "login"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === "register"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register Account (with OTP)
              </button>
            </div>

            {/* ============================================================== */}
            {/* SIGN IN TAB */}
            {/* ============================================================== */}
            {authMode === "login" && (
              <div>
                <div className="mb-6 text-left">
                  <h2 className="text-xl font-bold text-white">Sign In to Campus</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter institutional credentials or pick a demo persona on the left.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                    <span>✕</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      College Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="ananya@college.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none"
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
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoginLoading}
                    className="w-full mt-2 font-bold py-2.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Dashboard
                  </Button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      New user? Register with email OTP verification here →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* REGISTER TAB WITH OTP */}
            {/* ============================================================== */}
            {authMode === "register" && (
              <div>
                <div className="mb-5 text-left">
                  <h2 className="text-xl font-bold text-white">Create Verified Account</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter details and verify with Email OTP. Only registered accounts can access the platform.
                  </p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                    <span>✕</span>
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                  {/* Role Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Select Role
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { key: "STUDENT", label: "Student", icon: GraduationCap },
                        { key: "CLUB_LEAD", label: "Club Lead", icon: Users },
                        { key: "CAFETERIA_STAFF", label: "Canteen", icon: Coffee },
                        { key: "ALUMNI", label: "Alumni", icon: UserCheck },
                        { key: "ADMIN", label: "Admin", icon: ShieldCheck },
                      ].map((r) => {
                        const Icon = r.icon;
                        const isSelected = regRole === r.key;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setRegRole(r.key as any)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-600/20 border-amber-500 text-amber-400 shadow-sm"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] truncate">{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core Details: Name, College Email */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Full Name *</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ananya Reddy"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">College Email *</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ananya@college.edu"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email OTP Verification Section */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Email OTP Verification</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30 active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Send className="w-3 h-3" />
                        {otpSent ? "Resend OTP" : "Send Verification OTP"}
                      </button>
                    </div>

                    {otpSent ? (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP (e.g. 849201)"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs tracking-widest focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setEnteredOtp("849201")}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                          >
                            Auto-fill (849201)
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Code dispatched! Check the toast notification in the bottom right corner.
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Click &quot;Send Verification OTP&quot; to receive your 6-digit mock confirmation code in a toast.
                      </p>
                    )}
                  </div>

                  {/* Roll Number, Department, Year, Phone */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Roll Number / Employee ID *</label>
                      <input
                        type="text"
                        required
                        value={regRollNumber}
                        onChange={(e) => setRegRollNumber(e.target.value)}
                        placeholder="e.g. 22ECE1047"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Department *</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                      >
                        {departments.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Academic Year</label>
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Password (min 6 chars) *</label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isRegLoading}
                    className="w-full mt-3 font-bold py-2.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Verify OTP & Register Account
                  </Button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Already registered? Sign in here →
                    </button>
                  </div>
                </form>
              </div>
            )}
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
