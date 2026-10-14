"use client";

import React, { useMemo, useState } from "react";
import { getCollegeLogoConfig, getCollegeInitials } from "@/lib/college";
import { cn } from "@/lib/utils";

interface CollegeLogoProps {
  collegeName?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showInitialsOnly?: boolean;
}

const SIZE_MAP = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
  "2xl": "w-28 h-28 text-3xl",
};

export function CollegeLogo({
  collegeName = "Campus College",
  logoUrl,
  themeColor,
  size = "md",
  className,
}: CollegeLogoProps) {
  const [imageError, setImageError] = useState(false);

  const name = collegeName || "Campus College";
  const cfg = useMemo(() => getCollegeLogoConfig(name, themeColor), [name, themeColor]);

  // If a valid uploaded custom logo exists and hasn't errored
  if (logoUrl && !imageError) {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-700/60 bg-slate-900 shadow-md",
          SIZE_MAP[size],
          className
        )}
        style={{ borderColor: cfg.primaryColor + "50" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${name} official emblem`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Deterministic SVG Generator
  const isCircle = cfg.shape === "circle";
  const isShield = cfg.shape === "shield";
  const isHexagon = cfg.shape === "hexagon";

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center font-black select-none transition-transform hover:scale-105",
        SIZE_MAP[size],
        className
      )}
      title={`${name} · Institutional Seal`}
      aria-label={`${name} Emblem`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={cfg.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.primaryColor} />
            <stop offset="100%" stopColor={cfg.secondaryColor} />
          </linearGradient>
          <filter id={`filter-${cfg.gradientId}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={cfg.primaryColor} floodOpacity="0.4" />
          </filter>
        </defs>

        <g filter={`url(#filter-${cfg.gradientId})`}>
          {isShield && (
            <path
              d="M 50 8 C 75 8, 92 12, 92 36 C 92 68, 64 88, 50 94 C 36 88, 8 68, 8 36 C 8 12, 25 8, 50 8 Z"
              fill={`url(#${cfg.gradientId})`}
              stroke={cfg.accentColor}
              strokeWidth="2.5"
            />
          )}

          {isHexagon && (
            <polygon
              points="50,6 90,28 90,72 50,94 10,72 10,28"
              fill={`url(#${cfg.gradientId})`}
              stroke={cfg.accentColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}

          {cfg.shape === "diamond" && (
            <rect
              x="18"
              y="18"
              width="64"
              height="64"
              rx="12"
              transform="rotate(45 50 50)"
              fill={`url(#${cfg.gradientId})`}
              stroke={cfg.accentColor}
              strokeWidth="2.5"
            />
          )}

          {isCircle && (
            <>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill={`url(#${cfg.gradientId})`}
                stroke={cfg.accentColor}
                strokeWidth="2.5"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={cfg.accentColor}
                strokeOpacity="0.35"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </>
          )}

          {/* Emblem Accents */}
          {cfg.emblem === "book" && (
            <path
              d="M 36 32 Q 50 28 50 36 Q 50 28 64 32 L 64 42 Q 50 38 50 46 Q 50 38 36 42 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {cfg.emblem === "torch" && (
            <>
              <path d="M 50 24 C 54 28, 54 32, 50 35 C 46 32, 46 28, 50 24 Z" fill="#ffffff" />
              <path d="M 45 36 L 55 36 L 52 45 L 48 45 Z" fill="#ffffff" opacity="0.9" />
            </>
          )}

          {cfg.emblem === "atom" && (
            <>
              <ellipse
                cx="50"
                cy="35"
                rx="12"
                ry="4.5"
                transform="rotate(30 50 35)"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <ellipse
                cx="50"
                cy="35"
                rx="12"
                ry="4.5"
                transform="rotate(-30 50 35)"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <circle cx="50" cy="35" r="2.2" fill="#ffffff" />
            </>
          )}

          {cfg.emblem === "grad" && (
            <>
              <polygon points="50,26 66,32 50,38 34,32" fill="#ffffff" />
              <path d="M 40 35 L 40 42 Q 50 46 60 42 L 60 35" fill="none" stroke="#ffffff" strokeWidth="1.8" />
            </>
          )}

          {cfg.emblem === "tech" && (
            <>
              <circle cx="50" cy="28" r="2.2" fill="#ffffff" />
              <circle cx="39" cy="38" r="2.2" fill="#ffffff" />
              <circle cx="61" cy="38" r="2.2" fill="#ffffff" />
              <line x1="50" y1="28" x2="39" y2="38" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="50" y1="28" x2="61" y2="38" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="39" y1="38" x2="61" y2="38" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}

          {cfg.emblem === "laurel" && (
            <>
              <path
                d="M 38 28 C 34 34, 36 42, 50 45 C 64 42, 66 34, 62 28"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
              />
              <circle cx="50" cy="30" r="2.2" fill="#ffffff" />
            </>
          )}

          {/* Acronym / Initials */}
          <text
            x="50"
            y={cfg.emblem ? "66" : "59"}
            textAnchor="middle"
            fontFamily="'Inter', -apple-system, sans-serif"
            fontWeight="900"
            fontSize={cfg.initials.length > 3 ? "19" : cfg.initials.length === 3 ? "23" : "27"}
            fill="#ffffff"
            letterSpacing="0.5"
          >
            {cfg.initials}
          </text>
        </g>
      </svg>
    </div>
  );
}
