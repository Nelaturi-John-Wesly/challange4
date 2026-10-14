"use client";

import { useSidebar } from "@/components/layout/SidebarContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { CollegeLogo } from "@/components/shared/CollegeLogo";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, User as UserIcon, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

interface TopbarProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    collegeName?: string | null;
    collegeCity?: string | null;
    collegeState?: string | null;
    collegeLogoUrl?: string | null;
    collegeThemeColor?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const { toggleSidebar } = useSidebar();
  const collegeName = user.collegeName || "Narasaraopeta Engineering College";
  const collegeCity = user.collegeCity || "Narasaraopet";

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title / Branding Breadcrumb with 3-line Menu Icon & College Emblem */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
          className="p-2 -ml-1 sm:-ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic College Emblem & Name */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <CollegeLogo
            collegeName={collegeName}
            logoUrl={user.collegeLogoUrl}
            themeColor={user.collegeThemeColor}
            size="xs"
            className="w-7 h-7 hidden sm:flex"
          />
          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px] sm:max-w-xs md:max-w-md">
              {collegeName}
            </h1>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{collegeCity}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-amber-500 font-medium">Campus Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <ThemeToggle />

        {/* Profile Link & Signout */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <Link
            href="/profile"
            title="View & Edit Profile"
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/20 group-hover:ring-amber-500/50 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-all">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : <UserIcon className="w-4 h-4" />}
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
              <div className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                Profile & Settings →
              </div>
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
