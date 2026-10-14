"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Compass,
  FileText,
  MapPin,
  Mic,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAssistant } from "./AssistantContext";
import { CampusAILogo } from "./CampusAILogo";

export function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, setIsOpen, sendMessage, startListening } = useAssistant();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.resultsByModule);
        } catch {
          // Ignored
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, paletteOpen]);

  if (!paletteOpen) return null;

  const quickNav = [
    { label: "Check Attendance", icon: BookOpen, url: "/attendance" },
    { label: "Timetable & Exams", icon: Calendar, url: "/timetable" },
    { label: "Campus Gigs (Work-Study)", icon: Briefcase, url: "/gigs" },
    { label: "Corporate Placements", icon: Compass, url: "/placements" },
    { label: "Campus Map & Library", icon: MapPin, url: "/campus-map" },
    { label: "Student Profile", icon: Users, url: "/profile" },
  ];

  const handleSelectNav = (url: string) => {
    setPaletteOpen(false);
    router.push(url);
  };

  const handleAskAI = (q: string) => {
    setPaletteOpen(false);
    setIsOpen(true);
    sendMessage(q);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/70">
          <CampusAILogo size="sm" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search modules, or ask Campus AI (e.g. 'attendance in DBMS')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleAskAI(query);
              }
            }}
          />

          {/* Voice Mic Trigger */}
          <button
            type="button"
            onClick={() => {
              setPaletteOpen(false);
              setIsOpen(true);
              startListening();
            }}
            title="Speak command"
            className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Ask AI prompt when query typed */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => handleAskAI(query)}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border border-cyan-500/30 hover:border-cyan-500/60 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <div>
                  <span className="font-bold text-white">Ask AETHER AI:</span>
                  <span className="text-cyan-300 ml-1.5">"{query}"</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Press Enter ↵</span>
            </button>
          )}

          {/* Live Search Results */}
          {results && (
            <div className="space-y-3">
              {results.events?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">Campus Events</h4>
                  <div className="space-y-1">
                    {results.events.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectNav(item.url)}
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px]">{item.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.gigs?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Campus Gigs</h4>
                  <div className="space-y-1">
                    {results.gigs.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectNav(item.url)}
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">{item.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.placements?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1.5">Placements</h4>
                  <div className="space-y-1">
                    {results.placements.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectNav(item.url)}
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px]">{item.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.faqs?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5">Knowledge Base & Circulars</h4>
                  <div className="space-y-1">
                    {results.faqs.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectNav(item.url)}
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px]">{item.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickNav.map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.url}
                    type="button"
                    onClick={() => handleSelectNav(nav.url)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-2.5 text-left text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">{nav.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">↑↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">↵</kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Close:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
