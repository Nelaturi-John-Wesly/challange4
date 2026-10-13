"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Compass,
  Footprints,
  Info,
  Layers,
  MapPin,
  Navigation,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface Building {
  id: string;
  name: string;
  code: string;
  category: "Academic" | "Logistics" | "Living" | "Athletics";
  floors: number;
  highlightRooms: string[];
  description: string;
  timings: string;
}

const BUILDINGS: Building[] = [
  {
    id: "bld-1",
    name: "Lecture Hall Complex (LHC)",
    code: "LHC",
    category: "Academic",
    floors: 4,
    highlightRooms: ["Room 101-108", "Room 201-208", "Room 302 (DSP Lab)", "Seminar Hall A"],
    description: "Main instructional classrooms with smart audio-visual digital podiums and stepped seating.",
    timings: "08:00 AM - 08:00 PM",
  },
  {
    id: "bld-2",
    name: "Dr. APJ Abdul Kalam Innovation Hub",
    code: "IHUB",
    category: "Academic",
    floors: 5,
    highlightRooms: ["Robotics & Drone Lab (L1)", "Edge AI Compute Center", "E-Cell Incubator (L4)"],
    description: "24x7 collaborative space housing hardware prototyping equipment, 3D printers, and startup incubators.",
    timings: "24 Hours Open",
  },
  {
    id: "bld-3",
    name: "Central Administrative Block",
    code: "ADMIN",
    category: "Logistics",
    floors: 3,
    highlightRooms: ["Dean's Office (L1)", "Academic Accounts & Fee Counter", "Student Affairs Desk"],
    description: "Administrative headquarters handling admissions, fee clearances, transcripts, and faculty governance.",
    timings: "09:00 AM - 05:00 PM",
  },
  {
    id: "bld-4",
    name: "Central Library & Digital Commons",
    code: "LIB",
    category: "Academic",
    floors: 3,
    highlightRooms: ["Reading Hall (Silent)", "Digital Journal Access Room", "Book Stacks (L1-L2)"],
    description: "Over 85,000 volumes, IEEE Xplore terminals, and air-conditioned silent study cubicles.",
    timings: "08:00 AM - Midnight",
  },
  {
    id: "bld-5",
    name: "Central Food Court & Cafeteria",
    code: "CAFE",
    category: "Logistics",
    floors: 2,
    highlightRooms: ["Counter 1 (Fast Food)", "Counter 2 (South Indian Meals)", "Juice & Bakery Lounge"],
    description: "Modern food court with automated token ordering and digital pickup display screens.",
    timings: "07:30 AM - 10:30 PM",
  },
  {
    id: "bld-6",
    name: "Sports Complex & Indoor Arena",
    code: "SPORTS",
    category: "Athletics",
    floors: 2,
    highlightRooms: ["Synthetic Badminton Courts", "Squash Arena", "Gymnasium & Fitness Center"],
    description: "Multi-court complex supporting inter-university championships with professional wood sprung flooring.",
    timings: "06:00 AM - 09:30 PM",
  },
];

export default function CampusMapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(BUILDINGS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Wayfinding Pathfinder State
  const [startPoint, setStartPoint] = useState("Main Campus Entrance");
  const [destination, setDestination] = useState("Lecture Hall Complex (LHC)");
  const [isRouteCalculated, setIsRouteCalculated] = useState(false);

  const filteredBuildings = useMemo(() => {
    return BUILDINGS.filter((b) => {
      return (
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.highlightRooms.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <Compass className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Interactive Campus Blueprint & Navigator
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wayfinding directions, classroom locations, operating hours, and building directory.
              </p>
            </div>
          </div>
        </div>

        <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 font-bold self-start md:self-auto">
          65-Acre Smart Campus
        </Badge>
      </div>

      {/* Interactive Blueprint Map Visual Container */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-teal-500/30 p-6 text-white shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f766e15_1px,transparent_1px),linear-gradient(to_bottom,#0f766e15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Blueprint Top Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
              CAMPUS MASTER BLUEPRINT • GPS SYNC ACTIVE
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Latitude: 17.3850° N • Longitude: 78.4867° E
          </span>
        </div>

        {/* Map Building Hotspot Pins */}
        <div className="relative z-10 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuilding(b)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5",
                selectedBuilding.id === b.id
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-lg font-bold scale-105"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-teal-500/50"
              )}
            >
              <MapPin className="w-4 h-4 text-current" />
              <span className="text-xs font-bold leading-tight truncate w-full">{b.name.split("(")[0]}</span>
              <span className="text-[10px] font-mono opacity-80">[{b.code}]</span>
            </button>
          ))}
        </div>

        {/* Blueprint Footer Status */}
        <div className="relative z-10 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-400">Selected Facility:</span>
            <span className="font-semibold text-white">{selectedBuilding.name}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            Floors: {selectedBuilding.floors} • Hours: {selectedBuilding.timings}
          </span>
        </div>
      </div>

      {/* Two Column: Wayfinding Pathfinder + Selected Building Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Wayfinding Route Calculator */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Campus Walking Navigator
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Get instant turn-by-turn walking steps between any two campus facilities.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Starting Location
              </label>
              <select
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option>Main Campus Entrance</option>
                <option>Central Food Court & Cafeteria</option>
                <option>Central Library & Digital Commons</option>
                <option>Hostel Block A & B</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Destination Room / Facility
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option>Lecture Hall Complex (LHC Room 302)</option>
                <option>Innovation Hub (Drone Robotics Lab)</option>
                <option>Central Administrative Block (Accounts)</option>
                <option>Indoor Sports Complex Court 1</option>
              </select>
            </div>

            <button
              onClick={() => setIsRouteCalculated(true)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Footprints className="w-4 h-4" /> Calculate Walking Path
            </button>

            {isRouteCalculated && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 font-bold">
                  <span>Fastest Route: 280 Meters</span>
                  <span>~3.5 Mins Walking</span>
                </div>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] border-l-2 border-teal-500/40 pl-3 ml-1">
                  <p>1. Exit {startPoint} toward Central Palm Avenue.</p>
                  <p>2. Walk 120m straight past the Academic Fountain circle.</p>
                  <p>3. Take the covered glass corridor to {destination}.</p>
                  <p>4. Elevators & stairs located at the South Entrance atrium.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Facility Deep Directory */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 text-[10px] font-bold uppercase">
                {selectedBuilding.category} Facility
              </Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {selectedBuilding.name}
              </h3>
            </div>
            <span className="font-mono font-bold text-teal-500 text-xs px-2.5 py-1 rounded bg-teal-500/10">
              Code: {selectedBuilding.code}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {selectedBuilding.description}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border space-y-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
              Key Labs & Rooms Inside:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedBuilding.highlightRooms.map((room) => (
                <span
                  key={room}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300 text-[11px] font-medium shadow-sm"
                >
                  📍 {room}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] block uppercase font-bold text-slate-400">Total Floors</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBuilding.floors} Levels</span>
            </div>
            <div>
              <span className="text-[10px] block uppercase font-bold text-slate-400">Timings</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{selectedBuilding.timings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
