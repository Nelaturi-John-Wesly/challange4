import { prisma } from "@/lib/prisma";
import { globalStore } from "@/lib/store";

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  badge?: string;
  relevanceScore?: number;
}

export interface GroupedSearchResults {
  query: string;
  totalMatches: number;
  resultsByModule: {
    events: SearchResultItem[];
    clubs: SearchResultItem[];
    placements: SearchResultItem[];
    gigs: SearchResultItem[];
    courses: SearchResultItem[];
    faqs: SearchResultItem[];
    people: SearchResultItem[];
  };
}

// Curated Institutional Knowledge Base (Circulars, Policies, FAQs)
export const INSTITUTIONAL_KNOWLEDGE_BASE = [
  {
    id: "kb-exam-circ-2026",
    title: "Semester Final Exam Circular Oct 2026",
    description: "End-semester examinations commence from Nov 3rd, 2026. Hall tickets available on LMS portal.",
    category: "Notices & Circulars",
    url: "/timetable/exams",
    source: "Office of the Controller of Examinations",
  },
  {
    id: "kb-attendance-policy",
    title: "Mandatory 75% Minimum Attendance Regulation",
    description: "Students having less than 75% aggregate attendance without verified medical excuse are detained from end exams.",
    category: "Academic Policy",
    url: "/attendance",
    source: "Academic Senate Handbook",
  },
  {
    id: "kb-library-hours",
    title: "Central Digital Library Hours & WiFi Access",
    description: "Open 8:00 AM – 10:00 PM. High-speed 1 Gbps campus WiFi 'Campus_Secure' available on floors 1–3.",
    category: "Facilities",
    url: "/campus-map",
    source: "Campus Facilities Division",
  },
  {
    id: "kb-fee-concession",
    title: "Merit-cum-Means Fee Scholarships & Waivers",
    description: "Applications open for full and partial tuition fee waivers for students maintaining CGPA > 8.5.",
    category: "Finance & Accounts",
    url: "/fees",
    source: "Student Welfare Office",
  },
  {
    id: "kb-placement-rules",
    title: "Campus Placement Eligibility & Dream Job Policy",
    description: "Students securing a dream offer (> ₹12 LPA) are eligible to participate in 1 additional super-dream drive.",
    category: "Training & Placement",
    url: "/placements",
    source: "Training & Placement Cell",
  },
  {
    id: "kb-gigs-guidelines",
    title: "Campus Gigs Work-Study Policy",
    description: "Maximum 15 hours per week academic limit; up to 3 active gigs per student; zero upfront registration fees allowed.",
    category: "Career & Work-Study",
    url: "/gigs",
    source: "Dean of Student Affairs",
  },
];

/**
 * Executes a fast, categorized multi-module search across the platform
 */
export async function executeGlobalSearch(query: string): Promise<GroupedSearchResults> {
  const clean = (query || "").trim().toLowerCase();
  if (!clean) {
    return {
      query: "",
      totalMatches: 0,
      resultsByModule: {
        events: [],
        clubs: [],
        placements: [],
        gigs: [],
        courses: [],
        faqs: [],
        people: [],
      },
    };
  }

  const terms = clean.split(/\s+/).filter(Boolean);

  const matchesText = (text: string | null | undefined): boolean => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return terms.some((term) => lower.includes(term));
  };

  // 1. Events
  let eventItems: SearchResultItem[] = [];
  try {
    const events = await prisma.campusEvent.findMany({
      take: 20,
      select: { id: true, title: true, description: true, category: true, venue: true, startDate: true },
    });
    eventItems = events
      .filter((e) => matchesText(e.title) || matchesText(e.description) || matchesText(e.venue) || matchesText(e.category))
      .map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description?.slice(0, 120) + "..." || `Venue: ${e.venue}`,
        category: "Events",
        url: `/events`,
        badge: e.category,
      }));
  } catch (err) {
    console.warn("Event search error:", err);
  }

  // 2. Clubs
  let clubItems: SearchResultItem[] = [];
  try {
    const clubs = await prisma.club.findMany({
      take: 20,
      select: { id: true, name: true, description: true, category: true },
    });
    clubItems = clubs
      .filter((c) => matchesText(c.name) || matchesText(c.description) || matchesText(c.category))
      .map((c) => ({
        id: c.id,
        title: c.name,
        description: c.description?.slice(0, 120) + "..." || c.category,
        category: "Clubs",
        url: `/clubs`,
        badge: c.category,
      }));
  } catch (err) {
    console.warn("Club search error:", err);
  }

  // 3. Placements
  let placementItems: SearchResultItem[] = [];
  try {
    const placements = await prisma.placementDrive.findMany({
      take: 20,
      include: { recruiter: true },
    });
    placementItems = placements
      .filter((p) => matchesText(p.recruiter?.companyName || "") || matchesText(p.title) || matchesText(p.description))
      .map((p) => ({
        id: p.id,
        title: `${p.recruiter?.companyName || "Campus Drive"} — ${p.title}`,
        description: p.description?.slice(0, 120) + "..." || `Package: ₹${p.packageLPA} LPA`,
        category: "Placements",
        url: `/placements`,
        badge: `₹${p.packageLPA} LPA`,
      }));
  } catch (err) {
    console.warn("Placement search error:", err);
  }

  // 4. Campus Gigs
  const gigItems: SearchResultItem[] = globalStore.gigs
    .filter(
      (g) =>
        matchesText(g.title) ||
        matchesText(g.description) ||
        (Array.isArray(g.requiredSkills)
          ? g.requiredSkills.some((s: string) => matchesText(s))
          : Boolean(g.requiredSkills && matchesText(String(g.requiredSkills))))
    )
    .map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description.slice(0, 120) + "...",
      category: "Campus Gigs",
      url: `/gigs/${g.id}`,
      badge: g.rewardAmount ? `₹${g.rewardAmount}` : g.category,
    }));

  // 5. Courses
  let courseItems: SearchResultItem[] = [];
  try {
    const courses = await prisma.course.findMany({
      take: 20,
      select: { id: true, code: true, name: true, credits: true },
    });
    courseItems = courses
      .filter((c) => matchesText(c.code) || matchesText(c.name))
      .map((c) => ({
        id: c.id,
        title: `${c.code}: ${c.name}`,
        description: `${c.credits} Credits · Department Curriculum`,
        category: "Courses & LMS",
        url: `/lms`,
        badge: `${c.credits} Credits`,
      }));
  } catch (err) {
    console.warn("Course search error:", err);
  }

  // 6. Knowledge Base / FAQs
  const faqItems: SearchResultItem[] = INSTITUTIONAL_KNOWLEDGE_BASE.filter(
    (k) => matchesText(k.title) || matchesText(k.description) || matchesText(k.category) || matchesText(k.source)
  ).map((k) => ({
    id: k.id,
    title: k.title,
    description: k.description,
    category: "Knowledge Base",
    url: k.url,
    badge: k.source,
  }));

  // 7. People (Faculty / Staff)
  let peopleItems: SearchResultItem[] = [];
  try {
    const people = await prisma.user.findMany({
      where: { role: { not: "STUDENT" } },
      take: 15,
      select: { id: true, name: true, email: true, role: true, department: { select: { code: true, name: true } } },
    });
    peopleItems = people
      .filter((p) => matchesText(p.name) || matchesText(p.email) || matchesText(p.role) || matchesText(p.department?.name))
      .map((p) => ({
        id: p.id,
        title: p.name,
        description: `${p.role} · ${p.department?.name || p.department?.code || "Campus Staff"} (${p.email})`,
        category: "Faculty & Staff",
        url: `/profile`,
        badge: p.role,
      }));
  } catch (err) {
    console.warn("People search error:", err);
  }

  const totalMatches =
    eventItems.length +
    clubItems.length +
    placementItems.length +
    gigItems.length +
    courseItems.length +
    faqItems.length +
    peopleItems.length;

  return {
    query: clean,
    totalMatches,
    resultsByModule: {
      events: eventItems.slice(0, 4),
      clubs: clubItems.slice(0, 4),
      placements: placementItems.slice(0, 4),
      gigs: gigItems.slice(0, 4),
      courses: courseItems.slice(0, 4),
      faqs: faqItems.slice(0, 4),
      people: peopleItems.slice(0, 4),
    },
  };
}
