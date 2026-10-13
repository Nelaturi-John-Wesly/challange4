"use client";

import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Lock,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useState } from "react";

export default function AdminControlPage() {
  const store = useAppStore();
  const { toast } = useToast();

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"SYSTEM" | "EVENT" | "CLUB">("SYSTEM");

  const [userSearch, setUserSearch] = useState("");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    store.dispatchNotification({
      title: `🚨 ${broadcastTitle}`,
      message: broadcastMessage,
      type: broadcastType,
      link: "/dashboard",
    });

    toast({
      title: "Campus Notification Broadcasted!",
      description: `Dispatched to all 3,420 registered student and faculty accounts.`,
      variant: "success",
    });

    setBroadcastTitle("");
    setBroadcastMessage("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Institutional Admin Control Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Campus-wide governance, emergency notification dispatch, system health metrics, and audit logs.
              </p>
            </div>
          </div>
        </div>

        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold self-start md:self-auto">
          Root Administrator Clearance
        </Badge>
      </div>

      {/* Campus Health & Institutional Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Enrollment</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">3,420</p>
          <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Fee Reconciled</span>
          <p className="text-2xl font-black text-emerald-500 font-mono">₹4.28 Cr</p>
          <span className="text-[11px] text-slate-400">Target: ₹5.00 Cr (85.6%)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Server Cluster Health</span>
          <p className="text-2xl font-black text-indigo-500 font-mono">99.98%</p>
          <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3" /> All 8 Nodes Up
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Grievances Resolved</span>
          <p className="text-2xl font-black text-rose-500 font-mono">94.2%</p>
          <span className="text-[11px] text-slate-400">Avg Resolution: 24h</span>
        </div>
      </div>

      {/* Two Column Grid: Emergency Broadcast + Role Roster */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Emergency Broadcast Station */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Campus Emergency Notification Dispatch
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Push real-time alerts instantly to all student notification bells and dashboards.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Alert Category</label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option value="SYSTEM">Administrative Announcement (High Priority)</option>
                <option value="EVENT">Campus Fest / Holiday Alert</option>
                <option value="CLUB">Society Inductions Broadcast</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Headline / Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Severe Rain Advisory: Hybrid Lectures Tomorrow"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Message Body *</label>
              <textarea
                rows={3}
                required
                placeholder="Detailed guidance, rescheduling instructions, and helpline numbers..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" /> Broadcast Instant Alert
            </button>
          </form>
        </div>

        {/* Security & Access Audit Stream */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Security & Audit Stream
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> LIVE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { time: "04:32 AM", event: "User 22ECE1047 (Ananya Reddy) registered for InnovateX Hackathon Pass #TKT-8491." },
              { time: "04:20 AM", event: "SBI Payment Gateway reconciled transaction #TXN-94182 (₹199 INR)." },
              { time: "04:05 AM", event: "Chef Ramesh updated Canteen Token #TK-8492 to 'READY FOR PICKUP'." },
              { time: "03:52 AM", event: "Dr. Arvind Narayanan approved Club Lead induction for Robotics Guild." },
              { time: "03:30 AM", event: "Nightly automated SQLite database snapshot synchronized with encrypted cloud backup." },
            ].map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5"
              >
                <span className="text-[10px] text-slate-400 shrink-0 font-bold">
                  [{log.time}]
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
