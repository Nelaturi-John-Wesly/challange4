"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CampusGig, GigCategory, GigRewardType, useAppStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  ArrowUpDown,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  FileCheck2,
  Filter,
  GraduationCap,
  HelpCircle,
  Laptop,
  Layers,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

const CATEGORIES: (GigCategory | "All")[] = [
  "All",
  "Teaching/Tutoring",
  "Events Help",
  "Lab/Research Assistance",
  "Design/Content",
  "Data Entry/Documentation",
  "Tech/Coding",
  "Errands/Campus Help",
  "Other",
];

const REWARD_TYPES: (GigRewardType | "All")[] = [
  "All",
  "CASH",
  "CANTEEN_COUPON",
  "CERTIFICATE",
  "VOLUNTEER_HOURS",
];

export default function GigBoardPage() {
  const store = useAppStore();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "STUDENT";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GigCategory | "All">("All");
  const [selectedReward, setSelectedReward] = useState<GigRewardType | "All">("All");
  const [locationFilter, setLocationFilter] = useState<"All" | "On-campus" | "Remote">("All");
  const [slotsOnly, setSlotsOnly] = useState(false);
  const [minReward, setMinReward] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"newest" | "highestReward" | "endingSoon">("newest");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Statistics calculation
  const totalOpenGigs = store.gigs.filter((g) => g.status === "OPEN").length;
  const totalCashPool = store.gigs
    .filter((g) => g.status === "OPEN" && g.rewardType === "CASH" && g.rewardAmount)
    .reduce((acc, g) => acc + (g.rewardAmount || 0), 0);
  const totalParticipants = store.gigApplications.filter((a) => a.status === "ACCEPTED").length;

  // Filter and Sort Gigs
  const filteredGigs = useMemo(() => {
    return store.gigs
      .filter((gig) => {
        // Exclude pending approval unless Admin or the poster themselves
        if (gig.status === "PENDING_APPROVAL") {
          const isOwner = user?.id && gig.postedBy.id === user.id;
          const isAdmin = userRole === "ADMIN";
          if (!isOwner && !isAdmin) return false;
        }

        // Search Match
        const matchSearch =
          gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gig.postedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gig.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category Filter
        const matchCategory =
          selectedCategory === "All" || gig.category === selectedCategory;

        // Reward Type Filter
        const matchReward =
          selectedReward === "All" || gig.rewardType === selectedReward;

        // Location Filter
        const matchLocation =
          locationFilter === "All" || gig.location === locationFilter;

        // Available slots only
        const matchSlots = !slotsOnly || gig.numberOfSlots - gig.slotsFilled > 0;

        // Min reward
        const matchMinReward = minReward === 0 || (gig.rewardAmount && gig.rewardAmount >= minReward);

        return matchSearch && matchCategory && matchReward && matchLocation && matchSlots && matchMinReward;
      })
      .sort((a, b) => {
        if (sortBy === "highestReward") {
          return (b.rewardAmount || 0) - (a.rewardAmount || 0);
        }
        if (sortBy === "endingSoon") {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    store.gigs,
    searchQuery,
    selectedCategory,
    selectedReward,
    locationFilter,
    slotsOnly,
    minReward,
    sortBy,
    user?.id,
    userRole,
  ]);

  // Top Earners & Helpers leaderboard mock data
  const topEarners = [
    { name: "Ananya Reddy", dept: "ECE (3rd Yr)", gigsDone: 8, earned: "₹11,400", rating: 5.0, badge: "5-Star Helper" },
    { name: "Karthik Varma", dept: "CSE (3rd Yr)", gigsDone: 6, earned: "₹9,200", rating: 4.9, badge: "Top Tech Contributor" },
    { name: "Rohan Nair", dept: "IT (4th Yr)", gigsDone: 5, earned: "₹7,600", rating: 4.8, badge: "Audio/AV Specialist" },
    { name: "Sneha Sen", dept: "BioTech (2nd Yr)", gigsDone: 4, earned: "₹5,800", rating: 5.0, badge: "Lab Assistant Star" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Top Gigs Navigation */}
      <GigsNav userRole={userRole} userName={user?.name || undefined} />

      {/* Hero / Banner with Highlights */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/5 border border-amber-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Active Campus Marketplace
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Find Student Tasks, Mentorship & Paid Gigs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Work with professors, club presidents, and departmental labs. Earn verified stipends,
              canteen meal passes, and volunteer hours designed around your lecture timetable.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Upfront Fees Guaranteed</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-sky-600 dark:text-sky-400">
                <Clock className="w-4 h-4" />
                <span>15h Study-Life Weekly Cap</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm min-w-28 text-center">
              <div className="text-xl font-extrabold text-amber-500">{totalOpenGigs}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Live Tasks</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm min-w-28 text-center">
              <div className="text-xl font-extrabold text-emerald-500">
                {formatCurrency(totalCashPool)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Reward Pool</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm min-w-28 text-center">
              <div className="text-xl font-extrabold text-sky-500">{totalParticipants}+</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Hired Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <b>Official Campus Rule:</b> Meet only on campus premises. Never pay money, registration fees,
            or deposits to secure a gig. Report any violations directly to administration.
          </span>
        </div>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="text-xs font-bold text-amber-500 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>{showLeaderboard ? "Hide Leaderboard" : "Top Helpers"}</span>
        </button>
      </div>

      {/* Collapsible Leaderboard Widget */}
      {showLeaderboard && (
        <Card className="p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Top Gig Earners of the Month (October 2026)
              </h3>
            </div>
            <Badge variant="warning">Honor Roll</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topEarners.map((e, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                  #{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {e.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {e.dept} · {e.gigsDone} gigs
                  </div>
                  <div className="text-[11px] font-bold text-emerald-500 mt-0.5">
                    {e.earned} earned
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/30 text-amber-500 shrink-0">
                  ★ {e.rating}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filters Header */}
      <div className="space-y-3">
        {/* Row 1: Search Bar + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gigs by skill (Python, Figma, IoT), task name, or faculty poster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-slate-900">Newest First</option>
                <option value="highestReward" className="dark:bg-slate-900">Highest Reward</option>
                <option value="endingSoon" className="dark:bg-slate-900">Deadline: Ending Soon</option>
              </select>
            </div>

            <Link href="/gigs/post">
              <Button size="sm" variant="primary" className="gap-1.5 whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span>Post a Task</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Row 3: Secondary Filters (Reward, Location, Available Slots) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Reward Type Pill */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Reward:</span>
            <div className="flex items-center gap-1">
              {REWARD_TYPES.map((rew) => (
                <button
                  key={rew}
                  onClick={() => setSelectedReward(rew)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    selectedReward === rew
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {rew === "All" ? "All" : rew.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Location Toggle */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Location:</span>
            {(["All", "On-campus", "Remote"] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                  locationFilter === loc
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {loc}
              </button>
            ))}
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Open Slots Only Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={slotsOnly}
              onChange={(e) => setSlotsOnly(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Open slots only</span>
          </label>
        </div>
      </div>

      {/* Gigs Grid */}
      {filteredGigs.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No matching campus gigs found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, reset category filters, or be the first to post a new task.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedReward("All");
              setLocationFilter("All");
              setSlotsOnly(false);
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGigs.map((gig) => {
            const slotsRemaining = Math.max(0, gig.numberOfSlots - gig.slotsFilled);
            const isDeadlinePassed = new Date(gig.deadline).getTime() < Date.now();
            const daysLeft = Math.ceil(
              (new Date(gig.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Card
                key={gig.id}
                className={cn(
                  "group relative overflow-hidden flex flex-col justify-between p-5 transition-all duration-300 bg-white dark:bg-slate-900 border",
                  gig.status === "OPEN"
                    ? "border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5"
                    : "border-slate-200 dark:border-slate-800/60 opacity-80"
                )}
              >
                {/* Status Indicator Bar at Top */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {gig.category}
                    </span>

                    {/* Reward Badge */}
                    <Badge
                      variant={
                        gig.rewardType === "CASH"
                          ? "success"
                          : gig.rewardType === "CANTEEN_COUPON"
                          ? "warning"
                          : gig.rewardType === "CERTIFICATE"
                          ? "info"
                          : "default"
                      }
                      className="font-bold text-[11px]"
                    >
                      {gig.rewardType === "CASH" && gig.rewardAmount
                        ? `₹${gig.rewardAmount}`
                        : gig.rewardType.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link href={`/gigs/${gig.id}`}>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-2 cursor-pointer">
                        {gig.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {gig.description}
                    </p>
                  </div>

                  {/* Poster Info */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {gig.postedBy.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gig.postedBy.avatar}
                        alt={gig.postedBy.name}
                        className="w-7 h-7 rounded-full object-cover border border-amber-500/20"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        {gig.postedBy.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <span className="truncate">{gig.postedBy.name}</span>
                        {gig.postedBy.verified && (
                          <span
                            className="inline-flex items-center text-[10px] text-amber-500 font-bold"
                            title="Verified Campus Poster"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {gig.postedBy.role} · {gig.postedBy.department}
                      </div>
                    </div>
                  </div>

                  {/* Required Skills Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {gig.requiredSkills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {skill}
                      </span>
                    ))}
                    {gig.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{gig.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Meta & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {gig.location}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {gig.estimatedHours} hrs est.
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        slotsRemaining === 0 ? "text-rose-500" : "text-emerald-500"
                      )}
                    >
                      {slotsRemaining} of {gig.numberOfSlots} slot{gig.numberOfSlots !== 1 ? "s" : ""} left
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {isDeadlinePassed ? (
                        <span className="text-rose-400 font-semibold">Expired</span>
                      ) : daysLeft <= 2 ? (
                        <span className="text-amber-500 font-bold">Ends in {daysLeft}d</span>
                      ) : (
                        <span>Deadline: {daysLeft} days</span>
                      )}
                    </span>

                    <Link href={`/gigs/${gig.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-3 group-hover:border-amber-500/40">
                        View & Apply →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
