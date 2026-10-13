"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Award,
  Calendar,
  Check,
  Clock,
  Flame,
  MapPin,
  Medal,
  Plus,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import React, { useState } from "react";

interface Fixture {
  id: string;
  sport: "Cricket" | "Basketball" | "Badminton" | "Football" | "Table Tennis";
  title: string;
  teamA: string;
  teamB: string;
  scoreA?: string;
  scoreB?: string;
  status: "LIVE" | "Upcoming" | "Completed";
  date: string;
  venue: string;
  winner?: string;
}

const INITIAL_FIXTURES: Fixture[] = [
  {
    id: "sp-1",
    sport: "Cricket",
    title: "Inter-Department T20 Cup: Semi Final 1",
    teamA: "ECE Titans",
    teamB: "CSE CyberKnights",
    scoreA: "148/6 (18.4 ov)",
    scoreB: "146/8 (20 ov)",
    status: "LIVE",
    date: "Today, 03:30 PM",
    venue: "Main Turf Pavilion",
  },
  {
    id: "sp-2",
    sport: "Basketball",
    title: "Inter-College Hoops Championship",
    teamA: "Host College Eagles",
    teamB: "BITS Hyderabad Hawks",
    scoreA: "64",
    scoreB: "58",
    status: "Completed",
    date: "Yesterday",
    venue: "Indoor Wooden Arena Court 1",
    winner: "Host College Eagles",
  },
  {
    id: "sp-3",
    sport: "Badminton",
    title: "Men's Singles Championship Finals",
    teamA: "Karthik Varma (CSE)",
    teamB: "Rohan Das (Mech)",
    status: "Upcoming",
    date: "Tomorrow, 05:00 PM",
    venue: "Indoor Badminton Court 2",
  },
  {
    id: "sp-4",
    sport: "Football",
    title: "Monsoon League Derby",
    teamA: "Civil Strikers",
    teamB: "ECE Titans",
    scoreA: "2",
    scoreB: "1",
    status: "Completed",
    date: "Apr 12, 2026",
    venue: "East Football Ground",
    winner: "Civil Strikers",
  },
];

export default function SportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"fixtures" | "standings" | "facility" | "register">("fixtures");
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);

  // Facility Booking State
  const [selectedFacility, setSelectedFacility] = useState("Badminton Court 1");
  const [bookingDate, setBookingDate] = useState("2026-04-18");
  const [bookingSlot, setBookingSlot] = useState("06:00 PM - 07:00 PM");
  const [bookedSlots, setBookedSlots] = useState<{ facility: string; slot: string; date: string }[]>([
    { facility: "Badminton Court 1", slot: "05:00 PM - 06:00 PM", date: "2026-04-18" },
  ]);

  // Team Registration Form
  const [teamForm, setTeamForm] = useState({
    tournament: "Inter-Department Cricket Cup",
    teamName: "",
    department: "ECE",
    captainName: "Ananya Reddy",
    phone: "+91 98765 43210",
    playerList: "",
  });

  const handleFacilityBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookedSlots([
      { facility: selectedFacility, slot: bookingSlot, date: bookingDate },
      ...bookedSlots,
    ]);

    toast({
      title: "Court Booking Confirmed!",
      description: `${selectedFacility} reserved for ${bookingDate} (${bookingSlot}).`,
      variant: "success",
    });
  };

  const handleTeamRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.teamName) return;

    toast({
      title: "Team Registration Accepted!",
      description: `"${teamForm.teamName}" has been entered into ${teamForm.tournament}.`,
      variant: "success",
    });

    setTeamForm({
      ...teamForm,
      teamName: "",
      playerList: "",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Sports & Athletics Council
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Live tournament scores, court bookings, standings, and inter-collegiate championships.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("fixtures")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "fixtures"
                ? "bg-emerald-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Activity className="w-4 h-4" /> Live Fixtures
          </button>
          <button
            onClick={() => setActiveTab("standings")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "standings"
                ? "bg-emerald-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Medal className="w-4 h-4" /> Points Table
          </button>
          <button
            onClick={() => setActiveTab("facility")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "facility"
                ? "bg-emerald-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Clock className="w-4 h-4" /> Court Booking
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "register"
                ? "bg-emerald-600 text-white shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Plus className="w-4 h-4" /> Register Team
          </button>
        </div>
      </div>

      {/* TAB 1: FIXTURES & LIVE MATCHES */}
      {activeTab === "fixtures" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixtures.map((fix) => {
              const isLive = fix.status === "LIVE";
              return (
                <div
                  key={fix.id}
                  className={cn(
                    "rounded-2xl bg-white dark:bg-slate-900 border p-5 shadow-sm space-y-4 transition-all",
                    isLive
                      ? "border-emerald-500 shadow-emerald-500/10 dark:shadow-emerald-950/20"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      {isLive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                      {fix.sport} • {fix.title}
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5",
                        isLive
                          ? "bg-emerald-500 text-slate-950 animate-pulse font-extrabold"
                          : fix.status === "Upcoming"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}
                    >
                      {fix.status}
                    </Badge>
                  </div>

                  {/* Scoreboard Cards */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {fix.teamA}
                      </span>
                      <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                        {fix.scoreA || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {fix.teamB}
                      </span>
                      <span className="font-mono font-black text-base text-slate-700 dark:text-slate-300">
                        {fix.scoreB || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {fix.date}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {fix.venue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STANDINGS */}
      {activeTab === "standings" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Annual Inter-Department Championship Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative standings across Cricket, Basketball, Football, Athletics, and Badminton.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-center">Gold 🥇</th>
                  <th className="px-5 py-3 text-center">Silver 🥈</th>
                  <th className="px-5 py-3 text-center">Bronze 🥉</th>
                  <th className="px-5 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { rank: 1, dept: "Electronics & Communication (ECE)", g: 4, s: 2, b: 1, pts: 145 },
                  { rank: 2, dept: "Computer Science & Engg (CSE)", g: 3, s: 3, b: 2, pts: 130 },
                  { rank: 3, dept: "Mechanical Engineering (MECH)", g: 2, s: 1, b: 3, pts: 85 },
                  { rank: 4, dept: "Civil Engineering (CIVIL)", g: 1, s: 2, b: 1, pts: 60 },
                  { rank: 5, dept: "Information Technology (IT)", g: 1, s: 1, b: 2, pts: 55 },
                ].map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-bold font-mono text-emerald-500">
                      #{row.rank}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {row.dept}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold">{row.g}</td>
                    <td className="px-5 py-3.5 text-center font-bold">{row.s}</td>
                    <td className="px-5 py-3.5 text-center font-bold">{row.b}</td>
                    <td className="px-5 py-3.5 text-right font-black text-emerald-500 text-sm font-mono">
                      {row.pts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACILITY BOOKING */}
      {activeTab === "facility" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Reserve Sports Facility Slot
            </h3>
            <p className="text-xs text-slate-500">
              Students and faculty can reserve slots for up to 60 minutes daily.
            </p>

            <form onSubmit={handleFacilityBook} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Facility / Court
                </label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100"
                >
                  <option>Badminton Court 1 (Synthetic)</option>
                  <option>Badminton Court 2 (Synthetic)</option>
                  <option>Squash Court A (Glass Back)</option>
                  <option>Table Tennis Hall (Table 3)</option>
                  <option>Indoor Basketball Half-Court</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Time Slot
                </label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100"
                >
                  <option>06:00 AM - 07:00 AM</option>
                  <option>07:00 AM - 08:00 AM</option>
                  <option>04:00 PM - 05:00 PM</option>
                  <option>05:00 PM - 06:00 PM</option>
                  <option>06:00 PM - 07:00 PM</option>
                  <option>07:00 PM - 08:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all"
              >
                Confirm Court Reservation
              </button>
            </form>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Your Booked Slots
            </h3>
            <div className="space-y-3">
              {bookedSlots.map((b, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      {b.facility}
                    </span>
                    <span className="text-slate-500">
                      {b.date} • {b.slot}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                    CONFIRMED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTER TEAM */}
      {activeTab === "register" && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Tournament Team Entry Form
            </h3>
            <p className="text-xs text-slate-500">
              Submit team roster for sanctioned university tournaments.
            </p>
          </div>

          <form onSubmit={handleTeamRegister} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Tournament</label>
              <select
                value={teamForm.tournament}
                onChange={(e) => setTeamForm({ ...teamForm, tournament: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option>Inter-Department Cricket Cup</option>
                <option>Annual Basketball Championship</option>
                <option>Inter-Collegiate Football Trophy</option>
                <option>Badminton Doubles Knockouts</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Squad Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ECE Mavericks"
                value={teamForm.teamName}
                onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Player Roster (Roll Numbers) *</label>
              <textarea
                rows={3}
                required
                placeholder="List players with names and roll numbers..."
                value={teamForm.playerList}
                onChange={(e) => setTeamForm({ ...teamForm, playerList: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
            >
              Submit Tournament Roster
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
