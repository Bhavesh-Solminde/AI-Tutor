<div align="center">

<img src="frontend/public/dark.png" alt="NeuralNest AI — Dark Mode Dashboard" style="border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);max-width:100%;" />

<br/><br/>

# 🧠 NeuralNest AI
### The Learning Operating System That Thinks, Adapts, and Teaches

[![Live App](https://img.shields.io/badge/🚀_Live_Demo-ai--tutor--ebon--tau.vercel.app-3B6BFF?style=for-the-badge)](https://ai-tutor-ebon-tau.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Railway-black?style=for-the-badge)](https://ai-tutor-production-2957.up.railway.app/)
[![Stack](https://img.shields.io/badge/Stack-React_·_LangGraph_·_GPT--4o_·_Pinecone-0B0F19?style=for-the-badge)](#)

</div>

---

> **NeuralNest is a fully agentic LangGraph teaching system that verifies student understanding after every explanation, re-teaches in a smarter mode when confused, and autonomously manages an entire curriculum from syllabus to exam day.**

---

## 🏆 Feature Index

| # | Feature | Category |
|---|---------|----------|
| 01 | [Multi-Step LangGraph Agentic Teaching Loop](#01-multi-step-langgraph-agentic-teaching-loop) | AI Core |
| 02 | [Real-Time Student Comprehension Grading](#02-real-time-student-comprehension-grading) | AI Core |
| 03 | [Tool-Calling ReAct Tutor (RAG + Web Search)](#03-tool-calling-react-tutor-rag--web-search) | AI Core |
| 04 | [Q&A Doubt Mode with Agentic Routing](#04-qa-doubt-mode-with-agentic-routing) | AI Core |
| 05 | [AI-Powered Syllabus Topic Extraction (30–60 nodes)](#05-ai-powered-syllabus-topic-extraction-3060-nodes) | AI Pipeline |
| 06 | [PYQ (Past Year Question) Frequency Analyzer](#06-pyq-past-year-question-frequency-analyzer) | AI Pipeline |
| 07 | [YouTube Video Search & Inline Suggestion](#07-youtube-video-search--inline-suggestion) | AI Pipeline |
| 08 | [Persistent Learning Profile & Personalization](#08-persistent-learning-profile--personalization) | AI Core |
| 09 | [Visual Interactive Roadmap (React Flow DAG)](#09-visual-interactive-roadmap-react-flow-dag) | Learning |
| 10 | [Exam Rescue Plan — Day-by-Day AI Schedule](#10-exam-rescue-plan--day-by-day-ai-schedule) | Learning |
| 11 | [Gamified MCQ Quiz Engine with Lives & XP](#11-gamified-mcq-quiz-engine-with-lives--xp) | Quizzes |
| 12 | [Quiz History, Resumable Quizzes & Results Review](#12-quiz-history-resumable-quizzes--results-review) | Quizzes |
| 13 | [Mastery Scoring Engine with Auto-Unlock](#13-mastery-scoring-engine-with-auto-unlock) | Progress |
| 14 | [3-Input Onboarding (PDF / Text / Topic)](#14-3-input-onboarding-pdf--text--topic) | Onboarding |
| 15 | [Baseline Mastery Self-Rating per Topic](#15-baseline-mastery-self-rating-per-topic) | Onboarding |
| 16 | [Real-Time Progress Dashboard](#16-real-time-progress-dashboard) | Dashboard |
| 17 | [XP, Streaks & Weekly Study Heatmap](#17-xp-streaks--weekly-study-heatmap) | Gamification |
| 18 | [Multi-Namespace Pinecone RAG with Cohere Embeddings](#18-multi-namespace-pinecone-rag-with-cohere-embeddings) | Infrastructure |
| 19 | [Persistent Chat History (Categorized by Context)](#19-persistent-chat-history-categorized-by-context) | UX |
| 20 | [OAuth + Local Auth (Google, GitHub, Email)](#20-oauth--local-auth-google-github-email) | Auth |
| 21 | [Multi-Modal File Upload (PDF, DOCX, Images)](#21-multi-modal-file-upload-pdf-docx-images) | Infrastructure |
| 22 | [Explanation Level Calibration (Beginner → Advanced)](#22-explanation-level-calibration-beginner--advanced) | Personalization |
| 23 | [Exam Mode with PYQ Upload + Roadmap](#23-exam-mode-with-pyq-upload--roadmap) | Exam |
| 24 | [Glassmorphic Dual-Theme UI (Light + Dark)](#24-glassmorphic-dual-theme-ui-light--dark) | UX |
| 25 | [LangSmith Observability & Full Agent Tracing](#25-langsmith-observability--full-agent-tracing) | DevOps |
| 26 | [Profile, Exam Date Management & Level Switching](#26-profile-exam-date-management--level-switching) | UX |

---

## 01. Multi-Step LangGraph Agentic Teaching Loop

The AI brain is not a single LLM call. It is a stateful **LangGraph graph** that cycles through specialist nodes, one step at a time, until the student truly understands.

```
__start__ → router ──┬── tutorNode → gradeNode ──┬── UNDERSTOOD → END
                     │                            ├── CONFUSED   → tutorNode (simpler)
                     │                            ├── PARTIAL    → tutorNode (deeper)
                     │                            └── DOUBT      → doubtNode → END
                     ├── doubtNode → END
                     └── quizGeneratorNode → END
```

- `routerNode` — classifies incoming message as `teach`, `doubt`, or `quiz`
- `tutorNode` — ReAct tool-calling agent that teaches and generates a checkpoint question
- `gradeNode` — classifies student understanding as `UNDERSTOOD`, `CONFUSED`, `PARTIAL`, or `DOUBT`
- `doubtNode` — resolves specific student questions mid-curriculum
- `quizGeneratorNode` — creates topic-specific MCQs with explanations
- **Safety cap**: loop counter enforces maximum 3 re-explanation cycles per message — no infinite loops

---

## 02. Real-Time Student Comprehension Grading

After every explanation, the AI poses a **checkpoint question** and waits for the student's response. The `gradeNode` (GPT-4o at `temperature: 0.1`) classifies the response using structured output:

| Classification | Trigger | Next Step |
|---|---|---|
| `UNDERSTOOD` | Correct answer, "got it", affirmative | Move to next topic |
| `CONFUSED` | "I don't get it", wrong answer, re-explain | TutorNode: simpler analogy mode |
| `PARTIAL` | Half-correct, missing key detail | TutorNode: step-by-step breakdown |
| `DOUBT` | Specific follow-up question | DoubtNode: targeted Q&A |

The system never blindly moves on. It only advances the curriculum when it has verified understanding.

---

## 03. Tool-Calling ReAct Tutor (RAG + Web Search)

`tutorNode` runs a **ReAct loop** (Reason → Act → Observe) where GPT-4o autonomously decides when and what to search using two tools:

**Tool 1: `search_uploaded_materials`**
- Queries Pinecone vector store across multiple namespaces (student's uploaded PDFs, session notes)
- Called first for any new concept — grounds the tutor in the student's actual syllabus
- Supports multi-namespace retrieval across multiple uploaded sessions

**Tool 2: `search_web` (Tavily)**
- Called for real-world analogies, current documentation, or when notes are insufficient
- Toggled by the student via the Globe icon in the chat panel
- Falls back gracefully if API is unavailable

The loop caps at **3 tool calls** per message. If the cap is hit, a final non-tool call produces the response using all accumulated context.

---

## 04. Q&A Doubt Mode with Agentic Routing

Students can interrupt the teaching flow at any moment by toggling **Doubt Mode** (MessageSquare icon in the chat panel). The `routerNode` detects `DOUBT` intent and routes to `doubtNode`, which:

- Answers the specific question directly without losing curriculum context
- Returns the student to the teaching flow after the doubt is resolved
- Works mid-session without losing state or progress

---

## 05. AI-Powered Syllabus Topic Extraction (30–60 nodes)

When a student uploads a PDF or pastes notes, a GPT-4.1 structured extraction pipeline (`topicExtractor.ts`) analyzes up to **60,000 characters** and produces:

- **30–60 granular topic nodes** (subtopic level, not chapter level)
- Each node has: `name`, `difficulty` (easy/medium/hard), `estimatedMinutes`, `topicType` (theory/numerical/mixed)
- **Prerequisite edges** forming a directed acyclic graph (DAG) — the roadmap graph structure
- Topic names are exam-ready, 2–6 words, suitable for roadmap node labels

The prompt enforces subtopic granularity — e.g. "CPU Scheduling" becomes "Round Robin Scheduling", "FCFS Scheduling", "SRTF Algorithm", "Priority Scheduling" as separate nodes.

---

## 06. PYQ (Past Year Question) Frequency Analyzer

Students upload past year exam papers in Exam Mode. The `pyqParser.ts` pipeline:

- Uses GPT-4o structured output to classify each question to its topic
- Counts how many times each topic appears across all past papers
- Writes `pyqFrequency` to each Topic document in MongoDB
- The study plan generator uses this frequency to **prioritize high-yield topics** and schedule them earliest in the rescue timeline

---

## 07. YouTube Video Search & Inline Suggestion

After each AI explanation, the tutor searches for relevant educational YouTube videos:

- Primary: **YouTube Data API v3** — filtered to educational category (ID 27), English, relevance-sorted
- Fallback: **Tavily web search** (`site:youtube.com`) if API key not configured
- Rendered inline in the chat as clickable video cards (thumbnail, title, channel)
- Helps visual learners supplement text explanations with video content

---

## 08. Persistent Learning Profile & Personalization

The `gradeNode` writes back to the user's `learningProfile` in MongoDB after each session:

```ts
learningProfile: {
  conceptsStruggled: Map<string, number>,   // topicName → confusion count
  preferredExplanationStyle: "analogy" | "step_by_step" | "visual" | "standard",
  lastSessionSummary: string,
}
```

On every new session, `tutorNode` reads this profile from the database and injects it into the system prompt — so the tutor knows to use analogies if the student struggled before, or to be more concise if they prefer precision.

---

## 09. Visual Interactive Roadmap (React Flow DAG)

The full syllabus is visualized as a **directed graph** built on React Flow:

- **Nodes** show: topic name, mastery %, difficulty badge, estimated time, and topic type (theory/numerical/mixed)
- **Edges** represent prerequisite dependencies — you cannot start a node until its prerequisites are mastered
- **Node colors**: gray (locked), amber (in progress / learning), emerald (mastered)
- Clicking any node opens a **TopicPopupCard** with Time, Level, and Mastery stats, plus "Start Learning" and "Test My Skills" CTAs
- The canvas supports panning, zooming, minimap, and a legend panel (top-right)
- Exam Mode has its own separate roadmap instance for exam-specific topics

---

## 10. Exam Rescue Plan — Day-by-Day AI Schedule

When a student sets their exam date:

1. System calculates available days remaining
2. Fetches all topics sorted by `pyqFrequency` (highest-yield first) and mastery (lowest first)
3. Generates a **day-by-day study plan** stored in `StudyPlan` collection
4. Each day has assigned topics with estimated minutes
5. Mock exams are automatically inserted at strategic intervals before the exam date
6. The plan is shown as an **expandable timeline** (click any day to see assigned topics)
7. After a low quiz score (<60%), the plan is **auto-recalibrated** — weak topics are added back to the next day
8. Students can reset and regenerate the plan at any time

---

## 11. Gamified MCQ Quiz Engine with Lives & XP

Every topic has an AI-generated quiz powered by `quizGeneratorNode`:

- **10 adaptive MCQs** per quiz — generated fresh for the topic (adapts to previous quiz score)
- **Countdown timer** (10 min default) — quiz auto-submits on expiry
- **5 lives (hearts) system** — each wrong answer costs a life; quiz ends at 0 lives
- **+20 XP per correct answer** with animated floating XP popup
- **Step progress bar** shows correct (green) / wrong (red) / remaining (gray) for all questions
- After each answer: immediate right/wrong feedback with color-coded option highlights
- Toggle **Show Explanation** button reveals why the correct answer is correct
- Pass threshold: ≥60% correct — triggers mastery score update

---

## 12. Quiz History, Resumable Quizzes & Results Review

- **Active Quizzes**: list of in-progress sessions with progress bar and "Resume" button
- **Quiz History table**: all completed attempts with score, pass/fail badge, date, and time taken
- Clicking any row opens a full **Quiz Result Review** page with:
  - Question-by-question replay of all answers
  - Correct vs. selected option shown side-by-side
  - Per-question explanations
  - Final mastery delta (before → after)
  - XP earned, pass/fail status

---

## 13. Mastery Scoring Engine with Auto-Unlock

Mastery is computed from a **weighted formula** in [`masteryCalculator.ts`](backend/src/utils/masteryCalculator.ts) — pure TypeScript, no LLM involved:

```
masteryScore = round( (quizScore × 0.6) + (selfRating × 0.3) + (engagement × 0.1) ) × 100
```

| Component | Weight | Formula |
|---|---|---|
| `quizScore` | **60%** | `correctAnswers / totalQuestions` |
| `selfRating` | **30%** | `selfRatingAfter / 10` (1–10 scale normalized to 0–1) |
| `engagement` | **10%** | `min(actualStudyMinutes / estimatedTopicMinutes, 1.0)` — capped at 1 |

- **`passed`** = `quizScore >= 0.7` (quiz score alone determines pass/fail)
- **`nodeColor`** = `"mastered"` only when `passed && masteryScore >= 70`, else `"learning"`
- **`xpEarned`** = `correctAnswers × 20`
- Written to `Topic.masteryScore` in MongoDB on every quiz submission
- **Overall mastery** on Dashboard = average of all topic mastery scores

---

## 14. 3-Input Onboarding (PDF / Text / Topic)

The 3-step onboarding wizard supports three input modes on Step 1:

| Mode | Description |
|---|---|
| **Upload Syllabus** | PDF/DOCX drag-and-drop — extracted, embedded, and ingested into Pinecone |
| **Paste Notes** | Raw text input — topic extraction runs on the pasted content |
| **Single Topic** | Type a topic name — AI generates the full subtopic DAG from scratch |

All three paths converge at the same topic extraction pipeline and produce an identical roadmap. Progress stepper shows current step (1/2/3) with live spinner during AI processing (~30–60s).

---

## 15. Baseline Mastery Self-Rating per Topic

Step 3 of onboarding shows every extracted topic as a **slider (1–3)**:

- `1 = Beginner` — no prior knowledge
- `2 = Familiar` — seen it before, not mastered
- `3 = Comfortable` — can explain it roughly

These baseline ratings are saved as `selfRatingBefore` on each Topic document. The tutor reads this score to calibrate its starting explanation depth and detect overconfidence (high rating but low quiz performance).

---

## 16. Real-Time Progress Dashboard

The Dashboard aggregates data from 4 stores (Progress, Exam, Auth, Quiz) into one view:

| Widget | Data Source |
|---|---|
| **Mastery Ring** | Overall mastery % from all topic scores |
| **Exam Countdown** | Days remaining from `exam.examDate` |
| **Weekly Streak** | Count of `user.studyDays` in last 7 days |
| **XP Today** | Sum of `xpEarned` from quiz results completed today |
| **AI Recommended Card** | First `in-progress` topic with "Start Teaching" CTA |
| **Continue Card** | Most recently studied topic with "Resume" + "Take Quiz" CTAs |
| **Topic Mastery Table** | All topics with mastery %, difficulty, estimated time, and study button |
| **Rescue Plan Timeline** | Daily study plan from `StudyPlan` collection |

---

## 17. XP, Streaks & Weekly Study Heatmap

- **XP System**: `+20 XP` per correct quiz answer, tracked in `User.xp` and `User.totalXp`
- **Streak**: computed from `user.studyDays` — each unique day a student studies increments the streak
- **XP Level Tiers**: defined in `xpLevels.js` — "Rising Student", "Explorer", "Scholar", etc.
- **Weekly Heatmap**: Profile page shows a 7-day study activity heatmap with color intensity per day
- **Level badge**: shown in profile card based on total XP milestones

---

## 18. Multi-Namespace Pinecone RAG with Cohere Embeddings

The RAG infrastructure is production-grade:

- **Ingestion** (`ingest.ts`): PDFs/DOCX are chunked, Cohere `embed-english-v3.0` embeds each chunk (1024 dims), upserted to Pinecone with `userId_sessionId` namespace
- **Retrieval** (`retriever.ts`): Three retrieval modes:
  - `retrieveContextByNamespace` — single session namespace
  - `retrieveFromMultipleNamespaces` — student-selected material sessions (Materials modal in chat)
  - `retrieveFromAllUserSessions` — fallback across entire user knowledge base
- **Cosine similarity search** — top-K relevant chunks returned per query
- **Namespace isolation** — each user's data is completely separated from other users

---

## 19. Persistent Chat History (Categorized by Context)

All tutor conversations are saved to `ChatHistory` documents in MongoDB:

- Categorized into three buckets: **Exam**, **Roadmap**, **Other** (based on session context)
- Shown in the sidebar under collapsible sections with distinct color-coded icons:
  - BookMarked (blue) = Exam chats
  - Map (emerald) = Roadmap chats
  - Lightbulb (amber) = Open-topic chats
- Clicking any history item navigates to `/tutor/:topicId?chatId=:id`, restoring the exact conversation
- Chat title auto-generated from first message
- Timestamps shown next to each entry

---

## 20. OAuth + Local Auth (Google, GitHub, Email)

Three auth flows all handled by `Passport.js` + `JWT`:

- **Google OAuth 2.0** — one-click sign-in with Google account
- **GitHub OAuth** — sign-in with GitHub developer account
- **Local (Email + Password)** — bcrypt-hashed passwords, standard JWT issuance
- JWT stored in HTTP-only cookies for security
- `/api/auth/me` endpoint returns the authenticated user with `explanationLevel`, `xp`, `streak`, and `learningProfile`
- Onboarding flag (`user.onboarded`) gates access to main app pages

---

## 21. Multi-Modal File Upload (PDF, DOCX, Images)

The ingest pipeline (`ingest.ts`) supports:

- **PDFs** — parsed with pdf-parse, full text extracted
- **DOCX** — mammoth.js extracts body text
- **Images** — base64 encoded and sent to GPT-4o Vision for OCR + text extraction
- All types go through the same chunking + Cohere embedding + Pinecone upsert pipeline
- Files are also stored in **Cloudinary** for original file access
- Upload triggered from Onboarding (syllabus) or the in-chat **Attach Materials modal**

---

## 22. Explanation Level Calibration (Beginner → Advanced)

Students select their preferred explanation depth during onboarding (Step 2):

| Level | Behavior |
|---|---|
| **Beginner** | Terms defined before use, real-world analogies, conversational tone |
| **Intermediate** | Assumes tech literacy, balanced technical accuracy and clarity |
| **Advanced** | Dense study-note style, high-level terminology, edge cases and precise details |

- Stored as `user.explanationLevel` in MongoDB
- Injected into every `tutorNode` system prompt
- Can be changed anytime from the **Profile page** with instant effect

---

## 23. Exam Mode with PYQ Upload + Roadmap

A dedicated Exam Mode page with a 3-step wizard (`ExamSetupWizard`):

1. **Subject & Date** — sets `examDate` in the `Exam` document
2. **Syllabus Upload** — PDF/DOCX/text input, triggers full topic extraction + roadmap generation
3. **PYQ Upload** — past year papers analyzed for topic frequency (optional — skip skips to Tavily fallback)

After setup, the page renders:
- A full interactive **React Flow roadmap** for exam topics
- A **day-by-day rescue timeline** with expandable day blocks
- Status chips: Days Left (red), Mastered count (emerald), Active count (amber)
- Mock exam days injected automatically
- Hard reset button to wipe and start fresh

---

## 24. Glassmorphic Dual-Theme UI (Light + Dark)

NeuralNest ships a premium design system:

- **Dark mode**: `#0B0F19` base, `#1A1F2E` surfaces, `#3B6BFF` primary, blur-glass cards
- **Light mode**: `#F8FAFF` base, white surfaces, `#3B6BFF` primary, soft shadows
- **Typography**: Inter (sans-serif) globally — no monospace in UI labels
- **Icon system**: 100% Lucide icons — no emojis in the interface
- **Micro-animations**: bouncing typing dots, floating XP popups, animated roadmap edges, skeleton loaders on every data-fetching surface
- **Comprehension chips**: ThumbsUp / HelpCircle / Zap — replace the old emoji buttons
- **Glassmorphism**: backdrop-blur on the navbar, popup cards, and legend panel
- All interactive elements have hover, focus, and active states

---

## 25. LangSmith Observability & Full Agent Tracing

Every LangGraph run is traced end-to-end in **LangSmith**:

- Node-level traces: `router → tutorNode → gradeNode → ...` visible in LangSmith UI
- Tool call traces: every `search_uploaded_materials` and `search_web` call logged with inputs and outputs
- Token counts, latency, and classification results per node
- Pino-based structured logging (`createLogger`) for all server-side events
- LangGraph Studio UI available locally for real-time graph visualization during development

---

## 26. Profile, Exam Date Management & Level Switching

The Profile page provides full account control:

- **User card**: name, email, avatar (from OAuth provider or UI Avatars fallback), auth provider badge
- **Explanation level toggle**: one-click cycle through Beginner → Intermediate → Advanced, persisted instantly
- **Exam date editor**: inline date picker to update the exam target — study plan re-syncs automatically via `fetchExam`
- **Weekly streak bar**: 7-day visual activity
- **Mastery heatmap**: study activity per day over rolling period
- **Topics mastered count**: pulled from Progress store
- **Logout**: clears JWT and redirects to landing

---

## 🔬 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v7, Tailwind CSS, Zustand |
| **UI** | Lucide Icons, React Flow, React Markdown, React Hot Toast |
| **Backend** | Node.js, Express, TypeScript |
| **AI Agent** | LangGraph (TypeScript), LangChain |
| **LLM** | OpenAI `gpt-4o` (tutor, grader, doubt), `gpt-4.1` (topic extraction) |
| **Embeddings** | Cohere `embed-english-v3.0` (1024 dims) |
| **Vector DB** | Pinecone (cosine similarity, per-user namespaces) |
| **Database** | MongoDB + Mongoose |
| **Auth** | Passport.js (Google OAuth, GitHub OAuth, Local) + JWT |
| **File Storage** | Cloudinary |
| **Web Search** | Tavily |
| **YouTube** | YouTube Data API v3 (+ Tavily fallback) |
| **Observability** | LangSmith, Pino structured logging |
| **Deployment** | Vercel (frontend) + Railway (backend) |

---

## 🗂️ Data Models

| Model | Key Fields |
|---|---|
| `User` | `xp`, `streak`, `studyDays`, `explanationLevel`, `learningProfile`, `onboarded` |
| `Session` | `userId`, `sessionName`, `pineconeNamespace`, `inputType` |
| `Topic` | `name`, `difficulty`, `estimatedMinutes`, `masteryScore`, `status`, `pyqFrequency`, `prerequisites`, `topicType` |
| `ChatHistory` | `userId`, `sessionId`, `topicId`, `category`, `title`, `messages[]` |
| `QuizResult` | `topicId`, `correctAnswers`, `totalQuestions`, `passed`, `xpEarned`, `masteryDelta`, `timeTaken` |
| `StudyPlan` | `userId`, `examDate`, `days[{dayNumber, date, topics[], isMockExam, completed}]` |
| `Exam` | `userId`, `subject`, `examDate`, `syllabusUploaded`, `pyqUploaded` |

---

<div align="center">

**🎯 Try it live: [ai-tutor-ebon-tau.vercel.app](https://ai-tutor-ebon-tau.vercel.app/)**

*Built with obsessive attention to detail for the future of AI-powered education.*

</div>
