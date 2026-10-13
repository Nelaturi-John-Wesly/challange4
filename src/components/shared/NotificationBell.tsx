"use client";

import { useAppStore } from "@/lib/store";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export function NotificationBell() {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = store.notifications.filter((n) => !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer focus:outline-none"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">Campus Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => store.markAllNotificationsRead()}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {store.notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications yet.
              </div>
            ) : (
              store.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 text-left transition-colors hover:bg-slate-800/40 ${
                    !n.isRead ? "bg-amber-500/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5
                      className={`text-xs font-semibold ${
                        !n.isRead ? "text-amber-400 font-bold" : "text-slate-200"
                      }`}
                    >
                      {n.title}
                    </h5>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {n.createdAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  {n.link && (
                    <div className="mt-2">
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/40 text-center text-[10px] text-slate-500">
            Instant updates on club approvals, orders, tickets & grievances.
          </div>
        </div>
      )}
    </div>
  );
}
