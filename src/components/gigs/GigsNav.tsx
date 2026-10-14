"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Coins,
  FileCheck2,
  FolderKanban,
  PlusCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface GigsNavProps {
  userRole?: string;
  userName?: string;
}

export function GigsNav({ userRole = "STUDENT", userName }: GigsNavProps) {
  const pathname = usePathname();
  const store = useAppStore();

  const openGigsCount = store.gigs.filter((g) => g.status === "OPEN").length;
  const pendingApprovalsCount = store.gigs.filter((g) => g.status === "PENDING_APPROVAL").length;
  const pendingReportsCount = store.gigReports.filter((r) => r.status === "PENDING").length;

  const navLinks = [
    {
      name: "Gig Board",
      href: "/gigs",
      icon: Briefcase,
      badge: `${openGigsCount} live`,
      roles: ["STUDENT", "FACULTY", "ADMIN", "CLUB_LEAD", "RECRUITER", "ALUMNI", "CAFETERIA_STAFF"],
    },
    {
      name: "My Gigs & Tasks",
      href: "/gigs/my-gigs",
      icon: FolderKanban,
      roles: ["STUDENT", "FACULTY", "ADMIN", "CLUB_LEAD"],
    },
    {
      name: "Post a Gig",
      href: "/gigs/post",
      icon: PlusCircle,
      roles: ["STUDENT", "FACULTY", "ADMIN", "CLUB_LEAD"],
      highlight: true,
    },
    {
      name: "Wallet & Rewards",
      href: "/gigs/wallet",
      icon: Coins,
      roles: ["STUDENT", "ADMIN"],
    },
    {
      name: "Admin Control",
      href: "/gigs/admin",
      icon: ShieldAlert,
      badge: pendingApprovalsCount + pendingReportsCount > 0 ? `${pendingApprovalsCount + pendingReportsCount} pending` : undefined,
      badgeVariant: "danger" as const,
      roles: ["ADMIN"],
    },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(userRole));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      {/* Module Title & Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-md shadow-amber-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Campus Gigs
            </h1>
            <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
              Workplace
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student part-time marketplace · Verified faculty & club tasks · Stipends & hours
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <button
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : link.highlight
                    ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-slate-950" : "text-amber-500")} />
                <span>{link.name}</span>
                {link.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isActive
                        ? "bg-slate-950 text-amber-400"
                        : link.badgeVariant === "danger"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
