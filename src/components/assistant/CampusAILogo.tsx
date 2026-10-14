"use client";

import React from "react";

interface CampusAILogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  isListening?: boolean;
  className?: string;
}

export function CampusAILogo({
  size = "md",
  isListening = false,
  className = "",
}: CampusAILogoProps) {
  const sizeMap = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const orbSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${orbSize} ${className}`}>
      {/* Outer Pulse Rings (Active when listening) */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-cyan-500/40 animate-ping" />
          <span className="absolute -inset-1.5 rounded-full bg-indigo-500/30 animate-pulse" />
        </>
      )}

      {/* Futuristic Glassmorphic Orb Body */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-amber-400 p-[1.5px] shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105">
        <div className="w-full h-full rounded-2xl bg-slate-950/85 backdrop-blur-md flex items-center justify-center overflow-hidden">
          {/* Internal Neural Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-shimmer" />

          {/* AI Glyphic Monogram */}
          <svg
            className="w-3/5 h-3/5 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Geometric AETHER Crest */}
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
