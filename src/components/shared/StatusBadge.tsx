"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import React from "react";

export type StatusType =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "In progress"
  | "Resolved"
  | "Open"
  | "Closed"
  | "Completed";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, label: customLabel, className = "", showIcon = true }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = "border-slate-700 bg-slate-800/60 text-slate-300";
  let icon = <Clock className="w-3 h-3" />;
  let label = customLabel || status;

  if (normalized.includes("pending")) {
    styles = "border-amber-500/40 bg-amber-500/10 text-amber-400";
    icon = <Clock className="w-3 h-3 text-amber-400" />;
    label = "Pending";
  } else if (normalized.includes("approved") || normalized.includes("selected") || normalized.includes("verified")) {
    styles = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    label = "Approved";
  } else if (normalized.includes("rejected") || normalized.includes("cancelled") || normalized.includes("declined")) {
    styles = "border-rose-500/40 bg-rose-500/10 text-rose-400";
    icon = <XCircle className="w-3 h-3 text-rose-400" />;
    label = "Rejected";
  } else if (normalized.includes("progress") || normalized.includes("preparing") || normalized.includes("interview")) {
    styles = "border-sky-500/40 bg-sky-500/10 text-sky-400";
    icon = <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />;
    label = "In progress";
  } else if (normalized.includes("resolved") || normalized.includes("ready") || normalized.includes("completed")) {
    styles = "border-purple-500/40 bg-purple-500/10 text-purple-400";
    icon = <CheckCircle2 className="w-3 h-3 text-purple-400" />;
    label = "Resolved";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}
