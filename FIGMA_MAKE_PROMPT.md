# NeuralNest — Figma Make Prompt

> Paste this entire prompt into Figma Make to generate all pages.

---

## App Overview

NeuralNest is a premium AI-powered adaptive learning platform. It features a fixed left sidebar navigation, a global top bar, and a deep dark blue-charcoal visual identity. The design is modern, spatial, and premium — inspired by tools like Linear, Notion, and Arc Browser. **Not** a clone of StudyFetch or any competitor.

---

## Design System

### Colors (Dark Mode — Primary)

| Token | Hex | Usage |
|---|---|---|
| Page Background | `#16161F` | Main page background — dark blue-charcoal |
| Sidebar | `#111118` | Fixed left sidebar — slightly darker than page |
| Surface / Cards | `#1E1E2C` | All card surfaces, quiz options, action tiles |
| Elevated | `#25253A` | Input bars, modals, dropdowns — most prominent surfaces |
| Active Nav | `#1E2A45` | Active sidebar item pill background (dark blue) |
| Border | `#2A2A3E` | All borders and dividers — subtle cool-purple |
| Border Subtle | `#1E1E30` | Very subtle section dividers only |
| Text Primary | `#E8E8F2` | Main text — near white with slight blue tint (NOT harsh white) |
| Text Muted | `#8888A8` | Secondary text, labels, placeholders — muted blue-gray |
| Primary Blue | `#1D4ED8` | Navigation buttons, active states |
| CTA Blue | `#3B6BFF` | Primary action buttons — Send, Next, Start Learning |
| Accent Purple | `#8A72FF` | Highlights, accent icons, special elements |
| Mastery Gray | `#9CA3AF` | Unstarted node |
| Mastery Yellow | `#FBBF24` | Learning/active node |
| Mastery Green | `#10B981` | Mastered node |
| Quiz Wrong BG | `#2D2A14` | Wrong answer card background |
| Quiz Explain BG | `#1A2414` | Explanation card background |
| Orange Pill | `#F97316` | Exam countdown chip |
| Red | `#EF4444` | Hearts, errors |
| XP Amber | `#F59E0B` | XP counter, streak fire icon |

### Colors (Light Mode)

| Token | Hex | Usage |
|---|---|---|
| Page Background | `#F9FAFB` | Warm off-white |
| Sidebar | `#F3F4F6` | Light gray panel |
| Surface / Cards | `#FFFFFF` | Pure white cards |
| Elevated | `#F9FAFB` | Slightly off-white inputs |
| Border | `#E5E7EB` | Light gray borders |
| Text Primary | `#111827` | Near black |
| Text Muted | `#6B7280` | Mid gray |

### Typography

- **Font Family:** Inter (Google Fonts) — all body text
- **Monospace:** JetBrains Mono — roadmap labels, mastery scores, code blocks
- **Headings:** Bold, Inter
- **Body:** Regular 400, Inter, 14-16px

### Shadows

- Cards (dark): `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(42,42,62,0.8)`
- Cards (light): `0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(229,231,235,1)`
- Node glow: `0 0 16px rgba(138,114,255,0.35)`

### Corner Radius

- Cards: 12px
- Buttons: 8px
- Pills/badges: 9999px (full round)
- Input fields: 10px
- Modal: 16px

---

## Global Layout

### Sidebar — Fixed Left (210px wide)

Present on every authenticated page. Background: `#111118`.

**Structure (top to bottom):**
1. **Logo:** Brain icon 🧠 + "NEURALNEST" wordmark — bold, `#E8E8F2` text, 20px height, 16px padding
2. **Divider line** — `#1E1E30`
3. **Navigation links** (each is a row with icon + label):
   - 🏠 Dashboard
   - 🗺️ Roadmap
   - 🤖 AI Tutor
   - ⏱️ Exam Mode
   - 📝 Active Quizzes
4. **Divider line**
5. **Chat History** — collapsible section with ▾ toggle arrow
   - Sub-items when expanded: 📅 Exam / 🗺️ Roadmap / 💡 Other
   - Under each sub-item: list of individual chat session names (truncated, ellipsis)
6. **Notes** — collapsible section with ▾ toggle arrow
   - Sub-items when expanded: list of uploaded PDF names with 📄 icon
7. **Divider line**
8. **"+ New Session" button** — full width, `#3B6BFF` background, white text, rounded 8px

**Active nav item style:** `#1E2A45` background pill, `#E8E8F2` white text, bold
**Inactive nav item:** No background, `#8888A8` muted text, regular weight
**Icon size:** 18px, text 14px

### Top Bar — Fixed Top (full width minus sidebar)

Background: `#16161F`. Height: 60px. Bottom border: `#2A2A3E`.

**Elements (left to right):**
1. **Search bar** — left side, ~40% width, rounded input field, `#25253A` background, placeholder: "Search topics, syllabuses, or notes...", magnifying glass icon left
2. **"✦ Ask Doubt" button** — pill shape, `#3B6BFF` background, white text, sparkle icon ✦ left
3. **Bell icon** — notification bell, `#8888A8`, 20px (with optional red dot badge)
4. **Theme toggle** — moon icon 🌙 (dark mode) / sun icon ☀️ (light mode), `#8888A8`
5. **User avatar** — 32px circle, colored initial letter (e.g. "G" on green), right side. Next to it: user name in `#E8E8F2`, email in `#8888A8` below

---

## Page 1: Dashboard (`/dashboard`)

The main home screen. Full-width content area (right of sidebar, below top bar).

### Row 1 — Three stat cards (equal width, horizontal)

**Card 1: Overall Syllabus**
- Label: "OVERALL SYLLABUS" — small caps, `#8888A8`
- Large number: "33.7%" — bold, 32px, `#E8E8F2`
- Subtitle: "2 / 4 topics started" — `#8888A8`
- Right side: Circular progress ring (donut chart), stroke color `#10B981` on `#2A2A3E` track, "33.7%" in center

**Card 2: Exam Countdown**
- Label: "EXAM COUNTDOWN" — small caps, `#8888A8`
- Calendar icon 📅 in orange `#F97316`
- Large text: "5 Days" — bold, 24px + "Remaining" in green `#10B981`
- Subtitle: "Exam date: Jun 21, 2026" — `#8888A8`

**Card 3: Weekly Streak**
- Label: "WEEKLY STREAK" — small caps, `#8888A8`
- Fire icon 🔥 in amber `#F59E0B`
- Large text: "4 Days" — bold, 24px
- Badge: "+180 XP today" — small green pill
- Subtitle: "Mastery level: college scholar" — `#8888A8`

All cards: `#1E1E2C` background, `#2A2A3E` border, 12px radius, card shadow

### Row 2 — Topic-by-Topic Mastery Table (full width card)

- Header: "Topic-by-Topic Mastery" — bold 18px, left
- Right: "Sort by: Mastery" dropdown — `#25253A` bg, `#E8E8F2` text
- Table columns: Topic Concept | Difficulty | Estimate | Mastery Score | Study
- Each row:
  - Topic name: `#E8E8F2`, 14px
  - Difficulty: colored badge pill — "Medium" = blue `#3B6BFF`, "Hard" = red `#EF4444`, "Easy" = green `#10B981`
  - Estimate: "25m" — `#8888A8`
  - Mastery Score: horizontal progress bar (green `#10B981` fill on `#2A2A3E` track) + percentage text
  - Study: circle play button ▶ icon, `#8888A8`, clickable

Card: `#1E1E2C` bg, `#2A2A3E` border

### Row 3 — Two-column layout

**Left column: AI Recommended Next + Continue**

AI Recommended Next card:
- Label: "✦ AI RECOMMENDED NEXT" — small caps, gold `#FBBF24`, sparkle icon
- Topic name: "Virtual Memory & Paging" — bold 16px
- Description: "Your current mastery is 45%. Set at onboarding as a target topic."
- Stats: "⏱ 35m est" + "📊 Hard" — muted text
- Button: "Resume Study Pacing →" — full width, `#3B6BFF`, white text, 8px radius

Continue Where You Left Off card (below):
- Label: "⚡ CONTINUE WHERE YOU LEFT OFF"
- Text: "Last session: Virtual Memory • Yesterday • Mastery: 62%"
- Two buttons side by side: "Resume Tutor →" (filled `#3B6BFF`) + "Take Quiz →" (outlined `#3B6BFF` border)

**Right column: Exam Rescue Timeline**
- Label: "📅 EXAM RESCUE TIMELINE" — small caps
- Subtitle: "Day-by-day scheduler until exam day."
- Vertical timeline with dots:
  - ✅ Day 1 Study Block — June 16 — "Virtual Memory & Paging + CPU Scheduling Revision"
  - ② Day 2 Study Block — June 17 — "Deadlocks & Synchronization"
  - ③ Day 3 Study Block — June 18 — "File Systems & I/O"
  - ④ Day 4 Mock Exam — June 19

---

## Page 2: Roadmap (`/roadmap`)

### Page Header (below top bar)
- Left: "Operating Systems Roadmap" — bold 24px + "Click a node to open details and start studying." — `#8888A8` subtitle
- Right: Three pill badges:
  - `📅 Exam: 5 Days Left (Jun 21, 2026)` — orange `#F97316` bg, white text
  - `✓ 1 Mastered` — green `#10B981` bg
  - `✦ 1 Active` — yellow `#FBBF24` bg, dark text

### Canvas Area
- Full page card with `#1E1E2C` bg, 12px radius
- Subtle dot grid pattern on the background
- Bottom-left: zoom controls — `+` / `−` / expand buttons in a small `#25253A` toolbar
- Bottom-right: "React Flow" watermark text — `#8888A8`

### Nodes on Canvas

**Node 1 — "CPU" — Mastered (Green)**
- Large circle (80px diameter), green border `#10B981`, subtle green fill
- White ✓ checkmark icon centered
- Label below: "CPU" — green text
- Status: completed

**Node 2 — "Virtual" — Active (Yellow)**
- Large circle, yellow border `#FBBF24`, subtle yellow fill + pulsing glow animation ring
- ✦ sparkle icon centered (gold)
- Label below: "Virtual" — yellow text

**Node 3 — "Deadlocks" — Unstarted (Gray)**
- Large circle, gray border `#9CA3AF`, dark gray fill
- 🔒 lock icon centered
- Label below: "Deadlocks" — gray text

**Edges between nodes:**
- CPU → Virtual: dashed green line (`#10B981`)
- Virtual → Deadlocks: solid dark arrow line

### Node Popup Card (shown on node click — floating card attached to node)
- Position: appears to the right of the clicked node, slight offset
- Background: `#FFFFFF` (or `#1E1E2C` in dark), 16px radius, shadow elevation
- Close button: "Close" text, top right
- Content:
  - Topic title: "CPU Scheduling Algorithms" — bold 16px
  - Status badge: "MASTERED" — green pill `#10B981`
  - Description text: "First-Come First-Served (FCFS), Shortest Job First (SJF), and Round Robin CPU resource allocators." — `#8888A8`
  - Three stats in a row: "⏱ Est. Time: 25 mins" | "📊 Level: Medium" | "✦ Mastery: 98%"
  - **"Start Learning ›" button** — full width, `#3B6BFF` filled, white text, 8px radius
  - **"Test my Skills ›" button** — full width, transparent bg, `#3B6BFF` border and text, 8px radius (outlined style)

---

## Page 3: AI Tutor (`/tutor/:topicId`)

### Empty State (new session — no messages yet)

- Center of page (vertically + horizontally centered):
  - NeuralNest mascot/avatar icon — 64px
  - "Hello, I'm NeuralNest" — bold 24px, `#E8E8F2`
  - 2×2 grid of quick action cards (suggestion chips):
    - Card 1: 📄 icon + "Explain my lecture notes" — yellow/cream bg tint
    - Card 2: "Test my multiplication tables" — light blue/gray bg tint
    - Card 3: ✦ icon + "Make a review sheet for Spanish" — light blue/gray bg tint
    - Card 4: 💎 icon + "Create math formula flashcards" — light green bg tint
  - Each card: `#1E1E2C` bg, `#2A2A3E` border, 12px radius, ~200px wide, 100px tall
  - Below cards: "View More • View Previous Chat Sessions" — `#8888A8` text, dot separator

### Pinned Input Bar (bottom of page, always visible)

- Full width (minus sidebar), pinned to bottom
- Background: `#25253A`, top border: `#2A2A3E`, 16px padding
- Text input: "Ask your AI tutor anything..." placeholder, `#8888A8`
- Right side of input: blue circle send button ⬆ — `#3B6BFF`, white arrow icon
- Below input row, left to right:
  - 📎 Attach icon — `#8888A8`, 18px
  - 🌐 Globe icon — `#8888A8`, 18px
  - 💬 Chat icon — `#8888A8`, 18px
  - 📁 "0 materials" chip — `#25253A` bg, `#8888A8` text, small pill shape
  - Right side: 🎤 Microphone icon — `#8888A8`

### Active Chat State (design variant showing messages)

- Messages scroll area:
  - **AI message bubble:** left-aligned, `#1E1E2C` bg, rounded 12px (sharp top-left corner), max-width 70%
  - **User message bubble:** right-aligned, `#1E2A45` bg (dark blue), rounded 12px (sharp top-right corner), `#E8E8F2` text
  - After AI teaching chunk:
    - Three action chips in a row: `[Understood]` `[Need more help]` `[Go deeper]` — outlined pills, `#3B6BFF` border, `#3B6BFF` text
    - Below: "Do you have any doubts or questions before we move on?" — `#8888A8` italic

### Materials Selector Modal

- Centered overlay modal, `#25253A` background, 16px radius, max-width 680px
- Header: "Select Materials" — bold 20px + "Select materials to use for the chat." — `#8888A8`
- Top right of header: Study set dropdown
- Close button: X icon, top right corner
- Search bar: "Search materials..." — full width, `#1E1E2C` bg
- Right of search: Grid/List toggle buttons + "Select All" outlined blue pill
- Grid of material cards:
  - First card: "+ Upload New Material" — dashed `#2A2A3E` border, `+` icon centered, no fill
  - Other cards: `#1E1E2C` bg, `#2A2A3E` border, 12px radius. Shows: title (bold), subtitle, excerpt text preview
  - Selected state: `#3B6BFF` blue border (2px)
- Bottom right: "Confirm Selection" — `#3B6BFF` filled button, white text

---

## Page 4: Quiz (`/quiz/:topicId`)

### Page Header
- Left: ← back arrow icon + "PRACTICE MODULE" — small caps, `#8A72FF` accent color, 12px
- Below: "Topic Mastery Quiz" — bold 20px, `#E8E8F2`
- Top right: 5 heart icons ❤️ (red `#EF4444`, filled) + "🔥 28 XP" amber pill badge

### Timer
- Visible countdown at top center or top right — "12:34" format, `#8888A8` or orange when < 2 min

### Left Panel — Quiz Steps (~200px width)
- Background: `#1E1E2C` card, 12px radius
- Header: "QUIZ STEPS" — small caps, `#8888A8`
- List of 10 questions:
  - Active question: blue numbered circle `#3B6BFF` + "Question 1" blue text
  - Future questions: gray number + gray text
  - Completed questions: green checkmark ✓ + green text

### Right Panel — Question Area

- "Question 1 of 10" — `#8888A8`, small text
- Question text: bold 18px, `#E8E8F2`, regular leading
- 4 answer option cards stacked vertically:
  - Default: `#1E1E2C` bg, `#2A2A3E` border, 12px radius, full width, 48px height, left-aligned text
  - Hover: `#25253A` bg
  - **Selected + Correct:** green border `#10B981`, subtle green tint bg `#1A2414`, ✅ green checkmark icon right-aligned
  - **Selected + Wrong:** red border `#EF4444`, subtle red tint bg, ✗ icon right

- Bottom left: "✓ Correct! You gained +20 XP." — green `#10B981` text, checkmark icon
- Bottom right: "Continue →" — `#3B6BFF` filled pill button, white text

---

## Page 5: Exam Mode (`/exam`)

### Step 1 — Exam Details (centered card, no sidebar distractions)

- Center card: `#1E1E2C` bg, 16px radius, max-width 520px
- Icon: 📅 calendar
- Title: "Set Up Your Exam" — bold 20px
- Field 1: "What subject is your exam for?" — label + text input (`#25253A` bg)
- Field 2: "When is your exam?" — label + date picker input
- Below date picker: "You have 5 days left" — green `#10B981` calculated text
- Button: "Next →" — right-aligned, `#3B6BFF` filled

### Step 2 — Syllabus Upload (centered card)

- Title: "📄 Upload Your Syllabus (Optional)"
- Drag-and-drop zone: dashed border `#2A2A3E`, `#1E1E2C` bg, "+" icon centered, "Drop syllabus PDF here" text
- Below zone: "Skip — let AI find the syllabus online" — `#3B6BFF` text link, underlined
- Button: "Next →"

### Step 3 — PYQ Upload (centered card)

- Title: "📝 Upload Previous Year Questions (Optional)"
- Drag-and-drop zone: same style as step 2
- Explanation text: "AI will count how many times each topic appears in past papers to prioritize your study plan." — `#8888A8`
- Two buttons: "Skip" (ghost, left) + "Generate Roadmap" (`#3B6BFF` filled, right)

### After Setup — Exam Roadmap (identical to Roadmap page with extras)

- Page title: "[Subject] Exam Roadmap"
- Extra badges on high-frequency nodes: "🔥 12 PYQ Qs" — small orange pill on the node
- Right panel or bottom strip showing day-by-day plan

---

## Page 6: Active Quizzes (`/active-quizzes`)

### Page Header
- Title: "Active Quizzes" — bold 24px

### Top Section — Active / In-Progress

- Cards in a 2-column grid:
  - Each card: `#1E1E2C` bg, 12px radius
    - Topic name: bold 16px
    - Timer: countdown "08:42 remaining" — amber `#F59E0B` text
    - Progress: "4 / 10 answered" — `#8888A8`
    - Progress bar: partial fill
    - Button: "Resume →" — `#3B6BFF` filled

### Bottom Section — Quiz History

- Title: "Quiz History" — bold 18px
- Table: Topic Name | Score | Pass/Fail | Date | Time Taken
  - Pass badge: green ✓ pill
  - Fail badge: red ✗ pill
- Each row: `#1E1E2C` bg, hover `#25253A`

---

## Page 7: Profile (`/profile`)

### User Info Section
- Large avatar circle (64px) with colored initial
- Name: "Guest Scholar" — bold 20px
- Email: "guest@neuralnest.ai" — `#8888A8`
- Mastery Level: "College Scholar 🎓" — accent text
- Stats row: "Total XP: 1,240" + divider + "Streak: 4 days 🔥" — `#F59E0B` amber

### Study Consistency Heatmap
- Title: "PERSONAL STUDY CONSISTENCY" — small caps
- GitHub-style grid: 7 columns (Mon–Sun) × 12 rows (weeks)
- Square colors: empty = `#1E1E2C`, light = `#25253A`, medium = `#3B6BFF50`, dark = `#3B6BFF`, intense = `#10B981`
- Legend: "Less ░ ▒ ▓ █ More" — bottom

### Settings
- "Explanation Level: Beginner" with [Change] link
- "Exam Date: Jun 21, 2026" with [Update] link
- [Settings] and [Logout] buttons at bottom

---

## Page 8: Landing / Auth (`/`)

- Full-page centered layout, `#16161F` bg
- NeuralNest logo large centered (brain icon + wordmark)
- Tagline: "Your AI-powered adaptive learning platform" — `#8888A8`
- "Sign in with Google" — large button with Google icon, white bg, dark text
- Below: feature highlights — 3 small cards showing the 3 core differentiators

---

## Page 9: Onboarding (`/onboarding`)

### Step Indicator (top)
- 3-step horizontal progress: ① Upload → ② Level → ③ Rate
- Active step: `#3B6BFF` blue circle + bold text
- Completed: `#10B981` green check
- Future: `#9CA3AF` gray circle

### Step 1 — Upload
- Drag-and-drop zone for PDF
- Or: "Paste raw notes" textarea
- Or: "Type a topic" text input
- Exam date input: "My exam is in ___ days"

### Step 2 — Explanation Level
- 3 selectable cards side by side:
  - 🟢 Beginner (Recommended) — green left border accent
  - 🟡 Intermediate — yellow left border accent
  - 🔴 Advanced — red left border accent
- Each card: title, bullet points, "Best for:" line
- Selected card: `#3B6BFF` border, subtle blue tint bg

### Step 3 — Mastery Rating
- List of extracted topics
- Each topic: name + horizontal slider (1–10)
- Slider track: `#2A2A3E`, thumb: `#3B6BFF`
- "Skip" button (sets all to 0) + "Continue" button (`#3B6BFF`)

---

## Responsive Notes

- Sidebar collapses to icon-only (48px) on screens < 1024px
- Top bar search collapses to just the magnifying glass icon
- Cards stack vertically on mobile
- Quiz left panel becomes a horizontal scroll strip

---

## Figma Make Instructions

1. **Generate all 9 pages** listed above in dark mode first
2. Use exact hex values from the color system — no approximations
3. Use Inter font (Google Fonts) for all text
4. All interactive elements should have hover states (slightly lighter bg)
5. Maintain 16px base spacing grid throughout
6. Include both empty states and populated states for Dashboard, AI Tutor, and Active Quizzes
7. Group components properly for handoff (sidebar as a component, top bar as a component, etc.)
