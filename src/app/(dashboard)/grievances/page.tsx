"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Timeline } from "@/components/shared/Timeline";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { GrievanceTicket, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";

export default function GrievancesPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "STUDENT";
  const userName = session?.user?.name || "Ananya Reddy";
  const userRoll = (session?.user as any)?.rollNumber || "22ECE1047";
  const isAdmin = userRole === "ADMIN" || userRole === "FACULTY";

  const [activeTab, setActiveTab] = useState<"mytickets" | "admin">("mytickets");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // New Grievance Modal
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    category: "Infrastructure" as const,
    description: "",
    location: "Lecture Hall Complex, Room 302",
  });

  // Selected Ticket for Modal View / Admin Resolution
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState("");

  const filteredTickets = useMemo(() => {
    return store.grievances.filter((g) => {
      const matchCat = selectedCategory === "All" || g.category === selectedCategory;
      return matchCat;
    });
  }, [store.grievances, selectedCategory]);

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title || !newForm.description) return;

    const ticketNo = store.raiseGrievance({
      studentName: userName,
      studentRoll: userRoll,
      category: newForm.category,
      title: newForm.title,
      description: newForm.description,
      location: newForm.location,
    });

    toast({
      title: "Grievance Ticket Registered!",
      description: `Ticket #${ticketNo} logged with Campus Administration.`,
      variant: "success",
    });

    setIsRaiseOpen(false);
    setNewForm({
      title: "",
      category: "Infrastructure",
      description: "",
      location: "Lecture Hall Complex, Room 302",
    });
  };

  const handleStatusUpdate = (ticketId: string, status: "In progress" | "Resolved") => {
    store.updateGrievanceStatus(ticketId, status, resolutionRemarks);
    toast({
      title: `Grievance Updated: ${status}`,
      description: `Ticket status updated to ${status}. Student notified.`,
      variant: status === "Resolved" ? "success" : "info",
    });
    setSelectedTicket(null);
    setResolutionRemarks("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <HelpCircle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Help Desk & Grievance Redressal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Log academic, hostel, or facility concerns with transparent status timelines and administrative resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRaiseOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> File New Grievance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm w-fit">
        <button
          onClick={() => setActiveTab("mytickets")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
            activeTab === "mytickets"
              ? "bg-blue-600 text-white shadow-md font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          All Tickets ({store.grievances.length})
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "admin"
              ? "bg-blue-600 text-white shadow-md font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          <ShieldCheck className="w-4 h-4" /> Admin Redressal Desk
        </button>
      </div>

      {/* Grievance Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-500">
                    #{ticket.ticketNo}
                  </span>
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]">
                    {ticket.category}
                  </Badge>
                  <span className="text-xs text-slate-400">• Filed: {ticket.createdAt}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {ticket.title}
                </h3>
              </div>

              <StatusBadge status={ticket.status} />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {ticket.description}
            </p>

            {ticket.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Location: {ticket.location}</span>
              </div>
            )}

            {/* Vertical Progression Timeline */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Redressal Progress:
              </span>
              <Timeline items={ticket.timeline} />
            </div>

            {/* Resolution Note if any */}
            {ticket.resolutionNote && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Official Administrative Resolution Note:
                </span>
                <p>{ticket.resolutionNote}</p>
              </div>
            )}

            {/* Admin Controls */}
            {activeTab === "admin" && ticket.status !== "Resolved" && (
              <div className="pt-2 flex justify-end gap-2 border-t">
                {ticket.status === "Open" && (
                  <button
                    onClick={() => handleStatusUpdate(ticket.id, "In progress")}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Assign & Start Inspection
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Mark Resolved with Note
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* File Grievance Modal */}
      <ModalForm
        isOpen={isRaiseOpen}
        onClose={() => setIsRaiseOpen(false)}
        title="File Campus Grievance Ticket"
        description="Submit your concern directly to the student affairs desk"
      >
        <form onSubmit={handleRaiseSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Issue Category *</label>
            <select
              value={newForm.category}
              onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            >
              <option value="Infrastructure">Infrastructure (AC, Projector, Wi-Fi, Water)</option>
              <option value="Academic">Academic (Lectures, Timetable Conflict)</option>
              <option value="Hostel">Hostel & Housing</option>
              <option value="Accounts">Accounts & Fee Reconciliations</option>
              <option value="Canteen">Canteen & Hygiene</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Subject / Issue Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wi-Fi drop in LHC 2nd floor classrooms"
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Location / Classroom Number</label>
            <input
              type="text"
              value={newForm.location}
              onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the exact issue and when it occurs..."
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRaiseOpen(false)}
              className="px-4 py-2 rounded-xl border text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
            >
              Submit Ticket to Administration
            </button>
          </div>
        </form>
      </ModalForm>

      {/* Admin Resolution Remarks Modal */}
      <ModalForm
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Resolve Ticket #${selectedTicket?.ticketNo || ""}`}
        description="Provide final administrative closing remarks for the student"
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Resolution Summary Note *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Technician replaced the projector HDMI wiring and calibrated the bulb."
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl border text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(selectedTicket.id, "Resolved")}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
              >
                Sign Off & Mark Resolved
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}
