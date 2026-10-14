# College Website & Campus Life Platform — Deployment & Project Summary

> **Status:** Successfully Deployed to Vercel (Production)  
> **Working Tree:** Clean (`git` commit: `48733cd`)  
> **Local Path:** `c:\Users\johnf\college-platform`

---

## 🌐 Live Website Details

| Property | Value / Link |
| :--- | :--- |
| **Primary Production URL** | [https://college-platform-eosin.vercel.app](https://college-platform-eosin.vercel.app) |
| **Direct Deployment URL** | [https://college-platform-nl3yoor54-johnff340-4816.vercel.app](https://college-platform-nl3yoor54-johnff340-4816.vercel.app) |
| **Hosting Platform** | Vercel (Production Edge, Node.js 24 runtime) |
| **Deployment Mode** | Standard Public Web App (No tunnels or live dev servers needed) |

---

## 🔑 Demo Access Credentials

The login screen features 1-click quick login chips. You can also sign in manually with any of the accounts below:

| Role | Email | Password | Access & Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `ananya@college.edu` | `Student@123` | Dashboard, Attendance, Timetable, Fees, LMS, ID Card, Clubs, Events, Sports, Cafeteria, Grievances |
| **Student (Alt)** | `karthik@college.edu` | `Student@123` | CSE Department, 4th Year, Placements & Research focus |
| **Admin** | `admin@college.edu` | `Admin@123` | Institutional Control Center, Emergency Broadcasts, User Management, Audit Logs |
| **Alumni** | `alumni@college.edu` | `Alumni@123` | Alumni Directory, Mentorship Requests, Industry Networking |
| **Club Lead** | `club@college.edu` | `Club@123` | Club Management, Member Inductions, Event Scheduling |
| **Cafeteria Staff** | `canteen@college.edu` | `Staff@123` | Live Kitchen Orders, Express Tray Management, Token Verification |

---

## 🗺️ Complete Route & Feature Architecture

All routes are fully implemented, populated with realistic sample data, and styled with unique color themes:

### 1. Core Academic & Student Life
- **`/login`** — Modern split glassmorphism layout with institutional login, student registration with department dropdown, password toggle, and quick demo chips.
- **`/dashboard`** — Personal greeting, circular attendance ring, upcoming lectures, exam countdown, pending fee badge, and campus alerts.
- **`/attendance`** — Subject-wise breakdown, aggregate percentage, minimum attendance warning, and absence tracker.
- **`/timetable`** — Weekly class schedule with room allocations, faculty info, and interactive exam hall datesheet.
- **`/fees`** — Semester fee ledger, mock payment gateway (UPI/Cards), transaction history, and downloadable PDF-style fee receipts.
- **`/lms`** — Course materials, lecture PDF viewer, assignment submission portal with grade records.
- **`/id-card`** — Digital institutional smart card with barcode, roll number, department seal, and flip animation.

### 2. Campus Engagement & Co-Curricular (Unique Themes)
- **`/clubs`** (*Royal Indigo / Violet `#6366f1`*): Technical, cultural, and sports clubs with domain filter tabs, membership inductions, and Lead Portal.
- **`/events`** (*Vibrant Amber / Gold `#f59e0b`*): Interactive Month Calendar, QR pass issuance, mock UPI/Card ticket checkout, live check-in terminal, and digital certificates.
- **`/sports`** (*Athletic Emerald `#10b981`*): Live tournament scoreboards, inter-department points table, court reservations, and team registrations.
- **`/media`** (*Electric Sky / Cyan `#0ea5e9`*): Campus Chronicle magazine, student podcast player, video highlights, and op-ed submission form.
- **`/placements`** (*Rose / Coral Crimson `#f43f5e`*): Corporate recruitment drives, CGPA eligibility calculator, 1-click apply, CTC statistics, and interview rounds.
- **`/alumni`** (*Warm Gold Bronze `#d97706`*): Global graduate directory (Google, Microsoft, McKinsey) with 1-on-1 mentorship bookings.
- **`/research`** (*Neon Violet `#a855f7`*): IEEE/Nature research papers, citations, grants, lab equipment, and RA positions.
- **`/campus-map`** (*Modern Teal Blueprint `#14b8a6`*): Interactive campus GPS blueprint, facility category pins, and walking pathfinder.
- **`/cafeteria`** (*Warm Sunset Orange `#ea580c`*): Live canteen menu, express tray cart, instant food tokens (`#TK-XXXX`), and kitchen display system.
- **`/gigs`** (*Futuristic Electric Amber / Gold `#f59e0b` & Indigo*): Campus Part-Time Work Marketplace with anti-scam escrow, study-work limits (15h/week, 3 tasks max), role-based posting, student application tracker, two-way settlement, and digital completion certificates.
- **`/grievances`** (*Steel Blue `#3b82f6`*): Support ticket creation, multi-step vertical progression timeline, and resolution tracker.
- **`/admin`** (*Crimson Authority `#dc2626`*): Institutional analytics, emergency alert broadcaster, and live audit feed.

---

## 💻 Tech Stack & Design System

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Glassmorphism, CSS Custom Properties
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (JWT session strategy, cloud demo fallbacks + Prisma SQLite support)
- **Database**: SQLite via Prisma ORM
- **State Management**: React Context, custom stores, localStorage persistence
- **Hosting**: Vercel Serverless Edge

---

## 🚀 Commands Reference

```bash
# Navigate to project
cd C:\Users\johnf\.gemini\antigravity-ide\scratch\college-platform

# Run local development server
npm run dev

# Run production build
npm run build

# Redeploy to Vercel
npx.cmd vercel --prod --yes
```
