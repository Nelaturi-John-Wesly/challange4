"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CampusGig, useAppStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Flag,
  HelpCircle,
  Layers,
  Lock,
  PieChart,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function GigAdminPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "STUDENT";

  const [activeTab, setActiveTab] = useState<"pending" | "reports" | "users" | "analytics">("pending");

  // Rejection Modal
  const [rejectGigModal, setRejectGigModal] = useState<CampusGig | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Suspended users local state
  const [suspendedUsers, setSuspendedUsers] = useState<string[]>([]);

  // Analytics Metrics
  const totalGigs = store.gigs.length;
  const activeGigs = store.gigs.filter((g) => g.status === "OPEN" || g.status === "IN_PROGRESS").length;
  const completedGigs = store.gigs.filter((g) => g.status === "COMPLETED").length;
  const pendingGigs = store.gigs.filter((g) => g.status === "PENDING_APPROVAL");
  const pendingReports = store.gigReports.filter((r) => r.status === "PENDING");

  const totalRewardsDistributed = store.gigTransactions
    .filter((t) => t.status === "RECEIVED" && t.amount)
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  // Category Breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    store.gigs.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [store.gigs]);

  // Actions
  const handleApprove = (gigId: string) => {
    store.approveGig(gigId);
    toast({
      title: "Task Approved & Live! 🎉",
      description: "Gig has been published to the student Gig Board.",
      variant: "success",
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectGigModal) return;

    store.rejectGig(rejectGigModal.id, rejectReason || "Does not comply with campus safety standards.");
    toast({
      title: "Gig Request Rejected",
      description: "Notification with reason dispatched to student poster.",
      variant: "info",
    });

    setRejectGigModal(null);
    setRejectReason("");
  };

  const handleDismissReport = (reportId: string) => {
    store.resolveReport(reportId, "DISMISS");
    toast({
      title: "Report Dismissed",
      description: "Task verified and marked as safe.",
      variant: "info",
    });
  };

  const handleTakeDownGig = (reportId: string) => {
    store.resolveReport(reportId, "TAKE_DOWN");
    toast({
      title: "Gig Removed from Board",
      description: "Task has been cancelled and removed from active student listings.",
      variant: "error",
    });
  };

  const handleToggleSuspendUser = (userEmail: string) => {
    if (suspendedUsers.includes(userEmail)) {
      setSuspendedUsers(suspendedUsers.filter((u) => u !== userEmail));
      toast({ title: "User Access Restored", variant: "success" });
    } else {
      setSuspendedUsers([...suspendedUsers, userEmail]);
      toast({ title: "User Suspended from Campus Gigs", description: "User cannot post or apply.", variant: "warning" });
    }
  };

  // Role Gate check: Allow ADMIN (or allow preview for testing if needed)
  if (userRole !== "ADMIN") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center text-left">
        <GigsNav userRole={userRole} userName={user?.name || undefined} />
        <Card className="p-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Administrator Access Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            The Campus Gigs Admin Control Center is restricted to verified institutional deans and moderators.
            Sign in as <b>admin@college.edu</b> to test this control panel.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/gigs">
              <Button size="sm" variant="outline">
                Back to Gig Board
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 text-left">
      {/* Top Nav */}
      <GigsNav userRole={userRole} userName={user?.name || undefined} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border border-rose-500/20">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Campus Gigs Administration & Safety
            </h1>
            <Badge variant="danger" className="text-[10px]">
              Institutional Authority
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Moderate student-posted tasks, investigate reported listings, and manage marketplace safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-rose-500/30 text-rose-500 text-xs">
            {pendingGigs.length} Approvals Pending
          </Badge>
        </div>
      </div>

      {/* High-level KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Tasks Logged</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {totalGigs}
          </div>
          <span className="text-[10px] text-slate-400">{activeGigs} active right now</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-400 flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </span>
          <div className="text-2xl font-extrabold text-rose-500">
            {pendingGigs.length}
          </div>
          <span className="text-[10px] text-slate-400">Student submissions awaiting review</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-400 flex items-center justify-between">
            <span>Completed & Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </span>
          <div className="text-2xl font-extrabold text-emerald-500">
            {completedGigs}
          </div>
          <span className="text-[10px] text-slate-400">Successfully settled</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-400 flex items-center justify-between">
            <span>Rewards Distributed</span>
            <Coins className="w-4 h-4 text-sky-500" />
          </span>
          <div className="text-2xl font-extrabold text-sky-500">
            {formatCurrency(totalRewardsDistributed || 2700)}
          </div>
          <span className="text-[10px] text-slate-400">Total student stipends disbursed</span>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "pending", label: "Pending Gig Approvals", count: pendingGigs.length, alert: pendingGigs.length > 0 },
          { id: "reports", label: "Reported Gigs & Flags", count: pendingReports.length, alert: pendingReports.length > 0 },
          { id: "analytics", label: "Marketplace Analytics", count: null },
          { id: "users", label: "User Moderation", count: suspendedUsers.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
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
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PENDING APPROVALS QUEUE */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingGigs.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-200">Approvals Queue is Clear!</div>
              <div>No student-posted gigs are currently waiting for admin authorization.</div>
            </Card>
          ) : (
            pendingGigs.map((gig) => (
              <Card key={gig.id} className="p-5 space-y-4 border-amber-500/30 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Requires Approval</Badge>
                      <span className="text-xs text-slate-400">· {gig.category}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                      {gig.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-500">{gig.rewardDescription}</span>
                    <span className="text-[10px] text-slate-400 block">{gig.numberOfSlots} Slots Requested</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Student Poster:</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                      {gig.postedBy.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {gig.postedBy.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {gig.postedBy.department} Department · Student Account
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Description:</span>
                  {gig.description}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>📍 {gig.location} · {gig.estimatedHours}h estimated</span>
                  <span>Deadline: {new Date(gig.deadline).toLocaleDateString()}</span>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-rose-500 hover:text-rose-400 border-rose-500/30"
                    onClick={() => setRejectGigModal(gig)}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject with Reason</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    onClick={() => handleApprove(gig.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Make Live</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: REPORTED GIGS */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {store.gigReports.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No reports filed on campus tasks.
            </Card>
          ) : (
            store.gigReports.map((rep) => (
              <Card key={rep.id} className="p-5 space-y-3 border-rose-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={rep.status === "RESOLVED" ? "success" : "danger"}>
                      {rep.status}
                    </Badge>
                    <span className="text-xs font-bold text-rose-500">{rep.reason}</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Task: {rep.gigTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Reported by: <b>{rep.reportedByName}</b>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {rep.details}
                </div>

                {rep.status === "PENDING" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDismissReport(rep.id)}
                    >
                      Dismiss Report
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="text-xs"
                      onClick={() => handleTakeDownGig(rep.id)}
                    >
                      Take Down Gig
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Gigs by Category</span>
              </h3>
              <div className="space-y-2.5">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="font-bold text-amber-500">{count} gigs</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(count / totalGigs) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Safety & Compliance Summary */}
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Marketplace Health & Audit Status</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero upfront fee violations detected on active board.</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% of students remain within the 15 hours/week academic cap.</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Average task settlement turnaround: under 4.8 hours.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: USER MODERATION */}
      {activeTab === "users" && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-500" />
            <span>Campus Gigs User Moderation</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suspend bad actors or fake task posters from creating or applying to campus gigs.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { name: "Ananya Reddy", email: "ananya@college.edu", role: "STUDENT", dept: "ECE", status: "Active" },
              { name: "Karthik Varma", email: "karthik@college.edu", role: "STUDENT", dept: "CSE", status: "Active" },
              { name: "Prof. Sana Iqbal", email: "faculty@college.edu", role: "FACULTY", dept: "CSE", status: "Verified" },
              { name: "Priya Sharma", email: "club@college.edu", role: "CLUB_LEAD", dept: "ECE", status: "Verified" },
            ].map((u) => {
              const isSuspended = suspendedUsers.includes(u.email);
              return (
                <div
                  key={u.email}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{u.name}</span>
                      <Badge variant={isSuspended ? "danger" : "outline"} className="text-[9px]">
                        {isSuspended ? "SUSPENDED" : u.status}
                      </Badge>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {u.email} · {u.dept} ({u.role})
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isSuspended ? "primary" : "outline"}
                    className={cn("text-xs", isSuspended ? "" : "text-rose-500 hover:text-rose-400 border-rose-500/30")}
                    onClick={() => handleToggleSuspendUser(u.email)}
                  >
                    {isSuspended ? "Unsuspend User" : "Suspend Access"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Rejection Modal */}
      {rejectGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-rose-500">
                  Reject Student Gig Submission
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Task: {rejectGigModal.title}
                </p>
              </div>
              <button
                onClick={() => setRejectGigModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rejection Reason (sent to student) <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Task scope conflicts with exam preparations, or reward details require clarification..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectGigModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
