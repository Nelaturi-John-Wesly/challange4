# Campus AI (AETHER) — Architecture & Tool Registry

## 1. Overview
**Campus AI (AETHER)** is an intelligent, voice-first multimodal assistant integrated into the college student portal. It empowers students, faculty, and administrators to navigate the platform, query personal academic records, run semantic searches, pre-fill grievance/help desk forms, and trigger transactional campus workflows via conversational voice or text in English (`en-IN`), Telugu (`te-IN`), and Hindi (`hi-IN`).

---

## 2. High-Level Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │             Browser Client UI                │
                  │  - Floating Assistant Orb (AETHER)           │
                  │  - Global Command Palette (Ctrl+K)           │
                  │  - Web Speech API (STT & TTS)                │
                  │  - Confirmation & Result Cards               │
                  └──────────────┬───────────────────────────────┘
                                 │ HTTP POST
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Next.js Backend API Layer                             │
│                                                                             │
│  /api/assistant/message       /api/assistant/confirm       /api/search      │
│  (Authenticated Turn)         (Transactional Execute)      (Global Search)  │
└───────┬──────────────────────────────┬──────────────────────────────┬───────┘
        │                              │                              │
        ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────┐
│  Sanitization &  │           │   Confirmation   │           │ Multi-Module │
│  Rate Limiting   │           │    Token TTL     │           │   Semantic   │
└───────┬──────────┘           └───────┬──────────┘           │    Search    │
        │                              │                      └──────────────┘
        ▼                              ▼
┌───────────────────────────────────────────────────────────┐
│                 LLM & Intent Matcher                      │
│                                                           │
│  - Anthropic / Gemini Tool Calling (if API Key provided)  │
│  - Multilingual Rule-Based Intent Matcher (Offline)       │
└──────────────────────────────┬────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────┐
│              Allowlisted Server Tool Registry             │
│                                                           │
│  - Role-Gated Execution (STUDENT / FACULTY / ADMIN)       │
│  - Binds Strictly to Session Identity (JWT)               │
│  - Non-destructive execution directly via internal logic  │
│  - Transactional mutations generate Pending Confirmation  │
└──────────────────────────────┬────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────┐
│         Database & Audit Log (AssistantAuditLog)          │
│   (Prisma ORM, SQLite in dev / PostgreSQL in production)  │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Core Entry Points
1. **Floating AI Orb (`FloatingAssistantButton`):**
   - Positioned fixed at the bottom-right on all authenticated pages.
   - Animated glowing rings with listening pulse and audio visualizer waves.
   - Shows a keyboard shortcut chip (`Ctrl+K`).
2. **Global Command Palette (`CommandPalette`):**
   - Opened via `Ctrl+K` or `Cmd+K` anywhere across the portal.
   - Also accessible via the microphone search icon in the top navigation bar.
   - Real-time search across all campus modules with voice dictation.
3. **Voice & Text Panel (`AssistantPanel`):**
   - Sliding right-side drawer with streaming chat, role-aware suggestion chips, audio waveform, language switcher, and hands-free toggle.
4. **Interactive Login Demo Preview (`DemoAssistantPreview`):**
   - Sandboxed preview on `/login` that runs in demo mode without requiring authentication.

---

## 4. Voice Processing Engine
- **Speech-to-Text (STT):** Uses the browser standard `SpeechRecognition` / `webkitSpeechRecognition`.
  - Continuous listening support with auto-restart for `Hands-Free` mode.
  - Push-to-talk mode holding `Space` when the assistant panel is active.
  - Micro-animations: Dynamic 5-bar SVG waveform synchronized with speech activity.
  - Fallback: Gracefully switches to text input with a friendly warning if unsupported (e.g. Firefox).
- **Text-to-Speech (TTS):** Uses the browser `SpeechSynthesis` API.
  - Automatically matches speech locale (`en-IN`, `te-IN`, `hi-IN`).
  - Toggleable via the speaker icon or profile settings.
- **Multilingual Support:**
  - Auto-detects Telugu (`[\u0C00-\u0C7F]`), Hindi (`[\u0900-\u097F]`), or English keywords.
  - Responds in the matched language seamlessly.

---

## 5. Security & Privacy Architecture
1. **Zero Raw SQL / Direct DB from LLM:**
   - The LLM never receives SQL generation capabilities. It can only call strongly typed allowlisted tools.
2. **Session Identity Binding:**
   - The server inspects `session.user.id` and `session.user.role`. A user can only inspect their own attendance, grades, and submissions.
3. **Two-Phase Confirmation Flow:**
   - Any state-altering action (e.g., joining a club, registering for an event, ordering food, applying for a gig) generates a `pendingConfirmation` token stored in a short-lived TTL cache (5-minute expiration).
   - The action is never executed until the user explicitly clicks **"Confirm"** or says **"Yes, proceed"**.
4. **Input Sanitization & Prompt Injection Protection:**
   - Strips malicious system prompt override patterns (`system prompt:`, `ignore previous instructions`, `drop table`, `<script>`, etc.).
5. **No Audio Storage:**
   - Audio is transcribed locally in the client browser. No raw audio clips are transmitted, recorded, or persisted.
6. **Rate Limiting & Audit Logging:**
   - Limits unauthenticated and authenticated queries (maximum 40 requests per minute per IP).
   - Every executed tool logs an immutable entry to `AssistantAuditLog` (`userId`, `role`, `action`, `toolName`, `inputQuery`, `success`, `executionMs`).

---

## 6. Complete Tool Registry

| Tool Name | Allowed Roles | Description | Requires Confirmation |
|---|---|---|:---:|
| `navigate` | ALL | Navigates to any portal page (`/attendance`, `/placements`, `/events`, etc.) | No |
| `get_attendance` | STUDENT | Fetches student's subject-wise attendance and identifies subjects below 75% | No |
| `get_schedule` | STUDENT | Fetches next class, today's schedule, and pending assignment deadlines | No |
| `campus_map` | ALL | Locates campus venues (library, lab, auditorium, cafeteria) with directions | No |
| `prefill_grievance` | ALL | Pre-populates the Help Desk grievance form with title, category, and description | No |
| `join_club` | STUDENT | Joins a student club/society | **YES** |
| `register_event` | STUDENT | Registers the student for a campus hackathon or workshop | **YES** |
| `order_cafeteria` | ALL | Pre-orders food items from the campus cafeteria | **YES** |
| `apply_gig` | STUDENT | Applies for a campus part-time gig or student freelance job | **YES** |
| `lms_explain` | ALL | Generates student-friendly conceptual explanations (e.g. normalization, deadlock) | No |
| `lms_quiz` | ALL | Generates a 5-question interactive multiple-choice quiz on any academic topic | No |
| `study_plan` | STUDENT | Constructs a prioritized 7-day study plan based on timetable and deadlines | No |
| `placement_insights` | STUDENT | Identifies companies hiring for specific branches and recommends skills | No |
| `faculty_attendance_alert` | FACULTY, ADMIN | Lists students in faculty's department with attendance below 65% | No |
| `admin_platform_stats` | ADMIN | Retrieves platform metrics (total students, active gigs, grievances, pass rates) | No |

---

## 7. How to Add a New Tool

Follow these 4 steps to add any new tool to the registry:

### Step 1: Define the Tool Schema in `src/lib/assistant/tools.ts`
```typescript
{
  name: "library_search_books",
  description: "Search available books and reservations in the college central library",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Book title, author, or ISBN" },
      department: { type: "string", description: "Optional department filter (CSE, ECE, MECH)" },
    },
    required: ["query"],
  },
  roles: ["STUDENT", "FACULTY", "ADMIN"],
  requiresConfirmation: false,
  handler: async (args, ctx) => {
    // Call internal database or library service using ctx.user.id
    return {
      text: `Found 3 available copies of "${args.query}" on Shelf B-12.`,
      resultCards: [
        {
          id: "book-1",
          type: "course",
          title: String(args.query),
          subtitle: "Shelf B-12 · Central Library 2nd Floor",
          details: { "Status": "Available", "Copies": "3/5 Available" },
          link: "/library",
        },
      ],
    };
  },
}
```

### Step 2: Register Intent Keywords in `src/lib/assistant/intent-matcher.ts`
Add keyword triggers in English, Telugu, and Hindi so offline fallback and zero-latency matching work without an API key:
```typescript
if (matchPattern(t, ["find book", "library", "search book", "textbook", "పుస్తకం", "లైబ్రరీ", "किताब", "लाइब्रेरी"])) {
  return {
    toolName: "library_search_books",
    args: { query: extractSearchTerm(t, ["find book", "search book"]) },
    reply: "Searching the central library catalog...",
  };
}
```

### Step 3: Add Role-Based Suggestion Chips in `src/components/assistant/AssistantPanel.tsx`
Add a quick-click chip to the role suggestions array:
```typescript
{ label: "Find algorithms book", query: "Search for Cormen Algorithms book in library", icon: BookOpen }
```

### Step 4: Verify with Unit Tests
Add a test case in `tests/assistant.test.ts` verifying that:
1. Permitted roles can invoke the tool.
2. Disallowed roles receive an unauthorized action message.
3. Multilingual intent patterns correctly map to the tool.

---

## 8. Role-Based Verification Guide

### 1. Student Role Test
1. Click **"Login as Demo Student"** on the login page (or log in with `student@campus.edu` / `password123`).
2. Press `Ctrl+K` or click the glowing AI orb in the bottom-right.
3. Try saying or typing:
   - *"What's my attendance in DBMS?"* → Returns subject percentage with progress card.
   - *"Which subjects are below 75%?"* → Highlights low attendance warnings.
   - *"Where is the library?"* → Shows location card with navigation link to Campus Map.
   - *"Join the coding club"* → Prompts for confirmation; clicking **Confirm** executes the induction.
   - *"Explain deadlock in simple words"* → Delivers intuitive LMS explanation with real-world analogies.

### 2. Faculty Role Test
1. Log in with `faculty@campus.edu` / `password123`.
2. Notice the top suggestion chips change to faculty-specific queries.
3. Try saying or typing:
   - *"Show students with attendance below 65% in my class"* → Lists at-risk students for remedial action.
   - *"Post an announcement"* → Pre-fills announcement creator.
   - *"Where is the auditorium?"* → Shows campus map coordinates.

### 3. Administrator Role Test
1. Log in with `admin@campus.edu` / `password123`.
2. Try saying or typing:
   - *"Show platform statistics"* → Generates high-level institutional summary card (user count, active gigs, open grievances).
   - Attempt student-only actions (e.g. *"Show my attendance"*) → System politely reports that attendance tracking is bound to enrolled student accounts.

---

## 9. Environment Flags Reference

| Variable | Default | Purpose |
|---|---|---|
| `AI_ASSISTANT_ENABLED` | `true` | Master feature flag enabling Campus AI assistant backend and frontend orb |
| `DEMO_MODE_ENABLED` | `true` | Displays the "Explore the Demo" section and 1-click accounts on `/login` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Client-side flag for the interactive sandbox assistant |
| `ANTHROPIC_API_KEY` | `""` | Optional API key for Claude 3.7 tool calling |
| `GEMINI_API_KEY` | `""` | Optional API key for Google Gemini function calling |
| `AI_MODEL` | `gemini-1.5-flash` | Selected model provider when external LLM is configured |
