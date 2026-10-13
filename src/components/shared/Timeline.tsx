"use client";

import { Check, Circle } from "lucide-react";
import React from "react";

export interface TimelineStep {
  title?: string;
  step?: string;
  description?: string;
  date?: string;
  status: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  steps?: TimelineStep[];
  items?: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, items, className = "" }: TimelineProps) {
  const list = steps || items || [];
  return (
    <div className={`space-y-4 ${className}`}>
      {list.map((step, idx) => {
        const isLast = idx === list.length - 1;
        const title = step.title || step.step || "";

        let iconBg = "bg-slate-800 text-slate-500 border-slate-700";
        let lineBg = "bg-slate-800";
        let titleColor = "text-slate-400";

        if (step.status === "completed") {
          iconBg = "bg-emerald-500 text-white border-emerald-400";
          lineBg = "bg-emerald-500/50";
          titleColor = "text-white font-semibold";
        } else if (step.status === "current") {
          iconBg = "bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/20";
          titleColor = "text-amber-400 font-bold";
        }

        return (
          <div key={idx} className="relative flex items-start gap-3.5">
            {/* Step Marker */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${iconBg}`}
              >
                {step.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-current" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-full absolute top-7 bottom-0 -mb-4 ${lineBg}`}
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>

            {/* Step Details */}
            <div className="flex-1 pb-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-xs ${titleColor}`}>{title}</h4>
                {step.date && (
                  <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                )}
              </div>
              {step.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
