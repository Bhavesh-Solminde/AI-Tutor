# NeuralNest — Complete Project Summary & Design Decisions
> **Last Updated:** June 16, 2026  
> **Status:** Planning complete, ready to build  
> **Source of truth:** `/Users/solminde/Developer/Ai-tutor/TECHNICAL_ANALYSIS.md`
---
## 1. What Is NeuralNest?
**NeuralNest** is a premium AI-powered adaptive learning platform. It is a personal tutor that:
- Teaches topics from uploaded syllabuses or typed questions
- Tracks mastery per topic using a color-coded visual roadmap
- Quizzes users and only marks a topic "mastered" when they pass 70%+
- Generates day-by-day exam rescue plans based on an exam date
- Stores study history, chat history, notes, and progress
**One-liner:** *Upload your syllabus, paste your notes, or set your exam date — the AI teaches you topic by topic, checks if you understood, quizzes you, and tracks exactly what you know.*
---
## 2. The 3 Core Differentiators
| # | Feature | Why it matters |
|---|---|---|
| ① | **Visual Syllabus Roadmap** — nodes turn green live | No other edtech shows a spatial, real-time mastery map |
| ② | **Exam Countdown Rescue Plan** — day-by-day scheduler | Time-aware emergency planner based on weakest topics |
| ③ | **Open Topic Explanation** — paste notes or ask anything | Not locked to uploaded syllabus; ultra-flexible entry point |
---
## 3. Tech Stack
### Frontend
| Package | Purpose |
|---|---|
| React + Vite | Core UI framework |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| React Flow | Interactive node roadmap |
| Framer Motion | Micro-animations (node pulses, XP popups) |
| Lucide React | Icon set |
| Axios | HTTP client |
| eventsource-parser | Parse SSE streaming responses |
### Backend
| Package | Purpose |
|---|---|
| Express | HTTP server |
| Multer | File upload handling |
| pdf-parse / mammoth | PDF/DOCX text extraction |
| LangChain.js | Document chunking + embedding pipeline |
| LangGraph | Agent orchestration |
| @pinecone-database/pinecone | Vector store |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| google-auth-library | Google OAuth |
| LangSmith | Observability + tracing |
### AI / Data
- **LLM:** GPT-4o (via OpenAI)
- **Embeddings:** text-embedding-3-small
- **Vector DB:** Pinecone
- **Primary DB:** MongoDB Atlas
- **Streaming:** Server-Sent Events (SSE) — NOT WebSockets
---
## 4. Design System — Dark Mode (Primary)
| Token | Hex | Usage |
|---|---|---|
| Page Background | `#16161F` | Main page bg — deep dark blue-charcoal (cool purple undertone) |
| Sidebar | `#111118` | Fixed left sidebar — slightly darker than page |
| Surface / Cards | `#1E1E2C` | All card surfaces, quiz options, action tiles |
| Elevated | `#25253A` | Input bars, modals, dropdowns |
| Active Nav | `#1E2A45` | Active sidebar item pill background |
| Border | `#2A2A3E` | All borders — subtle cool-purple |
| Border Subtle | `#1E1E30` | Section dividers only |
| Text Primary | `#E8E8F2` | Main text — near white, slight blue tint |
| Text Muted | `#8888A8` | Labels, placeholders, secondary info |
| CTA Blue | `#3B6BFF` | Primary action buttons (Send, Next, Start Learning) |
| Primary Blue | `#1D4ED8` | Nav buttons, active states |
| Accent Purple | `#8A72FF` | Highlights, roadmap accents |
| Green (Mastered) | `#10B981` | Mastered nodes, success states |
| Yellow (Learning) | `#FBBF24` | Active/learning nodes |
| Gray (Unstarted) | `#9CA3AF` | Unstarted nodes |
| Orange | `#F97316` | Exam countdown badge |
| Red | `#EF4444` | Hearts/lives |
| Amber | `#F59E0B` | XP, streak fire icon |
| Quiz Wrong BG | `#2D2A14` | Wrong answer card tint |
| Quiz Explain BG | `#1A2414` | Explanation card tint |
### Light Mode Colors
| Token | Hex |
|---|---|
| Page Background | `#F9FAFB` |
| Sidebar | `#F3F4F6` |
| Cards | `#FFFFFF` |
| Border | `#E5E7EB` |
| Text Primary | `#111827` |
| Text Muted | `#6B7280` |
| Active Nav | `#EFF6FF` (light blue pill) |
**Font:** Inter (body) + JetBrains Mono (code, roadmap labels)  
**Dark/light toggle:** `dark` class on `<html>` element
---
## 5. Global Layout (All Authenticated Pages)
### Sidebar — Fixed Left, 210px
```
🧠 NEURALNEST (logo + wordmark)
─────────────────────
🏠 Dashboard
🗺️ Roadmap
🤖 AI Tutor
⏱️ Exam Mode
📝 Active Quizzes
─────────────────────
💬 Chat History ▾ (collapsible)
   📅 Exam
   🗺️ Roadmap
   💡 Other
─────────────────────
📓 Notes ▾ (collapsible)
   📄 PDF-name-1
─────────────────────
[  + New Session  ]   ← #3B6BFF CTA button
```
### Top Bar — Fixed, 60px
```
🔍 Search topics...  |  ✦ Ask Doubt  |  🔔  |  🌙  |  (G) Name
```
- **Avatar click** → navigates to `/profile`
- **Ask Doubt** → opens open-topic AI chat (Core Feature #3)
- **Moon/Sun** → theme toggle
---
## 6. All Pages & Routes
| Route | Page | Description |
|---|---|---|
| `/` | Landing | Google OAuth sign-in + feature pitch |
| `/onboarding` | Onboarding | 3-step wizard: upload → explanation level → mastery rating |
| `/dashboard` | Dashboard | Mission control: stats, mastery table, AI recommendation, rescue plan |
| `/roadmap` | Roadmap | React Flow visual node graph of syllabus topics |
| `/tutor/:topicId` | AI Tutor | Full-width chat session (NO split panel) |
| `/quiz/:topicId` | Quiz | Timed gamified MCQ (minimum 10 questions) |
| `/exam` | Exam Mode | 3-step setup wizard + AI-generated exam roadmap |
| `/active-quizzes` | Active Quizzes | In-progress + quiz history/record |
| `/profile` | Profile | Avatar, XP, streak, study heatmap |
---
## 7. Key Feature Rules
### Node Progression (Roadmap)
```
⬜ GRAY (Unstarted)   → user clicks "Start Learning" → AI Tutor opens
🟡 YELLOW (Learning)  → user clicks "Test my Skills" → Quiz starts (min 10 Qs)
                       → score ≥ 70% (7/10+) → node turns GREEN
                       → score < 70%  → node STAYS YELLOW (no regression)
🟢 GREEN (Mastered)   → fully mastered, never goes back to gray
```
### Quiz Rules
- **Minimum 10 questions** — always
- **Pass threshold: 70%** (7/10 correct)
- **Timer:** Visible countdown; auto-submits at 0; unanswered = wrong
- **Lives:** 5 hearts; all 5 lost → quiz ends early
- **XP:** +20 XP per correct answer
### AI Tutor Chat
- Full-width layout — NO split panel, NO notes panel on side
- Teaches in chunks (never full dumps)
- After each chunk: 3 comprehension chips `[Understood]` `[Need more help]` `[Go deeper]`
- Below chips: "Do you have any doubts or questions?"
- Explanation fallback chain (never repeats): Simpler language → Analogy → Step-by-step
- Streaming via SSE (word-by-word)
### Exam Mode — 3-Step Setup
1. **Subject + Date** → auto-calculates days remaining
2. **Syllabus Upload** (optional) → if skipped: AI web searches for syllabus
3. **PYQ Upload** (optional) → AI counts topic frequency from past papers
**AI logic:**
- Has PYQ? → Count frequency per topic → higher freq = higher priority weight
- Sort topics by (PYQ frequency × difficulty)
- Assign day-by-day plan (weakest + highest freq = first days)
- Final day = Mock Exam from PYQs
- Generate same roadmap UI with extra `🔥 12 PYQ Qs` badges on nodes
### Chat History — New Session Flow
- User clicks `+ New Session`
- Prompt appears: "Where should this chat be saved?"
- 3 pills: `📅 Exam` / `🗺️ Roadmap` / `💡 Other`
- Chat saved under correct sub-section in sidebar
### Dashboard — What's Included
- ✅ Overall mastery % (progress ring)
- ✅ Exam countdown (date + days)
- ✅ Weekly streak + XP
- ✅ Topic-by-topic mastery table (sortable, with play button)
- ✅ AI Recommended Next topic card
- ✅ Continue Where You Left Off card
- ✅ Exam Rescue Timeline (day-by-day — only shows if exam date set)
- ❌ NO heatmap here (heatmap is on Profile page)
- ❌ NO Study Mode selector (removed)
### Profile Page — What's Included
- Avatar, name, email, mastery level, total XP, streak
- GitHub-style study heatmap (7 × 12 grid — 12 weeks)
- Explanation Level setting + [Change] link
- Exam Date setting + [Update] link
- Settings + Logout buttons
---
## 8. Backend API Endpoints
### Auth
- `POST /api/auth/google` — Google OAuth → return JWT
- `GET /api/auth/me` — get current user
### Upload + Topics
- `POST /api/upload` — PDF → parse → embed → return topic list
- `POST /api/topics/baseline` — save initial self-ratings (1–10)
### Tutor
- `POST /api/tutor/chat` — SSE streaming chat; `type: 'teach' | 'doubt'`
- `POST /api/tutor/open` — open-mode session (Core #3); `inputType: 'notes' | 'topic'`
- `POST /api/tutor/rating` — save post-session self-rating
### Quiz
- `POST /api/quiz/generate` — generate minimum 10 MCQs (timed)
- `POST /api/quiz/submit` — submit answers → score + node update (≥70% = green)
### Progress
- `GET /api/progress/:userId` — all mastery scores
- `POST /api/progress/update` — update after quiz
- `GET /api/roadmap/:sessionId` — nodes + edges for React Flow
### Study Plan
- `POST /api/studyplan/generate` — rescue plan from exam date
- `GET /api/studyplan/:userId` — current plan
- `PATCH /api/studyplan/day/:dayId` — mark day complete
### Exam Mode
- `POST /api/exam/setup` — save subject + date
- `POST /api/exam/upload-syllabus` — syllabus PDF or web search fallback
- `POST /api/exam/upload-pyq` — PYQ PDF → topic frequency analysis
- `GET /api/exam/:userId` — exam config + roadmap
### Chat History
- `GET /api/chat-history/:userId` — all sessions grouped by section
- `POST /api/chat-history` — create new chat
- `DELETE /api/chat-history/:chatId` — delete chat
---
## 9. LangGraph Agents
### Agent 1 — Tutor Agent
- Retrieves RAG context from Pinecone
- Teaches in one focused chunk
- Ends every response with comprehension check
- Switches to `ANSWER_DOUBT` mode for freeform questions
- Uses `explanationLevel` (beginner/intermediate/advanced) from user profile
### Agent 2 — Quiz Generator Agent
- Reads concepts covered in session
- Generates **minimum 10 MCQ questions** with JSON structure: `{q, options, correct, explanation}`
### Agent 3 — Progress Tracking Agent
- Receives quiz scores + self-ratings
- Calculates mastery delta (0–100 scale)
- Generates next topic recommendation
- Adjusts rescue plan if exam date exists
### Agent 4 — PYQ Analysis Agent (Exam Mode only)
- Reads PYQ PDF
- Counts how many questions per topic
- Returns priority weights for roadmap generation
---
## 10. .gitignore — What to Include
```gitignore
node_modules/
.env
.env.local
.env.development
.env.production
.env.*.local
dist/
build/
.vite/
uploads/
*.log
.DS_Store
.vscode/
coverage/
```
**NEVER commit:** `.env` files (contain API keys)  
**ALWAYS commit:** `package-lock.json` and `pnpm-lock.yaml` (lock exact dependency versions)
---
## 11. Figma / Banani Design Generation
### Strategy
- Figma Make and Banani.co = conversational prompt interfaces
- One page per prompt — NOT a big markdown document
- Iterate with follow-up messages after each generation
### Light/Dark Toggle in Generated Code
- Must tell AI to use **CSS custom properties** (CSS variables) on root element
- Dark mode variables on `:root.dark`, light mode on `:root` (or vice versa)
- Moon/sun icon click toggles `dark` class on `<html>`
- All pages including Quiz must use CSS variables — not hardcoded hex
### Reference Screenshots Location
```
/Users/solminde/Developer/Ai-tutor/Ai-tutor-reference/
```
Key references:
- StudyFetch Roadmap page (light mode, card grid layout)
- StudyFetch Chat page (Spark.E empty state — exact inspiration for AI Tutor)
- Gizmo AI Quiz page (hearts/XP gamification reference)
---
## 12. Onboarding — Explanation Level
Set **once** at onboarding, applies to every tutor session. Stored as `explanationLevel` on user profile.
| Level | Behavior |
|---|---|
| 🟢 Beginner | Every jargon defined before use; real-life examples always; starts from zero |
| 🟡 Intermediate | Brief jargon explanations; one example per concept; assumes basic context |
| 🔴 Advanced | Jargon-heavy; dense study-notes style; no analogies unless requested |
---
## 13. What We Borrowed from Competitors
| Feature | Source |
|---|---|
| Side-by-side notes + chat layout | StudyFetch (NOT used in final — we went full-width chat) |
| Skill level selection at onboarding | StudyFetch |
| Gamified hearts/lives quiz system | Gizmo AI |
| "Explain" button after wrong answer | Gizmo AI |
| Chat empty state (mascot + suggestion cards) | StudyFetch (Spark.E pattern) |
---
*NeuralNest-OS · Stack: React + Vite + Tailwind · Node.js + Express · LangGraph + LangChain.js · Pinecone · MongoDB Atlas · GPT-4o*
