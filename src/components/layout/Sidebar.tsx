"use client";

import { useSidebar } from "@/components/layout/SidebarContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  IdCard,
  Layers,
  LayoutDashboard,
  MapPin,
  Menu,
  Newspaper,
  ShieldAlert,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Core Operations (Phase 1)",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["STUDENT", "FACULTY", "ADMIN", "RECRUITER", "ALUMNI"],
      },
      {
        name: "Smart Attendance",
        href: "/attendance",
        icon: Clock,
        roles: ["STUDENT"],
        badge: "<75% Alert",
      },
      {
        name: "Mark Attendance",
        href: "/attendance/mark",
        icon: Clock,
        roles: ["FACULTY", "ADMIN"],
      },
      {
        name: "Timetable & Schedule",
        href: "/timetable",
        icon: Calendar,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Exam Schedule",
        href: "/timetable/exams",
        icon: FileText,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "LMS & Course Notes",
        href: "/lms",
        icon: BookOpen,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Assignments Portal",
        href: "/lms/assignments",
        icon: Layers,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Fee Portal & Gateway",
        href: "/fees",
        icon: CreditCard,
        roles: ["STUDENT", "ADMIN"],
      },
      {
        name: "Digital Student ID",
        href: "/id-card",
        icon: IdCard,
        roles: ["STUDENT"],
        badge: "QR",
      },
    ],
  },
  {
    title: "Campus Life & Community",
    items: [
      {
        name: "Clubs & Societies",
        href: "/clubs",
        icon: Users,
        roles: ["STUDENT", "FACULTY", "ADMIN", "ALUMNI"],
      },
      {
        name: "Events & Ticketing",
        href: "/events",
        icon: Bell,
        roles: ["STUDENT", "FACULTY", "ADMIN", "ALUMNI", "RECRUITER"],
      },
      {
        name: "Sports Tournaments",
        href: "/sports",
        icon: Trophy,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Student Media Cell",
        href: "/media",
        icon: Newspaper,
        roles: ["STUDENT", "FACULTY", "ADMIN", "ALUMNI"],
      },
    ],
  },
  {
    title: "Career & Research",
    items: [
      {
        name: "Placements & Internships",
        href: "/placements",
        icon: Award,
        roles: ["STUDENT", "RECRUITER", "ADMIN"],
      },
      {
        name: "Alumni Directory",
        href: "/alumni",
        icon: GraduationCap,
        roles: ["STUDENT", "ALUMNI", "FACULTY", "ADMIN"],
      },
      {
        name: "Research Showcase",
        href: "/research",
        icon: BookOpen,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
    ],
  },
  {
    title: "Campus Logistics",
    items: [
      {
        name: "Campus Map",
        href: "/campus-map",
        icon: MapPin,
        roles: ["STUDENT", "FACULTY", "ADMIN", "RECRUITER", "ALUMNI"],
      },
      {
        name: "Cafeteria Pre-Order",
        href: "/cafeteria",
        icon: Coffee,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Help Desk & Grievance",
        href: "/grievances",
        icon: HelpCircle,
        roles: ["STUDENT", "FACULTY", "ADMIN"],
      },
      {
        name: "Admin Control Center",
        href: "/admin",
        icon: ShieldAlert,
        roles: ["ADMIN"],
      },
    ],
  },
];

export function Sidebar({ userRole }: { userRole: Role }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen, isDesktopCollapsed } = useSidebar();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0"
            : isDesktopCollapsed
            ? "-translate-x-full"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-extrabold shadow-sm">
              C
            </div>
            <div>
              <span className="font-bold text-slate-100 text-base tracking-tight">
                CampusConnect
              </span>
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                {userRole} Portal
              </div>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(userRole)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.title}
                </p>
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                        isActive
                          ? "bg-amber-600/15 text-amber-400 font-semibold border border-amber-600/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "warning" : "default"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Role Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Logged in as:</span>
            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40">
              {userRole}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
}
