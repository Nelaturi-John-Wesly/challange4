"use client";

import { useEffect, useState } from "react";

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================
export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: "CLUB" | "EVENT" | "SPORTS" | "PLACEMENT" | "CANTEEN" | "GRIEVANCE" | "SYSTEM";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Club Membership Approved!",
    message: "Your application to Robotics & AI Innovation Club was approved by Club Lead Priya Sharma.",
    type: "CLUB",
    link: "/clubs",
    isRead: false,
    createdAt: "10 mins ago",
  },
  {
    id: "notif-2",
    title: "Hackathon Ticket Confirmed",
    message: "Your ticket for National Web3 Hackathon 2026 is confirmed. QR pass generated.",
    type: "EVENT",
    link: "/events",
    isRead: false,
    createdAt: "1 hour ago",
  },
  {
    id: "notif-3",
    title: "Cafeteria Order Ready for Pickup",
    message: "Order #TK-8492 (Masala Dosa + Cold Coffee) is packed at Counter 2. Show Token.",
    type: "CANTEEN",
    link: "/cafeteria",
    isRead: false,
    createdAt: "2 hours ago",
  },
  {
    id: "notif-4",
    title: "Placement Shortlist Announced",
    message: "Google Campus Recruitment: You have been shortlisted for the Technical Round 1.",
    type: "PLACEMENT",
    link: "/placements",
    isRead: true,
    createdAt: "Yesterday",
  },
];

// ============================================================================
// CLUBS & SOCIETIES
// ============================================================================
export interface Club {
  id: string;
  name: string;
  category: "Tech" | "Cultural" | "Social" | "Business";
  leadName: string;
  membersCount: number;
  description: string;
  tags: string[];
  logo: string;
  joinStatus?: "none" | "Pending" | "Approved" | "Rejected";
  eventsCount: number;
}

export const INITIAL_CLUBS: Club[] = [
  {
    id: "club-1",
    name: "Robotics & AI Guild",
    category: "Tech",
    leadName: "Priya Sharma (Club Lead)",
    membersCount: 142,
    description: "Hands-on autonomous drones, computer vision, ROS2, and competitive robotics team.",
    tags: ["AI/ML", "Hardware", "ROS", "Robotics"],
    logo: "🤖",
    joinStatus: "Approved",
    eventsCount: 4,
  },
  {
    id: "club-2",
    name: "Google Developer Student Club (GDSC)",
    category: "Tech",
    leadName: "Kiran Kumar",
    membersCount: 310,
    description: "Cloud computing, Android Kotlin, Web development, open-source sprints, and global hackathons.",
    tags: ["Web", "Cloud", "Android", "Open Source"],
    logo: "💻",
    joinStatus: "none",
    eventsCount: 6,
  },
  {
    id: "club-3",
    name: "Dhwani Music & Arts Society",
    category: "Cultural",
    leadName: "Ananya Reddy",
    membersCount: 95,
    description: "Classical and fusion band, instrumental jam sessions, live concerts, and acoustic evenings.",
    tags: ["Music", "Concerts", "Instruments", "Vocals"],
    logo: "🎸",
    joinStatus: "none",
    eventsCount: 3,
  },
  {
    id: "club-4",
    name: "E-Cell: Entrepreneurship Cell",
    category: "Business",
    leadName: "Rohan Varma",
    membersCount: 180,
    description: "Startup incubation, pitch competitions, angel investor connects, and founder fireside chats.",
    tags: ["Startups", "Finance", "Incubation", "Pitch"],
    logo: "🚀",
    joinStatus: "none",
    eventsCount: 5,
  },
  {
    id: "club-5",
    name: "Rotaract Youth & Social Welfare",
    category: "Social",
    leadName: "Sneha Patil",
    membersCount: 220,
    description: "Community service, blood donation camps, digital literacy in rural schools, and eco-drives.",
    tags: ["Social Work", "Community", "Eco Drives", "NGO"],
    logo: "🤝",
    joinStatus: "Pending",
    eventsCount: 4,
  },
];

// ============================================================================
// EVENTS & TICKETING
// ============================================================================
export interface EventFeedback {
  id: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  clubName: string;
  date: string;
  time: string;
  venue: string;
  price: number; // 0 for free
  seatsTotal: number;
  seatsLeft: number;
  banner: string;
  description: string;
  category: "Cultural" | "Tech" | "Sports" | "Workshop" | "Seminar" | "Fest";
  speaker?: string;
  speakerRole?: string;
  registrationDeadline?: string;
  itinerary?: { time: string; activity: string }[];
  feedbackEnabled?: boolean;
  feedbacks?: EventFeedback[];
  isRegistered?: boolean;
}

export interface UserTicket {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userRoll: string;
  userEmail?: string;
  date: string;
  time?: string;
  venue: string;
  qrCode: string;
  status: "Registered" | "Checked In";
  bookedAt: string;
  checkedInAt?: string;
  paymentMethod?: string;
  amountPaid?: number;
}

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "ev-1",
    title: "InnovateX: 36-Hour National Hackathon",
    clubName: "Google Developer Student Club",
    date: "2026-04-18",
    time: "09:00 AM - 09:00 PM",
    venue: "Main Auditorium & LHC Labs",
    price: 0,
    seatsTotal: 200,
    seatsLeft: 18,
    banner: "🏆",
    description: "India's premier campus hackathon with ₹1.5L prize pool, cloud mentors, and hardware tracks. Build real AI solutions and present to Silicon Valley judges.",
    category: "Tech",
    speaker: "Sundararajan Krishnan",
    speakerRole: "Staff AI Engineer @ Google Brain",
    registrationDeadline: "2026-04-16",
    itinerary: [
      { time: "08:30 AM", activity: "Check-in, Swag Bags & Team Verification" },
      { time: "09:30 AM", activity: "Keynote Address by Google Brain Team" },
      { time: "11:00 AM", activity: "Hacking Begins (Hardware & Software Tracks)" },
      { time: "08:00 PM", activity: "Midnight Mentorship Round & Dinner" },
    ],
    feedbackEnabled: false,
    feedbacks: [],
    isRegistered: true,
  },
  {
    id: "ev-2",
    title: "Workshop: Generative AI & Robotics on Edge",
    clubName: "Robotics & AI Guild",
    date: "2026-04-22",
    time: "02:00 PM - 05:30 PM",
    venue: "Computer Center Lab 4",
    price: 199,
    seatsTotal: 60,
    seatsLeft: 7,
    banner: "⚡",
    description: "Hands-on masterclass: Deploy quantized Gemini models and real-time YOLOv10 object detection on Raspberry Pi 5 & Jetson Orin boards.",
    category: "Workshop",
    speaker: "Dr. Arvind Narayanan",
    speakerRole: "Director of Autonomous Systems Lab",
    registrationDeadline: "2026-04-20",
    itinerary: [
      { time: "02:00 PM", activity: "Edge TensorRT Architecture & Quantization" },
      { time: "03:15 PM", activity: "Hands-on: Flashing Models to Jetson Nano" },
      { time: "04:45 PM", activity: "Live Drone Camera Obstacle Avoidance Demo" },
    ],
    feedbackEnabled: false,
    feedbacks: [],
  },
  {
    id: "ev-3",
    title: "Echoes 2026: Grand Annual Cultural Festival",
    clubName: "Dhwani Music & Arts Society",
    date: "2026-05-02",
    time: "05:00 PM - 10:30 PM",
    venue: "Open Air Amphitheatre",
    price: 0,
    seatsTotal: 500,
    seatsLeft: 84,
    banner: "🎭",
    description: "The grandest night on campus featuring fusion band battles, classical showcase, celebrity DJ headliner, and inter-college dance finals.",
    category: "Cultural",
    speaker: "Maestro Shankar Ehsaan",
    speakerRole: "Celebrity Music Producer & Guest Judge",
    registrationDeadline: "2026-04-30",
    itinerary: [
      { time: "05:00 PM", activity: "Battle of the Bands Semi-Finals" },
      { time: "07:30 PM", activity: "Inter-College Dance Showcase" },
      { time: "09:00 PM", activity: "Headliner Concert & Light Show" },
    ],
    feedbackEnabled: true,
    feedbacks: [
      {
        id: "fb-1",
        studentName: "Aditya V.",
        rating: 5,
        comment: "Incredible lineup! Sound system at the open amphitheatre was top tier.",
        createdAt: "Yesterday",
      },
    ],
  },
  {
    id: "ev-4",
    title: "Inter-College Invitational Cricket Cup",
    clubName: "Sports & Athletics Council",
    date: "2026-05-05",
    time: "08:00 AM - 04:00 PM",
    venue: "College Sports Pavilion & Ground 1",
    price: 50,
    seatsTotal: 150,
    seatsLeft: 0, // SOLD OUT test case!
    banner: "🏏",
    description: "T20 Knockout tournament featuring 8 university teams. Witness the fiercest rivalries and high-stakes cricket under professional turf conditions.",
    category: "Sports",
    speaker: "Coach R. Balasubramanian",
    speakerRole: "Former Ranji Trophy Captain",
    registrationDeadline: "2026-05-01",
    itinerary: [
      { time: "08:00 AM", activity: "Coin Toss & Match 1: Host vs IIT" },
      { time: "12:30 PM", activity: "Lunch Break & Player Briefing" },
      { time: "01:30 PM", activity: "Grand Finals & Trophy Presentation" },
    ],
    feedbackEnabled: false,
    feedbacks: [],
  },
  {
    id: "ev-5",
    title: "Venture Pitch 2026: Angel & VC Seed Day",
    clubName: "E-Cell",
    date: "2026-05-09",
    time: "10:30 AM - 04:00 PM",
    venue: "Executive Seminar Hall",
    price: 99,
    seatsTotal: 100,
    seatsLeft: 42,
    banner: "💡",
    description: "Pitch your tech startup live to accredited venture partners from Sequoia Surge, Blume Ventures, and alumni angel syndicates. Grants up to ₹10 Lakhs.",
    category: "Seminar",
    speaker: "Neha Mathur",
    speakerRole: "Partner @ Nexus Venture Partners",
    registrationDeadline: "2026-05-07",
    itinerary: [
      { time: "10:30 AM", activity: "Founders Welcome & VC Panel Discussion" },
      { time: "11:45 AM", activity: "Top 10 Startup Pitches (5 min pitch + 3 min Q&A)" },
      { time: "02:30 PM", activity: "Term Sheet & Grant Winner Announcements" },
    ],
    feedbackEnabled: true,
    feedbacks: [
      {
        id: "fb-2",
        studentName: "Karthik Varma",
        rating: 5,
        comment: "Direct VC feedback on our pitch deck was extraordinarily helpful!",
        createdAt: "2 days ago",
      },
    ],
  },
];

// ============================================================================
// CAFETERIA MENU & ORDERS
// ============================================================================
export interface MenuItem {
  id: string;
  name: string;
  category: "Breakfast" | "Meals" | "Beverages" | "Snacks";
  price: number;
  prepTime: string;
  isAvailable: boolean;
  imageEmoji: string;
}

export interface CafeteriaOrder {
  orderId: string;
  tokenNumber: string;
  studentName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  pickupSlot: string;
  status: "Placed" | "Preparing" | "Ready" | "Completed";
  createdAt: string;
}

export const INITIAL_MENU: MenuItem[] = [
  { id: "m-1", name: "Mysore Masala Dosa", category: "Breakfast", price: 65, prepTime: "8 mins", isAvailable: true, imageEmoji: "🥞" },
  { id: "m-2", name: "Paneer Butter Masala Thali", category: "Meals", price: 120, prepTime: "12 mins", isAvailable: true, imageEmoji: "🍛" },
  { id: "m-3", name: "South Indian Filter Coffee", category: "Beverages", price: 25, prepTime: "3 mins", isAvailable: true, imageEmoji: "☕" },
  { id: "m-4", name: "Crispy Samosa Plate (2 pcs)", category: "Snacks", price: 30, prepTime: "4 mins", isAvailable: true, imageEmoji: "🥟" },
  { id: "m-5", name: "Cold Brew Hazelnut Frappe", category: "Beverages", price: 75, prepTime: "5 mins", isAvailable: true, imageEmoji: "🧋" },
  { id: "m-6", name: "Chicken Biryani Special", category: "Meals", price: 160, prepTime: "10 mins", isAvailable: true, imageEmoji: "🍗" },
];

export const INITIAL_ORDERS: CafeteriaOrder[] = [
  {
    orderId: "ord-8492",
    tokenNumber: "TK-8492",
    studentName: "Ananya Reddy",
    items: [
      { name: "Mysore Masala Dosa", quantity: 1, price: 65 },
      { name: "South Indian Filter Coffee", quantity: 1, price: 25 },
    ],
    totalAmount: 90,
    pickupSlot: "12:45 PM",
    status: "Ready",
    createdAt: "12:35 PM",
  },
  {
    orderId: "ord-8493",
    tokenNumber: "TK-8493",
    studentName: "Karthik Varma",
    items: [{ name: "Paneer Butter Masala Thali", quantity: 1, price: 120 }],
    totalAmount: 120,
    pickupSlot: "01:00 PM",
    status: "Preparing",
    createdAt: "12:42 PM",
  },
];

// ============================================================================
// PLACEMENTS & INTERNSHIPS
// ============================================================================
export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  packageLPA: number;
  minCgpa: number;
  maxBacklogs: number;
  eligibleBranches: string[];
  deadline: string;
  locations: string;
  logo: string;
  appliedStatus?: "none" | "Applied" | "Shortlisted" | "Interview" | "Selected" | "Rejected";
}

export const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: "drv-1",
    company: "Google India",
    role: "Software Development Engineer (SDE-1)",
    packageLPA: 32.5,
    minCgpa: 8.0,
    maxBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "ECE"],
    deadline: "2026-04-30",
    locations: "Bengaluru / Hyderabad",
    logo: "🌐",
    appliedStatus: "Shortlisted",
  },
  {
    id: "drv-2",
    company: "Microsoft IDC",
    role: "Cloud & AI Software Engineer",
    packageLPA: 28.0,
    minCgpa: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "ECE"],
    deadline: "2026-05-05",
    locations: "Hyderabad / Noida",
    logo: "💻",
    appliedStatus: "Applied",
  },
  {
    id: "drv-3",
    company: "Texas Instruments",
    role: "Embedded Systems & VLSI Engineer",
    packageLPA: 22.0,
    minCgpa: 7.0,
    maxBacklogs: 1,
    eligibleBranches: ["ECE", "MECH"],
    deadline: "2026-05-12",
    locations: "Bengaluru",
    logo: "⚡",
    appliedStatus: "none",
  },
  {
    id: "drv-4",
    company: "Tata Consultancy Services (Prime)",
    role: "Full Stack Engineer & Data Analyst",
    packageLPA: 9.0,
    minCgpa: 6.5,
    maxBacklogs: 1,
    eligibleBranches: ["CSE", "IT", "ECE", "MECH"],
    deadline: "2026-05-20",
    locations: "Pan India",
    logo: "🏢",
    appliedStatus: "none",
  },
];

// ============================================================================
// GRIEVANCES & HELP DESK
// ============================================================================
export interface GrievanceTicket {
  id: string;
  ticketNo: string;
  studentName: string;
  studentRoll: string;
  category: "Academic" | "Hostel" | "Infrastructure" | "Accounts" | "Canteen";
  title: string;
  description: string;
  status: "Open" | "In progress" | "Resolved";
  createdAt: string;
  location?: string;
  resolutionNote?: string;
  timeline: { step: string; status: "completed" | "current" | "upcoming"; date: string }[];
}

export const INITIAL_GRIEVANCES: GrievanceTicket[] = [
  {
    id: "grv-1",
    ticketNo: "GRV-001",
    studentName: "Ananya Reddy",
    studentRoll: "22ECE1047",
    category: "Infrastructure",
    title: "Air Conditioner & Projector glitch in LHC-302",
    description: "The digital projector bulb flickers continuously during Digital Signal Processing lectures.",
    status: "In progress",
    createdAt: "2026-04-10",
    location: "Lecture Hall Complex, Room 302",
    timeline: [
      { step: "Ticket Filed by Student", status: "completed", date: "Apr 10, 10:15 AM" },
      { step: "Assigned to Maintenance Division", status: "completed", date: "Apr 10, 11:30 AM" },
      { step: "Technician Inspection & Repair in Progress", status: "current", date: "Apr 11, 09:00 AM" },
      { step: "Resolution & Student Sign-off", status: "upcoming", date: "Pending" },
    ],
  },
  {
    id: "grv-2",
    ticketNo: "GRV-002",
    studentName: "Karthik Varma",
    studentRoll: "22CSE0231",
    category: "Accounts",
    title: "Exam Fee Transaction Verification",
    description: "Paid Semester 6 exam fee via UPI reference #UPI-849129, receipt pending generation.",
    status: "Resolved",
    createdAt: "2026-04-08",
    resolutionNote: "Payment reconciled with SBI gateway. Official receipt #REC-2026-8491 generated and emailed.",
    timeline: [
      { step: "Ticket Raised with Gateway Ref", status: "completed", date: "Apr 08, 02:00 PM" },
      { step: "Finance Officer Verification", status: "completed", date: "Apr 08, 04:30 PM" },
      { step: "Bank Statement Reconciled", status: "completed", date: "Apr 09, 10:00 AM" },
      { step: "Receipt Dispatched & Resolved", status: "completed", date: "Apr 09, 11:15 AM" },
    ],
  },
];

// ============================================================================
// REACTIVE STORE SINGLETON & STATE SUBSCRIBERS
// ============================================================================
class GlobalAppStore {
  notifications: AppNotification[] = INITIAL_NOTIFICATIONS;
  clubs: Club[] = INITIAL_CLUBS;
  events: CampusEvent[] = INITIAL_EVENTS;
  userTickets: UserTicket[] = [
    {
      ticketId: "TKT-HACK-8491",
      eventId: "ev-1",
      eventTitle: "InnovateX: 36-Hour National Hackathon",
      userName: "Ananya Reddy",
      userRoll: "22ECE1047",
      userEmail: "ananya@college.edu",
      date: "2026-04-18",
      time: "09:00 AM - 09:00 PM",
      venue: "Main Auditorium & LHC Labs",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-HACK-8491",
      status: "Registered",
      bookedAt: "Yesterday",
    },
    {
      ticketId: "TKT-CUL-5021",
      eventId: "ev-3",
      eventTitle: "Echoes 2026: Grand Annual Cultural Festival",
      userName: "Ananya Reddy",
      userRoll: "22ECE1047",
      userEmail: "ananya@college.edu",
      date: "2026-05-02",
      time: "05:00 PM - 10:30 PM",
      venue: "Open Air Amphitheatre",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-CUL-5021",
      status: "Checked In",
      bookedAt: "3 days ago",
      checkedInAt: "05:15 PM",
      paymentMethod: "Free Entry Pass",
      amountPaid: 0,
    },
    {
      ticketId: "TKT-ROBO-9214",
      eventId: "ev-2",
      eventTitle: "Workshop: Generative AI & Robotics on Edge",
      userName: "Karthik Varma",
      userRoll: "22CSE0231",
      userEmail: "karthik@college.edu",
      date: "2026-04-22",
      time: "02:00 PM - 05:30 PM",
      venue: "Computer Center Lab 4",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-ROBO-9214",
      status: "Registered",
      bookedAt: "2 days ago",
      paymentMethod: "UPI QR (student@upi)",
      amountPaid: 199,
    },
  ];
  menu: MenuItem[] = INITIAL_MENU;
  orders: CafeteriaOrder[] = INITIAL_ORDERS;
  drives: PlacementDrive[] = INITIAL_DRIVES;
  grievances: GrievanceTicket[] = INITIAL_GRIEVANCES;

  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Notification Actions ---
  dispatchNotification(notif: Omit<AppNotification, "id" | "createdAt" | "isRead">) {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      createdAt: "Just now",
      isRead: false,
      ...notif,
    };
    this.notifications = [newNotif, ...this.notifications];
    this.notify();
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.notify();
  }

  // --- Club Actions ---
  joinClub(clubId: string, _reason: string, _skills: string) {
    this.clubs = this.clubs.map((c) =>
      c.id === clubId ? { ...c, joinStatus: "Pending" } : c
    );
    this.dispatchNotification({
      title: "Club Join Request Submitted",
      message: "Your application is currently Pending review with the Club Lead.",
      type: "CLUB",
      link: "/clubs",
    });
    this.notify();
  }

  updateClubRequest(clubId: string, newStatus: "Approved" | "Rejected") {
    this.clubs = this.clubs.map((c) =>
      c.id === clubId ? { ...c, joinStatus: newStatus } : c
    );
    this.dispatchNotification({
      title: `Club Membership ${newStatus}`,
      message: `Your membership request has been ${newStatus.toLowerCase()} by the Club Lead.`,
      type: "CLUB",
      link: "/clubs",
    });
    this.notify();
  }

  // --- Event & Ticketing Actions ---
  createEvent(eventData: Omit<CampusEvent, "id" | "seatsLeft" | "isRegistered" | "feedbacks">) {
    const newEvent: CampusEvent = {
      id: `ev-${Date.now()}`,
      ...eventData,
      seatsLeft: eventData.seatsTotal,
      feedbacks: [],
      feedbackEnabled: false,
      isRegistered: false,
    };

    this.events = [newEvent, ...this.events];

    this.dispatchNotification({
      title: `🎉 New Event: ${newEvent.title}`,
      message: `Hosted by ${newEvent.clubName} at ${newEvent.venue}. Registration is now open!`,
      type: "EVENT",
      link: "/events",
    });

    this.notify();
    return newEvent;
  }

  bookEvent(
    eventId: string,
    userName: string,
    userRoll: string,
    userEmail?: string,
    paymentMethod?: string,
    amountPaid: number = 0
  ): { success: boolean; ticket?: UserTicket; message?: string } {
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) return { success: false, message: "Event not found." };
    if (ev.seatsLeft <= 0) return { success: false, message: "Sorry, this event is already sold out." };

    this.events = this.events.map((e) =>
      e.id === eventId
        ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - 1), isRegistered: true }
        : e
    );

    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket: UserTicket = {
      ticketId: ticketCode,
      eventId: ev.id,
      eventTitle: ev.title,
      userName: userName || "Ananya Reddy",
      userRoll: userRoll || "22ECE1047",
      userEmail: userEmail || "ananya@college.edu",
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}`,
      status: "Registered",
      bookedAt: "Just now",
      paymentMethod: paymentMethod || (ev.price > 0 ? "Mock UPI" : "Free Registration"),
      amountPaid: amountPaid,
    };

    this.userTickets = [newTicket, ...this.userTickets];

    this.dispatchNotification({
      title: "🎟️ Event Ticket Booked!",
      message: `Pass #${ticketCode} confirmed for "${ev.title}". Saved to My Tickets.`,
      type: "EVENT",
      link: "/events",
    });

    this.notify();
    return { success: true, ticket: newTicket };
  }

  cancelTicket(ticketId: string): { success: boolean; message: string } {
    const ticket = this.userTickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return { success: false, message: "Ticket not found." };

    // Release seat back
    this.events = this.events.map((e) =>
      e.id === ticket.eventId
        ? { ...e, seatsLeft: Math.min(e.seatsTotal, e.seatsLeft + 1) }
        : e
    );

    // Remove ticket
    this.userTickets = this.userTickets.filter((t) => t.ticketId !== ticketId);

    // If no more tickets for this event, reset isRegistered
    const remainingForEvent = this.userTickets.some((t) => t.eventId === ticket.eventId);
    if (!remainingForEvent) {
      this.events = this.events.map((e) =>
        e.id === ticket.eventId ? { ...e, isRegistered: false } : e
      );
    }

    this.dispatchNotification({
      title: "Pass Cancelled & Seat Released",
      message: `Your booking for "${ticket.eventTitle}" was cancelled. 1 seat restored.`,
      type: "EVENT",
      link: "/events",
    });

    this.notify();
    return { success: true, message: "Registration cancelled successfully. Seat released." };
  }

  checkInTicket(ticketId: string): { success: boolean; message: string; ticket?: UserTicket } {
    const ticket = this.userTickets.find((t) => t.ticketId.toUpperCase() === ticketId.trim().toUpperCase());
    if (!ticket) {
      return { success: false, message: `No active ticket found with ID "${ticketId}".` };
    }

    if (ticket.status === "Checked In") {
      return {
        success: false,
        message: `⚠️ Duplicate Scan! Ticket #${ticket.ticketId} (${ticket.userName}) was already checked in at ${ticket.checkedInAt || "earlier"}.`,
        ticket,
      };
    }

    const checkTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.userTickets = this.userTickets.map((t) =>
      t.ticketId === ticket.ticketId
        ? { ...t, status: "Checked In", checkedInAt: checkTime }
        : t
    );

    this.dispatchNotification({
      title: "Pass Scanned: Checked In",
      message: `Ticket #${ticket.ticketId} validated at entrance for ${ticket.userName} (${checkTime}).`,
      type: "EVENT",
      link: "/events",
    });

    this.notify();
    return {
      success: true,
      message: `✅ Check-in Approved! Welcome ${ticket.userName} (${ticket.userRoll}) at ${checkTime}.`,
      ticket: { ...ticket, status: "Checked In", checkedInAt: checkTime },
    };
  }

  toggleFeedbackCollection(eventId: string, enabled: boolean) {
    this.events = this.events.map((e) =>
      e.id === eventId ? { ...e, feedbackEnabled: enabled } : e
    );

    const ev = this.events.find((e) => e.id === eventId);
    if (enabled && ev) {
      this.dispatchNotification({
        title: "📝 Event Feedback Open",
        message: `Organizer is now collecting student feedback for "${ev.title}".`,
        type: "EVENT",
        link: "/events",
      });
    }

    this.notify();
  }

  submitEventFeedback(eventId: string, studentName: string, rating: number, comment: string) {
    const feedback: EventFeedback = {
      id: `fb-${Date.now()}`,
      studentName: studentName || "Anonymous Student",
      rating,
      comment,
      createdAt: "Just now",
    };

    this.events = this.events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          feedbacks: [feedback, ...(e.feedbacks || [])],
        };
      }
      return e;
    });

    this.dispatchNotification({
      title: "Thank You for Event Feedback!",
      message: `Your rating and review were submitted to the organizing committee.`,
      type: "EVENT",
      link: "/events",
    });

    this.notify();
    return true;
  }

  // --- Cafeteria Actions ---
  placeOrder(studentName: string, items: { name: string; quantity: number; price: number }[], pickupSlot: string) {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tokenNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: CafeteriaOrder = {
      orderId: `ord-${Date.now()}`,
      tokenNumber,
      studentName,
      items,
      totalAmount,
      pickupSlot,
      status: "Placed",
      createdAt: "Just now",
    };

    this.orders = [newOrder, ...this.orders];

    this.dispatchNotification({
      title: `🍽️ Order Placed (${tokenNumber})`,
      message: `Your food token ${tokenNumber} is sent to the canteen kitchen.`,
      type: "CANTEEN",
      link: "/cafeteria",
    });

    this.notify();
    return tokenNumber;
  }

  updateOrderStatus(orderId: string, newStatus: "Preparing" | "Ready" | "Completed") {
    this.orders = this.orders.map((o) =>
      o.orderId === orderId ? { ...o, status: newStatus } : o
    );

    const order = this.orders.find((o) => o.orderId === orderId);

    this.dispatchNotification({
      title: `Cafeteria Order: ${newStatus}`,
      message: `Order #${order?.tokenNumber || ""} is now ${newStatus.toUpperCase()}.`,
      type: "CANTEEN",
      link: "/cafeteria",
    });

    this.notify();
  }

  // --- Placement Actions ---
  applyToDrive(driveId: string) {
    this.drives = this.drives.map((d) =>
      d.id === driveId ? { ...d, appliedStatus: "Applied" } : d
    );
    const drive = this.drives.find((d) => d.id === driveId);
    this.dispatchNotification({
      title: "Placement Application Sent",
      message: `Successfully applied to ${drive?.company || "recruitment drive"}.`,
      type: "PLACEMENT",
      link: "/placements",
    });
    this.notify();
  }

  updateApplicationStage(driveId: string, stage: "Shortlisted" | "Interview" | "Selected" | "Rejected") {
    this.drives = this.drives.map((d) =>
      d.id === driveId ? { ...d, appliedStatus: stage } : d
    );
    this.dispatchNotification({
      title: `Placement Status: ${stage}`,
      message: `Your application status updated to: ${stage}.`,
      type: "PLACEMENT",
      link: "/placements",
    });
    this.notify();
  }

  // --- Grievance Actions ---
  raiseGrievance(ticket: Omit<GrievanceTicket, "id" | "ticketNo" | "status" | "createdAt" | "timeline">) {
    const ticketNo = `GRV-${Math.floor(100 + Math.random() * 900)}`;
    const newGrievance: GrievanceTicket = {
      id: `grv-${Date.now()}`,
      ticketNo,
      status: "Open",
      createdAt: "Today",
      ...ticket,
      timeline: [
        { step: "Grievance Raised", status: "completed", date: "Just now" },
        { step: "Department Review", status: "current", date: "In Queue" },
        { step: "Action & Resolution", status: "upcoming", date: "Pending" },
      ],
    };

    this.grievances = [newGrievance, ...this.grievances];

    this.dispatchNotification({
      title: `Help Desk Ticket #${ticketNo} Logged`,
      message: `Your grievance has been routed to the campus administration desk.`,
      type: "GRIEVANCE",
      link: "/grievances",
    });

    this.notify();
    return ticketNo;
  }

  updateGrievanceStatus(ticketId: string, newStatus: "In progress" | "Resolved", note?: string) {
    this.grievances = this.grievances.map((g) => {
      if (g.id !== ticketId) return g;
      const updatedTimeline = g.timeline.map((step, idx) => {
        if (newStatus === "In progress" && idx === 1) return { ...step, status: "completed" as const };
        if (newStatus === "Resolved") return { ...step, status: "completed" as const };
        return step;
      });

      return {
        ...g,
        status: newStatus,
        resolutionNote: note || g.resolutionNote,
        timeline: updatedTimeline,
      };
    });

    const grv = this.grievances.find((g) => g.id === ticketId);

    this.dispatchNotification({
      title: `Ticket ${grv?.ticketNo}: ${newStatus}`,
      message: `Administration marked your ticket as ${newStatus}.`,
      type: "GRIEVANCE",
      link: "/grievances",
    });

    this.notify();
  }
}

// Global Singleton Instance
export const globalStore = new GlobalAppStore();

// React Hook to subscribe to store changes
export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return globalStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return globalStore;
}
