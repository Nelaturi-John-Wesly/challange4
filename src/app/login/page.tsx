"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  Mail,
  Phone,
  School,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

const DEFAULT_DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "IT", name: "Information Technology" },
];

export default function LoginPage() {
  const router = useRouter();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("student@college.edu");
  const [loginPassword, setLoginPassword] = useState("Student@123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration Form States
  const [regRole, setRegRole] = useState<"STUDENT" | "FACULTY" | "ALUMNI" | "RECRUITER">("STUDENT");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regDepartment, setRegDepartment] = useState("CSE");

  // Student specific states
  const [regRollNumber, setRegRollNumber] = useState("");
  const [regBatch, setRegBatch] = useState("2024-2028");
  const [regYear, setRegYear] = useState("1");
  const [regSemester, setRegSemester] = useState("1");
  const [regSection, setRegSection] = useState("A");
  const [regBloodGroup, setRegBloodGroup] = useState("O+");
  const [regEmergencyContact, setRegEmergencyContact] = useState("");

  // Faculty specific states
  const [regEmployeeId, setRegEmployeeId] = useState("");
  const [regDesignation, setRegDesignation] = useState("Assistant Professor");
  const [regQualification, setRegQualification] = useState("Ph.D. / M.Tech");
  const [regCabinNumber, setRegCabinNumber] = useState("LHC-204");

  // Alumni specific states
  const [regGradYear, setRegGradYear] = useState("2023");
  const [regDegree, setRegDegree] = useState("B.Tech Computer Science");
  const [regCompany, setRegCompany] = useState("");
  const [regAlumniDesignation, setRegAlumniDesignation] = useState("Software Engineer");
  const [regIndustry, setRegIndustry] = useState("Information Technology");
  const [regLinkedinUrl, setRegLinkedinUrl] = useState("");

  // Recruiter specific states
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regRecruiterIndustry, setRegRecruiterIndustry] = useState("Technology");
  const [regWebsite, setRegWebsite] = useState("");

  // Departments list & Async feedback
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Fetch departments dynamically on mount
  useEffect(() => {
    fetch("/api/auth/register")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      })
      .catch(() => {
        // Fall back to default departments
      });
  }, []);

  // Handle Login Submission
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
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected authentication error occurred.");
      setIsLoginLoading(false);
    }
  };

  // Handle Quick Demo Login
  const handleQuickLogin = async (accEmail: string, accPass: string) => {
    setLoginEmail(accEmail);
    setLoginPassword(accPass);
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: accEmail,
        password: accPass,
      });

      if (res?.error) {
        setLoginError(res.error);
        setIsLoginLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected authentication error occurred.");
      setIsLoginLoading(false);
    }
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match. Please verify both password fields.");
      setIsRegLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters long.");
      setIsRegLoading(false);
      return;
    }

    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole,
        departmentCode: regDepartment,
        // Student fields
        rollNumber: regRollNumber,
        batch: regBatch,
        year: parseInt(regYear, 10),
        semester: parseInt(regSemester, 10),
        section: regSection,
        bloodGroup: regBloodGroup,
        emergencyContact: regEmergencyContact,
        // Faculty fields
        employeeId: regEmployeeId,
        designation: regDesignation,
        qualification: regQualification,
        cabinNumber: regCabinNumber,
        // Alumni fields
        graduationYear: parseInt(regGradYear, 10),
        degree: regDegree,
        company: regCompany,
        alumniDesignation: regAlumniDesignation,
        industry: regIndustry,
        linkedinUrl: regLinkedinUrl,
        // Recruiter fields
        companyName: regCompanyName,
        recruiterIndustry: regRecruiterIndustry,
        website: regWebsite,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Registration failed. Please check your details.");
        setIsRegLoading(false);
        return;
      }

      setRegSuccess("Account registered successfully! Signing you in automatically...");

      // Automatically sign in with newly registered account
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: regEmail,
        password: regPassword,
      });

      if (signInRes?.error) {
        // If auto-signin fails for any reason, prefill login and switch tabs
        setLoginEmail(regEmail);
        setLoginPassword(regPassword);
        setAuthMode("login");
        setIsRegLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setRegError("Failed to connect to registration server. Please try again.");
      setIsRegLoading(false);
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

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto my-6 grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Hero */}
        <div className="lg:col-span-5 space-y-5 text-left pt-2">
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
            Only registered institutional users are granted verified role-based access. Complete registration to unlock course materials, real-time attendance, digital ID, and student club memberships.
          </p>

          {/* Quick Demo Credentials */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ⚡ 1-Click Instant Demo Portals (Pre-registered)
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  disabled={isLoginLoading || isRegLoading}
                  onClick={() => {
                    setAuthMode("login");
                    handleQuickLogin(acc.email, acc.password);
                  }}
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
            {/* Tab Switcher: Sign In vs Register */}
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
                Register Account
              </button>
            </div>

            {/* ============================================================== */}
            {/* LOGIN FORM TAB */}
            {/* ============================================================== */}
            {authMode === "login" && (
              <div>
                <div className="mb-6 text-left">
                  <h2 className="text-xl font-bold text-white">Sign In to Campus</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your registered institutional credentials or choose a quick demo account.
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
                      Institutional Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showLoginPassword ? (
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
                      New student or faculty? Register your full account here →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* REGISTER FORM TAB */}
            {/* ============================================================== */}
            {authMode === "register" && (
              <div>
                <div className="mb-5 text-left">
                  <h2 className="text-xl font-bold text-white">Register Institutional Account</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill in your total information. Only registered profiles are authorized to sign in.
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
                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: "STUDENT", label: "Student", icon: GraduationCap },
                        { key: "FACULTY", label: "Faculty", icon: School },
                        { key: "ALUMNI", label: "Alumni", icon: UserCheck },
                        { key: "RECRUITER", label: "Recruiter", icon: Briefcase },
                      ].map((r) => {
                        const Icon = r.icon;
                        const isSelected = regRole === r.key;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setRegRole(r.key as any)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-600/20 border-amber-500 text-amber-400 shadow-sm"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 1: Basic User Information */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Full Name *</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Institutional Email *</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="rahul@college.edu"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

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
                          className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
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
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Department *</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                      >
                        {departments.map((dept) => (
                          <option key={dept.code} value={dept.code}>
                            {dept.code} - {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ROLE SPECIFIC COMPREHENSIVE FIELDS */}
                  {/* ============================================================== */}
                  {regRole === "STUDENT" && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        🎓 Student Academic Details
                      </div>

                      <div className="grid sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Roll Number *</label>
                          <input
                            type="text"
                            required
                            value={regRollNumber}
                            onChange={(e) => setRegRollNumber(e.target.value)}
                            placeholder="e.g. 23CSE045"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Batch *</label>
                          <input
                            type="text"
                            value={regBatch}
                            onChange={(e) => setRegBatch(e.target.value)}
                            placeholder="2024-2028"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Section</label>
                          <select
                            value={regSection}
                            onChange={(e) => setRegSection(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          >
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Academic Year</label>
                          <select
                            value={regYear}
                            onChange={(e) => setRegYear(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          >
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Semester</label>
                          <select
                            value={regSemester}
                            onChange={(e) => setRegSemester(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <option key={s} value={s}>
                                Sem {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Blood Group</label>
                          <select
                            value={regBloodGroup}
                            onChange={(e) => setRegBloodGroup(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          >
                            {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((bg) => (
                              <option key={bg} value={bg}>
                                {bg}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Parent Phone</label>
                          <input
                            type="tel"
                            value={regEmergencyContact}
                            onChange={(e) => setRegEmergencyContact(e.target.value)}
                            placeholder="+91 9123456780"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {regRole === "FACULTY" && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        🏛️ Faculty Profile Details
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Employee ID *</label>
                          <input
                            type="text"
                            required
                            value={regEmployeeId}
                            onChange={(e) => setRegEmployeeId(e.target.value)}
                            placeholder="e.g. FAC-CSE-105"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Designation</label>
                          <input
                            type="text"
                            value={regDesignation}
                            onChange={(e) => setRegDesignation(e.target.value)}
                            placeholder="e.g. Associate Professor"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Highest Qualification</label>
                          <input
                            type="text"
                            value={regQualification}
                            onChange={(e) => setRegQualification(e.target.value)}
                            placeholder="e.g. Ph.D. in Computer Science"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Cabin / Room Number</label>
                          <input
                            type="text"
                            value={regCabinNumber}
                            onChange={(e) => setRegCabinNumber(e.target.value)}
                            placeholder="e.g. LHC-304"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {regRole === "ALUMNI" && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        🌟 Alumni Network Details
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Graduation Year</label>
                          <input
                            type="number"
                            value={regGradYear}
                            onChange={(e) => setRegGradYear(e.target.value)}
                            placeholder="2022"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Degree Completed</label>
                          <input
                            type="text"
                            value={regDegree}
                            onChange={(e) => setRegDegree(e.target.value)}
                            placeholder="B.Tech Computer Science"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Current Employer / Company</label>
                          <input
                            type="text"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            placeholder="e.g. Microsoft / Infosys"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Current Job Title</label>
                          <input
                            type="text"
                            value={regAlumniDesignation}
                            onChange={(e) => setRegAlumniDesignation(e.target.value)}
                            placeholder="e.g. Cloud Architect"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {regRole === "RECRUITER" && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                        💼 Corporate Recruiter Details
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-400">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={regCompanyName}
                            onChange={(e) => setRegCompanyName(e.target.value)}
                            placeholder="e.g. Google India"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400">Industry / Domain</label>
                          <input
                            type="text"
                            value={regRecruiterIndustry}
                            onChange={(e) => setRegRecruiterIndustry(e.target.value)}
                            placeholder="e.g. Cloud & AI / Fintech"
                            className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Company Website</label>
                        <input
                          type="url"
                          value={regWebsite}
                          onChange={(e) => setRegWebsite(e.target.value)}
                          placeholder="https://careers.google.com"
                          className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isRegLoading}
                    className="w-full mt-3 font-bold py-2.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Complete Registration & Enter Portal
                  </Button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Already registered? Sign in with your credentials →
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
