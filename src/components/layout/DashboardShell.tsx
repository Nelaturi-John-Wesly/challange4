"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Role } from "@prisma/client";
import React from "react";

interface DashboardShellProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Off-canvas slide-out Navigation Drawer: starts closed, opened on-demand via top-left 3-line icon */}
      <Sidebar userRole={user.role as Role} />

      {/* Main Full-Width Content Container */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
