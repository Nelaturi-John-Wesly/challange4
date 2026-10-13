"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { PlacementDrive, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export default function PlacementsPage() {
  const store = useAppStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"drives" | "myapplications" | "stats">("drives");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  // Selected Drive for Modal Details
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // Student Profile Metrics
  const studentCgpa = 8.85;
  const studentBranch = "ECE";
  const studentBacklogs = 0;

  const filteredDrives = useMemo(() => {
    return store.drives.filter((d) => {
      const matchSearch =
        d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.locations.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBranch = branchFilter === "All" || d.eligibleBranches.includes(branchFilter);
      return matchSearch && matchBranch;
    });
  }, [store.drives, searchQuery, branchFilter]);

  const myApplications = useMemo(() => {
    return store.drives.filter((d) => d.appliedStatus && d.appliedStatus !== "none");
  }, [store.drives]);

  const handleApply = (drive: PlacementDrive) => {
    if (studentCgpa < drive.minCgpa) {
      toast({
        title: "Eligibility Criteria Not Met",
        description: `This drive requires minimum CGPA of ${drive.minCgpa} (Your CGPA: ${studentCgpa}).`,
        variant: "error",
      });
      return;
    }

    store.applyToDrive(drive.id);
    toast({
      title: "Application Dispatched!",
      description: `Resume forwarded to ${drive.company} Campus Recruitment Team.`,
      variant: "success",
    });
    setSelectedDrive(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Briefcase className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Placements & Corporate Internships
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                On-campus recruitment drives, CTC packages, eligibility filters, and corporate aptitude tests.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab("drives")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
              activeTab === "drives"
                ? "bg-rose-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Active Drives ({store.drives.length})
          </button>
          <button
            onClick={() => setActiveTab("myapplications")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "myapplications"
                ? "bg-rose-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Applied Status
            {myApplications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold">
                {myApplications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "stats"
                ? "bg-rose-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" /> CTC Analytics
          </button>
        </div>
      </div>

      {/* Student Eligibility Profile Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            AR
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Logged-in Candidate</span>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Ananya Reddy (Roll: 22ECE1047)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{studentBranch}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Cumulative CGPA</span>
            <span className="font-extrabold text-emerald-500 text-sm">{studentCgpa} / 10.0</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Active Backlogs</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{studentBacklogs}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Resume Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[10px]">
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: ACTIVE DRIVES */}
      {activeTab === "drives" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company, job role, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Eligible Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Disciplines</option>
                <option value="CSE">CSE Only</option>
                <option value="ECE">ECE Only</option>
                <option value="IT">IT Only</option>
                <option value="MECH">MECH Only</option>
              </select>
            </div>
          </div>

          {/* Drives Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDrives.map((drive) => {
              const isEligible = studentCgpa >= drive.minCgpa;
              const hasApplied = drive.appliedStatus && drive.appliedStatus !== "none";

              return (
                <div
                  key={drive.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border">
                        {drive.logo}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {drive.company}
                        </h3>
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {drive.role}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        CTC PACKAGE
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{drive.packageLPA} LPA
                      </span>
                    </div>
                  </div>

                  {/* Requirements Matrix */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">MINIMUM CGPA</span>
                      <span
                        className={cn(
                          "font-bold",
                          isEligible ? "text-slate-900 dark:text-slate-100" : "text-rose-500"
                        )}
                      >
                        {drive.minCgpa} (You: {studentCgpa})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">LOCATIONS</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {drive.locations}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ELIGIBLE BRANCHES</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {drive.eligibleBranches.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">REGISTRATION DEADLINE</span>
                      <span className="font-semibold text-rose-500">
                        {drive.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    {hasApplied ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Stage:</span>
                        <StatusBadge
                          status={drive.appliedStatus === "Selected" ? "Approved" : "In progress"}
                          label={drive.appliedStatus}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Ready to Submit</span>
                    )}

                    <div className="flex items-center gap-2">
                      {hasApplied ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold"
                        >
                          Application Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(drive)}
                          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          1-Click Apply Now
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

      {/* TAB 2: MY APPLICATIONS TRACKER */}
      {activeTab === "myapplications" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Your Campus Recruitment Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track round clearances, technical interview calls, and corporate offer letters.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Designation</th>
                    <th className="px-5 py-3">CTC</th>
                    <th className="px-5 py-3">Current Round / Stage</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{app.logo}</span> {app.company}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-rose-500">{app.role}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-500">
                        ₹{app.packageLPA} LPA
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {app.appliedStatus}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <StatusBadge
                          status={app.appliedStatus === "Selected" ? "Approved" : "In progress"}
                          label={app.appliedStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Highest Offer This Season</span>
            <p className="text-3xl font-black text-emerald-500 font-mono">₹48.5 LPA</p>
            <span className="text-xs text-slate-500">Uber ATG • Bangalore</span>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Average Placement Package</span>
            <p className="text-3xl font-black text-rose-500 font-mono">₹14.2 LPA</p>
            <span className="text-xs text-slate-500">Across 680+ Placed Students</span>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Visiting Recruiters</span>
            <p className="text-3xl font-black text-indigo-500 font-mono">142 Companies</p>
            <span className="text-xs text-slate-500">Tier-1 MNCs, Startups & Labs</span>
          </div>
        </div>
      )}
    </div>
  );
}
