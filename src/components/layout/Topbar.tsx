"use client";

import { useSidebar } from "@/components/layout/SidebarContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import React from "react";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title / Branding Breadcrumb with 3-line Menu Icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
          className="p-2 -ml-1 sm:-ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Campus Portal
        </h1>
        <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">
          /
        </span>
        <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400">
          Academic Year 2024–2025
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        {/* User Card & Signout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{user.name}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase px-1.5 py-0 text-amber-500 border-amber-500/30 font-bold"
                >
                  {user.role}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
