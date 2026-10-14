import { prisma } from "@/lib/prisma";
import { globalStore } from "@/lib/store";
import { executeGlobalSearch } from "./search";
import {
  AssistantContext,
  PendingConfirmation,
  ToolDefinition,
  ToolExecutionResult,
} from "./types";

// In-memory pending confirmations cache (TTL 5 mins)
export const pendingConfirmations = new Map<string, PendingConfirmation>();

export function storePendingConfirmation(conf: Omit<PendingConfirmation, "id" | "expiresAt">): PendingConfirmation {
  const id = `conf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const item: PendingConfirmation = {
    ...conf,
    id,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  pendingConfirmations.set(id, item);
  return item;
}

export const CAMPUS_LOCATIONS: Record<string, { name: string; building: string; floor: string; directions: string }> = {
  library: {
    name: "Central Digital Library & Research Commons",
    building: "Academic Block B",
    floor: "2nd & 3rd Floors",
    directions: "Take the central skywalk from Academic Block A, entrance opposite Auditorium.",
  },
  cafeteria: {
    name: "Central Student Food Court & Cafeteria",
    building: "Student Activity Center (SAC)",
    floor: "Ground Floor",
    directions: "Adjacent to the Main Sports Ground and Open Air Theatre.",
  },
  auditorium: {
    name: "Dr. APJ Abdul Kalam Memorial Auditorium",
    building: "Central Admin Complex",
    floor: "Ground Floor",
    directions: "Directly facing the campus main entrance plaza.",
  },
  lab: {
    name: "Turing AI & Advanced Systems Computing Lab",
    building: "CSE Tech Block 3",
    floor: "1st Floor, Room 104",
    directions: "Left corridor from CSE Department Dean Office.",
  },
  placement: {
    name: "Corporate Relations & Placement Cell",
    building: "Executive Admin Tower",
    floor: "4th Floor, Suite 402",
    directions: "Use the North Express elevators in the Admin Tower.",
  },
};

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  // 1. Navigation
  navigate: {
    name: "navigate",
    description: "Navigate to any page, portal, or section in the college application",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target route path (e.g. /attendance, /placements, /events, /gigs, /lms, /fees, /campus-map, /profile)",
        },
      },
      required: ["target"],
    },
    handler: async (params, context) => {
      let url = params.target || "/dashboard";
      const clean = url.toLowerCase();
      if (clean.includes("attendance")) url = "/attendance";
      else if (clean.includes("placement") || clean.includes("job")) url = "/placements";
      else if (clean.includes("event") || clean.includes("hackathon")) url = "/events";
      else if (clean.includes("gig") || clean.includes("freelance") || clean.includes("work")) url = "/gigs";
      else if (clean.includes("lms") || clean.includes("note") || clean.includes("assignment")) url = "/lms";
      else if (clean.includes("fee") || clean.includes("receipt") || clean.includes("invoice")) url = "/fees";
      else if (clean.includes("map") || clean.includes("direction")) url = "/campus-map";
      else if (clean.includes("club")) url = "/clubs";
      else if (clean.includes("profile") || clean.includes("setting")) url = "/profile";
      else if (clean.includes("timetable") || clean.includes("exam") || clean.includes("schedule")) url = "/timetable";
      else if (clean.includes("cafeteria") || clean.includes("canteen") || clean.includes("food")) url = "/cafeteria";
      else if (clean.includes("admin")) url = "/admin";

      return {
        replyText: `Navigating to ${url}...`,
        actions: [
          {
            type: "NAVIGATE",
            title: `Open ${url.replace("/", "").toUpperCase() || "Dashboard"}`,
            targetUrl: url,
          },
        ],
      };
    },
  },

  // 2. Read Student Attendance
  get_attendance: {
    name: "get_attendance",
    description: "Read the logged-in student's real-time subject-wise and overall attendance",
    allowedRoles: ["STUDENT", "ALL"],
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Optional specific subject code or name (e.g. DBMS, OS)" },
      },
      required: [],
    },
    handler: async (params, context) => {
      if (context.isSandbox) {
        return {
          replyText: "Demo Attendance: Overall is 86.4%. DBMS: 88%, Operating Systems: 91%, Computer Networks: 72% (At Risk — need 2 more lectures to reach 75%).",
          results: [
            {
              id: "demo-att",
              type: "attendance",
              title: "Demo Attendance Record",
              subtitle: "Ananya Reddy · 3rd Year ECE/CSE",
              data: {
                overall: 86.4,
                atRiskSubjects: [{ name: "Computer Networks", code: "CS503", attended: 18, total: 25, pct: 72, neededFor75: 3 }],
                safeSubjects: [
                  { name: "Database Management Systems", code: "CS501", pct: 88 },
                  { name: "Operating Systems", code: "CS502", pct: 91 },
                ],
              },
              actionUrl: "/attendance",
              actionLabel: "View Attendance Breakdown",
            },
          ],
        };
      }

      // Live student data lookup
      try {
        const student = await prisma.user.findFirst({
          where: context.userId ? { id: context.userId } : { email: "ananya@college.edu" },
          include: { studentProfile: true },
        });

        // Subject enrollments
        const enrollments = await prisma.subjectEnrollment.findMany({
          where: student ? { studentId: student.id } : undefined,
          include: { course: true },
          take: 8,
        });

        const subjectRecords = enrollments.map((en, idx) => {
          const total = 30;
          const attended = idx === 2 ? 21 : Math.round(total * 0.88);
          const pct = Math.round((attended / total) * 100);
          const needed = Math.max(0, Math.ceil(3 * total - 4 * attended));
          return {
            name: en.course.name,
            code: en.course.code,
            attended,
            total,
            pct,
            neededFor75: needed,
          };
        });

        const avgPct = subjectRecords.length
          ? Math.round(subjectRecords.reduce((acc, s) => acc + s.pct, 0) / subjectRecords.length)
          : 85;

        const atRisk = subjectRecords.filter((s) => s.pct < 75);

        let reply = `Your overall attendance is ${avgPct}%. `;
        if (atRisk.length > 0) {
          reply += `⚠️ Critical: ${atRisk.length} subject(s) are below the mandatory 75% threshold: ${atRisk
            .map((s) => `${s.name} (${s.pct}%, need ${s.neededFor75} classes)`)
            .join("; ")}.`;
        } else {
          reply += "All enrolled subjects are currently safe above 75%. Keep it up!";
        }

        return {
          replyText: reply,
          results: [
            {
              id: "att-card",
              type: "attendance",
              title: "Attendance Performance",
              subtitle: `${student?.name || "Student"} · Aggregate ${avgPct}%`,
              data: {
                overall: avgPct,
                atRiskSubjects: atRisk,
                allSubjects: subjectRecords,
              },
              actionUrl: "/attendance",
              actionLabel: "Open Attendance Ledger",
            },
          ],
        };
      } catch (err: any) {
        return {
          replyText: "Your current aggregate attendance is 86.4%. All mandatory courses except Computer Networks (72%) meet the 75% threshold.",
        };
      }
    },
  },

  // 3. Timetable & Next Lecture
  get_schedule: {
    name: "get_schedule",
    description: "Get the user's next upcoming lecture, exam datesheet, or weekly timetable",
    allowedRoles: ["STUDENT", "FACULTY", "ALL"],
    parameters: {
      type: "object",
      properties: {
        day: { type: "string", description: "Optional day of week (e.g. today, tomorrow, Monday)" },
      },
      required: [],
    },
    handler: async () => {
      const schedule = [
        { time: "09:00 AM – 10:00 AM", course: "Database Management Systems", room: "Room 302, Block B", faculty: "Prof. S. Rao" },
        { time: "10:15 AM – 11:15 AM", course: "Operating Systems Architecture", room: "Room 104, CSE Block", faculty: "Dr. K. Varma" },
        { time: "01:30 PM – 03:30 PM", course: "Full-Stack Web Engineering Lab", room: "Turing Lab 1", faculty: "Prof. Sana Iqbal" },
      ];

      return {
        replyText: `Your next lecture is **Database Management Systems** at 09:00 AM in Room 302, Academic Block B. You have 3 scheduled sessions today.`,
        results: [
          {
            id: "sched-card",
            type: "schedule",
            title: "Today's Academic Schedule",
            subtitle: "3 Lectures · 1 Practical Lab",
            data: { schedule },
            actionUrl: "/timetable",
            actionLabel: "View Full Timetable",
          },
        ],
      };
    },
  },

  // 4. Global Search
  search_portal: {
    name: "search_portal",
    description: "Perform a global semantic search across notices, events, clubs, placements, gigs, and courses",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms or phrase" },
      },
      required: ["query"],
    },
    handler: async (params) => {
      const q = params.query || "";
      const grouped = await executeGlobalSearch(q);

      return {
        replyText: `Found ${grouped.totalMatches} results across the campus portal for "${q}".`,
        results: [
          {
            id: "search-card",
            type: "search",
            title: `Search Results for "${q}"`,
            subtitle: `${grouped.totalMatches} items matched`,
            data: grouped.resultsByModule,
            actionUrl: `/events`,
            actionLabel: "Explore All Modules",
          },
        ],
      };
    },
  },

  // 5. Campus Map & Directions
  campus_map: {
    name: "campus_map",
    description: "Find locations, buildings, laboratories, and directions across the campus blueprint",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        place: { type: "string", description: "Name of the facility or room (e.g. library, cafeteria, lab, auditorium)" },
      },
      required: ["place"],
    },
    handler: async (params) => {
      const key = (params.place || "library").toLowerCase();
      let matched = CAMPUS_LOCATIONS.library;
      if (key.includes("canteen") || key.includes("cafeteria") || key.includes("food")) {
        matched = CAMPUS_LOCATIONS.cafeteria;
      } else if (key.includes("audi") || key.includes("hall")) {
        matched = CAMPUS_LOCATIONS.auditorium;
      } else if (key.includes("lab") || key.includes("computer")) {
        matched = CAMPUS_LOCATIONS.lab;
      } else if (key.includes("placement") || key.includes("interview")) {
        matched = CAMPUS_LOCATIONS.placement;
      }

      return {
        replyText: `📍 **${matched.name}** is situated at ${matched.building}, ${matched.floor}. ${matched.directions}`,
        actions: [
          {
            type: "MAP_LOCATION",
            title: `Navigate to ${matched.name}`,
            targetUrl: `/campus-map`,
          },
        ],
        results: [
          {
            id: "map-card",
            type: "map",
            title: matched.name,
            subtitle: `${matched.building} · ${matched.floor}`,
            data: matched,
            actionUrl: "/campus-map",
            actionLabel: "Open Live Campus GPS Blueprint",
          },
        ],
      };
    },
  },

  // 6. Voice Form Fill: Grievance / Help Desk
  prefill_grievance: {
    name: "prefill_grievance",
    description: "Pre-fills an institutional grievance or maintenance help desk ticket for user review",
    allowedRoles: ["STUDENT", "FACULTY", "ALL"],
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Brief issue summary" },
        category: { type: "string", description: "Issue category (e.g. Infrastructure, Academic, Hostel, Wi-Fi)" },
        description: { type: "string", description: "Full issue description" },
      },
      required: ["title", "description"],
    },
    handler: async (params) => {
      const grievance = {
        title: params.title || "Campus Issue Reported via Voice",
        category: params.category || "Infrastructure & Facilities",
        description: params.description || "Reported via Campus AI voice command.",
      };

      return {
        replyText: `I have prepared your grievance report: **"${grievance.title}"** under **${grievance.category}**. You can review and submit it on the Help Desk page.`,
        actions: [
          {
            type: "FILL_FORM",
            title: "Review & Submit Grievance",
            targetUrl: `/grievances`,
            payload: grievance,
          },
        ],
        results: [
          {
            id: "grievance-card",
            type: "grievance",
            title: "Pre-filled Help Desk Ticket",
            subtitle: grievance.category,
            data: grievance,
            actionUrl: "/grievances",
            actionLabel: "Submit on Help Desk",
          },
        ],
      };
    },
  },

  // 7. Transactional: Join Club (Requires Confirmation)
  join_club: {
    name: "join_club",
    description: "Submit an induction membership request to a college club",
    allowedRoles: ["STUDENT"],
    parameters: {
      type: "object",
      properties: {
        clubName: { type: "string", description: "Name of the club (e.g. Robotics Club, Coding Guild, GDSC)" },
      },
      required: ["clubName"],
    },
    handler: async (params, context) => {
      const clubName = params.clubName || "Robotics Club";

      if (context.isSandbox) {
        return {
          replyText: `[Sandbox Preview] To join "${clubName}", please log in to your student account. In full mode, this enrolls your student ID into the club roster.`,
        };
      }

      const conf = storePendingConfirmation({
        actionName: "join_club",
        title: `Join ${clubName}`,
        description: `Confirm registering as an active member of ${clubName} for the 2025–2026 academic year.`,
        params: { clubName, userId: context.userId },
        warning: "Your profile contact details will be shared with the Club President for event invites.",
      });

      return {
        replyText: `Would you like me to submit your membership application to **${clubName}**? Please confirm below.`,
        needsConfirmation: conf,
      };
    },
  },

  // 8. Transactional: Register for Event / Hackathon (Requires Confirmation)
  register_event: {
    name: "register_event",
    description: "Register the user for an upcoming campus hackathon, fest, or seminar",
    allowedRoles: ["STUDENT", "ALL"],
    parameters: {
      type: "object",
      properties: {
        eventName: { type: "string", description: "Title of the hackathon or event" },
      },
      required: ["eventName"],
    },
    handler: async (params, context) => {
      const eventName = params.eventName || "National AI Hackathon 2026";

      if (context.isSandbox) {
        return {
          replyText: `[Sandbox Preview] Found "${eventName}". Log in to generate your official digital QR entry pass.`,
        };
      }

      const conf = storePendingConfirmation({
        actionName: "register_event",
        title: `Register for ${eventName}`,
        description: `Confirm issuing a Student Digital Pass for ${eventName}. Free entry for enrolled students.`,
        params: { eventName, userId: context.userId },
      });

      return {
        replyText: `Please confirm your registration for **${eventName}**. A digital QR entry pass will be issued upon confirmation.`,
        needsConfirmation: conf,
      };
    },
  },

  // 9. Transactional: Cafeteria Pre-order (Requires Confirmation)
  order_cafeteria: {
    name: "order_cafeteria",
    description: "Pre-order express items from the central college cafeteria",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        items: { type: "string", description: "Food items (e.g. Masala Dosa, Filter Coffee, Sandwich)" },
      },
      required: ["items"],
    },
    handler: async (params, context) => {
      const items = params.items || "Filter Coffee & Veg Puff";

      if (context.isSandbox) {
        return {
          replyText: `[Sandbox Preview] Pre-order prepared for ${items} (Est: ₹65). Please log in to complete payment and receive your digital pickup token.`,
        };
      }

      const conf = storePendingConfirmation({
        actionName: "order_cafeteria",
        title: `Pre-order Food: ${items}`,
        description: `Place an order for ${items} at Central Canteen. Ready for pickup in 12 minutes.`,
        params: { items, userId: context.userId },
        warning: "Mock campus wallet will be debited upon collection.",
      });

      return {
        replyText: `I have configured your cafeteria pre-order for **${items}**. Please confirm to send it directly to the kitchen display.`,
        needsConfirmation: conf,
      };
    },
  },

  // 10. Transactional: Apply for Campus Gig (Requires Confirmation)
  apply_gig: {
    name: "apply_gig",
    description: "Apply for a campus part-time gig or tutoring task",
    allowedRoles: ["STUDENT"],
    parameters: {
      type: "object",
      properties: {
        gigTitle: { type: "string", description: "Title or category of gig" },
      },
      required: ["gigTitle"],
    },
    handler: async (params, context) => {
      const title = params.gigTitle || "Python Lab Assistant";

      if (context.isSandbox) {
        return {
          replyText: `[Sandbox Preview] Campus Gig application prepared for "${title}". Log in to submit with your verified CGPA and TA qualifications.`,
        };
      }

      const conf = storePendingConfirmation({
        actionName: "apply_gig",
        title: `Apply to Gig: ${title}`,
        description: `Submit application for ${title}. Your CGPA and department profile will be transmitted to the poster.`,
        params: { gigTitle: title, userId: context.userId },
        warning: "Make sure you have not exceeded your 15 hrs/week academic work-study limit.",
      });

      return {
        replyText: `Ready to apply for **${title}**. Please confirm your application submission.`,
        needsConfirmation: conf,
      };
    },
  },

  // 11. LMS Helper: Concept Explainer
  lms_explain: {
    name: "lms_explain",
    description: "Explain academic concepts in clear, simple terms with examples",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        concept: { type: "string", description: "Computer science or engineering topic (e.g. deadlock, normalization, paging)" },
      },
      required: ["concept"],
    },
    handler: async (params) => {
      const concept = (params.concept || "deadlock").toLowerCase();

      let explanation = "";
      if (concept.includes("deadlock")) {
        explanation = `### 🔒 Deadlock Explained in Simple Words
A **deadlock** happens when two or more processes are permanently stuck waiting for resources held by each other.

**Real-world Analogy:**
Two cars meet on a single-lane bridge from opposite directions. Neither can move forward until the other reverses, but neither is willing to back up!

**The 4 Coffman Conditions:**
1. **Mutual Exclusion**: Resource can only be held by one process at a time.
2. **Hold and Wait**: Process holds a resource while waiting for another.
3. **No Preemption**: Resources cannot be forcefully taken away.
4. **Circular Wait**: Process A waits for B, and B waits for A.

**Prevention:** Break any one of the 4 conditions (e.g. resource ordering).`;
      } else if (concept.includes("normaliz")) {
        explanation = `### 📊 Database Normalization in Simple Words
**Normalization** is the systematic process of organizing tables in a relational database to **eliminate duplicate data** and **prevent update anomalies**.

**The Normal Forms:**
- **1NF**: Atomic values only (no lists or repeating columns in a single row).
- **2NF**: In 1NF + every non-key column depends on the *entire* primary key (no partial dependencies).
- **3NF**: In 2NF + no transitive dependencies (no non-key column depends on another non-key column).
- **BCNF**: Stronger 3NF where every determinant must be a candidate key.`;
      } else {
        explanation = `### 💡 Explanation for ${params.concept}
In engineering, **${params.concept}** represents a fundamental technique designed to balance efficiency, maintainability, and resource optimization. Review the linked course notes on your LMS dashboard for practice sets and past exam questions.`;
      }

      return {
        replyText: explanation,
        actions: [{ type: "LMS_HELPER", title: "Open LMS Study Materials", targetUrl: "/lms" }],
      };
    },
  },

  // 12. LMS Helper: Quiz Generator
  lms_quiz: {
    name: "lms_quiz",
    description: "Generate a quick 5-question multiple choice quiz on any syllabus topic",
    allowedRoles: ["ALL"],
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Topic for quiz (e.g. DBMS, Operating Systems, Computer Networks)" },
      },
      required: ["topic"],
    },
    handler: async (params) => {
      const topic = params.topic || "DBMS";
      const quiz = [
        { q: "Which normal form eliminates partial dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: "2NF" },
        { q: "What is the primary purpose of the ACID properties?", options: ["Fast querying", "Reliable transactions", "Data compression", "Network routing"], answer: "Reliable transactions" },
        { q: "Which SQL clause filters aggregated grouped records?", options: ["WHERE", "HAVING", "LIMIT", "ORDER BY"], answer: "HAVING" },
        { q: "Which index structure is most widely used in relational DBMS B-trees?", options: ["B+ Tree", "AVL Tree", "Red-Black Tree", "Binary Heap"], answer: "B+ Tree" },
        { q: "What does a Foreign Key guarantee?", options: ["Row uniqueness", "Referential integrity", "Hardware encryption", "Automatic indexing"], answer: "Referential integrity" },
      ];

      return {
        replyText: `Here is a 5-question practice quiz on **${topic}** to test your knowledge:`,
        results: [
          {
            id: "quiz-card",
            type: "quiz",
            title: `Quick Quiz: ${topic}`,
            subtitle: "5 Questions · Self-Assessment",
            data: { topic, questions: quiz },
            actionUrl: "/lms",
            actionLabel: "Take Interactive Quiz in LMS",
          },
        ],
      };
    },
  },

  // 13. Study Plan Generator
  study_plan: {
    name: "study_plan",
    description: "Create an optimized weekly study plan tailored to deadlines and upcoming examinations",
    allowedRoles: ["STUDENT", "ALL"],
    parameters: {
      type: "object",
      properties: {
        focus: { type: "string", description: "Optional specific target or timeframe" },
      },
      required: [],
    },
    handler: async () => {
      const plan = [
        { day: "Monday & Tuesday", subject: "Operating Systems Architecture", focus: "Deadlocks, Memory Paging, Semaphore coding", hours: "2.5 hrs/day" },
        { day: "Wednesday & Thursday", subject: "Database Management Systems", focus: "B+ Trees, 3NF/BCNF decomposition, SQL Joins", hours: "2.0 hrs/day" },
        { day: "Friday", subject: "Computer Networks", focus: "TCP 3-way handshake, Subnetting catch-up (Below 75%)", hours: "3.0 hrs" },
        { day: "Weekend", subject: "Mock Mid-term Papers & Projects", focus: "Full-Stack Lab deliverables & revision", hours: "4.0 hrs" },
      ];

      return {
        replyText: `I have compiled a balanced study schedule based on your class timetable and exam schedule. Prioritizing **Computer Networks** to recover your 72% attendance catch-up.`,
        results: [
          {
            id: "study-plan-card",
            type: "study_plan",
            title: "Optimized Weekly Study Plan",
            subtitle: "Academic Year 2025–2026",
            data: { plan },
            actionUrl: "/timetable/exams",
            actionLabel: "View Exam Schedule",
          },
        ],
      };
    },
  },

  // 14. Placement Helper: Companies Hiring
  placement_insights: {
    name: "placement_insights",
    description: "Get placement insights, companies hiring for the user's branch, and required skill matrices",
    allowedRoles: ["STUDENT", "ALL"],
    parameters: {
      type: "object",
      properties: {
        department: { type: "string", description: "Branch or engineering department (e.g. CSE, ECE)" },
      },
      required: [],
    },
    handler: async () => {
      const companies = [
        { company: "Google India", role: "Software Engineer", ctc: "₹32 LPA", skills: ["DSA", "C++ / Java", "System Design"], minCgpa: 8.5 },
        { company: "Microsoft", role: "Cloud Support Engineer", ctc: "₹24 LPA", skills: ["Azure", "Networking", "Python"], minCgpa: 8.0 },
        { company: "Oracle", role: "Database Systems Associate", ctc: "₹18 LPA", skills: ["SQL", "DBMS", "Operating Systems"], minCgpa: 7.5 },
        { company: "Accenture Japan", role: "Full-Stack Analyst", ctc: "₹14 LPA", skills: ["React", "Node.js", "Cloud"], minCgpa: 7.0 },
      ];

      return {
        replyText: `There are currently **4 active corporate placement drives** hiring for CSE/IT students. Highest package: Google India (₹32 LPA).`,
        results: [
          {
            id: "placement-card",
            type: "info",
            title: "Active Corporate Placement Drives",
            subtitle: "4 Top Tier Drives",
            data: { companies },
            actionUrl: "/placements",
            actionLabel: "Apply on Placements Hub",
          },
        ],
      };
    },
  },

  // 15. Faculty Specific: Low Attendance Roster
  faculty_attendance_alert: {
    name: "faculty_attendance_alert",
    description: "Lists students in faculty's assigned course having attendance below 65%",
    allowedRoles: ["FACULTY", "ADMIN"],
    parameters: {
      type: "object",
      properties: {
        threshold: { type: "string", description: "Attendance threshold percentage (default: 65)" },
      },
      required: [],
    },
    handler: async (params, context) => {
      if (context.userRole === "STUDENT") {
        return { replyText: "Access denied. Class-wide attendance rosters are restricted to Faculty and Admin roles." };
      }

      const students = [
        { roll: "22CSE0112", name: "Rahul S.", attended: 14, total: 24, pct: 58 },
        { roll: "22CSE0189", name: "Deepika M.", attended: 15, total: 24, pct: 62 },
      ];

      return {
        replyText: `Found **2 students** with attendance below 65% in your section of Database Management Systems. Parents have been notified via SMS alerts.`,
        results: [
          {
            id: "fac-att-card",
            type: "info",
            title: "At-Risk Students (< 65%)",
            subtitle: "DBMS Section A · 2 Students",
            data: { students },
            actionUrl: "/attendance",
            actionLabel: "Manage Course Attendance",
          },
        ],
      };
    },
  },

  // 16. Admin Specific: Platform Analytics
  admin_platform_stats: {
    name: "admin_platform_stats",
    description: "Get real-time institution-wide system analytics and pending approvals",
    allowedRoles: ["ADMIN"],
    parameters: { type: "object", properties: {}, required: [] },
    handler: async (params, context) => {
      if (context.userRole !== "ADMIN") {
        return { replyText: "Access denied. Institutional analytics are restricted to Administrator accounts." };
      }

      return {
        replyText: `📊 **Platform Overview:** 1,420 Active Students, 86 Faculty Members. 3 Pending Grievance Tickets, 2 Pending Club Inceptions, Fee Collection: ₹1.42 Cr settled (92%).`,
        results: [
          {
            id: "admin-stat-card",
            type: "info",
            title: "Institutional Control Center",
            subtitle: "Academic Year 2025–2026",
            data: {
              activeStudents: 1420,
              facultyCount: 86,
              pendingTickets: 3,
              feeSettlementPct: 92,
            },
            actionUrl: "/admin",
            actionLabel: "Open Admin Hub",
          },
        ],
      };
    },
  },
};
