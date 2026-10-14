"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { DemoLoginButtons } from "./DemoLoginButtons";
import { DemoAssistantPreview } from "./DemoAssistantPreview";
import { FeatureHighlights } from "./FeatureHighlights";

interface DemoSectionProps {
  onQuickLogin: (email: string, pass: string, name: string) => void;
  isLoading: boolean;
  demoModeEnabled?: boolean;
}

export function DemoSection({
  onQuickLogin,
  isLoading,
  demoModeEnabled = true,
}: DemoSectionProps) {
  if (!demoModeEnabled) return null;

  return (
    <section
      id="explore-demo"
      aria-label="Explore the Demo"
      className="w-full max-w-5xl mx-auto pt-16 pb-12 space-y-12 text-left"
    >
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Sandbox Preview
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Try the Portal Without Signing Up
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Evaluate instant pre-seeded accounts or test the voice-activated Campus AI in sandbox mode before registering.
        </p>
      </div>

      {/* 1. Quick Demo Login Buttons */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          ⚡ 1-Click Instant Login Roles
        </h3>
        <DemoLoginButtons onQuickLogin={onQuickLogin} isLoading={isLoading} />
      </div>

      {/* 2. Interactive "Try Campus AI" Sandbox Preview Card */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          🎙️ Live AI Voice &amp; Text Assistant
        </h3>
        <DemoAssistantPreview />
      </div>

      {/* 3. Feature Highlights & 3-Step Row */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          🌟 Core Platform Capabilities
        </h3>
        <FeatureHighlights />
      </div>
    </section>
  );
}
