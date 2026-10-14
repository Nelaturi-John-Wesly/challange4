import { Role } from "@prisma/client";

// ============================================================================
// CAMPUS GIGS TYPE DEFINITIONS
// ============================================================================

export type GigCategory =
  | "Teaching/Tutoring"
  | "Events Help"
  | "Lab/Research Assistance"
  | "Design/Content"
  | "Data Entry/Documentation"
  | "Tech/Coding"
  | "Errands/Campus Help"
  | "Other";

export type GigRewardType =
  | "CASH"
  | "CANTEEN_COUPON"
  | "CERTIFICATE"
  | "VOLUNTEER_HOURS"
  | "OTHER";

export type GigStatus =
  | "PENDING_APPROVAL"
  | "OPEN"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "DISPUTED";

export type GigLocation = "On-campus" | "Remote";

export interface CampusGig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  postedBy: {
    id: string;
    name: string;
    role: Role | "STAFF";
    department: string;
    verified: boolean;
    avatar?: string;
  };
  rewardType: GigRewardType;
  rewardAmount?: number;
  rewardDescription: string;
  numberOfSlots: number;
  slotsFilled: number;
  deadline: string; // ISO date string
  estimatedHours: number;
  location: GigLocation;
  locationDetails?: string;
  requiredSkills: string[];
  attachments?: { name: string; url: string }[];
  status: GigStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type ApplicationStatus = "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface GigApplication {
  id: string;
  gigId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentDept?: string;
  studentYear?: number;
  studentRating?: number;
  message: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export type SubmissionStatus = "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED" | "REJECTED";

export interface GigSubmission {
  id: string;
  gigId: string;
  studentId: string;
  studentName: string;
  notes: string;
  filesOrLinks: { title: string; url: string }[];
  submittedAt: string;
  status: SubmissionStatus;
  revisionNote?: string;
  reviewedAt?: string;
}

export interface GigRating {
  id: string;
  gigId: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  role: "POSTER" | "STUDENT";
  stars: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export type TransactionStatus = "PENDING" | "PAID" | "RECEIVED";

export interface GigTransaction {
  id: string;
  gigId: string;
  gigTitle: string;
  studentId: string;
  studentName: string;
  rewardType: GigRewardType;
  amount?: number;
  rewardDescription: string;
  status: TransactionStatus;
  posterConfirmed: boolean;
  studentConfirmed: boolean;
  transactionRef?: string;
  date: string;
}

export interface GigReport {
  id: string;
  gigId: string;
  gigTitle: string;
  reportedById: string;
  reportedByName: string;
  reason: string;
  details: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

// ============================================================================
// 8-10 REALISTIC INITIAL GIGS SEED DATA
// ============================================================================

export const INITIAL_CAMPUS_GIGS: CampusGig[] = [
  {
    id: "gig-1",
    title: "Python Lab Teaching Assistant (Data Structures)",
    description:
      "Assist 2nd-year undergraduate students during weekly binary tree & graph algorithm lab sessions. Review code syntax, debug pointer issues, and conduct 5-minute viva evaluations under instructor supervision.",
    category: "Teaching/Tutoring",
    postedBy: {
      id: "usr-faculty",
      name: "Prof. Sana Iqbal",
      role: "FACULTY",
      department: "CSE",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 1800,
    rewardDescription: "₹1,800 direct stipend + Faculty recommendation note",
    numberOfSlots: 2,
    slotsFilled: 1,
    deadline: "2026-10-24T18:00:00Z",
    estimatedHours: 6,
    location: "On-campus",
    locationDetails: "Turing Lab 302, Computing Block",
    requiredSkills: ["Python", "DSA", "Problem Solving", "Lab Mentoring"],
    status: "OPEN",
    createdAt: "2026-10-12T09:00:00Z",
  },
  {
    id: "gig-2",
    title: "Annual Tech Fest Stage & AV Coordination",
    description:
      "Manage stage audio-visual equipment, console switching, cordless microphone coordination, and speaker cueing for InnovateX 2026 guest keynotes in the grand auditorium.",
    category: "Events Help",
    postedBy: {
      id: "usr-club",
      name: "Priya Sharma",
      role: "CLUB_LEAD",
      department: "Robotics & AI Guild",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CANTEEN_COUPON",
    rewardAmount: 600,
    rewardDescription: "₹600 Canteen Food Coupons (3 Days Lunch + Refreshment Pass)",
    numberOfSlots: 4,
    slotsFilled: 2,
    deadline: "2026-10-20T12:00:00Z",
    estimatedHours: 8,
    location: "On-campus",
    locationDetails: "Main Campus Auditorium & Open Amphitheater",
    requiredSkills: ["Event Management", "Sound & Lighting", "Punctuality", "Teamwork"],
    status: "OPEN",
    createdAt: "2026-10-11T14:30:00Z",
  },
  {
    id: "gig-3",
    title: "Smart Greenhouse IoT Sensor Data Annotation",
    description:
      "Cleanse, filter, and label 14 days of soil moisture, ambient humidity, and thermal imaging time-series telemetry from our hydroponic greenhouse testbed for an upcoming IEEE publication.",
    category: "Lab/Research Assistance",
    postedBy: {
      id: "usr-venkat",
      name: "Dr. K. Venkat",
      role: "FACULTY",
      department: "ECE",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 2400,
    rewardDescription: "₹2,400 Research Grant Payout + Research Paper Co-Acknowledgment",
    numberOfSlots: 2,
    slotsFilled: 0,
    deadline: "2026-10-28T23:59:00Z",
    estimatedHours: 10,
    location: "On-campus",
    locationDetails: "Microcontroller & Sensor Research Lab, Block B",
    requiredSkills: ["Data Analysis", "Excel/CSV", "IoT Basics", "Attention to Detail"],
    status: "OPEN",
    createdAt: "2026-10-13T11:00:00Z",
  },
  {
    id: "gig-4",
    title: "Campus Placement Brochure & Social Media Creatives",
    description:
      "Design a sleek 6-page corporate recruitment showcase PDF and 4 Instagram/LinkedIn announcement banners for the upcoming Fall Placement Drive following university brand guidelines.",
    category: "Design/Content",
    postedBy: {
      id: "usr-admin",
      name: "Dr. S. Prakash",
      role: "ADMIN",
      department: "Placement & Corporate Relations",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 3000,
    rewardDescription: "₹3,000 Payout + Institutional CDC Designer Portfolio Certificate",
    numberOfSlots: 1,
    slotsFilled: 0,
    deadline: "2026-10-22T20:00:00Z",
    estimatedHours: 8,
    location: "Remote",
    locationDetails: "Remote / Online Submissions via Figma",
    requiredSkills: ["Figma", "Canva / Photoshop", "Typography", "Branding"],
    status: "OPEN",
    createdAt: "2026-10-10T08:15:00Z",
  },
  {
    id: "gig-5",
    title: "Library Rare Manuscripts Archival Digitization",
    description:
      "Scan historical institutional conference proceedings and type title/author/abstract indexes into our Open Access Koha archival catalog.",
    category: "Data Entry/Documentation",
    postedBy: {
      id: "usr-staff-lib",
      name: "Dr. M. Chacko",
      role: "STAFF",
      department: "Central Library",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "VOLUNTEER_HOURS",
    rewardAmount: 12,
    rewardDescription: "12 Certified Campus Volunteer / CSR Hours + Free Library Lending Privileges",
    numberOfSlots: 3,
    slotsFilled: 1,
    deadline: "2026-10-26T17:00:00Z",
    estimatedHours: 12,
    location: "On-campus",
    locationDetails: "Central Library 2nd Floor Digital Archives",
    requiredSkills: ["Typing Speed > 40 WPM", "Document Scanning", "Metadata Tagging"],
    status: "OPEN",
    createdAt: "2026-10-09T16:20:00Z",
  },
  {
    id: "gig-6",
    title: "Next.js Mobile-Responsive Bugfixes for Hackathon Portal",
    description:
      "Fix responsive layout overflow bugs on the participant registration dialog and ensure camera QR scanning behaves on iOS Safari mobile screens.",
    category: "Tech/Coding",
    postedBy: {
      id: "usr-club",
      name: "GDSC Student Chapter",
      role: "CLUB_LEAD",
      department: "Google Developer Student Club",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 2200,
    rewardDescription: "₹2,200 Developer Stipend + GDSC Contributor Swag Kit",
    numberOfSlots: 1,
    slotsFilled: 1,
    deadline: "2026-10-18T18:00:00Z",
    estimatedHours: 5,
    location: "Remote",
    locationDetails: "GitHub Pull Request Review",
    requiredSkills: ["Next.js", "Tailwind CSS", "TypeScript", "Git PRs"],
    status: "IN_PROGRESS",
    createdAt: "2026-10-08T10:00:00Z",
  },
  {
    id: "gig-7",
    title: "Hostel Quad Book Exchange & Moving Assistance",
    description:
      "Help arrange 8 cartons of donated engineering textbooks onto tables for the semester book giveaway and deliver 3 boxes to the reading room.",
    category: "Errands/Campus Help",
    postedBy: {
      id: "usr-ananya",
      name: "Ananya Reddy",
      role: "STUDENT",
      department: "ECE",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 500,
    rewardDescription: "₹500 Cash on completion + Chilled Beverage",
    numberOfSlots: 2,
    slotsFilled: 2,
    deadline: "2026-10-16T14:00:00Z",
    estimatedHours: 2,
    location: "On-campus",
    locationDetails: "Hostel Block 4 Front Lawn",
    requiredSkills: ["Physical Fitness", "Punctuality", "Friendly Demeanor"],
    status: "COMPLETED",
    createdAt: "2026-10-05T12:00:00Z",
  },
  {
    id: "gig-8",
    title: "Microbiology Culture Petri Dish Sterilization Assistance",
    description:
      "Assist in preparing nutrient agar plates, autoclaving glassware, and logging batch serial numbers for undergraduate microbial assays.",
    category: "Lab/Research Assistance",
    postedBy: {
      id: "usr-sen",
      name: "Dr. Anirudh Sen",
      role: "FACULTY",
      department: "BioTech",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CERTIFICATE",
    rewardAmount: 0,
    rewardDescription: "Official Biohazard & Autoclave Safety Practicum Certificate signed by Dean",
    numberOfSlots: 2,
    slotsFilled: 0,
    deadline: "2026-10-25T16:00:00Z",
    estimatedHours: 4,
    location: "On-campus",
    locationDetails: "BioTech Wet Lab 108",
    requiredSkills: ["Lab Safety", "Pipetting", "Autoclave Protocol"],
    status: "OPEN",
    createdAt: "2026-10-07T15:00:00Z",
  },
  {
    id: "gig-9",
    title: "Sports Day Live Drone Videography & Reel Editing",
    description:
      "Film dynamic 4K overhead aerial passes during the Inter-Department 4x100m relay sprint finals and cut a 60-second high-tempo Instagram Reel.",
    category: "Design/Content",
    postedBy: {
      id: "usr-sports",
      name: "Athletics & Sports Board",
      role: "STAFF",
      department: "Physical Education Dept",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 2500,
    rewardDescription: "₹2,500 Cash + VIP Sports Gala Dinner Pass",
    numberOfSlots: 1,
    slotsFilled: 0,
    deadline: "2026-10-29T19:00:00Z",
    estimatedHours: 6,
    location: "On-campus",
    locationDetails: "Main Sports Stadium & Track",
    requiredSkills: ["Drone Piloting / Gimbal", "Premiere Pro / CapCut", "Action Cinematography"],
    status: "OPEN",
    createdAt: "2026-10-13T17:00:00Z",
  },
  {
    id: "gig-10",
    title: "Peer Math Tutoring for Calculus II Backlogs",
    description:
      "Student-initiated peer study group to break down Fourier series and double integrals with solved past question papers for semester exams.",
    category: "Teaching/Tutoring",
    postedBy: {
      id: "usr-karthik",
      name: "Karthik Varma",
      role: "STUDENT",
      department: "CSE",
      verified: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    rewardType: "CASH",
    rewardAmount: 800,
    rewardDescription: "₹800 per 3-session batch",
    numberOfSlots: 3,
    slotsFilled: 0,
    deadline: "2026-10-30T17:00:00Z",
    estimatedHours: 4,
    location: "On-campus",
    locationDetails: "Library Discussion Room C",
    requiredSkills: ["Calculus", "Differential Equations", "Patience"],
    status: "PENDING_APPROVAL", // Needs Admin approval!
    createdAt: "2026-10-14T08:00:00Z",
  },
];

export const INITIAL_GIG_APPLICATIONS: GigApplication[] = [
  {
    id: "app-1",
    gigId: "gig-1",
    studentId: "usr-karthik",
    studentName: "Karthik Varma",
    studentEmail: "karthik@college.edu",
    studentDept: "CSE",
    studentYear: 3,
    studentRating: 4.9,
    message: "I scored an S-grade in Data Structures and have maintained a 9+ CGPA in algorithm courses. Excited to mentor juniors!",
    status: "ACCEPTED",
    appliedAt: "2026-10-12T14:00:00Z",
  },
  {
    id: "app-2",
    gigId: "gig-6",
    studentId: "usr-ananya",
    studentName: "Ananya Reddy",
    studentEmail: "ananya@college.edu",
    studentDept: "ECE",
    studentYear: 3,
    studentRating: 5.0,
    message: "Full-stack developer with React & Next.js production experience. I can resolve the iOS Safari viewport bug within 24 hours.",
    status: "ACCEPTED",
    appliedAt: "2026-10-09T11:00:00Z",
  },
  {
    id: "app-3",
    gigId: "gig-2",
    studentId: "usr-karthik",
    studentName: "Karthik Varma",
    studentEmail: "karthik@college.edu",
    studentDept: "CSE",
    studentYear: 3,
    studentRating: 4.9,
    message: "Handled sound mixing at previous cultural fest. Available all 3 days.",
    status: "APPLIED",
    appliedAt: "2026-10-12T10:00:00Z",
  },
];

export const INITIAL_GIG_SUBMISSIONS: GigSubmission[] = [
  {
    id: "sub-1",
    gigId: "gig-7",
    studentId: "usr-karthik",
    studentName: "Karthik Varma",
    notes: "Successfully moved all 8 textbook boxes and organized the reading room rack according to branch categories.",
    filesOrLinks: [
      { title: "Box Delivery Confirmation Photo", url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80" }
    ],
    submittedAt: "2026-10-06T15:00:00Z",
    status: "APPROVED",
    reviewedAt: "2026-10-06T16:30:00Z",
  },
  {
    id: "sub-2",
    gigId: "gig-6",
    studentId: "usr-ananya",
    studentName: "Ananya Reddy",
    notes: "Submitted Pull Request #42 fixing dynamic viewport units (dvh) and touch-action css properties on modal overlays.",
    filesOrLinks: [
      { title: "GitHub PR #42", url: "https://github.com/college/hackathon-portal/pull/42" }
    ],
    submittedAt: "2026-10-13T19:00:00Z",
    status: "SUBMITTED",
  },
];

export const INITIAL_GIG_RATINGS: GigRating[] = [
  {
    id: "rate-1",
    gigId: "gig-7",
    fromUserId: "usr-ananya",
    fromName: "Ananya Reddy",
    toUserId: "usr-karthik",
    toName: "Karthik Varma",
    role: "POSTER",
    stars: 5,
    comment: "Extremely helpful, punctual, and handled delicate books with immense care!",
    createdAt: "2026-10-06T17:00:00Z",
  },
  {
    id: "rate-2",
    gigId: "gig-7",
    fromUserId: "usr-karthik",
    fromName: "Karthik Varma",
    toUserId: "usr-ananya",
    toName: "Ananya Reddy",
    role: "STUDENT",
    stars: 5,
    comment: "Clear instructions and paid the stipend immediately upon completion.",
    createdAt: "2026-10-06T17:05:00Z",
  },
];

export const INITIAL_GIG_TRANSACTIONS: GigTransaction[] = [
  {
    id: "tx-gig-1",
    gigId: "gig-7",
    gigTitle: "Hostel Quad Book Exchange & Moving Assistance",
    studentId: "usr-karthik",
    studentName: "Karthik Varma",
    rewardType: "CASH",
    amount: 500,
    rewardDescription: "₹500 Cash on completion",
    status: "RECEIVED",
    posterConfirmed: true,
    studentConfirmed: true,
    transactionRef: "UPI-CAMPUS-702914",
    date: "2026-10-06",
  },
  {
    id: "tx-gig-2",
    gigId: "gig-6",
    gigTitle: "Next.js Mobile-Responsive Bugfixes for Hackathon Portal",
    studentId: "usr-ananya",
    studentName: "Ananya Reddy",
    rewardType: "CASH",
    amount: 2200,
    rewardDescription: "₹2,200 Developer Stipend + Swag Kit",
    status: "PENDING",
    posterConfirmed: false,
    studentConfirmed: false,
    date: "2026-10-13",
  },
];

export const INITIAL_GIG_REPORTS: GigReport[] = [
  {
    id: "rep-1",
    gigId: "gig-3",
    gigTitle: "Smart Greenhouse IoT Sensor Data Annotation",
    reportedById: "usr-sample",
    reportedByName: "Anonymous Student",
    reason: "Verification Query",
    details: "Checked to ensure lab equipment access timings don't clash with evening hostel curfew.",
    status: "RESOLVED",
    createdAt: "2026-10-13T12:00:00Z",
  },
];

// ============================================================================
// SAFETY RULES & VALIDATION HELPERS
// ============================================================================

export const MAX_ACTIVE_GIGS_PER_STUDENT = 3;
export const MAX_WEEKLY_HOURS_PER_STUDENT = 15;

/**
 * Checks if a gig description asks students to pay an upfront fee (anti-scam rule).
 */
export function containsProhibitedFeeKeywords(text: string): boolean {
  const prohibited = [
    "registration fee",
    "application fee",
    "pay fee",
    "pay an application",
    "pay money",
    "deposit money",
    "pay us",
    "security deposit",
    "upfront fee",
    "processing fee",
    "application charge",
    "entry fee",
  ];
  const lower = text.toLowerCase();
  return prohibited.some((phrase) => lower.includes(phrase));
}

/**
 * Calculates a match score (0-100%) between student skills and gig required skills.
 */
export function calculateSkillMatch(studentSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills.length) return 100;
  const lowerStudent = studentSkills.map((s) => s.toLowerCase());
  const matches = requiredSkills.filter((r) =>
    lowerStudent.some((s) => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s))
  );
  return Math.round((matches.length / requiredSkills.length) * 100);
}
