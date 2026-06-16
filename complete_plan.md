# NeuralNest — 4 Implementation Plans

> **Frontend Status:** ✅ Complete (React + CRA + Tailwind, 9 pages, all components built)  
> **Backend Status:** 🔴 Not started  
> **AI Agents Status:** 🔴 Not started (will be provided as JSON, converted to LangChain/LangGraph TS)

---

## Plan 1 of 4: Backend Setup (Express + TypeScript)

### Goal
Scaffold a production-ready Node.js/TypeScript backend with Express, MongoDB, Pinecone, file uploads, and all API routes — **without** the AI agent logic (that's Plan 2).

### Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.21 | HTTP server |
| `typescript` + `tsx` | ^5.5 / ^4.19 | TypeScript runtime + dev execution |
| `mongoose` | ^8.8 | MongoDB ODM |
| `multer` | ^1.4 | File upload middleware |
| `pdf-parse` | ^1.1 | PDF text extraction |
| `mammoth` | ^1.8 | DOCX text extraction |
| `@pinecone-database/pinecone` | ^4.0 | Vector store client |
| `jsonwebtoken` | ^9.0 | JWT auth |
| `google-auth-library` | ^9.14 | Google OAuth verification |
| `cors` | ^2.8 | CORS middleware |
| `helmet` | ^8.0 | Security headers |
| `morgan` | ^1.10 | HTTP request logging |
| `dotenv` | ^16.4 | Environment variable loading |
| `zod` | ^3.23 | Request body validation |

---

### File Structure

```
backend/
├── src/
│   ├── index.ts                     # Express entry point + server start
│   ├── app.ts                       # Express app factory (middleware, routes)
│   ├── config/
│   │   ├── db.ts                    # MongoDB connection (mongoose.connect)
│   │   ├── pinecone.ts              # Pinecone client initialization
│   │   └── env.ts                   # Validated env vars (zod schema)
│   ├── middleware/
│   │   ├── auth.ts                  # JWT verification middleware
│   │   ├── errorHandler.ts          # Global error handler (catches all throws)
│   │   └── validate.ts              # Zod request validation middleware
│   ├── routes/
│   │   ├── auth.routes.ts           # POST /api/auth/google, GET /api/auth/me
│   │   ├── upload.routes.ts         # POST /api/upload
│   │   ├── session.routes.ts        # POST /api/sessions, GET /api/sessions/:id/topics
│   │   ├── topic.routes.ts          # POST /api/topics/baseline
│   │   ├── tutor.routes.ts          # POST /api/tutor/chat (SSE), /api/tutor/open, /api/tutor/rating
│   │   ├── quiz.routes.ts           # POST /api/quiz/generate, /api/quiz/submit
│   │   ├── progress.routes.ts       # GET /api/progress/:userId, POST /api/progress/update, GET /api/roadmap/:sessionId
│   │   ├── studyplan.routes.ts      # POST /api/studyplan/generate, GET /api/studyplan/:userId, PATCH /api/studyplan/day/:dayId
│   │   ├── exam.routes.ts           # POST /api/exam/setup, /upload-syllabus, /upload-pyq, GET /api/exam/:userId
│   │   └── chatHistory.routes.ts    # GET /api/chat-history/:userId, POST, DELETE
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── session.controller.ts
│   │   ├── topic.controller.ts
│   │   ├── tutor.controller.ts      # Sets up SSE headers, calls agent (Plan 2), streams back
│   │   ├── quiz.controller.ts
│   │   ├── progress.controller.ts
│   │   ├── studyplan.controller.ts
│   │   ├── exam.controller.ts
│   │   └── chatHistory.controller.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Session.ts
│   │   ├── Topic.ts
│   │   ├── QuizResult.ts
│   │   ├── StudyPlan.ts
│   │   ├── Exam.ts
│   │   └── ChatHistory.ts
│   ├── pipelines/                   # Data processing (non-AI)
│   │   ├── ingest.ts                # PDF → chunks → embeddings → Pinecone
│   │   ├── retriever.ts             # Query embedding → Pinecone similarity search → context string
│   │   └── pyqParser.ts             # PYQ PDF → extract questions → count per topic
│   ├── agents/                      # Placeholder stubs — implemented in Plan 2
│   │   ├── index.ts                 # Re-exports all agents
│   │   ├── tutorAgent.ts            # Stub: returns mock streaming response
│   │   ├── quizAgent.ts             # Stub: returns mock 10 questions
│   │   ├── progressAgent.ts         # Stub: returns mock mastery delta
│   │   └── pyqAnalysisAgent.ts      # Stub: returns mock topic frequencies
│   └── types/
│       ├── index.ts                 # Shared TypeScript types
│       └── api.ts                   # Request/Response type definitions
├── package.json
├── tsconfig.json
├── .env.example                     # Template with all required env vars
└── nodemon.json                     # Dev server config
```

---

### MongoDB Models (Mongoose + TypeScript)

All 7 models from [TECHNICAL_ANALYSIS.md § 6](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1163-L1247):

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `googleId`, `email`, `name`, `avatar`, `explanationLevel`, `xp`, `streak`, `studyDays[]` | `explanationLevel` defaults to `'beginner'`. `studyDays` is an array of dates for heatmap. |
| **Session** | `userId`, `name`, `inputMethod`, `fileUrl`, `rawText`, `pineconeNamespace`, `examDate` | One session per uploaded syllabus/set of notes |
| **Topic** | `sessionId`, `userId`, `name`, `difficulty`, `estimatedMinutes`, `masteryScore` (0–100), `status` (unstarted/learning/mastered), `roadmapPosition` | React Flow node position stored here |
| **QuizResult** | `userId`, `topicId`, `questions[]`, `score`, `total`, `xpEarned`, `timeTaken`, `passed` | `passed = score/total >= 0.7` |
| **StudyPlan** | `userId`, `sessionId`, `examDate`, `days[]` with `{dayNumber, date, topics[], isMockExam, completed}` | Auto-regenerated when exam date changes |
| **Exam** | `userId`, `subject`, `examDate`, `syllabusSource` ('upload'/'web'), `pyqUploaded`, `topicFrequencies` | Stores PYQ analysis results |
| **ChatHistory** | `userId`, `sessionId`, `section` ('exam'/'roadmap'/'other'), `title`, `messages[]` | Groups chats for sidebar sections |

---

### Pipelines (Non-AI Data Processing)

#### `ingest.ts` — PDF → Pinecone
```
1. Multer saves PDF to /uploads/
2. pdf-parse extracts raw text
3. RecursiveCharacterTextSplitter(chunkSize: 1000, chunkOverlap: 200)
4. OpenAI text-embedding-3-small embeds each chunk
5. Pinecone upsert with metadata: { userId, sessionId, chunkIndex, text }
6. GPT-4o extracts topic list from full text (name + difficulty + time estimate)
7. Topics saved to MongoDB
8. Returns { topics[], roadmapNodes[] }
```

#### `retriever.ts` — RAG Query
```
1. Query string embedded via text-embedding-3-small
2. Pinecone query(topK: 5, filter: { userId, topicId })
3. Returns formatted context string for agent prompt injection
```

#### `pyqParser.ts` — PYQ Frequency Analysis
```
1. PDF text extracted
2. GPT-4o classifies each question by topic
3. Returns frequency map: { "CPU Scheduling": 12, "Memory Management": 8 }
```

---

### Key Implementation Details

**SSE Streaming (tutor.controller.ts):**
```typescript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

const stream = await tutorAgent.streamChat({ topicId, message, userId });
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
}
res.write('data: [DONE]\n\n');
res.end();
```

**Agent Stubs (for Plan 1):**
All agent files in `agents/` will be **stubs** that return mock data. This lets us test every route independently before the real LangGraph agents are wired in Plan 2.

---

### Steps

- [ ] 1. `mkdir backend && cd backend && npm init -y`
- [ ] 2. Install all dependencies (express, mongoose, multer, etc.)
- [ ] 3. Configure `tsconfig.json` with strict mode + paths
- [ ] 4. Create `src/config/env.ts` with Zod-validated env vars
- [ ] 5. Create `src/config/db.ts` — MongoDB connection
- [ ] 6. Create `src/config/pinecone.ts` — Pinecone client
- [ ] 7. Create `src/app.ts` — Express app with middleware (cors, helmet, morgan, JSON parser)
- [ ] 8. Create `src/index.ts` — Start server, connect DB
- [ ] 9. Create all 7 Mongoose models in `src/models/`
- [ ] 10. Create `src/middleware/auth.ts` — JWT verification
- [ ] 11. Create `src/middleware/errorHandler.ts` — Global error handler
- [ ] 12. Create `src/middleware/validate.ts` — Zod validation wrapper
- [ ] 13. Create `src/types/` — shared TypeScript interfaces
- [ ] 14. Create all 10 route files in `src/routes/`
- [ ] 15. Create all 10 controller files in `src/controllers/`
- [ ] 16. Create `src/pipelines/ingest.ts` — PDF → chunks → Pinecone
- [ ] 17. Create `src/pipelines/retriever.ts` — RAG retrieval
- [ ] 18. Create `src/pipelines/pyqParser.ts` — PYQ frequency counter
- [ ] 19. Create agent stubs in `src/agents/`
- [ ] 20. Create `.env.example` with all required variables
- [ ] 21. Verify: `npm run dev` starts without errors
- [ ] 22. Verify: all routes return mock data via Postman/curl

### Verification

```bash
# Start dev server
npm run dev

# Test auth
curl -X POST http://localhost:5000/api/auth/google -H "Content-Type: application/json" -d '{"token":"mock"}'

# Test upload
curl -X POST http://localhost:5000/api/upload -F "file=@test.pdf"

# Test tutor SSE
curl -N http://localhost:5000/api/tutor/chat -H "Content-Type: application/json" -d '{"topicId":"mock","message":"teach me"}'
```

---
---

## Plan 2 of 4: Convert JSON Agents → LangChain.js + LangGraph (TypeScript)

### Goal
Take the agent definitions (provided as JSON with prompts, inputs, outputs) and implement them as real LangChain.js + LangGraph TypeScript agents that replace the stubs from Plan 1.

### Tech Stack (AI-specific)

| Package | Purpose |
|---|---|
| `@langchain/core` | Base abstractions (prompts, output parsers) |
| `@langchain/openai` | ChatOpenAI model wrapper |
| `@langchain/langgraph` | State graph, nodes, edges, conditional routing |
| `@langchain/community` | Additional tools (web search for exam mode) |
| `@langchain/pinecone` | Pinecone vector store integration |
| `openai` | Direct OpenAI SDK (for embedding calls) |
| `langsmith` | Tracing + observability |
| `zod` | Structured output schemas |

---

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph State Graph                     │
│                                                              │
│  User Message                                                │
│       ↓                                                      │
│  ┌──────────────┐                                            │
│  │ Router Node  │ → Determines: TEACH / DOUBT / QUIZ_READY  │
│  └──────┬───────┘                                            │
│         ↓                                                    │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │ Tutor Agent Node │ OR │ Doubt Agent Node │                │
│  │ (RAG + teach)    │    │ (answer question) │                │
│  └──────┬───────────┘    └──────────────────┘                │
│         ↓                                                    │
│    If QUIZ_READY:                                            │
│  ┌──────────────────────┐                                    │
│  │ Quiz Generator Node  │                                    │
│  │ (10 MCQs, structured │                                    │
│  │  JSON output)        │                                    │
│  └──────┬───────────────┘                                    │
│         ↓                                                    │
│    After quiz submitted:                                     │
│  ┌──────────────────────┐                                    │
│  │ Progress Tracker Node│                                    │
│  │ (mastery calc + plan)│                                    │
│  └──────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### File Structure (inside `backend/src/agents/`)

```
agents/
├── index.ts                    # Re-exports all agent functions
├── state.ts                    # LangGraph state type definition (Annotation)
├── graph.ts                    # Main StateGraph definition + compilation
├── nodes/
│   ├── router.ts               # Routes user input → TEACH / DOUBT / QUIZ_READY
│   ├── tutorNode.ts            # RAG retrieval + GPT-4o teaching chunk (streaming)
│   ├── doubtNode.ts            # Freeform question answering
│   ├── quizGeneratorNode.ts    # Generates 10 MCQs with structured output (Zod)
│   ├── progressTrackerNode.ts  # Mastery calculation + study plan update
│   └── pyqAnalysisNode.ts      # PYQ PDF → topic frequency
├── prompts/
│   ├── tutorPrompt.ts          # Tutor system prompt template
│   ├── quizPrompt.ts           # Quiz generator system prompt
│   ├── progressPrompt.ts       # Progress tracker system prompt
│   └── pyqPrompt.ts            # PYQ analysis prompt
└── tools/
    ├── webSearchTool.ts        # Tavily/SerpAPI for exam syllabus web search fallback
    └── pineconeRetrieverTool.ts # RAG retrieval as a LangGraph tool
```

---

### LangGraph State Definition

```typescript
// state.ts
import { Annotation } from "@langchain/langgraph";

const AgentState = Annotation.Root({
  // Input
  userId: Annotation<string>,
  topicId: Annotation<string>,
  topicName: Annotation<string>,
  message: Annotation<string>,
  messageType: Annotation<"teach" | "doubt">,
  
  // Context
  ragContext: Annotation<string>,
  chatHistory: Annotation<Array<{role: string, content: string}>>,
  explanationLevel: Annotation<"beginner" | "intermediate" | "advanced">,
  masteryScore: Annotation<number>,
  
  // Tutor output
  explanation: Annotation<string>,
  checkpointQuestion: Annotation<string>,
  nextAction: Annotation<"CONTINUE" | "GO_DEEPER" | "GO_SIMPLER" | "ANSWER_DOUBT" | "QUIZ_READY">,
  
  // Quiz output
  questions: Annotation<Array<{q: string, options: string[], correct: number, explanation: string}>>,
  
  // Progress output
  masteryDelta: Annotation<{before: number, after: number}>,
  nodeColorUpdate: Annotation<"unstarted" | "learning" | "mastered">,
  nextTopicRecommendation: Annotation<{topicId: string, topicName: string, reason: string}>,
  studyPlanUpdate: Annotation<Record<string, string[]>>,
});
```

---

### Each Agent Node — What It Does

#### Router Node
- Reads `messageType` from request
- If `messageType === 'doubt'` → route to Doubt Node
- If user sent comprehension chip `QUIZ_READY` → route to Quiz Generator
- Otherwise → route to Tutor Node

#### Tutor Node (`tutorNode.ts`)
1. Retrieves RAG context from Pinecone via `retriever.ts`
2. Builds system prompt with explanation level, mastery score, RAG context, chat history
3. Calls `ChatOpenAI` with streaming enabled
4. Returns structured JSON: `{ explanation, checkpoint_question, doubt_prompt, next_action, explanation_mode }`
5. **Streaming:** The controller streams each token via SSE as it arrives

#### Quiz Generator Node (`quizGeneratorNode.ts`)
1. Takes concepts covered from the tutor session
2. Builds prompt with difficulty calibration based on mastery level
3. Calls `ChatOpenAI` with `withStructuredOutput()` using Zod schema
4. Returns exactly 10 MCQs in structured JSON format

#### Progress Tracker Node (`progressTrackerNode.ts`)
1. Receives quiz score, self-ratings, session duration
2. Calculates mastery: `score × 0.6 + selfRating × 0.3 + engagement × 0.1`
3. Determines node color: `>= 70 → mastered`, else `learning`
4. If exam date exists → regenerates rescue plan (sort by weakest topics)
5. Returns mastery delta + node color update + next topic + study plan

#### PYQ Analysis Node (`pyqAnalysisNode.ts`)
1. Takes extracted PYQ text
2. GPT-4o classifies each question by topic
3. Returns frequency map + priority weights

---

### Steps

- [ ] 1. Install LangChain/LangGraph packages: `@langchain/core`, `@langchain/openai`, `@langchain/langgraph`, `@langchain/pinecone`
- [ ] 2. Create `agents/state.ts` — LangGraph Annotation state type
- [ ] 3. Create `agents/prompts/tutorPrompt.ts` — Tutor system prompt (from [TECHNICAL_ANALYSIS.md § 5](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1006-L1057))
- [ ] 4. Create `agents/prompts/quizPrompt.ts` — Quiz generator prompt
- [ ] 5. Create `agents/prompts/progressPrompt.ts` — Progress tracker prompt
- [ ] 6. Create `agents/nodes/router.ts` — Route: teach / doubt / quiz_ready
- [ ] 7. Create `agents/nodes/tutorNode.ts` — RAG + streaming GPT-4o
- [ ] 8. Create `agents/nodes/doubtNode.ts` — Freeform Q&A
- [ ] 9. Create `agents/nodes/quizGeneratorNode.ts` — 10 MCQ structured output
- [ ] 10. Create `agents/nodes/progressTrackerNode.ts` — Mastery calc + study plan
- [ ] 11. Create `agents/nodes/pyqAnalysisNode.ts` — PYQ frequency counter
- [ ] 12. Create `agents/tools/pineconeRetrieverTool.ts` — RAG tool wrapper
- [ ] 13. Create `agents/tools/webSearchTool.ts` — Web search fallback (exam mode)
- [ ] 14. Create `agents/graph.ts` — Wire all nodes into LangGraph StateGraph
- [ ] 15. Replace stub agents with real agents in controllers
- [ ] 16. Enable LangSmith tracing (`LANGCHAIN_TRACING_V2=true`)
- [ ] 17. Verify: Tutor agent streams tokens correctly
- [ ] 18. Verify: Quiz agent returns exactly 10 valid MCQs
- [ ] 19. Verify: Progress agent calculates mastery and updates MongoDB
- [ ] 20. Verify: Traces appear in LangSmith dashboard

### Converting JSON → LangChain/LangGraph

When you receive the agent definitions as JSON, the conversion pattern is:

```
JSON Definition                    →   LangChain/LangGraph TypeScript
────────────────────────────────       ──────────────────────────────
system_prompt: "..."               →   ChatPromptTemplate.fromMessages([["system", "..."]])
input: { topicName, mastery }      →   LangGraph Annotation state fields
output: { explanation, quiz }      →   Zod schema + withStructuredOutput()
model: "gpt-4o"                    →   new ChatOpenAI({ model: "gpt-4o", temperature: 0.7 })
tools: ["web_search"]              →   TavilySearchTool() bound to node
```

### Verification

```bash
# Test tutor streaming
curl -N -X POST http://localhost:5000/api/tutor/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"topicId":"<id>","message":"explain CPU scheduling","type":"teach"}'
# Should stream SSE tokens word by word

# Test quiz generation
curl -X POST http://localhost:5000/api/quiz/generate \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"topicId":"<id>"}'
# Should return { questions: [...10 items] }

# Verify LangSmith
# Go to smith.langchain.com → project "neuralnest-os" → see traces
```

---
---

## Plan 3 of 4: Frontend ↔ Backend ↔ AI Integration

### Goal
Wire the existing React frontend to the live Express backend and LangGraph agents. Replace all mock/hardcoded data with real API calls.

---

### What's Already Built (Frontend)

| Page | File | Status |
|---|---|---|
| Landing | [Landing.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Landing.jsx) | ✅ UI complete |
| Onboarding | [Onboarding.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Onboarding.jsx) | ✅ UI complete |
| Dashboard | [Dashboard.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Dashboard.jsx) | ✅ UI complete |
| Roadmap | [Roadmap.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Roadmap.jsx) | ✅ UI complete |
| AI Tutor | [Tutor.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Tutor.jsx) | ✅ UI complete |
| Quiz | [Quiz.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Quiz.jsx) | ✅ UI complete |
| Exam Mode | [ExamMode.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/ExamMode.jsx) | ✅ UI complete |
| Active Quizzes | [ActiveQuizzes.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/ActiveQuizzes.jsx) | ✅ UI complete |
| Profile | [Profile.jsx](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Profile.jsx) | ✅ UI complete |

---

### Integration Steps (by feature flow)

#### Flow A: Auth (Google OAuth → JWT)
1. **Frontend:** Landing page → "Sign in with Google" button calls `@react-oauth/google`
2. **API call:** `POST /api/auth/google` with Google ID token
3. **Backend:** Verify token via `google-auth-library` → find/create user → return JWT
4. **Frontend:** Store JWT in localStorage + AuthContext → redirect to `/dashboard`
5. **All subsequent calls:** `Authorization: Bearer <jwt>` header via Axios interceptor

#### Flow B: Onboarding (Upload → Topics → Ratings)
1. **Step 1 upload:** `POST /api/upload` with FormData (PDF file)
   - Backend runs `ingest.ts` → extracts topics → returns `{ topics[], roadmapNodes[] }`
2. **Step 2 level:** Stored client-side, sent with baseline ratings
3. **Step 3 ratings:** `POST /api/topics/baseline` with `{ topicId, selfRating }[]`
   - Also sends `explanationLevel` to `PATCH /api/auth/me`
4. **Redirect:** → `/dashboard`

#### Flow C: Dashboard (Real Data)
1. **On mount:** Parallel API calls:
   - `GET /api/progress/:userId` → mastery scores for ring + table
   - `GET /api/studyplan/:userId` → rescue timeline (if exam set)
   - `GET /api/roadmap/:sessionId` → topic list for mastery table
2. **AI Recommendation:** Backend picks topic with lowest mastery
3. **Continue card:** Last session from `GET /api/chat-history/:userId`

#### Flow D: Roadmap (React Flow + Live Node Colors)
1. `GET /api/roadmap/:sessionId` → returns nodes with `{ id, label, status, position, edges[] }`
2. React Flow renders nodes with correct colors (gray/yellow/green)
3. On node click → popup card with topic data
4. "Start Learning" → navigate to `/tutor/:topicId`
5. "Test my Skills" → navigate to `/quiz/:topicId`

#### Flow E: Tutor Chat (SSE Streaming)
1. User types message → `POST /api/tutor/chat` with `{ topicId, message, type: 'teach'|'doubt' }`
2. **Frontend SSE handler:**
```javascript
const eventSource = new EventSource('/api/tutor/chat', { method: 'POST', body: ... });
// OR manual fetch with ReadableStream:
const response = await fetch('/api/tutor/chat', { method: 'POST', ... });
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // Parse SSE "data: {...}" lines → append tokens to message state
}
```
3. Comprehension chips → send chip value as next message
4. "Understood" → `CONTINUE`, "Need more help" → `GO_SIMPLER`, "Go deeper" → `GO_DEEPER`

#### Flow F: Quiz (Generate + Submit + Node Update)
1. `POST /api/quiz/generate` → returns `{ questions: [...10], timeLimit: 600 }`
2. Timer starts on frontend. User answers each question.
3. `POST /api/quiz/submit` → sends `{ topicId, answers: [...] }`
4. Backend: Quiz Agent scores → Progress Agent calculates mastery → MongoDB update
5. Response: `{ score, total, passed, masteryDelta, nodeColorUpdate, xpEarned }`
6. Frontend: Animate node color change on roadmap, show mastery delta banner

#### Flow G: Exam Mode (Setup + PYQ + Roadmap)
1. `POST /api/exam/setup` → `{ subject, examDate }`
2. `POST /api/exam/upload-syllabus` → FormData (PDF) OR skip (triggers web search)
3. `POST /api/exam/upload-pyq` → FormData (PDF)
4. Backend chains: ingest → PYQ analysis → topic extraction → study plan → roadmap nodes
5. Frontend: Redirects to exam roadmap (same as `/roadmap` but with PYQ badges)

---

### Frontend Changes Required

| File | Change |
|---|---|
| `package.json` | Add `axios`, `@react-oauth/google`, `eventsource-parser` |
| `src/context/AuthContext.js` | Wire to real JWT auth (currently mock) |
| `src/hooks/` | Create `useApi()` hook with Axios instance + JWT interceptor |
| Every page component | Replace hardcoded mock data with `useEffect` → API calls |
| `Tutor.jsx` | Add SSE streaming logic for real-time word-by-word rendering |
| `Quiz.jsx` | POST to real quiz endpoints instead of local mock questions |
| `Roadmap.jsx` | GET real nodes from API, update colors on quiz completion |

### CORS Configuration (Backend)

```typescript
// app.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

### Steps

- [ ] 1. Add API client packages to frontend (`axios`, `@react-oauth/google`)
- [ ] 2. Create `frontend/src/api/client.ts` — Axios instance with JWT interceptor
- [ ] 3. Create `frontend/src/api/` endpoint modules (auth, tutor, quiz, progress, etc.)
- [ ] 4. Wire `AuthContext` to real Google OAuth + JWT flow
- [ ] 5. Wire Landing page → real Google sign-in
- [ ] 6. Wire Onboarding → real upload + baseline endpoints
- [ ] 7. Wire Dashboard → real progress + study plan data
- [ ] 8. Wire Roadmap → real node/edge data from API
- [ ] 9. Wire Tutor → real SSE streaming with `fetch` ReadableStream
- [ ] 10. Wire Quiz → real quiz generate + submit endpoints
- [ ] 11. Wire Exam Mode → real setup + upload chain
- [ ] 12. Wire Active Quizzes → real quiz history data
- [ ] 13. Wire Profile → real user data + heatmap from study days
- [ ] 14. Wire Chat History sidebar → real grouped chat sessions
- [ ] 15. End-to-end test: Upload PDF → see roadmap → study topic → take quiz → node turns green

### Verification

```
1. Start backend: cd backend && npm run dev (port 5000)
2. Start frontend: cd frontend && npm start (port 3000)
3. Sign in with Google → lands on Dashboard with real data
4. Upload a PDF → topics appear on Roadmap
5. Click a topic → AI Tutor streams real explanations
6. Take a quiz → node color updates live
7. Set exam date → rescue plan generates
```

---
---

## Plan 4 of 4: Deployment

### Goal
Deploy the full stack to production: frontend on Vercel, backend on Render/Railway, MongoDB Atlas, Pinecone Cloud.

---

### Architecture Diagram

```
┌────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Vercel CDN   │  HTTPS │   Render/Railway  │        │   MongoDB Atlas   │
│   (Frontend)   │───────→│   (Backend API)   │───────→│   (Primary DB)    │
│   React SPA    │  /api  │   Express + TS    │        │                   │
└────────────────┘        │   + LangGraph     │        └──────────────────┘
                          │                   │
                          │                   │───────→┌──────────────────┐
                          │                   │        │   Pinecone       │
                          └───────────────────┘        │   (Vector DB)    │
                                    │                  └──────────────────┘
                                    │
                                    ├───────→ OpenAI API (GPT-4o + embeddings)
                                    ├───────→ Google OAuth (token verification)
                                    └───────→ LangSmith (tracing)
```

---

### Platform Choices

| Component | Platform | Why |
|---|---|---|
| **Frontend** | **Vercel** | Free tier, automatic deployments from GitHub, perfect for React SPAs, global CDN |
| **Backend** | **Render** (recommended) or Railway | Free tier with 750 hrs/month, auto-deploy from GitHub, supports Docker, easy env vars. Railway is the alternative if you prefer simpler DX. |
| **Database** | **MongoDB Atlas** | Free M0 tier (512MB), managed, auto-backups, global clusters |
| **Vector DB** | **Pinecone** | Free starter tier (100k vectors), serverless, no infra management |
| **File Storage** | **Cloudinary** (or S3) | For uploaded PDFs — don't store on Render (ephemeral filesystem). Free tier: 25GB. |
| **Domain** | **Custom domain** (optional) | `neuralnest.app` or `neuralnest.study` — pointed at Vercel (frontend) + Render (API) |

---

### Step-by-Step Deployment

#### A. MongoDB Atlas Setup
1. Create free M0 cluster on [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user + password
3. Whitelist `0.0.0.0/0` (or Render IPs specifically)
4. Get connection string → set as `MONGODB_URI` env var

#### B. Pinecone Setup
1. Create free account on [pinecone.io](https://pinecone.io)
2. Create index: name = `neuralnest-os`, dimension = `1536` (text-embedding-3-small), metric = `cosine`
3. Get API key → set as `PINECONE_API_KEY` env var

#### C. Backend Deployment (Render)
1. Push `backend/` to GitHub repo
2. Create new **Web Service** on Render:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (runs compiled JS from `dist/`)
   - **Root Directory:** `backend`
3. Set environment variables:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
JWT_SECRET=<random-64-char-string>
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=neuralnest-os
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_...
LANGCHAIN_PROJECT=neuralnest-os
FRONTEND_URL=https://neuralnest.vercel.app
```
4. Deploy → get URL like `https://neuralnest-api.onrender.com`

#### D. Frontend Deployment (Vercel)
1. Push `frontend/` to GitHub repo (same repo, different directory)
2. Import project on [vercel.com](https://vercel.com):
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Set environment variables:
```
REACT_APP_API_URL=https://neuralnest-api.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=...
```
4. Deploy → get URL like `https://neuralnest.vercel.app`

#### E. Google OAuth Setup (Production)
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID:
   - **Authorized JavaScript origins:** `https://neuralnest.vercel.app`
   - **Authorized redirect URIs:** `https://neuralnest.vercel.app`
3. Update `GOOGLE_CLIENT_ID` in both frontend and backend env vars

#### F. Custom Domain (Optional)
1. Buy domain (e.g., `neuralnest.study`)
2. On Vercel: Add custom domain → point DNS A record to Vercel
3. On Render: Add custom domain `api.neuralnest.study` → point DNS CNAME
4. Update `FRONTEND_URL` on backend to custom domain
5. Update `REACT_APP_API_URL` on frontend to `https://api.neuralnest.study`

---

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy NeuralNest

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: npm test

  # Vercel auto-deploys on push — no manual step needed
  # Render auto-deploys on push — no manual step needed
```

---

### Production Checklist

| # | Item | Status |
|---|---|---|
| 1 | MongoDB Atlas M0 cluster created | ⬜ |
| 2 | Pinecone index created (1536 dim, cosine) | ⬜ |
| 3 | Google OAuth credentials for production domain | ⬜ |
| 4 | Backend deployed on Render with all env vars | ⬜ |
| 5 | Frontend deployed on Vercel with `REACT_APP_API_URL` | ⬜ |
| 6 | CORS allows production frontend URL | ⬜ |
| 7 | JWT_SECRET is a strong random 64-char string | ⬜ |
| 8 | Rate limiting on `/api/tutor/chat` (prevent API cost abuse) | ⬜ |
| 9 | File upload size limit (10MB max) | ⬜ |
| 10 | LangSmith traces appearing for production calls | ⬜ |
| 11 | HTTPS enforced everywhere | ⬜ |
| 12 | Error monitoring (Sentry free tier — optional) | ⬜ |
| 13 | Custom domain configured (optional) | ⬜ |
| 14 | End-to-end test on production URL works | ⬜ |

---

> [!IMPORTANT]
> **Execution order:** Plan 1 → Plan 2 → Plan 3 → Plan 4. Each plan depends on the previous.  
> **Estimated timeline:** Plan 1 (1–2 days) → Plan 2 (2–3 days) → Plan 3 (1–2 days) → Plan 4 (half day)

## Open Questions

> [!WARNING]
> **File storage for uploaded PDFs:** Render has ephemeral storage — files are lost on redeploy. Do you want to use **Cloudinary** (free 25GB) or **AWS S3** for persistent PDF storage? Or should we process PDFs immediately and delete the file after ingestion?

> [!IMPORTANT]
> **Google OAuth Client ID:** Do you already have a Google Cloud project with OAuth credentials set up? If not, we'll need to create one before Plan 3.

> [!NOTE]
> **Render cold starts:** Free tier Render instances spin down after 15 min of inactivity. First request takes ~30 seconds to wake up. If this is unacceptable, consider the $7/month Starter plan. Railway's free tier doesn't have this issue.
