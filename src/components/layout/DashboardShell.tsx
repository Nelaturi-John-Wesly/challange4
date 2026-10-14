"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Role } from "@prisma/client";
import React from "react";
import { AssistantProvider } from "@/components/assistant/AssistantContext";
import { FloatingAssistantButton } from "@/components/assistant/FloatingAssistantButton";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { CommandPalette } from "@/components/assistant/CommandPalette";

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <AssistantProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Off-canvas slide-out Navigation Drawer: starts closed, opened on-demand via top-left 3-line icon */}
        <Sidebar userRole={user.role as Role} user={user} />

        {/* Main Full-Width Content Container */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Topbar user={user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Campus AI (AETHER) Layer */}
        <FloatingAssistantButton />
        <AssistantPanel />
        <CommandPalette />
      </div>
    </AssistantProvider>
  );
}
