"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateSkillMatch, MAX_ACTIVE_GIGS_PER_STUDENT, MAX_WEEKLY_HOURS_PER_STUDENT, useAppStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  ExternalLink,
  Flag,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Info,
  MapPin,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function GigDetailPage() {
  const params = useParams();
  const gigId = params?.id as string;
  const router = useRouter();
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const userRole = currentUser?.role || "STUDENT";

  const gig = useMemo(() => {
    return store.gigs.find((g) => g.id === gigId);
  }, [store.gigs, gigId]);

  // Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Suspicious Request or Upfront Fee");
  const [reportDetails, setReportDetails] = useState("");

  // Student specific check
  const studentSkills = ["Python", "React", "Next.js", "TypeScript", "Data Analysis", "Communication", "Event Management"];
  const skillMatchScore = useMemo(() => {
    if (!gig) return 100;
    return calculateSkillMatch(studentSkills, gig.requiredSkills);
  }, [gig]);

  const existingApplication = useMemo(() => {
    if (!currentUser?.id || !gig) return null;
    return store.gigApplications.find(
      (a) => a.gigId === gig.id && (a.studentId === currentUser.id || a.studentEmail === currentUser.email)
    );
  }, [store.gigApplications, currentUser, gig]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!gig) return;

    function updateCountdown() {
      if (!gig) return;
      const difference = new Date(gig.deadline).getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [gig]);

  if (!gig) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center text-left">
        <GigsNav userRole={userRole} userName={currentUser?.name || undefined} />
        <Card className="p-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Campus Gig Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This opportunity might have been archived, completed, or removed by administration.
          </p>
          <Link href="/gigs">
            <Button variant="outline" size="sm">
              ← Return to Gig Board
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const slotsRemaining = Math.max(0, gig.numberOfSlots - gig.slotsFilled);
  const isPoster = currentUser?.id === gig.postedBy.id;
  const isExpired = new Date(gig.deadline).getTime() < Date.now();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please share a brief note on your experience and why you are suited for this task.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    const result = store.applyToGig({
      gigId: gig.id,
      studentId: currentUser?.id || `usr-student-${Date.now()}`,
      studentName: currentUser?.name || "Student Applicant",
      studentEmail: currentUser?.email || "student@college.edu",
      studentDept: (currentUser as any)?.departmentCode || "Engineering",
      studentYear: 3,
      studentRating: 5.0,
      message: applyMessage,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Application Dispatched! 🚀",
        description: `Your application has been routed to ${gig.postedBy.name} for review.`,
        variant: "success",
      });
      setShowApplyModal(false);
      setApplyMessage("");
    } else {
      toast({
        title: "Application Blocked",
        description: result.error || "Could not submit application.",
        variant: "error",
      });
    }
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    store.reportGig({
      gigId: gig.id,
      reportedById: currentUser?.id || "usr-anon",
      reportedByName: currentUser?.name || "Campus User",
      reason: reportReason,
      details: reportDetails || "Flagged for administrative review.",
    });

    toast({
      title: "Task Report Filed",
      description: "Our campus administration team has been notified and will inspect this listing.",
      variant: "success",
    });
    setShowReportModal(false);
    setReportDetails("");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 text-left">
      {/* Top Nav */}
      <GigsNav userRole={userRole} userName={currentUser?.name || undefined} />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/gigs"
          className="text-xs font-semibold text-slate-500 hover:text-amber-500 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all gigs</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link Copied!", description: "Gig URL copied to clipboard.", variant: "info" });
              }
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-rose-500 hover:text-rose-400 gap-1.5 border-rose-500/20"
            onClick={() => setShowReportModal(true)}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Task</span>
          </Button>
        </div>
      </div>

      {/* Safety Notice on Cash Gigs */}
      {gig.rewardType === "CASH" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <b>Campus Safety Protocol:</b> Meet only in designated campus facilities (libraries, labs, open auditoriums).
            Never pay any money or advance deposit to get a task. Verified campus posters release rewards directly upon work approval.
          </div>
        </div>
      )}

      {/* Main Grid: Left Details (8 cols) & Right Sidebar Actions (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Comprehensive Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Header badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {gig.category}
                </span>

                <Badge
                  variant={
                    gig.status === "OPEN"
                      ? "success"
                      : gig.status === "IN_PROGRESS"
                      ? "warning"
                      : gig.status === "COMPLETED"
                      ? "info"
                      : "danger"
                  }
                  className="font-bold text-xs"
                >
                  {gig.status.replace("_", " ")}
                </Badge>

                {slotsRemaining > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {slotsRemaining} of {gig.numberOfSlots} slot{gig.numberOfSlots !== 1 ? "s" : ""} available
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {gig.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <b>{gig.location}</b> {gig.locationDetails ? `(${gig.locationDetails})` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Estimated: <b>{gig.estimatedHours} Hours total</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Posted: {new Date(gig.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Poster Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {gig.postedBy.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gig.postedBy.avatar}
                    alt={gig.postedBy.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                    {gig.postedBy.name[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {gig.postedBy.name}
                    </span>
                    {gig.postedBy.verified && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                        Verified {gig.postedBy.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {gig.postedBy.department} Department · Institutional Campus Staff
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-emerald-500 font-semibold block">
                  100% Track Record
                </span>
                <span className="text-[10px] text-slate-400">Past Gigs Settled Promptly</span>
              </div>
            </div>

            {/* Description & Deliverables */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Task Overview & Scope of Work</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {gig.description}
              </p>
            </div>

            {/* Required Skills & Student Match Meter */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Required Skills & Criteria</span>
                </h3>
                <span className="text-xs font-bold text-amber-500">
                  {skillMatchScore}% Profile Match
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {gig.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Institutional Rules Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Applicant Eligibility Rules
              </h4>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Must be an active student enrolled in the current semester.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Total work commitments must stay within the {MAX_WEEKLY_HOURS_PER_STUDENT} hours/week cap.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Maximum of {MAX_ACTIVE_GIGS_PER_STUDENT} concurrent active tasks allowed per student.
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions, Rewards & Countdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reward & Apply Card */}
          <Card className="p-6 space-y-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-white dark:via-slate-900 to-transparent">
            {/* Reward Card Header */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Reward Package
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                {gig.rewardType === "CASH" && gig.rewardAmount ? (
                  <span className="text-3xl font-extrabold text-emerald-500">
                    {formatCurrency(gig.rewardAmount)}
                  </span>
                ) : (
                  <span className="text-xl font-extrabold text-amber-500">
                    {gig.rewardType.replace("_", " ")}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">on approval</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                {gig.rewardDescription}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Time Remaining</span>
                </span>
                {isExpired && <span className="text-rose-500">EXPIRED</span>}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{timeLeft.days}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Days</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{timeLeft.hours}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Hours</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{timeLeft.minutes}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Mins</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-lg font-extrabold text-amber-500">{timeLeft.seconds}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Secs</div>
                </div>
              </div>
            </div>

            {/* Application Action Button */}
            <div className="space-y-3">
              {isPoster ? (
                <div className="space-y-2">
                  <Badge variant="info" className="w-full justify-center py-1.5 text-xs">
                    You are the Poster of this Gig
                  </Badge>
                  <Link href="/gigs/my-gigs">
                    <Button variant="primary" className="w-full">
                      Manage Applicants & Submissions
                    </Button>
                  </Link>
                </div>
              ) : existingApplication ? (
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Status: {existingApplication.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Submitted on {new Date(existingApplication.appliedAt).toLocaleDateString()}
                  </p>
                  <Link href="/gigs/my-gigs">
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                      Track in My Gigs →
                    </Button>
                  </Link>
                </div>
              ) : gig.status !== "OPEN" ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-500 font-bold">
                  This task is no longer accepting new applications.
                </div>
              ) : isExpired ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-500 font-bold">
                  The application deadline for this task has passed.
                </div>
              ) : slotsRemaining === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-500 font-bold">
                  All slots are currently filled. Check back if a spot opens!
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full py-3 text-sm font-bold shadow-lg shadow-amber-500/20 gap-2 cursor-pointer"
                  onClick={() => setShowApplyModal(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply for this Gig</span>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  Apply for Task
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {gig.title}
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Applicant Profile Snapshot */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {currentUser?.name || "Student Applicant"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Roll: {(currentUser as any)?.rollNumber || "22ECE1047"} · {(currentUser as any)?.departmentCode || "ECE"} (3rd Yr)
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 font-bold">
                  {skillMatchScore}% Match
                </Badge>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cover Note / Why are you suited for this task? <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mention your relevant skills, past projects, lab experience, or availability..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Safety Confirmation */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/20">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  By applying, you agree to fulfill the required deliverables under campus academic integrity guidelines.
                  No money is ever requested to apply.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Send Application"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-base text-rose-500 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>Report Task to Administration</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Help keep our student marketplace safe and verified.
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReport} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="Suspicious Request or Upfront Fee">Asks student for fee / payment</option>
                  <option value="Misleading Information or Scope">Misleading description or reward</option>
                  <option value="Off-Campus Risk">Asks to meet outside safe campus grounds</option>
                  <option value="Inappropriate Content">Inappropriate or offensive content</option>
                  <option value="Other Policy Violation">Other policy violation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Details / Evidence
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide context for campus moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Submit Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
