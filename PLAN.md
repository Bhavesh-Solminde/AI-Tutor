# AI Adaptive Tutor — Complete Project Brief (NeuralNest-OS)

---

## 1. One-Line Pitch

> **"Upload your syllabus, paste your notes, or just ask — our AI teaches you topic by topic, checks if you understood, quizzes you, and tracks exactly what you know."**

---

## 2. Why We Chose This Project

- 30 teams are building simultaneously. Project 1 (AI Project Manager) is the most obvious pick — high collision risk
- Project 3 has the highest demo viscerality — judges can interact live without needing technical background
- Universal relatability — every judge has been a student
- Maximum AI concept coverage in one project: RAG + multi-agent + personalization + long-term memory
- Neither StudyFetch nor Gizmo (our reference products) has our three core differentiators

---

## 3. Our Three Core Differentiators vs. StudyFetch & Gizmo

These are the **live demo anchors** — every judge interaction hits at least one.

### ① Visual Syllabus Roadmap — Nodes That Change Color Live
User uploads a syllabus PDF → AI extracts all topics → renders them as clickable nodes on an interactive graph. As the user learns and gets quizzed, each node updates its color in real time:
- 🔘 **Gray** = not started
- 🟡 **Yellow** = currently learning / partially mastered
- 🟢 **Green** = fully mastered (quiz score > 85%)

No other edtech app shows a spatial, visual map of what you know and what you don't. **Money shot in the demo.**

### ② Exam Countdown Rescue Plan
User says *"My exam is in 3 days"* → AI reads all mastery scores → auto-generates a day-by-day study plan:
- Weakest topics get the most time
- Strong topics get a single revision quiz only
- Score < 60% on a day → topic pushed to next day automatically
- Final day = full mock exam from the entire syllabus
- After mock exam: *"3 topics need revision before your exam tomorrow"*

### ③ Open Topic Explanation — Paste Notes or Ask Anything
User is **not locked into the syllabus**. They can:
- Paste messy handwritten/typed notes → AI restructures + identifies gaps → teaches from them
- Just type *"Explain me OS scheduling algorithms"* → AI teaches from scratch

Both cases: AI explains → quizzes from that material → tracks mastery → feeds into the same dashboard.

---

### Full Feature Comparison

| Feature | StudyFetch | Gizmo | NeuralNest-OS |
|---|---|---|---|
| Visual syllabus roadmap (nodes turn green) | ❌ | ❌ | ✅ **Core #1** |
| Exam countdown rescue plan | ❌ | ❌ | ✅ **Core #2** |
| Open topic / paste notes explanation | ❌ | ❌ | ✅ **Core #3** |
| Mastery delta shown ("3/10 → 8/10") | ❌ | ❌ | ✅ |
| 3 explanation levels (Beginner/Intermediate/Advanced) | ❌ | ❌ | ✅ |
| Comprehension checkpoint + Q&A doubt prompt | ❌ | ❌ | ✅ sub-feature |
| Adaptive explanation (simpler → analogy → step-by-step) | ❌ | ❌ | ✅ |
| Quiz from your own material | ✅ | ✅ | ✅ |
| File upload | ✅ | ✅ | ✅ |
| Progress tracking | ✅ | ✅ | ✅ |
| Gamified quiz (hearts/lives/XP) | ❌ | ✅ | ✅ |

**What we borrow from StudyFetch:** side-by-side layout, adaptive pacing concept
**What we borrow from Gizmo:** gamified quiz feel, "Explain" button after wrong answer

---

## 4. Core User Flows

### Flow 1 — Syllabus Roadmap *(primary / demo anchor — Core Differentiator #1)*

```
Upload syllabus PDF
        ↓
AI extracts all topics + subtopics + estimates difficulty (Easy / Medium / Hard)
        ↓
Onboarding Step 2: User picks Explanation Level (Beginner / Intermediate / Advanced)
Stored as explanationLevel on user profile — applies to every session
        ↓
Onboarding Step 3: Tutor asks "Rate your current knowledge of [topic] from 1–10"
User responds → stored as baseline mastery
        ↓
Visual roadmap generated — topics as clickable nodes (gray/yellow/green)
        ↓
User clicks any topic node → Tutor begins teaching in conversational chunks
Calibrated to both explanationLevel AND mastery score
After each chunk → Comprehension checkpoint:
  "Did that click? [Understood] [Need more help] [Go deeper]"
  + "Also — do you have any doubts or questions before we move on?"
User responds naturally or clicks chip → Tutor adapts
        ↓
Quiz auto-triggers after topic covered
Score updates node color: Gray → Yellow → Green
Mastery score updated in DB
        ↓
Dashboard shows full syllabus mastery %
"What should I study next?" → AI recommends lowest mastery topic
```

---

### Flow 2 — Exam Rescue Plan *(emotional hook — Core Differentiator #2)*

```
User uploads syllabus + enters exam date ("My OS exam is in 3 days")
        ↓
AI reads all current topic mastery scores from DB
        ↓
Progress Tracking Agent generates day-by-day rescue plan:
  - Weak topics → more days
  - Strong topics → revision only + 1 quiz
  - Final day → full mock exam
Plan saved as StudyPlan in MongoDB
        ↓
Each day: Tutor teaches assigned topic (same tutor flow as Flow 1)
End of each day → mini quiz
  Score < 60% → topic re-added to next day automatically
  Score > 85% → AI compresses remaining time for that topic
        ↓
Final day: Full mock exam from entire syllabus
Graded → weak topics flagged → emergency revision list
"3 topics need revision before your exam tomorrow"
```

---

### Flow 3 — Open Topic Explanation *(most flexible — Core Differentiator #3)*

```
User pastes their own messy notes OR types any topic name
        ↓
If pasted notes:
  AI restructures notes into clean breakdown:
    - Main concept
    - Key subtopics
    - Gaps detected: "Your notes don't cover X — want me to fill that in?"
  Notes chunked + embedded on-the-fly → stored as temporary session in Pinecone

If typed topic name (e.g. "Explain me RAG"):
  No RAG, pure LLM knowledge — no upload needed
        ↓
Onboarding Step 3 (single slider): "Rate your current knowledge of this topic 1–10"
Stored as baseline mastery
        ↓
Tutor teaches from the structured notes or from scratch
After each chunk → Comprehension checkpoint + Q&A doubt prompt
If user says "I don't get it" → Tutor switches explanation mode completely
  → Never repeats same explanation
  → Fallback chain: simpler language → real-world analogy → step-by-step breakdown
        ↓
After full topic: "How would you rate your understanding now? 1–10"
User gives new score → Delta shown: "You went from 3/10 to 8/10 🎉"
        ↓
Quiz generated from user's own notes specifically
Score saved as mastery for that topic
Feeds into same dashboard + roadmap as Flows 1 & 4
Weak questions flagged → "Want to revisit? I'll explain differently"
```

---

### How All 3 Flows Connect

```
New user lands
        ↓
Flow 1 → Upload syllabus → get roadmap → start learning
        ↓
Has exam coming → Flow 2 → AI reads weak topics → builds rescue plan
        ↓
Has own notes or specific question → Flow 3 → paste/type → AI teaches → quiz
        ↓
All 3 feed into the same dashboard + mastery score system + roadmap node colors
```

---

## 5. Features Common to All Flows

**Explanation Level (set once at onboarding)**
User picks how the AI explains things — applies to every session:

| Level | Behavior |
|---|---|
| 🟢 Beginner *(Recommended)* | Every jargon defined before use, real-life examples, simple conversational language, starts from zero |
| 🟡 Intermediate | Jargon briefly explained, assumes basic context, one example per concept |
| 🔴 Advanced | Full jargon, no analogies, concise study-notes style, treats user as a peer |

Stored as `explanationLevel: 'beginner' | 'intermediate' | 'advanced'` in the User schema.

**Mastery Check-in**
Every topic starts with a 1–10 self-rating. Stored in DB. Personalizes depth from the first message alongside `explanationLevel`.

**Comprehension Checkpoint + Q&A Doubt Prompt**
After every teaching chunk, the tutor does two things in one message:
1. *"Did that click? [Understood] [Need more help] [Go deeper]"*
2. *"Also — do you have any doubts or questions before we move on?"*

User can click a chip OR type any freeform question. Tutor answers the doubt fully, then resumes. This turns every session into a live Q&A tutor, not just a lecture.

**Adaptive Explanation Modes**
On confusion, three fallback modes trigger in sequence — never repeats same text:
- Mode 1: Simpler language — reduce jargon, shorter sentences
- Mode 2: Real-world analogy — map to something familiar
- Mode 3: Step-by-step breakdown — smallest atomic steps possible

**Mastery Delta**
Before vs. after score shown at end of every topic. "You went from 3/10 to 8/10." Stored in DB, visible on dashboard over time.

**Quiz as Confirmation**
Generated from exactly what was taught in that specific session. Tests retention of what was covered, not general topic knowledge. Wrong answers trigger the Explain button with a different angle.

---

## 6. Agent Architecture

Three LangGraph agents coordinate via a shared state graph. Each agent is an LLM call with structured JSON output enforced via `response_format`.

### Tutor Agent
- **Input:** topic name + `explanationLevel` + `masteryLevel` (1–10) + RAG chunks from Pinecone + conversation history
- **Output:**
  ```json
  {
    "explanation": "teaching chunk",
    "checkpoint_question": "Did that click?",
    "doubt_prompt": "Do you have any doubts or questions before we move on?",
    "next_action": "CONTINUE | GO_DEEPER | GO_SIMPLER | ANSWER_DOUBT",
    "explanation_mode": "standard | simpler | analogy | step_by_step"
  }
  ```
- **Rule:** never repeat same explanation, always end chunk with checkpoint + doubt prompt
- `ANSWER_DOUBT` fires when user types a freeform question instead of clicking a chip

### Quiz Generator Agent
- **Input:** concepts covered in session + `masteryLevel` + `previousQuizScore`
- **Output:** `[{ question, options, correct, explanation }]`
- **Rule:** difficulty auto-adjusts — score < 60% on last quiz → next quiz simpler on same concepts

### Progress Tracking Agent
- **Input:** quiz results + self-rating before/after + session duration + `examDate` + all topic masteries
- **Output:** updated mastery score (0–100) per topic + next topic recommendation + study plan adjustments
- **Mastery formula:** Quiz score (60%) + Self-rating after (30%) + Session time (10%)
- **Also:** generates and updates the exam rescue plan in Flow 4

### Agent Flow
```
User Input
    ↓
Tutor Agent (RAG retrieval → teach in chunks → checkpoint + doubt prompt)
    ↓ (if ANSWER_DOUBT) → answer freeform question → resume
    ↓ (if QUIZ_READY)
Quiz Generator Agent (generate 5 MCQs → evaluate → feedback)
    ↓
Progress Tracking Agent (update mastery → update node color → recommend next → adjust rescue plan)
    ↓
MongoDB (persist) + React UI (render roadmap + dashboard)
```

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS (dark/light mode via `class`) |
| Fonts | Inter (body), JetBrains Mono (labels/code) |
| Routing | React Router v6 |
| Roadmap visual | React Flow |
| Auth | Google OAuth + JWT |
| Backend | Node.js + Express |
| AI orchestration | LangChain + LangGraph |
| LLM | OpenAI GPT-4o |
| Vector DB | Pinecone (free tier) |
| Primary DB | MongoDB Atlas (free tier) |
| File upload | Multer |
| Observability | LangSmith |
| Frontend deploy | Vercel |
| Backend deploy | Render / Railway |

---

## 8. 7-Day Build Plan

| Day | Focus | Person A — Frontend | Person B — Backend / AI |
|---|---|---|---|
| 1–2 | Foundation | Vite + React setup, Tailwind tokens (dark/light), Auth UI, file upload drop zone, chat shell layout | Express scaffold, MongoDB connect, PDF ingestion → chunking → embeddings → Pinecone, RAG retriever working |
| 3 | Tutor Agent | Streaming SSE chat UI, message bubbles, comprehension chips, doubt prompt input, SSE parser hook | Tutor Agent system prompt (explanationLevel + masteryLevel), LangGraph state graph, session memory, streaming endpoint |
| 4 | Quiz Agent | Quiz card component, MCQ renderer, lives bar, XP popup, score display, animated feedback | Quiz Generator Agent, difficulty adjustment, QuizResults saved to MongoDB |
| 5 | Progress + Dashboard | Dashboard page, mastery % display, React Flow node color update, mastery delta banner, rescue plan timeline | Progress Tracking Agent, mastery score formula, exam plan generator, StudyPlan schema |
| 6 | Polish | Onboarding wizard (3 steps + explanation level), roadmap polish, mobile responsive, loading skeletons | Error handling, LLM retry with backoff, cross-session memory, LangSmith tracing verified |
| 7 | Deploy + Demo | Vercel deploy, final UI fixes, demo rehearsal | Render deploy, env vars, architecture diagram, LangSmith traces ready for judges |

> **Rule:** Sync frontend ↔ backend every 24 hrs. Never let them diverge more than one day.

> **Scaling to 3 people?** Split "Backend / AI Dev" into: one handles Express routes + MongoDB + auth, the other handles LangGraph agents + Pinecone + prompt engineering.

---

## 9. Scope — Cut List

Features explicitly out of scope to protect delivery:

- ❌ Voice input / recording
- ❌ Multiple simultaneous syllabuses
- ❌ Leaderboards / social features
- ❌ Custom difficulty sliders (agent decides automatically)
- ❌ PDF export of study plan
- ❌ Fine-tuned models (strong prompts on GPT-4o is sufficient)
- ❌ Video / audio generation

---

## 10. Production Requirements Checklist

| | Requirement | Implementation |
|---|---|---|
| ✅ | Multi-Agent Architecture | Tutor + Quiz Generator + Progress Tracking via LangGraph |
| ✅ | Advanced RAG System | Pinecone + LangChain retrieval chain |
| ✅ | Tool Calling & External Integrations | File upload, vector DB, MongoDB |
| ✅ | Conversation & Long-Term Memory | Session memory (LangChain) + cross-session (MongoDB) |
| ✅ | Error Handling & Retry Mechanisms | LLM retry with exponential backoff |
| ✅ | File Upload & Processing Support | Multer + PDF/DOCX chunking pipeline |
| ✅ | Authentication & User Management | Google OAuth + JWT |
| ✅ | Production Deployment | Vercel (frontend) + Render (backend) |
| ✅ | Publicly Accessible URL | Live Vercel URL |
| ✅ | Observability | LangSmith agent traces |

---

## 11. Demo Script — 90 Seconds on Stage

| # | You do | Judges see |
|---|---|---|
| 1 | Upload a real college OS syllabus PDF | Full visual roadmap appears in ~10 sec. Colored topic nodes. **Money shot.** |
| 2 | Click one weak (gray) topic → tutor asks mastery rating | Personalization visible before teaching even starts |
| 3 | Midway through explanation say "I don't get it" | Tutor switches to analogy mode — completely different explanation |
| 4 | Complete topic → quiz appears → answer one right one wrong | Node turns yellow. Score updates live on roadmap. Mastery delta shown. |
| 5 | Say "my exam is in 3 days" | Rescue plan generates in seconds. Day-by-day schedule appears on dashboard. |
| 6 | Show dashboard | Full syllabus mastery overview. Clean finish. |

> Judges see RAG, multi-agent, adaptive AI, personalization, and memory — all in 90 seconds, without you explaining a single technical term.

---

## 12. Final Deliverables

- GitHub Repository — public, clean README, setup instructions
- Live Application URL — Vercel deployment
- Architecture Diagram — agent flow + data flow (Excalidraw, max 1 hr)
- Presentation Deck — 8–10 slides max
- 2–3 Minute Demo Video — screen record the demo script above
- Technical Documentation — see `TECHNICAL_ANALYSIS.md` for full API, agent prompts, data models
- Agent Workflow Documentation — LangGraph state graph with node descriptions

---

*Stack: React + Node.js + LangGraph + Pinecone + MongoDB | References: StudyFetch, Gizmo AI*