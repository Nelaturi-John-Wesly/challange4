"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Club, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";

export default function ClubsPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "STUDENT";
  const userName = session?.user?.name || "Ananya Reddy";
  const isLeadOrAdmin = userRole === "ADMIN" || userRole === "CLUB_LEAD";

  const [activeTab, setActiveTab] = useState<"browse" | "myclubs" | "lead">("browse");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [joinClubTarget, setJoinClubTarget] = useState<Club | null>(null);
  const [joinReason, setJoinReason] = useState("");
  const [joinSkills, setJoinSkills] = useState("");
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // New Club Lead Announcement
  const [announcementText, setAnnouncementText] = useState("");

  const filteredClubs = useMemo(() => {
    return store.clubs.filter((club) => {
      const matchCat = selectedCategory === "All" || club.category === selectedCategory;
      const matchSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [store.clubs, selectedCategory, searchQuery]);

  const myClubs = useMemo(() => {
    return store.clubs.filter((c) => c.joinStatus === "Approved" || c.joinStatus === "Pending");
  }, [store.clubs]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClubTarget) return;

    setIsSubmittingJoin(true);
    setTimeout(() => {
      store.joinClub(joinClubTarget.id, joinReason, joinSkills);
      setIsSubmittingJoin(false);
      setJoinClubTarget(null);
      setJoinReason("");
      setJoinSkills("");

      toast({
        title: "Membership Application Submitted!",
        description: `Your application to ${joinClubTarget.name} is now Pending review.`,
        variant: "success",
      });
    }, 600);
  };

  const handleReviewApplicant = (clubId: string, status: "Approved" | "Rejected") => {
    store.updateClubRequest(clubId, status);
    toast({
      title: `Membership ${status}`,
      description: `Student application has been ${status.toLowerCase()}.`,
      variant: status === "Approved" ? "success" : "info",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Clubs & Student Societies
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Join high-impact technical teams, cultural societies, and entrepreneurial cells.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab("browse")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all",
              activeTab === "browse"
                ? "bg-indigo-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            All Societies ({store.clubs.length})
          </button>
          <button
            onClick={() => setActiveTab("myclubs")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
              activeTab === "myclubs"
                ? "bg-indigo-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            My Clubs
            {myClubs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-bold">
                {myClubs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("lead")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
              activeTab === "lead"
                ? "bg-indigo-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Lead Portal
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE CLUBS */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clubs, domains, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {["All", "Tech", "Cultural", "Social", "Business"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Clubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const isMember = club.joinStatus === "Approved";
              const isPending = club.joinStatus === "Pending";

              return (
                <div
                  key={club.id}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                          {club.logo}
                        </span>
                        <div>
                          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] font-bold uppercase">
                            {club.category}
                          </Badge>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-indigo-500 transition-colors">
                            {club.name}
                          </h3>
                        </div>
                      </div>

                      {club.joinStatus && club.joinStatus !== "none" && (
                        <StatusBadge status={club.joinStatus} />
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {club.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {club.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Meta stats */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{club.membersCount} active members</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{club.eventsCount} events/year</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedClub(club)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all text-center"
                      >
                        Details
                      </button>

                      {isMember ? (
                        <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Member
                        </span>
                      ) : isPending ? (
                        <span className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold text-center">
                          Pending Review
                        </span>
                      ) : (
                        <button
                          onClick={() => setJoinClubTarget(club)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Apply to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY CLUBS */}
      {activeTab === "myclubs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Your Club Memberships
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep track of your active societies, meeting calls, and pending induction applications.
              </p>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">
              {myClubs.length} Active / Pending
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myClubs.map((club) => (
              <div
                key={club.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                      {club.logo}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {club.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Lead: {club.leadName}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={club.joinStatus || "Pending"} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {club.description}
                </p>

                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs flex items-center justify-between">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Next Guild Meet: Thursdays @ 05:00 PM
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Lab 4</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEAD & ADMIN PORTAL */}
      {activeTab === "lead" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Club Lead Induction Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Approve or reject prospective member applications and broadcast updates to your members.
              </p>
            </div>

            {/* Pending Applicants Queue */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Membership Applications
              </h3>

              {store.clubs.filter((c) => c.joinStatus === "Pending").length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  All candidate applications have been reviewed. No pending inductions!
                </div>
              ) : (
                store.clubs
                  .filter((c) => c.joinStatus === "Pending")
                  .map((club) => (
                    <div
                      key={club.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {userName} (Roll: 22ECE1047)
                          </span>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                            Applying to: {club.name}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Statement: "Passionate about autonomous flight systems, OpenCV, and competing in National RoboCup."
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReviewApplicant(club.id, "Approved")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewApplicant(club.id, "Rejected")}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY TO JOIN CLUB */}
      <ModalForm
        isOpen={!!joinClubTarget}
        onClose={() => setJoinClubTarget(null)}
        title={`Apply to ${joinClubTarget?.name || ""}`}
        description="Submit your induction profile to the Club Lead"
      >
        {joinClubTarget && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Why do you want to join this society? *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Mention your motivation, what projects you want to build, or how you plan to contribute..."
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Relevant Skills / Past Experience *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Python, ROS, Guitar, Public Speaking, Graphic Design"
                value={joinSkills}
                onChange={(e) => setJoinSkills(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setJoinClubTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingJoin}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Application
              </button>
            </div>
          </form>
        )}
      </ModalForm>

      {/* MODAL: CLUB DETAILS */}
      <ModalForm
        isOpen={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        title={selectedClub?.name || "Club Details"}
        description={`${selectedClub?.category || ""} Society • ${selectedClub?.membersCount || 0} Members`}
      >
        {selectedClub && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
              <span className="text-4xl">{selectedClub.logo}</span>
              <div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  {selectedClub.name}
                </span>
                <span className="text-slate-500">Lead: {selectedClub.leadName}</span>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Mission</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedClub.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <div>
                <span className="text-slate-400 block font-semibold">Active Members</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedClub.membersCount}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Events / Competitions</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedClub.eventsCount} Planned
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}
