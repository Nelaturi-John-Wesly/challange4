"use client";

import React from "react";
import { Mic, Sparkles } from "lucide-react";
import { useAssistant } from "./AssistantContext";
import { CampusAILogo } from "./CampusAILogo";

export function FloatingAssistantButton() {
  const { toggleOpen, isListening, startListening, isOpen, aiEnabled } = useAssistant();

  if (!aiEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Keyboard Shortcut Tooltip Chip (Shown when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleOpen}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Campus AI</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Toggle Campus AI Assistant"
        className={`relative group p-1 rounded-2xl transition-all duration-300 hover:scale-108 active:scale-95 shadow-2xl cursor-pointer ${
          isListening
            ? "ring-4 ring-cyan-500/50 shadow-cyan-500/40"
            : "shadow-indigo-900/50 hover:shadow-cyan-500/30"
        }`}
      >
        <CampusAILogo size="lg" isListening={isListening} />

        {/* Quick Voice Indicator Badge */}
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-700 shadow-md">
          <Mic className={`w-3.5 h-3.5 ${isListening ? "text-cyan-400 animate-bounce" : "text-slate-400"}`} />
        </div>
      </button>
    </div>
  );
}
