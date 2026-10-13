"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useSidebar } from "@/components/layout/SidebarContext";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";
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
  const { isDesktopCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Role-based responsive navigation sidebar */}
      <Sidebar userRole={user.role as Role} />

      {/* Main content wrapper that shifts smoothly when sidebar collapses on desktop */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "lg:pl-0" : "lg:pl-64"
        )}
      >
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
