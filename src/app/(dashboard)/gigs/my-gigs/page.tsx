"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CampusGig,
  GigApplication,
  GigSubmission,
  MAX_ACTIVE_GIGS_PER_STUDENT,
  MAX_WEEKLY_HOURS_PER_STUDENT,
  useAppStore,
} from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function MyGigsPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "STUDENT";
  const userId = user?.id || "usr-ananya";

  // Mode: 'student' or 'poster'
  const isDefaultPoster = userRole === "FACULTY" || userRole === "CLUB_LEAD" || userRole === "ADMIN";
  const [activeMode, setActiveMode] = useState<"student" | "poster">(isDefaultPoster ? "poster" : "student");

  // Student Tabs: 'applied' | 'accepted' | 'submitted' | 'completed'
  const [studentTab, setStudentTab] = useState<"applied" | "accepted" | "submitted" | "completed">("accepted");

  // Poster Tabs: 'posted' | 'applicants' | 'in_progress' | 'needs_review' | 'completed'
  const [posterTab, setPosterTab] = useState<"posted" | "applicants" | "in_progress" | "needs_review" | "completed">("applicants");

  // Modals
  const [submissionModalGig, setSubmissionModalGig] = useState<CampusGig | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");

  const [revisionModalSub, setRevisionModalSub] = useState<GigSubmission | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const [ratingModalData, setRatingModalData] = useState<{
    gigId: string;
    toUserId: string;
    toName: string;
    role: "POSTER" | "STUDENT";
  } | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Student metrics
  const myApplications = useMemo(() => {
    return store.gigApplications.filter(
      (a) => a.studentId === userId || a.studentEmail === user?.email
    );
  }, [store.gigApplications, userId, user?.email]);

  const acceptedApps = myApplications.filter((a) => a.status === "ACCEPTED");
  const myActiveGigs = store.gigs.filter((g) =>
    acceptedApps.some((a) => a.gigId === g.id && (g.status === "IN_PROGRESS" || g.status === "SUBMITTED"))
  );
  const currentWeeklyHours = myActiveGigs.reduce((acc, g) => acc + g.estimatedHours, 0);

  // Poster metrics
  const myPostedGigs = useMemo(() => {
    return store.gigs.filter(
      (g) => g.postedBy.id === userId || (userRole === "FACULTY" && g.postedBy.role === "FACULTY")
    );
  }, [store.gigs, userId, userRole]);

  const myPostedGigIds = myPostedGigs.map((g) => g.id);

  const pendingApplicants = useMemo(() => {
    return store.gigApplications.filter(
      (a) => myPostedGigIds.includes(a.gigId) && a.status === "APPLIED"
    );
  }, [store.gigApplications, myPostedGigIds]);

  const submissionsToReview = useMemo(() => {
    return store.gigSubmissions.filter(
      (s) => myPostedGigIds.includes(s.gigId) && s.status === "SUBMITTED"
    );
  }, [store.gigSubmissions, myPostedGigIds]);

  // Handlers
  const handleDeliverWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionModalGig) return;

    store.submitGigWork({
      gigId: submissionModalGig.id,
      studentId: userId,
      studentName: user?.name || "Student Deliverer",
      notes: submissionNotes,
      filesOrLinks: submissionLink ? [{ title: "Deliverable Link", url: submissionLink }] : [],
    });

    toast({
      title: "Deliverables Uploaded! 🚀",
      description: `Your work for "${submissionModalGig.title}" has been sent to the poster for verification.`,
      variant: "success",
    });

    setSubmissionModalGig(null);
    setSubmissionNotes("");
    setSubmissionLink("");
  };

  const handleApproveWork = (sub: GigSubmission) => {
    store.reviewSubmission({
      submissionId: sub.id,
      decision: "APPROVED",
    });
    toast({
      title: "Work Approved & Reward Released! 🎉",
      description: `Task completed. Reward transaction has been dispatched to ${sub.studentName}.`,
      variant: "success",
    });
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionModalSub) return;

    store.reviewSubmission({
      submissionId: revisionModalSub.id,
      decision: "REVISION_REQUESTED",
      revisionNote: revisionFeedback || "Please review code formatting and add test verification.",
    });

    toast({
      title: "Revision Requested",
      description: "Feedback note sent to the student worker.",
      variant: "info",
    });

    setRevisionModalSub(null);
    setRevisionFeedback("");
  };

  const handleSendRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalData) return;

    store.rateGig({
      gigId: ratingModalData.gigId,
      fromUserId: userId,
      fromName: user?.name || "User",
      toUserId: ratingModalData.toUserId,
      toName: ratingModalData.toName,
      role: ratingModalData.role,
      stars: ratingStars,
      comment: ratingComment,
    });

    toast({
      title: "Review Published ⭐",
      description: `Thank you for reviewing ${ratingModalData.toName}!`,
      variant: "success",
    });

    setRatingModalData(null);
    setRatingStars(5);
    setRatingComment("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 text-left">
      {/* Top Nav */}
      <GigsNav userRole={userRole} userName={user?.name || undefined} />

      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>My Campus Tasks & Workflow</span>
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 uppercase">
              {activeMode === "student" ? "Applicant / Worker Mode" : "Poster / Employer Mode"}
            </Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track applications, deliver work, review applicants, and release verified student rewards.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode("student")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeMode === "student"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>
          <button
            onClick={() => setActiveMode("poster")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeMode === "poster"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Poster Portal</span>
            {pendingApplicants.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. STUDENT VIEW */}
      {/* ==================================================================== */}
      {activeMode === "student" && (
        <div className="space-y-6">
          {/* Study-Work Life Balance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Weekly Study-Work Cap</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {currentWeeklyHours} / {MAX_WEEKLY_HOURS_PER_STUDENT} hrs
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentWeeklyHours / MAX_WEEKLY_HOURS_PER_STUDENT) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                {MAX_WEEKLY_HOURS_PER_STUDENT - currentWeeklyHours} hrs remaining this week
              </span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent border-sky-500/20">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>Active Tasks</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {myActiveGigs.length} / {MAX_ACTIVE_GIGS_PER_STUDENT}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all"
                  style={{ width: `${(myActiveGigs.length / MAX_ACTIVE_GIGS_PER_STUDENT) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                Concurrent task limit
              </span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <span>Campus Wallet</span>
                </span>
                <div className="text-xl font-extrabold text-emerald-500 mt-1">
                  ₹2,200 <span className="text-xs font-normal text-slate-400">earned</span>
                </div>
              </div>
              <Link href="/gigs/wallet">
                <Button size="sm" variant="outline" className="text-xs border-emerald-500/30">
                  View Wallet →
                </Button>
              </Link>
            </Card>
          </div>

          {/* Student Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: "accepted", label: "In Progress / Accepted", count: acceptedApps.length },
              { id: "applied", label: "Applied / In Review", count: myApplications.filter((a) => a.status === "APPLIED").length },
              { id: "submitted", label: "Submitted for Review", count: store.gigSubmissions.filter((s) => s.studentId === userId).length },
              { id: "completed", label: "Completed", count: store.gigs.filter((g) => g.status === "COMPLETED").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudentTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  studentTab === tab.id
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* TAB 1: In Progress / Accepted Tasks */}
          {studentTab === "accepted" && (
            <div className="space-y-4">
              {acceptedApps.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>You have no active accepted gigs right now.</div>
                  <Link href="/gigs">
                    <Button size="sm" variant="outline" className="mt-2 text-xs">
                      Browse Open Gigs
                    </Button>
                  </Link>
                </Card>
              ) : (
                acceptedApps.map((app) => {
                  const gig = store.gigs.find((g) => g.id === app.gigId);
                  if (!gig) return null;
                  const existingSub = store.gigSubmissions.find((s) => s.gigId === gig.id);

                  return (
                    <Card key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-amber-500/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Accepted & Hired</Badge>
                          <span className="text-xs text-slate-500">· {gig.category}</span>
                          <span className="text-xs font-bold text-amber-500">{gig.rewardDescription}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {gig.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>Poster: <b>{gig.postedBy.name}</b> ({gig.postedBy.department})</span>
                          <span>Deadline: {new Date(gig.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/gigs/${gig.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Brief
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                          onClick={() => setSubmissionModalGig(gig)}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{existingSub ? "Update Submission" : "Submit Work"}</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Applied / Waiting */}
          {studentTab === "applied" && (
            <div className="space-y-3">
              {myApplications.filter((a) => a.status === "APPLIED").map((app) => {
                const gig = store.gigs.find((g) => g.id === app.gigId);
                return (
                  <Card key={app.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">In Review</Badge>
                        <span className="text-xs text-slate-400">Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {gig?.title || "Campus Gig"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                        "{app.message}"
                      </p>
                    </div>
                    <Link href={`/gigs/${app.gigId}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Gig →
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}

          {/* TAB 3: Submitted */}
          {studentTab === "submitted" && (
            <div className="space-y-3">
              {store.gigSubmissions.map((sub) => {
                const gig = store.gigs.find((g) => g.id === sub.gigId);
                return (
                  <Card key={sub.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.status === "APPROVED" ? "success" : sub.status === "REVISION_REQUESTED" ? "danger" : "info"}>
                          {sub.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {gig && (
                        <Link href={`/gigs/${gig.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Task
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {gig?.title || "Campus Deliverable"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <b>Your Notes:</b> {sub.notes}
                      </p>
                    </div>

                    {sub.revisionNote && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                        <b>Revision Feedback from Poster:</b> {sub.revisionNote}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* TAB 4: Completed */}
          {studentTab === "completed" && (
            <div className="space-y-3">
              {store.gigs.filter((g) => g.status === "COMPLETED").map((gig) => (
                <Card key={gig.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Completed & Settled</Badge>
                      <span className="text-xs text-emerald-500 font-bold">{gig.rewardDescription}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                      {gig.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Poster: {gig.postedBy.name} · {gig.postedBy.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={() =>
                        setRatingModalData({
                          gigId: gig.id,
                          toUserId: gig.postedBy.id,
                          toName: gig.postedBy.name,
                          role: "STUDENT",
                        })
                      }
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rate Poster</span>
                    </Button>
                    <Link href="/gigs/wallet">
                      <Button size="sm" variant="primary" className="text-xs">
                        Wallet →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. POSTER VIEW */}
      {/* ==================================================================== */}
      {activeMode === "poster" && (
        <div className="space-y-6">
          {/* Poster Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            {[
              { id: "applicants", label: "Review Applicants", count: pendingApplicants.length, alert: pendingApplicants.length > 0 },
              { id: "needs_review", label: "Submissions to Review", count: submissionsToReview.length, alert: submissionsToReview.length > 0 },
              { id: "posted", label: "My Posted Tasks", count: myPostedGigs.length },
              { id: "completed", label: "Completed Gigs", count: myPostedGigs.filter((g) => g.status === "COMPLETED").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPosterTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
                  posterTab === tab.id
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    tab.alert
                      ? "bg-rose-500 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* POSTER TAB 1: Review Applicants */}
          {posterTab === "applicants" && (
            <div className="space-y-4">
              {pendingApplicants.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>No pending student applicants to review.</div>
                </Card>
              ) : (
                pendingApplicants.map((app) => {
                  const gig = store.gigs.find((g) => g.id === app.gigId);
                  return (
                    <Card key={app.id} className="p-5 space-y-4 border-amber-500/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Applying For:</span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {gig?.title}
                          </h4>
                        </div>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-xs">
                          {gig?.slotsFilled} of {gig?.numberOfSlots} Slots Filled
                        </Badge>
                      </div>

                      {/* Applicant Profile */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                            {app.studentName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{app.studentName}</span>
                              <span className="text-xs text-amber-500 font-semibold">★ {app.studentRating || "5.0"}</span>
                            </div>
                            <div className="text-xs text-slate-400">
                              {app.studentDept} · Year {app.studentYear} · {app.studentEmail}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-400">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Cover Note */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-400 block mb-1">Applicant Note:</span>
                        "{app.message}"
                      </div>

                      {/* Decision Buttons */}
                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-rose-500 hover:text-rose-400 border-rose-500/30"
                          onClick={() => store.rejectApplicant(app.id)}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1.5 shadow-md shadow-amber-500/20"
                          onClick={() => store.acceptApplicant(app.id)}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Accept & Assign Slot</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* POSTER TAB 2: Submissions to Review */}
          {posterTab === "needs_review" && (
            <div className="space-y-4">
              {submissionsToReview.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>No pending deliverables awaiting your approval.</div>
                </Card>
              ) : (
                submissionsToReview.map((sub) => {
                  const gig = store.gigs.find((g) => g.id === sub.gigId);
                  return (
                    <Card key={sub.id} className="p-5 space-y-4 border-amber-500/30 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <Badge variant="warning" className="text-[10px]">
                            Deliverable Submitted
                          </Badge>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                            {gig?.title}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Worker:</span>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{sub.studentName}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 font-semibold">Student Notes & Findings:</div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          {sub.notes}
                        </p>
                      </div>

                      {sub.filesOrLinks?.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs text-slate-500 font-semibold">Attached Deliverables:</div>
                          <div className="flex flex-wrap gap-2">
                            {sub.filesOrLinks.map((f, idx) => (
                              <a
                                key={idx}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold flex items-center gap-1.5 hover:underline border border-amber-500/20"
                              >
                                <span>{f.title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Poster Decision Controls */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1"
                          onClick={() => setRevisionModalSub(sub)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1.5 shadow-md shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white"
                          onClick={() => handleApproveWork(sub)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Release Reward</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* POSTER TAB 3: My Posted Gigs */}
          {posterTab === "posted" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href="/gigs/post">
                  <Button size="sm" variant="primary" className="text-xs gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Create Another Task</span>
                  </Button>
                </Link>
              </div>

              {myPostedGigs.map((gig) => (
                <Card key={gig.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={gig.status === "OPEN" ? "success" : "warning"}>
                        {gig.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-slate-400">· {gig.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {gig.title}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Slots: <b>{gig.slotsFilled} of {gig.numberOfSlots}</b> filled · Reward: <b>{gig.rewardDescription}</b>
                    </div>
                  </div>

                  <Link href={`/gigs/${gig.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Task Details →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* POSTER TAB 4: Completed Gigs */}
          {posterTab === "completed" && (
            <div className="space-y-3">
              {myPostedGigs.filter((g) => g.status === "COMPLETED").map((gig) => (
                <Card key={gig.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <Badge variant="success">Completed</Badge>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                      {gig.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Reward Released: {gig.rewardDescription}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() =>
                      setRatingModalData({
                        gigId: gig.id,
                        toUserId: "usr-student",
                        toName: "Student Worker",
                        role: "POSTER",
                      })
                    }
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rate Student</span>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}

      {/* 1. Work Submission Modal */}
      {submissionModalGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Deliver Work for Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Task: {submissionModalGig.title}
                </p>
              </div>
              <button
                onClick={() => setSubmissionModalGig(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliverWork} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Work Notes & Executive Summary <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the tasks completed, outcomes achieved, or observations..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deliverable URL (GitHub PR, Google Drive, Figma, or Document Link)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmissionModalGig(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5 cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Deliverable</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 2. Request Revision Modal */}
      {revisionModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-amber-500">
                  Request Revision from Worker
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Worker: {revisionModalSub.studentName}
                </p>
              </div>
              <button
                onClick={() => setRevisionModalSub(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Revision Feedback & Action Items <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain clearly what changes, additions, or checks are needed..."
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevisionModalSub(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Send Feedback
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 3. Rating & Review Modal */}
      {ratingModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Rate & Review {ratingModalData.toName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ratings help build campus credibility scores.
                </p>
              </div>
              <button
                onClick={() => setRatingModalData(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRating} className="space-y-4">
              {/* Star selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    <span className={star <= ratingStars ? "text-amber-400" : "text-slate-600"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Comment & Testimonial
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share how it was to work together on this task..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRatingModalData(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Publish Rating
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
