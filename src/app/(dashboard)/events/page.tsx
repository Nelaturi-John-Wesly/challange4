"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { CampusEvent, UserTicket, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Award,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";

// ============================================================================
// MAIN EVENTS & TICKETING COMPONENT
// ============================================================================
export default function EventsPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Active User Info
  const userRole = (session?.user?.role as string) || "STUDENT";
  const userName = session?.user?.name || "Ananya Reddy";
  const userRoll = (session?.user as any)?.rollNumber || "22ECE1047";
  const userEmail = session?.user?.email || "ananya@college.edu";
  const isOrganizerRole = userRole === "ADMIN" || userRole === "CLUB_LEAD";

  // Tab State: "browse" | "calendar" | "tickets" | "organizer"
  const [activeTab, setActiveTab] = useState<"browse" | "calendar" | "tickets" | "organizer">("browse");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>("All");
  const [priceFilter, setPriceFilter] = useState<"All" | "Free" | "Paid">("All");

  // Modals State
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [paymentModalEvent, setPaymentModalEvent] = useState<CampusEvent | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("student@okhdfcbank");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Ticket & Certificate Modals
  const [viewingTicket, setViewingTicket] = useState<UserTicket | null>(null);
  const [ticketToCancel, setTicketToCancel] = useState<UserTicket | null>(null);
  const [certificateTicket, setCertificateTicket] = useState<UserTicket | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<CampusEvent | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Organizer Hub Sub-Tabs: "attendees" | "checkin" | "create" | "feedback"
  const [organizerSubTab, setOrganizerSubTab] = useState<"attendees" | "checkin" | "create" | "feedback">("attendees");
  const [selectedOrganizerEventId, setSelectedOrganizerEventId] = useState<string>(store.events[0]?.id || "");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<"All" | "Registered" | "Checked In">("All");

  // Check-In Terminal State
  const [checkInInput, setCheckInInput] = useState("");
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    ticket?: UserTicket;
  } | null>(null);

  // Create Event Form State
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    clubName: "Google Developer Student Club",
    category: "Tech" as const,
    date: "2026-05-15",
    time: "10:00 AM - 04:00 PM",
    venue: "Main Auditorium",
    price: 0,
    seatsTotal: 120,
    banner: "🚀",
    description: "",
    speaker: "",
    speakerRole: "",
    registrationDeadline: "2026-05-12",
  });

  // Calendar View State
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 3, 1)); // April 2026

  // Unique Organizers for Filter
  const organizersList = useMemo(() => {
    const list = Array.from(new Set(store.events.map((e) => e.clubName)));
    return ["All", ...list];
  }, [store.events]);

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return store.events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.speaker && ev.speaker.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === "All" || ev.category === selectedCategory;
      const matchOrganizer = selectedOrganizer === "All" || ev.clubName === selectedOrganizer;
      const matchPrice =
        priceFilter === "All" ? true : priceFilter === "Free" ? ev.price === 0 : ev.price > 0;

      return matchSearch && matchCategory && matchOrganizer && matchPrice;
    });
  }, [store.events, searchQuery, selectedCategory, selectedOrganizer, priceFilter]);

  // User Tickets (filtered for logged-in user or active list)
  const myTickets = useMemo(() => {
    return store.userTickets.filter((t) => t.userRoll === userRoll || t.userName === userName);
  }, [store.userTickets, userRoll, userName]);

  // Attendees for the selected event in Organizer View
  const currentEventAttendees = useMemo(() => {
    return store.userTickets.filter((t) => {
      const matchEvent = t.eventId === selectedOrganizerEventId;
      const matchSearch =
        t.userName.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
        t.userRoll.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(attendeeSearchQuery.toLowerCase());
      const matchStatus = attendeeStatusFilter === "All" || t.status === attendeeStatusFilter;
      return matchEvent && matchSearch && matchStatus;
    });
  }, [store.userTickets, selectedOrganizerEventId, attendeeSearchQuery, attendeeStatusFilter]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleRegisterClick = (event: CampusEvent) => {
    if (event.seatsLeft <= 0) {
      toast({
        title: "Event Sold Out",
        description: "This event has reached full capacity. Registrations are closed.",
        type: "error",
      });
      return;
    }

    if (event.price > 0) {
      // Paid event: Open Payment Modal
      setPaymentModalEvent(event);
      setSelectedEvent(null);
    } else {
      // Free event: Confirm immediately
      const res = store.bookEvent(event.id, userName, userRoll, userEmail, "Free Pass", 0);
      if (res.success && res.ticket) {
        toast({
          title: "Registration Confirmed!",
          description: `Pass #${res.ticket.ticketId} saved to My Tickets.`,
          type: "success",
        });
        setSelectedEvent(null);
        setViewingTicket(res.ticket);
      } else {
        toast({
          title: "Booking Failed",
          description: res.message || "Could not register for this event.",
          type: "error",
        });
      }
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentModalEvent) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const res = store.bookEvent(
        paymentModalEvent.id,
        userName,
        userRoll,
        userEmail,
        paymentMethod === "upi"
          ? `UPI (${upiId})`
          : paymentMethod === "card"
          ? "Card (**** 4821)"
          : "NetBanking (SBI)",
        paymentModalEvent.price
      );

      setIsProcessingPayment(false);
      setPaymentModalEvent(null);

      if (res.success && res.ticket) {
        toast({
          title: "Payment Received & Ticket Booked!",
          description: `₹${paymentModalEvent.price} processed. Your QR Pass is ready.`,
          type: "success",
        });
        setViewingTicket(res.ticket);
      } else {
        toast({
          title: "Registration Error",
          description: res.message || "Something went wrong.",
          type: "error",
        });
      }
    }, 900);
  };

  const handleCancelRegistration = (ticket: UserTicket) => {
    const res = store.cancelTicket(ticket.ticketId);
    if (res.success) {
      toast({
        title: "Ticket Cancelled",
        description: `Pass #${ticket.ticketId} has been revoked and the seat was released.`,
        type: "info",
      });
      setTicketToCancel(null);
    }
  };

  const handleTerminalCheckIn = (ticketIdToScan?: string) => {
    const id = (ticketIdToScan || checkInInput).trim();
    if (!id) {
      toast({
        title: "Ticket ID Required",
        description: "Please enter or scan a valid Ticket ID.",
        type: "error",
      });
      return;
    }

    const res = store.checkInTicket(id);
    setCheckInResult(res);
    if (res.success) {
      toast({
        title: "Check-in Successful",
        description: res.message,
        type: "success",
      });
      setCheckInInput("");
    } else {
      toast({
        title: "Check-in Alert",
        description: res.message,
        type: "error",
      });
    }
  };

  const handleExportCSV = () => {
    const currentEv = store.events.find((e) => e.id === selectedOrganizerEventId);
    if (!currentEv) return;

    const attendees = store.userTickets.filter((t) => t.eventId === currentEv.id);
    const headers = ["Ticket ID", "Student Name", "Roll Number", "Email", "Event", "Date", "Status", "Checked In At", "Amount Paid"];
    const rows = attendees.map((a) => [
      `"${a.ticketId}"`,
      `"${a.userName}"`,
      `"${a.userRoll}"`,
      `"${a.userEmail || ""}"`,
      `"${a.eventTitle}"`,
      `"${a.date}"`,
      `"${a.status}"`,
      `"${a.checkedInAt || "N/A"}"`,
      `"₹${a.amountPaid || 0}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendees_${currentEv.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Attendee CSV Exported",
      description: `Downloaded ${attendees.length} attendee records for "${currentEv.title}".`,
      type: "success",
    });
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title || !newEventForm.venue || !newEventForm.date) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all mandatory event fields.",
        type: "error",
      });
      return;
    }

    store.createEvent({
      ...newEventForm,
      price: Number(newEventForm.price),
      seatsTotal: Number(newEventForm.seatsTotal),
      itinerary: [
        { time: "09:30 AM", activity: "Attendee Check-in & Badge Distribution" },
        { time: "10:30 AM", activity: `Keynote Presentation by ${newEventForm.speaker || "Guest Speaker"}` },
        { time: "01:00 PM", activity: "Lunch Break & Interactive Showcase" },
        { time: "03:30 PM", activity: "Awards, Q&A and Closing Ceremony" },
      ],
    });

    toast({
      title: "Event Published Successfully!",
      description: `"${newEventForm.title}" is now live for all students to register.`,
      type: "success",
    });

    setOrganizerSubTab("attendees");
    setSelectedOrganizerEventId(store.events[0]?.id || "");
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEvent) return;

    store.submitEventFeedback(feedbackEvent.id, userName, feedbackRating, feedbackComment);
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for rating your event experience.",
      type: "success",
    });
    setFeedbackEvent(null);
    setFeedbackComment("");
  };

  // --------------------------------------------------------------------------
  // CALENDAR GENERATION HELPERS
  // --------------------------------------------------------------------------
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });

  const eventsInCurrentMonth = useMemo(() => {
    return store.events.filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
    });
  }, [store.events, calendarYear, calendarMonth]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ==================================================================== */}
      {/* HEADER SECTION & TAB SWITCHER */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Ticket className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Campus Events & Passes
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Discover fests, hackathons, sports championships, workshops, and manage entrance QR passes.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("browse")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
              activeTab === "browse"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Layers className="w-4 h-4" />
            Browse Events
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-950/20 text-slate-950 dark:bg-slate-800 dark:text-amber-400">
              {store.events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
              activeTab === "calendar"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
              activeTab === "tickets"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <QrCode className="w-4 h-4" />
            My Tickets
            {myTickets.length > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 dark:bg-amber-400/20 dark:text-amber-300 font-bold">
                {myTickets.length}
              </span>
            )}
          </button>

          {/* Organizer Hub: Visible for ADMIN/CLUB_LEAD or accessible in demo */}
          <button
            onClick={() => setActiveTab("organizer")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap",
              activeTab === "organizer"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : isOrganizerRole
                ? "text-amber-500 hover:text-amber-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Organizer Hub
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Admin / Lead
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: BROWSE EVENTS */}
      {/* ==================================================================== */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by title, speaker, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Organizer Dropdown */}
              <div className="md:col-span-4">
                <select
                  value={selectedOrganizer}
                  onChange={(e) => setSelectedOrganizer(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="All">All Clubs & Councils</option>
                  {organizersList
                    .filter((o) => o !== "All")
                    .map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                </select>
              </div>

              {/* Price Selector */}
              <div className="md:col-span-3 flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {(["All", "Free", "Paid"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriceFilter(p)}
                    className={cn(
                      "flex-1 py-1 text-xs font-semibold rounded-lg transition-all",
                      priceFilter === p
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {["All", "Tech", "Cultural", "Sports", "Workshop", "Seminar"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

            {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Ticket className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No events found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Try loosening your filters or search keywords to view campus activities.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedOrganizer("All");
                  setPriceFilter("All");
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const isSoldOut = ev.seatsLeft <= 0;
                const capacityPercentage = Math.round(
                  ((ev.seatsTotal - ev.seatsLeft) / ev.seatsTotal) * 100
                );
                const hasRegistered = store.userTickets.some((t) => t.eventId === ev.id && t.userRoll === userRoll);

                return (
                  <div
                    key={ev.id}
                    className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Top Banner & Category Header */}
                    <div className="relative p-5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                            {ev.banner}
                          </span>
                          <div>
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                              {ev.clubName}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {ev.category} Event
                            </span>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <Badge
                          className={cn(
                            "px-2.5 py-1 text-xs font-bold uppercase",
                            ev.price === 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {ev.price === 0 ? "FREE" : `₹${ev.price}`}
                        </Badge>
                      </div>

                      {/* Sold Out / Registered Flag */}
                      {isSoldOut && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                          SOLD OUT
                        </div>
                      )}
                      {hasRegistered && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Check className="w-3 h-3" /> REGISTERED
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {ev.description}
                        </p>
                      </div>

                      {/* Event Key Details */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {new Date(ev.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-slate-400">•</span>
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{ev.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>

                        {ev.speaker && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 italic">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">Speaker: {ev.speaker}</span>
                          </div>
                        )}
                      </div>

                      {/* Seat Availability Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Capacity</span>
                          <span
                            className={cn(
                              "font-bold",
                              ev.seatsLeft <= 10
                                ? "text-red-500 dark:text-red-400"
                                : "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {isSoldOut ? "0 seats remaining" : `${ev.seatsLeft} of ${ev.seatsTotal} left`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              isSoldOut ? "bg-red-500" : ev.seatsLeft <= 15 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${capacityPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-center"
                        >
                          Details & Agenda
                        </button>

                        <button
                          onClick={() => handleRegisterClick(ev)}
                          disabled={isSoldOut}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5",
                            isSoldOut
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              : hasRegistered
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md hover:shadow-amber-500/20"
                          )}
                        >
                          {isSoldOut ? (
                            "Sold Out"
                          ) : hasRegistered ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Book Another
                            </>
                          ) : ev.price > 0 ? (
                            `Register (₹${ev.price})`
                          ) : (
                            "Register Free"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CALENDAR VIEW */}
      {/* ==================================================================== */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-500" />
                  {monthName} {calendarYear}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {eventsInCurrentMonth.length} major campus events and tournaments scheduled this month.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(2026, 3, 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  April 2026
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(2026, 4, 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  May 2026
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-3 border-b border-slate-100 dark:border-slate-800">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 pt-3">
              {/* Padding empty slots */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="h-28 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-transparent"
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber = i + 1;
                const formattedDate = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(
                  dayNumber
                ).padStart(2, "0")}`;
                const daysEvents = store.events.filter((ev) => ev.date === formattedDate);
                const isToday = dayNumber === 18 && calendarMonth === 3; // Highlight hackathon day demo

                return (
                  <div
                    key={dayNumber}
                    className={cn(
                      "h-28 p-2 rounded-xl border transition-all flex flex-col justify-between overflow-hidden",
                      isToday
                        ? "border-amber-500 bg-amber-500/5 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                          isToday
                            ? "bg-amber-500 text-slate-950 font-extrabold"
                            : "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {dayNumber}
                      </span>
                      {daysEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-500">
                          {daysEvents.length} ev
                        </span>
                      )}
                    </div>

                    {/* Events list in day */}
                    <div className="space-y-1 overflow-y-auto max-h-16">
                      {daysEvents.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full text-left px-1.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold truncate border border-amber-500/20 block"
                        >
                          {ev.banner} {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MY TICKETS & PASSES */}
      {/* ==================================================================== */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Your Registered Passes & Badges
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Show these QR passes at the entrance for instant check-in. Download participation certificates once attended.
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold">
              {myTickets.length} Active Pass{myTickets.length === 1 ? "" : "es"}
            </Badge>
          </div>

          {myTickets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <QrCode className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Tickets Booked Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Explore the events catalog and register for workshops, hackathons, or cultural nights to receive your scannable digital badge.
              </p>
              <button
                onClick={() => setActiveTab("browse")}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Browse Campus Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myTickets.map((t) => {
                const isAttended = t.status === "Checked In";
                const evObj = store.events.find((e) => e.id === t.eventId);

                return (
                  <div
                    key={t.ticketId}
                    className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
                  >
                    {/* Top Boarding Pass Header */}
                    <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            #{t.ticketId}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                          {t.eventTitle}
                        </h3>
                      </div>

                      <StatusBadge
                        status={isAttended ? "Approved" : "Pending"}
                        label={isAttended ? "ATTENDED" : "REGISTERED"}
                      />
                    </div>

                    {/* Middle Pass Details & QR Code */}
                    <div className="p-5 flex-1 flex flex-col sm:flex-row items-center justify-between gap-5">
                      <div className="space-y-3 text-xs w-full sm:w-auto">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            ATTENDEE
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {t.userName}
                          </span>
                          <span className="text-slate-500 block font-mono">
                            Roll: {t.userRoll}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              DATE
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {t.date}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              VENUE
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                              {t.venue}
                            </span>
                          </div>
                        </div>

                        {isAttended && t.checkedInAt && (
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Validated at Venue: {t.checkedInAt}
                          </div>
                        )}
                      </div>

                      {/* Scannable QR Code */}
                      <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        <img
                          src={t.qrCode}
                          alt={`QR Code for ${t.ticketId}`}
                          className="w-28 h-28 rounded-lg shadow-sm bg-white p-1"
                        />
                        <span className="text-[10px] font-mono text-slate-500 mt-1 font-semibold">
                          SCAN AT ENTRANCE
                        </span>
                      </div>
                    </div>

                    {/* Ticket Action Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Download Pass View */}
                        <button
                          onClick={() => setViewingTicket(t)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> View / Print Pass
                        </button>

                        {/* Certificate Button if Attended */}
                        {isAttended && (
                          <button
                            onClick={() => setCertificateTicket(t)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Award className="w-3.5 h-3.5" /> Get Certificate
                          </button>
                        )}

                        {/* Feedback Button if Enabled */}
                        {evObj?.feedbackEnabled && (
                          <button
                            onClick={() => setFeedbackEvent(evObj)}
                            className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5" /> Rate Event
                          </button>
                        )}
                      </div>

                      {/* Cancel Option (Only if not already attended) */}
                      {!isAttended && (
                        <button
                          onClick={() => setTicketToCancel(t)}
                          className="text-xs text-red-500 hover:text-red-400 font-medium hover:underline"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ORGANIZER HUB (ADMIN & CLUB LEADS) */}
      {/* ==================================================================== */}
      {activeTab === "organizer" && (
        <div className="space-y-6">
          {/* Sub-navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOrganizerSubTab("attendees")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  organizerSubTab === "attendees"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Users className="w-3.5 h-3.5" /> Attendees & CSV
              </button>

              <button
                onClick={() => setOrganizerSubTab("checkin")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  organizerSubTab === "checkin"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <QrCode className="w-3.5 h-3.5" /> Entrance Check-In Scanner
              </button>

              <button
                onClick={() => setOrganizerSubTab("create")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  organizerSubTab === "create"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Plus className="w-3.5 h-3.5" /> Create New Event
              </button>

              <button
                onClick={() => setOrganizerSubTab("feedback")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  organizerSubTab === "feedback"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Star className="w-3.5 h-3.5" /> Feedback & Ratings
              </button>
            </div>

            {/* Event Selector in Organizer Hub */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Selected Event:</span>
              <select
                value={selectedOrganizerEventId}
                onChange={(e) => setSelectedOrganizerEventId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {store.events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-tab 1: Attendees Table & CSV Export */}
          {organizerSubTab === "attendees" && (
            <div className="space-y-4">
              {/* Event Stats Summary */}
              {(() => {
                const currentEv = store.events.find((e) => e.id === selectedOrganizerEventId);
                const allEventTickets = store.userTickets.filter((t) => t.eventId === selectedOrganizerEventId);
                const attendedCount = allEventTickets.filter((t) => t.status === "Checked In").length;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Total Capacity</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                        {currentEv?.seatsTotal || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Registered Attendees</span>
                      <p className="text-xl font-extrabold text-amber-500 mt-1">
                        {allEventTickets.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Checked In (Attended)</span>
                      <p className="text-xl font-extrabold text-emerald-500 mt-1">
                        {attendedCount}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Seats Left</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                        {currentEv?.seatsLeft || 0}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Table Search & Export Controls */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search attendee by roll number, name or ticket ID..."
                      value={attendeeSearchQuery}
                      onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <select
                    value={attendeeStatusFilter}
                    onChange={(e) => setAttendeeStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Registered">Registered Only</option>
                    <option value="Checked In">Checked In Only</option>
                  </select>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV Report
                </button>
              </div>

              {/* Attendees List */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Ticket ID</th>
                        <th className="px-4 py-3">Attendee Name</th>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Check-in Timestamp</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentEventAttendees.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            No attendees matching your query for this event.
                          </td>
                        </tr>
                      ) : (
                        currentEventAttendees.map((att) => (
                          <tr
                            key={att.ticketId}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono font-bold text-amber-500">
                              {att.ticketId}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                              {att.userName}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                              {att.userRoll}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge
                                status={att.status === "Checked In" ? "Approved" : "Pending"}
                                label={att.status === "Checked In" ? "ATTENDED" : "REGISTERED"}
                              />
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {att.checkedInAt || "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {att.status !== "Checked In" ? (
                                <button
                                  onClick={() => handleTerminalCheckIn(att.ticketId)}
                                  className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] transition-all"
                                >
                                  Mark Attended
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Check-In Scanner Terminal */}
          {organizerSubTab === "checkin" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mx-auto flex items-center justify-center">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Live Venue Entrance Scanner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Scan or input attendee Ticket ID to record entry and validate access. Prevents duplicate check-in.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Ticket ID (e.g. TKT-HACK-8491)"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTerminalCheckIn()}
                    className="flex-1 px-4 py-2.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleTerminalCheckIn()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all"
                  >
                    Validate
                  </button>
                </div>

                {/* Quick Simulation Clickers */}
                <div className="pt-2 text-left">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-2">
                    Quick Demo Scanners:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {store.userTickets.map((t) => (
                      <button
                        key={t.ticketId}
                        onClick={() => {
                          setCheckInInput(t.ticketId);
                          handleTerminalCheckIn(t.ticketId);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono hover:bg-amber-500/10 hover:text-amber-500 border border-slate-200 dark:border-slate-700"
                      >
                        {t.ticketId} ({t.userName.split(" ")[0]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Check-In Result Banner */}
                {checkInResult && (
                  <div
                    className={cn(
                      "p-4 rounded-xl text-left border text-xs space-y-1 transition-all mt-4",
                      checkInResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {checkInResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <span>{checkInResult.message}</span>
                    </div>

                    {checkInResult.ticket && (
                      <div className="pt-2 border-t border-current/10 grid grid-cols-2 gap-2 text-[11px]">
                        <div>Attendee: {checkInResult.ticket.userName}</div>
                        <div>Roll: {checkInResult.ticket.userRoll}</div>
                        <div>Event: {checkInResult.ticket.eventTitle}</div>
                        <div>Status: {checkInResult.ticket.status}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab 3: Create Event Form */}
          {organizerSubTab === "create" && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Publish New Campus Event
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add full details, set registration cap, itinerary, and broadcast notification to campus students.
                </p>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CyberSec Defense Summit 2026"
                      value={newEventForm.title}
                      onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Organizing Club / Society *
                    </label>
                    <select
                      value={newEventForm.clubName}
                      onChange={(e) => setNewEventForm({ ...newEventForm, clubName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Google Developer Student Club">Google Developer Student Club</option>
                      <option value="Robotics & AI Guild">Robotics & AI Guild</option>
                      <option value="Dhwani Music & Arts Society">Dhwani Music & Arts Society</option>
                      <option value="Sports & Athletics Council">Sports & Athletics Council</option>
                      <option value="E-Cell">E-Cell</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <select
                      value={newEventForm.category}
                      onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Tech">Tech</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventForm.date}
                      onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM - 04:00 PM"
                      value={newEventForm.time}
                      onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Venue *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lecture Hall Complex Room 101 / Central Ground"
                      value={newEventForm.venue}
                      onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Price (INR) — 0 for Free
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newEventForm.price}
                      onChange={(e) => setNewEventForm({ ...newEventForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Total Capacity (Seats)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newEventForm.seatsTotal}
                      onChange={(e) => setNewEventForm({ ...newEventForm, seatsTotal: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Banner Emoji / Icon
                    </label>
                    <input
                      type="text"
                      value={newEventForm.banner}
                      onChange={(e) => setNewEventForm({ ...newEventForm, banner: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Keynote Speaker Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={newEventForm.speaker}
                      onChange={(e) => setNewEventForm({ ...newEventForm, speaker: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Event Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Brief overview of themes, eligibility, rules, and benefits for students..."
                      value={newEventForm.description}
                      onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Publish & Notify Campus
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-tab 4: Feedback & Ratings */}
          {organizerSubTab === "feedback" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.events.map((ev) => {
                  const hasFeedback = (ev.feedbacks && ev.feedbacks.length > 0) || false;
                  const avgRating = hasFeedback
                    ? (
                        ev.feedbacks!.reduce((acc, f) => acc + f.rating, 0) / ev.feedbacks!.length
                      ).toFixed(1)
                    : "N/A";

                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{ev.banner}</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {ev.title}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {ev.clubName} • {ev.date}
                          </span>
                        </div>

                        {/* Toggle Feedback */}
                        <button
                          onClick={() => store.toggleFeedbackCollection(ev.id, !ev.feedbackEnabled)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                            ev.feedbackEnabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          {ev.feedbackEnabled ? "Feedback Open" : "Feedback Closed"}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          {avgRating}
                        </div>
                        <div className="text-xs text-slate-500">
                          Based on {ev.feedbacks?.length || 0} student review(s)
                        </div>
                      </div>

                      {/* Feedback List */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Student Reviews:
                        </span>
                        {ev.feedbacks && ev.feedbacks.length > 0 ? (
                          ev.feedbacks.map((fb) => (
                            <div
                              key={fb.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {fb.studentName}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-400">
                                  {Array.from({ length: fb.rating }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 italic">
                                "{fb.comment}"
                              </p>
                              <span className="text-[10px] text-slate-400 block text-right">
                                {fb.createdAt}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No feedback entries yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: EVENT DETAILS & ITINERARY */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event Details"}
        description={`${selectedEvent?.clubName || ""} • ${selectedEvent?.category || ""} Event`}
      >
        {selectedEvent && (
          <div className="space-y-5">
            {/* Header Highlights */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedEvent.banner}</span>
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Registration Fee:
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedEvent.price === 0 ? "FREE ENTRY" : `₹${selectedEvent.price} INR`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Seats Remaining</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedEvent.seatsLeft} / {selectedEvent.seatsTotal}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Overview & Objectives
              </h4>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedEvent.description}
              </p>
            </div>

            {/* Speaker Spotlight */}
            {selectedEvent.speaker && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                  {selectedEvent.speaker[0]}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                    Distinguished Speaker
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {selectedEvent.speaker}
                  </span>
                  {selectedEvent.speakerRole && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {selectedEvent.speakerRole}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Agenda & Itinerary */}
            {selectedEvent.itinerary && selectedEvent.itinerary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Event Schedule & Itinerary
                </h4>
                <div className="space-y-2 border-l-2 border-amber-500/40 pl-3 ml-1">
                  {selectedEvent.itinerary.map((item, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                        {item.time}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date, Time, Venue Box */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedEvent.date} ({selectedEvent.time})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedEvent.venue}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleRegisterClick(selectedEvent)}
                disabled={selectedEvent.seatsLeft <= 0}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md",
                  selectedEvent.seatsLeft <= 0
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                )}
              >
                {selectedEvent.seatsLeft <= 0
                  ? "Sold Out"
                  : selectedEvent.price > 0
                  ? `Proceed to Pay (₹${selectedEvent.price})`
                  : "Confirm Free Registration"}
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* ==================================================================== */}
      {/* MODAL 2: MOCK PAYMENT GATEWAY */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!paymentModalEvent}
        onClose={() => setPaymentModalEvent(null)}
        title="College Fee & Event Gateway"
        description={`Registration checkout for ${paymentModalEvent?.title || ""}`}
      >
        {paymentModalEvent && (
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border border-amber-500/30">
              <div>
                <span className="text-xs text-slate-400 block">Total Payable Amount</span>
                <p className="text-2xl font-black text-amber-400">
                  ₹{paymentModalEvent.price}.00 INR
                </p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono">
                INSTANT PASS GENERATION
              </Badge>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1",
                  paymentMethod === "upi"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                <QrCode className="w-4 h-4" /> UPI QR & Apps
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1",
                  paymentMethod === "card"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                <CreditCard className="w-4 h-4" /> Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("netbanking")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1",
                  paymentMethod === "netbanking"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                <ExternalLink className="w-4 h-4" /> Net Banking
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === "upi" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-center">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-sm border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=collegefees@sbi&pn=CollegePlatform&am=${paymentModalEvent.price}`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM. Or enter your VPA:
                </p>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="student@upi"
                  className="w-full text-center px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 4821"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      defaultValue="08/29"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">CVV</label>
                    <input
                      type="password"
                      defaultValue="842"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <label className="text-[11px] text-slate-400 font-semibold">Select Bank</label>
                <select className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentModalEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Bank Gateway...
                  </>
                ) : (
                  `Pay ₹${paymentModalEvent.price} & Generate Pass`
                )}
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* ==================================================================== */}
      {/* MODAL 3: PASS VIEWER & PRINT PREVIEW */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!viewingTicket}
        onClose={() => setViewingTicket(null)}
        title="Official Entrance Pass"
        description={`Pass ID: #${viewingTicket?.ticketId || ""}`}
      >
        {viewingTicket && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-black tracking-widest uppercase text-amber-400 font-mono">
                    CAMPUS EVENT BOARDING PASS
                  </span>
                </div>
                <Badge className="bg-amber-500 text-slate-950 font-mono font-bold">
                  {viewingTicket.ticketId}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-black text-amber-400 leading-tight">
                  {viewingTicket.eventTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Venue: {viewingTicket.venue}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800/80 py-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">ATTENDEE</span>
                  <span className="font-bold text-slate-100">{viewingTicket.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">ROLL NUMBER</span>
                  <span className="font-mono text-slate-100">{viewingTicket.userRoll}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">EVENT DATE</span>
                  <span className="text-slate-100 font-semibold">{viewingTicket.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">STATUS</span>
                  <span
                    className={cn(
                      "font-bold",
                      viewingTicket.status === "Checked In" ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {viewingTicket.status === "Checked In" ? "ATTENDED / VERIFIED" : "REGISTERED"}
                  </span>
                </div>
              </div>

              {/* Centered QR */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl">
                <img
                  src={viewingTicket.qrCode}
                  alt="QR Pass"
                  className="w-36 h-36 object-contain"
                />
                <span className="text-[10px] font-mono text-slate-900 font-bold mt-1">
                  OFFICIAL INSTITUTIONAL ENTRANCE PASS
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save Pass PDF
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* ==================================================================== */}
      {/* MODAL 4: CERTIFICATE OF PARTICIPATION */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!certificateTicket}
        onClose={() => setCertificateTicket(null)}
        title="Official Participation Certificate"
        description={`Issued for attending ${certificateTicket?.eventTitle || ""}`}
      >
        {certificateTicket && (
          <div className="space-y-4">
            {/* Certificate Canvas Frame */}
            <div className="relative p-8 rounded-2xl bg-amber-50/20 dark:bg-slate-950 border-4 border-double border-amber-500/70 text-center space-y-4 shadow-2xl">
              {/* College Emblem & Seal */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🏛️</span>
                <span className="text-xs font-black tracking-widest uppercase text-amber-500 font-serif">
                  CAMPUSCONNECT INSTITUTION OF HIGHER EDUCATION
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-slate-900 dark:text-amber-400 uppercase">
                  Certificate of Participation
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  This official document certifies active participation in college co-curricular affairs.
                </p>
              </div>

              <div className="py-2 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">This is to proudly certify that</p>
                <p className="text-lg font-black text-slate-950 dark:text-slate-100 font-serif border-b border-amber-500/40 inline-block px-4 pb-0.5">
                  {certificateTicket.userName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  bearing Institutional Roll No:{" "}
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {certificateTicket.userRoll}
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 max-w-md mx-auto pt-1">
                  has actively attended and successfully participated in{" "}
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    "{certificateTicket.eventTitle}"
                  </span>{" "}
                  held on <span className="font-semibold">{certificateTicket.date}</span> at{" "}
                  <span className="font-semibold">{certificateTicket.venue}</span>.
                </p>
              </div>

              {/* Signatures & Seal Line */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs border-t border-amber-500/30">
                <div className="space-y-1">
                  <span className="font-serif italic text-amber-600 dark:text-amber-400 block text-sm">
                    Dr. S. Prakash
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    DEAN OF STUDENT AFFAIRS
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif italic text-amber-600 dark:text-amber-400 block text-sm">
                    Priya Sharma
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    EVENT CONVENER & CLUB LEAD
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-mono">
                Verification Certificate Ref: CERT-{certificateTicket.ticketId}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCertificateTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Download / Print PDF
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* ==================================================================== */}
      {/* MODAL 5: CANCEL REGISTRATION CONFIRMATION */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!ticketToCancel}
        onClose={() => setTicketToCancel(null)}
        title="Confirm Cancellation"
        description="Are you sure you want to release your booking?"
      >
        {ticketToCancel && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cancelling ticket <span className="font-bold text-amber-500">#{ticketToCancel.ticketId}</span> for{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">"{ticketToCancel.eventTitle}"</span> will immediately release your reserved seat back to fellow students.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTicketToCancel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={() => handleCancelRegistration(ticketToCancel)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* ==================================================================== */}
      {/* MODAL 6: EVENT FEEDBACK & STAR RATING */}
      {/* ==================================================================== */}
      <ModalForm
        isOpen={!!feedbackEvent}
        onClose={() => setFeedbackEvent(null)}
        title="Event Feedback"
        description={`Share your thoughts on ${feedbackEvent?.title || ""}`}
      >
        {feedbackEvent && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Overall Experience Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7",
                        star <= feedbackRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-500 ml-2">
                  {feedbackRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Review & Suggestions
              </label>
              <textarea
                rows={3}
                required
                placeholder="What did you enjoy most? How can the organizer improve next time?"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFeedbackEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </ModalForm>
    </div>
  );
}
