# NeuralNest-OS — Deep Technical Analysis

> **Prepared for:** Team Reference  
> **Project:** AI Adaptive Tutor (Hackathon Demo)  
> **Stack:** React + Vite · Node.js + Express · LangGraph · Pinecone · MongoDB  
> **Competitors Referenced:** StudyFetch, Gizmo AI  

---

## Table of Contents

1. [Project Overview & Differentiators](#1-project-overview--differentiators)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Frontend — Full Breakdown](#3-frontend--full-breakdown)
4. [Backend — Full Breakdown](#4-backend--full-breakdown)
5. [AI / Agent Layer — Full Breakdown](#5-ai--agent-layer--full-breakdown)
6. [Database Schemas](#6-database-schemas)
7. [API Contract](#7-api-contract)
8. [Data Flow — Per User Flow](#8-data-flow--per-user-flow)
9. [Environment Variables](#9-environment-variables)
10. [7-Day Build Plan (Team Split)](#10-7-day-build-plan-team-split)
11. [Out of Scope](#11-out-of-scope)
12. [Demo Script (90 seconds)](#12-demo-script-90-seconds)

---

## 1. Project Overview & Differentiators

**One-liner:** Upload your syllabus, paste your notes, or set your exam date — the AI teaches you topic by topic, checks if you understood, quizzes you, and tracks exactly what you know.

### The 3 Core Differentiators (vs StudyFetch & Gizmo)

Neither competitor has all three of these. **These are the live demo anchors — every judge interaction hits at least one.**

---

#### ① Visual Syllabus Roadmap — Nodes That Change Color Live

User uploads a syllabus PDF → AI extracts all topics → renders them as **clickable nodes on an interactive graph**. As the user learns and gets quizzed, each node updates its color in real time:
- 🔘 **Gray** = not started yet
- 🟡 **Yellow** = currently learning / partially mastered
- 🟢 **Green** = fully mastered (quiz score > 85%)

No other edtech app shows a spatial, visual map of what you know and what you don't. This is the **money shot** in the demo.

---

#### ② Exam Countdown Rescue Plan

User says *"My exam is in 3 days"* → AI reads all their current mastery scores → **auto-generates a day-by-day study plan**:
- Weakest topics get the most time
- Strong topics get a single revision quiz only
- If a daily quiz scores < 60%, that topic is pushed to the next day automatically
- Final day = full mock exam from the entire syllabus
- After mock exam: *"3 topics need revision before your exam tomorrow"*

Neither StudyFetch nor Gizmo has a time-aware emergency rescue planner.

---

#### ③ Open Topic Explanation — Paste Notes or Ask Anything

The user is **not locked into the uploaded syllabus**. They can:
- Paste their own messy handwritten/typed notes → AI restructures them, identifies gaps, then teaches from them
- Just type *"Explain me Operating System scheduling algorithms"* → AI teaches that topic from scratch

In both cases: AI explains → quizzes from that specific material → tracks mastery for that topic. Everything feeds back into the same dashboard and roadmap.

This is the **most flexible entry point** — students with no syllabus or who just need to understand one specific concept can use this without any setup.

---

### Supporting Features (Not Core Differentiators, But Still Important)

| Feature | StudyFetch | Gizmo | NeuralNest-OS |
|---|---|---|---|
| Visual syllabus roadmap (nodes turn green) | ❌ | ❌ | ✅ **Core #1** |
| Exam countdown rescue plan | ❌ | ❌ | ✅ **Core #2** |
| Open topic / paste notes explanation | ❌ | ❌ | ✅ **Core #3** |
| Mastery delta shown ("3/10 → 8/10") | ❌ | ❌ | ✅ |
| Adaptive explanation (simpler → analogy → step-by-step) | ❌ | ❌ | ✅ |
| &nbsp;&nbsp;&nbsp;↳ Comprehension checkpoint + Q&A doubt prompt | ❌ | ❌ | ✅ sub-feature |
| &nbsp;&nbsp;&nbsp;↳ 3 explanation levels set at onboarding | ❌ | ❌ | ✅ sub-feature |
| Quiz from your own material | ✅ | ✅ | ✅ |
| File upload | ✅ | ✅ | ✅ |
| Progress tracking | ✅ | ✅ | ✅ |
| Gamified quiz (hearts/lives/XP) | ❌ | ✅ | ✅ |

> **Comprehension Checkpoint + Q&A Doubt Prompt (sub-feature):**
> After every teaching chunk, the tutor **pauses and does two things in one message**:
> 1. Asks a comprehension check: *"Did that click? [Understood] [Need more help] [Go deeper]"*
> 2. Follows with: *"Also — do you have any doubts or questions before we move on?"*
>
> The user can either click a chip (Understood / Need more help / Go deeper) **or** type any question they have — about this topic, something adjacent, or anything confusing from their notes. The tutor answers the doubt fully, then continues. This turns every session into a live Q&A tutor, not just a lecture.

### What We Borrow from Competitors
- **From StudyFetch:** Side-by-side notes + chat layout, skill level selection at onboarding
- **From Gizmo:** Gamified hearts/lives quiz system, "Explain" button after wrong answer

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│                                                                 │
│  /onboarding  →  /roadmap  →  /tutor  →  /quiz  →  /dashboard  │
│                                                                 │
│  React Flow (node graph)  │  Tailwind CSS  │  React Router v6   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST + SSE (streaming)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                │
│                                                                 │
│  /api/auth        /api/upload      /api/tutor                   │
│  /api/quiz        /api/progress    /api/roadmap                 │
│                                                                 │
│  Multer (file upload)  │  PDF/DOCX parser  │  JWT middleware     │
└────────────┬───────────────────────┬────────────────────────────┘
             │                       │
             ▼                       ▼
┌────────────────────┐   ┌──────────────────────────────────────┐
│   MongoDB Atlas    │   │         LangGraph AI Layer            │
│                    │   │                                      │
│  Users             │   │  Tutor Agent                         │
│  Sessions          │   │  Quiz Generator Agent                │
│  Topics/Mastery    │   │  Progress Tracking Agent             │
│  QuizResults       │   │                                      │
│  StudyPlans        │   │  LangChain  │  GPT-4o  │  LangSmith  │
└────────────────────┘   └──────────────┬───────────────────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │     Pinecone Vector DB   │
                          │  (chunked PDF embeddings)│
                          └─────────────────────────┘
```

---

## 3. Frontend — Full Breakdown

### Tech Stack
| Package | Purpose |
|---|---|
| `react` + `vite` | Core UI framework + fast build |
| `react-router-dom` v6 | Client-side routing |
| `tailwindcss` | Utility-first styling |
| `react-flow` | Interactive syllabus node graph |
| `framer-motion` | Micro-animations (node pulses, XP popups) |
| `lucide-react` | Icon set |
| `axios` | HTTP client |
| `eventsource-parser` | Parse SSE streaming responses |

---

### Visual Identity — NeuralNest-OS

The design is a personalized, premium platform — **not a StudyFetch clone**. Two modes are fully defined.

#### Dark Mode
> **Vibe:** Sleek, high-focus, premium dark workspace.  
> **Key elements:** GitHub-style Personal Mastery heatmap in sidebar, spatial node roadmap on a grid backdrop, NeuralNest Tutor drawer with abstract brain icon and action chips.  
> **Palette:**
> - Background: `#090A0F` (deep navy charcoal)
> - Surface cards: `#131520`
> - Border/grid lines: `#1E2030`
> - Primary button (Home, My Courses, active nav): `#1D4ED8` (professional dark blue)
> - Accent (roadmap nodes, highlights): `#8A72FF` (purple)
> - Success / mastered: `#10B981` (green)

![NeuralNest-OS Dark Mode Mockup](/Users/solminde/Developer/Ai-tutor/neuralnest_dark_mockup_1781390980129.png)

#### Light Mode
> **Vibe:** Clean, geometric, airy, high-readability intellectual workspace.  
> **Key elements:** Same layout as dark theme. Off-white background, high-contrast black typography, thin light gray grid lines, soft ambient shadows.  
> **Palette:**
> - Background: `#F9FAFB` (warm neutral off-white)
> - Surface cards: `#FFFFFF` (pure white)
> - Borders: `#E5E7EB`
> - Primary button (Home, My Courses, active nav): `#1D4ED8` (professional dark blue — same as dark mode)
> - Accent (roadmap nodes): `#7C6EF8` (purple)
> - Success / mastered: `#10B981` (green)

![NeuralNest-OS Light Mode Mockup](/Users/solminde/Developer/Ai-tutor/neuralnest_light_mockup_1781391009838.png)

---

### Theme System — Tailwind Config

Dark/light mode is toggled via the `dark` class on the `<html>` element. All color tokens defined once, used everywhere.

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // toggle via 'dark' class on <html>
  theme: {
    extend: {
      colors: {
        background: { light: '#F9FAFB', dark: '#090A0F' },
        surface:    { light: '#FFFFFF',  dark: '#131520' },
        border:     { light: '#E5E7EB',  dark: '#1E2030' },
        primary:    { DEFAULT: '#1D4ED8', hover: '#1E40AF' }, // dark blue — all buttons, active nav
        accent:     { DEFAULT: '#7C6EF8' },                   // purple — roadmap nodes, highlights
        mastery: {
          unstarted: '#9CA3AF',   // gray
          learning:  '#FBBF24',   // yellow
          mastered:  '#10B981',   // green
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],         // all body text
        mono: ['JetBrains Mono', 'monospace'], // code, terminal-style labels
      }
    }
  }
}
```

### Frontend File Structure
```
frontend/ (or Ai-tutor/src/)
├── App.jsx                          # Root router + layout state + theme toggle
├── index.css                        # Global tokens, smooth scroll, base reset
├── pages/
│   ├── Landing.jsx                  # /  — Auth + pitch
│   ├── Onboarding.jsx               # /onboarding — 3-step wizard
│   ├── Roadmap.jsx                  # /roadmap — React Flow node graph hub
│   ├── Tutor.jsx                    # /tutor/:topicId — split-pane session
│   ├── Quiz.jsx                     # /quiz/:topicId — gamified MCQ
│   └── Dashboard.jsx                # /dashboard — mastery overview
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx              # Left nav: logo, links, mastery heatmap
│   │   ├── TopBar.jsx               # Search, theme toggle, user avatar
│   │   └── ThemeToggle.jsx          # dark/light switch button
│   ├── roadmap/
│   │   ├── RoadmapCanvas.jsx        # ReactFlow wrapper + custom nodes + edges
│   │   ├── TopicNode.jsx            # Custom node: gray/yellow/green states
│   │   └── TopicPopupCard.jsx       # Glassmorphism click popup card
│   ├── tutor/
│   │   ├── TutorChatPanel.jsx       # Streaming message bubbles + chips
│   │   ├── MessageBubble.jsx        # AI vs user message styles
│   │   ├── ComprehensionChips.jsx   # [Understood] [Need more help] [Go deeper]
│   │   ├── DoubtPrompt.jsx          # "Do you have any doubts?" + freeform input
│   │   └── NotesPanel.jsx           # Left panel: PDF/notes formatted viewer
│   ├── quiz/
│   │   ├── QuizCard.jsx             # Question + 4 MCQ options
│   │   ├── LivesBar.jsx             # ❤️ hearts + XP counter + progress dots
│   │   ├── AnswerOptionButton.jsx   # Correct/wrong animation states
│   │   ├── XPPopup.jsx              # Floating "+20 XP" animation
│   │   └── ScoreSummary.jsx         # End-of-quiz mastery delta card
│   ├── dashboard/
│   │   ├── MasteryRing.jsx          # Circular % progress indicator
│   │   ├── MasteryHeatmap.jsx       # GitHub-style study activity grid
│   │   ├── TopicMasteryTable.jsx    # Sortable table with progress bars
│   │   ├── ExamCountdownWidget.jsx  # Date + days remaining
│   │   ├── StudyModeSelector.jsx    # Cram / Standard / Deep toggle
│   │   ├── RescuePlanTimeline.jsx   # Vertical day-by-day plan view
│   │   └── NextTopicCard.jsx        # AI-recommended next topic
│   └── onboarding/
│       ├── DropZone.jsx             # Drag-and-drop file upload
│       ├── ExplanationLevelCard.jsx # Beginner/Intermediate/Advanced selector
│       ├── MasteryRatingSlider.jsx  # Per-topic 1–10 slider
│       └── ProgressStepper.jsx      # 1/2/3 step indicator
└── hooks/
    ├── useSSE.js                    # SSE streaming parser for tutor chat
    ├── useTheme.js                  # Dark/light class toggle + persistence
    └── useMastery.js                # Mastery score state + node color resolver
```

### Pages / Routes

#### `/` — Landing / Auth
- Google OAuth sign-in button
- App pitch copy + feature highlights
- Redirects to `/onboarding` if first login, `/roadmap` if returning user

#### `/onboarding` — Setup Wizard (3 steps)
**Step 1:** Input method selector
- Upload Syllabus PDF (drag-and-drop zone)
- Paste raw notes (textarea)
- Type a topic (text input)
- Set Exam Countdown ("My exam is in ___ days")

**Step 2:** Explanation Level Selector

User picks how they want the AI to explain things. This is asked **once at the start** and applies to every tutor session. Stored as `explanationLevel` on the user profile.

> 🟢 **Beginner** *(Recommended)*
> - Every jargon/technical term is **defined before it is used** in the explanation
> - Every concept is explained with a real-life example
> - Simple, conversational language throughout
> - Assumes nothing — starts from zero
> - *Best for: first-time learners, people switching fields, or anyone who finds textbooks confusing*

> 🟡 **Intermediate**
> - Jargons are still explained, but briefly — assumes the user has basic context
> - Simple language, but slightly more precise
> - One example per concept, not necessarily a real-life one
> - *Best for: students who've touched the topic before but want a proper walkthrough*

> 🔴 **Advanced**
> - Jargon-heavy, technical, and precise — no hand-holding
> - Explanations are concise and dense (study-notes style)
> - No real-life analogies unless specifically requested
> - Every point is accurate and complete, nothing simplified away
> - *Best for: students preparing for exams/interviews who already know the basics*

Stored as `explanationLevel: 'beginner' | 'intermediate' | 'advanced'` in the User schema.

**Step 3:** Topic mastery self-rating
- **PDF upload / pasted notes:** AI extracts topics → show a slider (1–10) per topic
- **Single typed topic:** show one slider for that topic: "Rate your current knowledge of [topic] from 1–10"
- "Skip" sets mastery = 0 (AI assumes no knowledge)
- All ratings POSTed to `/api/topics/baseline`
- This step is **never skipped** — even a single topic gets one slider

**Components needed:**
- `<DropZone />` — drag-and-drop file input with accept types
- `<SkillCard />` — selectable card with icon + description
- `<MasteryRatingSlider />` — range input per topic
- `<ProgressStepper />` — 1/2/3 step indicator header

#### `/roadmap` — Visual Syllabus Roadmap (MONEY SHOT)
**What it does:** Renders a zoomable, pannable node graph. Each node = one topic.

**Node states:**
```
Unstarted  → gray circle,  dashed border,  🔒 icon
Learning   → yellow circle, solid border,  pulsing glow animation
Mastered   → green circle,  solid border,  ✓ checkmark
```

**On node click:**
- Glassmorphism popup card opens (topic name, mastery %, estimated time)
- "Start Learning" button → navigates to `/tutor/:topicId`

**Sidebar (left):**
- NeuralNest-OS logo + nav links
- Course list
- GitHub-style Personal Mastery heatmap (7×N grid, one square per study day)

**Top bar:**
- Search topics
- "Tutor Mode" button
- "View Insights" button
- User avatar + settings

**Right panel (collapsible):**
- NeuralNest Tutor chat (compact version)
- Quick options: Explain this node / Start Quiz / Find Resources

**React Flow custom node implementation:**
```jsx
// Each topic is a custom React Flow node
const TopicNode = ({ data }) => {
  const colorMap = {
    unstarted: 'border-gray-400 bg-gray-800',
    learning:  'border-yellow-400 bg-yellow-900 animate-pulse',
    mastered:  'border-green-400 bg-green-900',
  }
  return (
    <div className={`rounded-full w-24 h-24 border-2 flex items-center justify-center ${colorMap[data.status]}`}>
      <span className="text-xs text-center font-mono">{data.label}</span>
    </div>
  )
}
```

**Components needed:**
- `<RoadmapCanvas />` — wraps `<ReactFlow>` with custom nodes + edges
- `<TopicNode />` — custom node component
- `<TopicPopupCard />` — glassmorphism hover/click card
- `<MasteryHeatmap />` — GitHub-style activity grid in sidebar

#### `/tutor/:topicId` — Tutor Session
**Layout:** Split-pane (side-by-side, like StudyFetch)
- **Left (55%):** Notes/material panel — read-only uploaded content rendered as formatted text
- **Right (45%):** NeuralNest Tutor chat drawer

**Two modes — same page, same UI:**

| Mode | How it starts | Left panel shows | RAG source |
|---|---|---|---|
| **Syllabus mode** (default) | User clicks a node on the roadmap | Uploaded PDF/notes content for that topic | Pinecone vectors from uploaded material |
| **Open mode** (Core #3) | User pastes notes or types "Explain me [topic]" via the navbar input or dashboard | Pasted notes (formatted), or empty if typed topic | Pasted notes get chunked + embedded on-the-fly. Typed topic = no RAG, pure LLM knowledge |

Both modes use the **exact same tutor UI and chat behavior** below. The only difference is where the content comes from.

**Tutor chat behavior:**
- AI teaches in chunks (not full dumps)
- After each chunk → comprehension checkpoint with 3 action chips + Q&A doubt prompt
- Chip responses: `[Understood]` `[Need more help]` `[Go deeper]`
- Below chips: *"Do you have any doubts or questions before we move on?"*
- Typing natural language also accepted — triggers `ANSWER_DOUBT` mode
- The tutor answers the doubt fully, then resumes the normal teaching flow
- Explanation fallback chain (never repeats):
  1. Simpler language
  2. Real-world analogy
  3. Step-by-step atomic breakdown

**Streaming:** Responses stream via SSE (Server-Sent Events) so text appears word-by-word.

**After topic complete:**
- Mastery self-rating prompt: "How would you rate your understanding now? 1–10"
- Mastery delta shown: "You went from 3/10 → 8/10 🎉"
- "Start Quiz" button appears

**Components needed:**
- `<NotesPanel />` — formatted PDF/notes viewer
- `<TutorChatPanel />` — streaming message bubbles
- `<MessageBubble />` — AI vs user message variants
- `<ComprehensionChips />` — "Understood / Need more help / Go deeper" action pills
- `<MasteryDeltaBanner />` — before/after score comparison callout

#### `/quiz/:topicId` — Gamified Quiz
**Borrowed from Gizmo AI layout:**
- Top bar: `❤️ 5 LIVES` + progress dots + `+XP` earned counter
- Left sidebar: Step checklist (Step 1 ✓, Step 2 ✓, Current Step 3...)
- Center: Large quiz card with blue border, MCQ options
- Right: NeuralNest Tutor drawer showing feedback popup

**Answer flow:**
- Correct: Green highlight + `+20 XP` popup + confetti
- Wrong: Red flash + heart removed + "Explain" button appears
- "Explain" → Tutor explains the correct answer from a completely fresh angle

**After all questions:**
- Score summary card
- Mastery delta shown
- Roadmap node color updates via API call
- "Next Topic" recommendation

**Components needed:**
- `<QuizCard />` — question + options MCQ card
- `<LivesBar />` — heart icons + XP counter
- `<StepChecklist />` — left sidebar progress tracker
- `<AnswerOptionButton />` — clickable option with correct/wrong states
- `<XPPopup />` — animated floating XP gained notification
- `<ScoreSummary />` — end-of-quiz breakdown

#### `/dashboard` — Overview Hub
**Widgets:**
- Overall syllabus mastery % (progress ring)
- Topic-by-topic mastery table (sortable)
- Exam Dates widget + countdown timer (like StudyFetch)
- Study Mode selector: `Cram` / `Standard` / `Deep`
- Personal Mastery Heatmap (full-width, 12-week view)
- "What should I study next?" → AI-recommended topic card
- Exam Rescue Plan (if exam date set): day-by-day schedule timeline

**Components needed:**
- `<MasteryRing />` — circular progress indicator
- `<TopicMasteryTable />` — sortable table with mastery bars
- `<ExamCountdownWidget />` — date + days remaining
- `<StudyModeSelector />` — Cram / Standard / Deep toggle
- `<RescuePlanTimeline />` — vertical day-by-day study plan view
- `<NextTopicCard />` — AI-recommended next study card

---

## 4. Backend — Full Breakdown

### Tech Stack
| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `multer` | File upload handling |
| `pdf-parse` / `mammoth` | PDF/DOCX text extraction |
| `langchain` | Document chunking + embedding pipeline |
| `@pinecone-database/pinecone` | Vector store client |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth |
| `google-auth-library` | Google OAuth token verification |
| `cors`, `helmet`, `morgan` | Security + logging middleware |
| `eventsource` / `openai` stream | SSE streaming to frontend |
| `langsmith` | Observability + tracing |

### Project Structure
```
backend/
├── src/
│   ├── index.js                  # Express entry point
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── pinecone.js           # Pinecone client init
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   ├── auth.js               # POST /api/auth/google
│   │   ├── upload.js             # POST /api/upload
│   │   ├── topics.js             # GET/POST /api/topics
│   │   ├── tutor.js              # POST /api/tutor/chat (streaming)
│   │   ├── quiz.js               # POST /api/quiz/generate, /api/quiz/submit
│   │   ├── progress.js           # GET/POST /api/progress
│   │   └── studyplan.js          # POST /api/studyplan/generate
│   ├── agents/
│   │   ├── tutorAgent.js         # LangGraph Tutor Agent
│   │   ├── quizAgent.js          # LangGraph Quiz Generator Agent
│   │   └── progressAgent.js      # LangGraph Progress Tracking Agent
│   ├── pipelines/
│   │   ├── ingest.js             # PDF → chunks → embeddings → Pinecone
│   │   └── retriever.js          # RAG retrieval from Pinecone
│   └── models/
│       ├── User.js
│       ├── Session.js
│       ├── Topic.js
│       ├── QuizResult.js
│       └── StudyPlan.js
└── package.json
```

### Key Backend Processes

#### 1. File Ingestion Pipeline (`pipelines/ingest.js`)
```
User uploads PDF
    ↓
Multer saves file to /uploads/
    ↓
pdf-parse extracts raw text
    ↓
LangChain RecursiveCharacterTextSplitter
  → chunk_size: 1000 tokens
  → chunk_overlap: 200 tokens
    ↓
OpenAI text-embedding-3-small generates embedding vectors
    ↓
Vectors upserted to Pinecone with metadata:
  { userId, sessionId, topicId, chunkIndex, text }
    ↓
AI extracts topic list from full text:
  → topic name + estimated difficulty + estimated study time
    ↓
Topics saved to MongoDB Topics collection
    ↓
Response: { topics: [...], roadmapNodes: [...] }
```

#### 2. RAG Retrieval Pipeline (`pipelines/retriever.js`)
```
User asks about a topic during tutor session
    ↓
Query embedded via text-embedding-3-small
    ↓
Pinecone similarity search (top_k: 5)
  → filter: { userId, topicId }
    ↓
Retrieved chunks formatted as context string
    ↓
Injected into Tutor Agent system prompt
```

#### 3. Streaming Tutor Response
```javascript
// Route handler — streams SSE to frontend
res.setHeader('Content-Type', 'text/event-stream')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')

const stream = await tutorAgent.streamChat({ topicId, message, userId })
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`)
}
res.write('data: [DONE]\n\n')
res.end()
```

---

## 5. AI / Agent Layer — Full Breakdown

### LangGraph State Graph
All three agents share a state graph. They are called sequentially, passing results forward.

```
User message
    ↓
[Tutor Agent Node]
  - Retrieves RAG context from Pinecone
  - Generates explanation chunk
  - Appends comprehension check question
  - Emits: { explanation, checkpoint_question, next_action }
    ↓
  If user responds QUIZ_READY:
[Quiz Generator Agent Node]
  - Reads concepts covered in session
  - Generates 5 MCQ questions with structured JSON
  - Emits: { questions: [{q, options, correct, explanation}] }
    ↓
[Progress Tracking Agent Node]
  - Receives quiz scores + self-ratings
  - Calculates mastery delta (0–100 scale)
  - Generates next topic recommendation
  - If exam date exists → adjusts rescue plan
  - Emits: { masteryScore, nextTopic, studyPlanUpdate }
    ↓
MongoDB write + React UI update
```

### Agent 1 — Tutor Agent

**System Prompt (key parts):**
```
You are NeuralNest, an adaptive AI tutor. You teach one concept at a time.

Rules:
- NEVER dump the full topic. Teach in a single focused chunk.
- Always end with exactly one comprehension check question.
- If the user says they are confused, COMPLETELY CHANGE your explanation style.
  Never repeat the same phrasing. Try: simpler language → analogy → step-by-step.
- User mastery score is {masteryLevel}/10. Use this to judge how deeply to go.

Explanation Level: {explanationLevel}
Calibrate your entire tone, vocabulary, and structure based on this:

  BEGINNER:
  - Define every jargon term the moment you first use it, before continuing.
  - Use real-life examples for every concept (e.g. "think of it like a library...").
  - Use simple, conversational language. No dense sentences.
  - Assume the user knows nothing. Start from first principles.

  INTERMEDIATE:
  - Briefly define jargon only if it is domain-specific (assume general tech literacy).
  - Use simple but slightly more precise language.
  - Include one example per concept, can be technical.
  - Do not over-explain basics they likely know.

  ADVANCED:
  - Use full technical jargon without defining it.
  - Be concise and precise — study-notes style.
  - No real-life analogies unless the user asks.
  - Pack more information per sentence. Be accurate and complete.
  - Treat the user as a peer studying for an exam or interview.

Context from their material:
{ragContext}

Conversation history:
{chatHistory}

Current topic: {topicName}
```

**Output format (structured JSON via response_format):**
```json
{
  "explanation": "string — the teaching chunk",
  "checkpoint_question": "string — comprehension check e.g. 'Did that click?'",
  "doubt_prompt": "string — always: 'Do you have any doubts or questions before we move on?'",
  "next_action": "CONTINUE | GO_DEEPER | GO_SIMPLER | ANSWER_DOUBT",
  "explanation_mode": "standard | simpler | analogy | step_by_step"
}
```

> `ANSWER_DOUBT` is triggered when the user types a freeform question instead of clicking a chip. The agent answers the doubt fully and then resumes the normal flow.

### Agent 2 — Quiz Generator Agent

**Input:**
```json
{
  "topicName": "Retrieval-Augmented Generation",
  "conceptsCovered": ["what RAG is", "retriever role", "generator role", "vector DB"],
  "userMasteryLevel": 4,
  "previousQuizScore": null
}
```

**System Prompt (key parts):**
```
Generate exactly 5 multiple-choice questions based ONLY on the concepts covered
in this session. Do not test general knowledge — test what was specifically taught.

Difficulty calibration:
- mastery 1-3: simple recall questions
- mastery 4-6: application questions
- mastery 7-10: analysis/edge-case questions
- If previousQuizScore < 60: make this quiz SIMPLER than last time.

Each question must have exactly 4 options, one correct answer, and a brief
explanation of WHY the correct answer is right (used in the "Explain" button).
```

**Output format:**
```json
{
  "questions": [
    {
      "question": "What does the 'R' in RAG stand for?",
      "options": ["Retrieval", "Relevance", "Ranking", "Reasoning"],
      "correct": 0,
      "explanation": "RAG stands for Retrieval-Augmented Generation. The retriever fetches relevant context from external sources before the generator produces a response."
    }
  ]
}
```

### Agent 3 — Progress Tracking Agent

**Input:**
```json
{
  "userId": "...",
  "topicId": "...",
  "topicName": "RAG",
  "quizResults": { "score": 4, "total": 5, "wrongQuestions": [...] },
  "selfRatingBefore": 3,
  "selfRatingAfter": 8,
  "sessionDurationMinutes": 22,
  "examDate": "2026-06-19",
  "allTopicMasteries": [...]
}
```

**System Prompt (key parts):**
```
Calculate a mastery score (0–100) for this topic based on:
- Quiz score (weight: 60%)
- Self-rating after session (weight: 30%)
- Session engagement time (weight: 10%)

Then determine the next best topic to study using:
- Lowest mastery score topics first
- If examDate is set and < 7 days away: prioritize weakest topics
- If examDate is set: regenerate the day-by-day rescue plan

For the rescue plan:
- Assign 1-2 topics per day based on estimated study time
- Weakest topics get more time per day
- Final day = full mock exam (generate from all topics)
```

**Output format:**
```json
{
  "masteryScore": 76,
  "masteryDelta": { "before": 30, "after": 76 },
  "nodeColorUpdate": "learning",
  "nextTopicRecommendation": { "topicId": "...", "topicName": "Vector Databases", "reason": "Lowest mastery at 2/10" },
  "studyPlanUpdate": {
    "day1": ["Vector Databases", "Embeddings"],
    "day2": ["Agent Systems", "LangGraph"],
    "day3": ["Mock Exam"]
  }
}
```

### LangSmith Observability
Every agent call is traced automatically via LangSmith:
```javascript
process.env.LANGCHAIN_TRACING_V2 = 'true'
process.env.LANGCHAIN_API_KEY = '...'
process.env.LANGCHAIN_PROJECT = 'neuralnest-os'
```
Judges can be shown a live LangSmith trace dashboard during demo.

---

## 6. Database Schemas

### Users
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,
  name: String,
  avatar: String,
  explanationLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdAt: Date
}
```

### Sessions
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,              // e.g. "OS Exam Prep"
  inputMethod: String,       // 'pdf' | 'notes' | 'topic'
  fileUrl: String,           // S3/Cloudinary URL or local path
  rawText: String,           // extracted text
  pineconeNamespace: String, // userId_sessionId
  examDate: Date,
  createdAt: Date
}
```

### Topics
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  userId: ObjectId,
  name: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  estimatedMinutes: Number,
  masteryScore: { type: Number, default: 0 },   // 0–100
  selfRatingBefore: Number,                      // 1–10
  selfRatingAfter: Number,                       // 1–10
  status: { type: String, enum: ['unstarted', 'learning', 'mastered'], default: 'unstarted' },
  lastStudiedAt: Date,
  roadmapPosition: { x: Number, y: Number }     // React Flow node position
}
```

### QuizResults
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  topicId: ObjectId,
  questions: [{
    question: String,
    userAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    explanation: String
  }],
  score: Number,          // e.g. 4
  total: Number,          // e.g. 5
  xpEarned: Number,
  createdAt: Date
}
```

### StudyPlans
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: ObjectId,
  examDate: Date,
  generatedAt: Date,
  days: [{
    dayNumber: Number,
    date: Date,
    topics: [{ topicId: ObjectId, topicName: String, estimatedMinutes: Number }],
    isMockExam: Boolean,
    completed: Boolean
  }]
}
```

---

## 7. API Contract

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/google` | Verify Google token → return JWT |
| GET | `/api/auth/me` | Get current user from JWT |

### File & Session
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload PDF/DOCX → ingest → return topic list |
| POST | `/api/sessions` | Create new study session |
| GET | `/api/sessions/:id/topics` | Get all topics for a session |
| POST | `/api/topics/baseline` | Save initial 1–10 self-ratings |

### Tutor
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tutor/chat` | Send message → stream SSE response. Body includes `type: 'teach' \| 'doubt'` — when `type: 'doubt'`, the Tutor Agent switches to `ANSWER_DOUBT` mode, answers the user's freeform question fully, then resumes teaching. Same endpoint, no separate route needed. |
| POST | `/api/tutor/open` | Start an open-mode tutor session (Core #3). Body: `{ inputType: 'notes' \| 'topic', content: '...' }`. If `inputType: 'notes'`: chunks + embeds on-the-fly → creates a temporary session. If `inputType: 'topic'`: no RAG, tutor teaches from pure LLM knowledge. Returns `{ sessionId, topics }` then redirects to `/tutor/:topicId`. |
| POST | `/api/tutor/rating` | Save post-session self-rating |

### Quiz
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/quiz/generate` | Generate 5 MCQs for a topic |
| POST | `/api/quiz/submit` | Submit answers → get score + explanation |

### Progress
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/progress/:userId` | Get all topic mastery scores |
| POST | `/api/progress/update` | Update mastery after quiz |
| GET | `/api/roadmap/:sessionId` | Get all nodes + edges for React Flow |

### Study Plan
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/studyplan/generate` | Generate rescue plan from exam date |
| GET | `/api/studyplan/:userId` | Get current study plan |
| PATCH | `/api/studyplan/day/:dayId` | Mark day as complete |

---

## 8. Data Flow — Per User Flow

### Flow 1: Upload Syllabus → Roadmap
```
Frontend                      Backend                         AI/DB
   |                             |                              |
   | POST /api/upload (PDF)      |                              |
   |─────────────────────────>   |                              |
   |                             | Extract text (pdf-parse)     |
   |                             | Chunk text (LangChain)       |
   |                             | Embed chunks (OpenAI)        |
   |                             | Upsert to Pinecone           |
   |                             | Extract topics (GPT-4o) ─────>
   |                             |                              | Save Topics to MongoDB
   | { topics, roadmapNodes }    |<─────────────────────────────|
   |<────────────────────────    |                              |
   | Render React Flow graph     |                              |
```

### Flow 2: Tutor Session (Streaming)
```
Frontend                      Backend / Agent
   |                             |
   | POST /api/tutor/chat        |
   | { topicId, message, userId }|
   |─────────────────────────>   |
   |                             | Retrieve RAG context (Pinecone)
   |                             | Build prompt (context + history + mastery)
   |                             | Call GPT-4o (streaming)
   | token by token SSE stream   |
   |<════════════════════════    |
   | Render word-by-word         |
   | Show comprehension chips    |
```

### Flow 3: Quiz → Mastery Update → Node Recolor
```
Frontend                      Backend / Agent           MongoDB
   |                             |                         |
   | POST /api/quiz/generate     |                         |
   |─────────────────────────>   |                         |
   |                             | Quiz Agent generates 5 Qs|
   | { questions }               |                         |
   |<────────────────────────    |                         |
   | User answers all questions  |                         |
   | POST /api/quiz/submit       |                         |
   |─────────────────────────>   |                         |
   |                             | Progress Agent runs     |
   |                             | Calculate masteryScore  |
   |                             | Update Topics.status ───>
   |                             | Update StudyPlan if needed
   | { masteryScore, delta,      |                         |
   |   nodeColorUpdate,          |                         |
   |   nextTopicRecommendation } |                         |
   |<────────────────────────    |                         |
   | Animate node color change   |                         |
   | Show mastery delta banner   |                         |
```

### Flow 4: Exam Rescue Plan Generation
```
Frontend                      Backend / Agent           MongoDB
   |                             |                         |
   | User says "My exam is in    |                         |
   | 3 days" or sets exam date   |                         |
   |                             |                         |
   | POST /api/studyplan/generate|                         |
   | { userId, examDate,         |                         |
   |   sessionId }               |                         |
   |─────────────────────────>   |                         |
   |                             | GET all topic masteries  |
   |                             |   from MongoDB ──────────>
   |                             |                         | Topics[]
   |                             | <────────────────────────|
   |                             |                         |
   |                             | Progress Agent runs:    |
   |                             | - Count days until exam |
   |                             | - Sort topics by mastery|
   |                             |   (weakest first)       |
   |                             | - Assign 1-2 topics/day |
   |                             | - Final day = mock exam |
   |                             | - Save StudyPlan ───────>
   |                             |                         | StudyPlan{}
   | { studyPlan: {              |                         |
   |   day1: [...topics],        |                         |
   |   day2: [...topics],        |                         |
   |   day3: ["Mock Exam"] } }   |                         |
   |<────────────────────────    |                         |
   | Render RescuePlanTimeline   |                         |
   | Show on Dashboard           |                         |
```

> **Live behavior during the rescue plan:**  
> Each day, user studies the assigned topics (Tutor → Quiz loop).  
> After each quiz, Progress Agent checks: score < 60%? → that topic is **pushed to the next day** and the plan auto-adjusts via `PATCH /api/studyplan/day/:dayId`.

---

## 9. Environment Variables

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth
GOOGLE_CLIENT_ID=...
JWT_SECRET=...

# OpenAI
OPENAI_API_KEY=...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX=neuralnest-os
PINECONE_ENVIRONMENT=us-east-1

# LangSmith
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...
LANGCHAIN_PROJECT=neuralnest-os
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=...
```

---

## 10. 7-Day Build Plan (Team Split)

| Day | Focus | Frontend Dev | Backend / AI Dev |
|---|---|---|---|
| **1–2** | Foundation | Vite setup, Tailwind tokens, Auth UI, file upload drop zone, chat shell layout | Express scaffold, MongoDB connect, PDF ingestion → Pinecone pipeline, RAG retriever working |
| **3** | Tutor Agent | Streaming SSE chat UI, message bubbles, comprehension chip buttons, SSE parser | Tutor Agent system prompt, LangGraph state graph, session memory, streaming endpoint |
| **4** | Quiz Agent | Quiz card component, MCQ renderer, lives bar, XP popup, score display | Quiz Generator Agent, difficulty adjustment, QuizResults saved to MongoDB |
| **5** | Progress + Dashboard | Dashboard page, mastery % display, React Flow node color update, mastery delta banner | Progress Tracking Agent, mastery score logic, exam plan generator, StudyPlan schema |
| **6** | Polish | Onboarding wizard, roadmap polish, mobile responsive, loading skeletons | Error handling, LLM retry with backoff, cross-session memory, LangSmith tracing verified |
| **7** | Deploy + Demo | Vercel deploy, final UI fixes, demo rehearsal | Render deploy, env vars, architecture diagram, LangSmith traces ready for judges |

> **Rule:** Sync frontend ↔ backend every 24 hours. Never let them diverge more than one day.

> **Scaling to 3 people?** If you have a 3rd teammate, split "Backend / AI Dev" into two roles: one handles Express routes + MongoDB + auth, the other handles LangGraph agents + Pinecone + prompt engineering. Frontend stays with one person. The day-by-day plan stays the same — just the right column splits.

---

## 11. Out of Scope

These are explicitly cut to protect delivery:

- ❌ Voice input / recording
- ❌ Multiple simultaneous syllabuses
- ❌ Leaderboards / social features
- ❌ Custom difficulty sliders (agent decides automatically)
- ❌ PDF export of study plan
- ❌ Fine-tuned models (strong prompts on GPT-4o is sufficient)
- ❌ Video / audio generation

---

## 12. Demo Script (90 Seconds on Stage)

| # | You do | Judges see |
|---|---|---|
| 1 | Upload a real college OS syllabus PDF | Full visual roadmap appears in ~10 sec. Colored topic nodes. **Money shot.** |
| 2 | Click one weak (red) topic → tutor asks mastery rating | Personalization visible before teaching even starts |
| 3 | Midway through explanation say "I don't get it" | Tutor switches to analogy mode — completely different explanation |
| 4 | Complete topic → quiz appears → answer one right one wrong | Node turns yellow. Score updates live on roadmap. Mastery delta shown. |
| 5 | Say "my exam is in 3 days" | Flow 4 activates. Day-by-day rescue plan generates in seconds. |
| 6 | Show dashboard | Full syllabus mastery overview. Clean finish. |

> Judges see RAG, multi-agent, adaptive AI, personalization, and memory — all in 90 seconds, without you explaining a single technical term.

---

## 13. Frontend Verification Checklist

After scaffolding the frontend, verify each of these before connecting to the backend:

| Check | Command / Action |
|---|---|
| Lint passes | `npm run lint` |
| Build compiles clean | `npm run build` |
| Dark mode toggles correctly | Add/remove `dark` class on `<html>`, all colors must adapt |
| Roadmap nodes show 3 color states | Set `status: 'unstarted' / 'learning' / 'mastered'` in mock data |
| Node click opens popup card | Click any node → glassmorphism card appears with topic name + mastery % |
| Tutor streaming renders word-by-word | Point at mock SSE endpoint, confirm text streams in |
| Comprehension chips appear after message | After each AI message → 3 chips + doubt prompt must render |
| Quiz correct/wrong states animate | Answer a question → green highlight or red flash must fire |
| XP popup floats and fades | Correct answer → "+20 XP" floats up and disappears |
| Dashboard mastery ring updates | Change mastery % in state → ring must re-render live |
| Heatmap renders 7×N grid | Confirm each square = one study day, green intensity = session count |
| Rescue plan timeline renders | Pass mock `studyPlan` prop → day-by-day vertical timeline must show |

---

*NeuralNest-OS · Stack: React + Node.js + LangGraph + Pinecone + MongoDB*
