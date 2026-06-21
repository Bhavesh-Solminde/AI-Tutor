# NeuralNest-OS — Sections 14–15: Complete AI Flow Traces + What's Broken

> **Ground rule:** Every step traces to actual code. No examples from general knowledge.

---

## SECTION 14: Complete AI Flow Traces

---

### FLOW A: User Uploads a PDF for the First Time

---

#### A1. Frontend: File Input

**Component:** [Onboarding.jsx L126-131](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Onboarding.jsx#L126-L131)

```jsx
{inputType === 'pdf' && (
  <DropZone
    selectedFileName={selectedFile?.name}
    onFileSelected={(file) => setSelectedFile(file)}
  />
)}
```

When user clicks **"Next Step"** at step 1 with `inputType === 'pdf'`:

**File:** [Onboarding.jsx L43-48](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Onboarding.jsx#L43-L48)

```jsx
const formData = new FormData();
formData.append('file', selectedFile);           // The actual File object
formData.append('sessionName', selectedFile.name); // e.g. "OS_Notes.pdf"
await uploadFile(formData);
```

**The FormData object contains:**
```
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="OS_Notes.pdf"
Content-Type: application/pdf
<binary PDF data>
------WebKitFormBoundary
Content-Disposition: form-data; name="sessionName"
OS_Notes.pdf
------WebKitFormBoundary--
```

**Store call:** [useSessionStore.js L50-77](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useSessionStore.js#L50-L77)

```javascript
const { data } = await api.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 120_000,  // 2-minute timeout for Cloudinary + Pinecone
});
```

**Endpoint:** `POST /api/upload`

---

#### A2. Backend: Multer + Controller

**Route:** [upload.routes.ts L33](file:///Users/solminde/Developer/Ai-tutor/backend/src/routes/upload.routes.ts#L33)

```typescript
router.post("/", authMiddleware, upload.single("file"), uploadFile);
```

Multer intercepts the multipart request, validates the file type ([upload.routes.ts L18-24](file:///Users/solminde/Developer/Ai-tutor/backend/src/routes/upload.routes.ts#L18-L24)), and stores the file in memory (`memoryStorage()`). Max 10MB.

**Controller entry:** [upload.controller.ts L46](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L46) — `uploadFile()`

```typescript
const file = req.file;                              // multer file object
const { sessionName, inputMethod, referenceOnly } = req.body;
const userId = req.userId!;                         // from JWT middleware
```

---

#### A3. Session creation + Pinecone ingestion

**Step 1 — Create Session:** [upload.controller.ts L62-69](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L62-L69)

```typescript
const namespace = `${userId}_${new mongoose.Types.ObjectId()}`;
const session = await Session.create({ userId, name: "OS_Notes.pdf", inputMethod: "pdf",
  pineconeNamespace: namespace, isReference: false });
```

**Step 2 — ingestPDFEmbedOnly:** [upload.controller.ts L116](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L116) calls [ingest.ts L45-57](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L45-L57):

```
uploadPdfToCloudinary(buffer, "OS_Notes.pdf")  →  fileUrl (Cloudinary URL)
pdfParse(buffer)                               →  rawText (all pages concatenated)
Session.findByIdAndUpdate(sessionId, { fileUrl, rawText })
embedText(rawText, userId, sessionId)          →  chunk + Pinecone upsert
```

**Step 3 — embedText:** [ingest.ts L15-26](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L15-L26):

```typescript
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
const chunks = await splitter.createDocuments([rawText], [{ userId, sessionId }]);
await PineconeStore.fromDocuments(chunks, cohereEmbeddings, { pineconeIndex, namespace });
```

---

#### A4. Response + Background Topic Extraction

**HTTP response sent immediately:** [upload.controller.ts L149-156](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L149-L156)

```json
{
  "sessionId": "6853a1b2c3d4e5f6a7b8c9d0",
  "sessionName": "OS_Notes.pdf",
  "fileUrl": "https://res.cloudinary.com/dxxx/raw/upload/.../OS_Notes.pdf",
  "topics": [],
  "roadmapNodes": [],
  "processing": true
}
```

**Fire-and-forget topic extraction:** [upload.controller.ts L159](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L159)

```typescript
extractAndSaveTopics(rawText, userId, session._id.toString());
```

This calls [topicExtractor.ts L25-90](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/topicExtractor.ts#L25-L90) which sends the full raw text (up to 60,000 chars) to **GPT-4.1** with `withStructuredOutput(topicSchema)`:

```typescript
const model = new ChatOpenAI({ model: "gpt-4.1", temperature: 0.2 });
const structuredModel = model.withStructuredOutput(topicSchema);
```

**The exact system prompt sent to GPT-4.1:** (from [topicExtractor.ts L48-67](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/topicExtractor.ts#L48-L67))

```
You are an expert curriculum designer and educational content analyst.
Your task is to extract a COMPREHENSIVE, GRANULAR list of study topics...
## CRITICAL RULES:
1. Extract EVERY distinct concept, algorithm, technique — aim for 30 to 60 nodes.
2. Work at the SUBTOPIC level, NOT the chapter level.
   ❌ "CPU Scheduling" (too broad)
   ✅ "Round Robin Scheduling", "FCFS Scheduling", "Priority Scheduling"
...
```

**Structured output schema:** [topicExtractor.ts L8-16](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/topicExtractor.ts#L8-L16)

```typescript
z.object({
  topics: z.array(z.object({
    name: z.string(),                              // "Round Robin Scheduling"
    difficulty: z.enum(["easy", "medium", "hard"]), // "medium"
    estimatedMinutes: z.number().int().min(5).max(120), // 25
  }))
})
```

**GPT-4.1 returns** (enforced by Zod):
```json
{
  "topics": [
    { "name": "Process Lifecycle States", "difficulty": "easy", "estimatedMinutes": 15 },
    { "name": "FCFS Scheduling", "difficulty": "medium", "estimatedMinutes": 25 },
    { "name": "Round Robin Scheduling", "difficulty": "medium", "estimatedMinutes": 30 },
    ...  // 30-60 topics total
  ]
}
```

**Topics saved to MongoDB:** [upload.controller.ts L25-34](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L25-L34)

```typescript
await Topic.insertMany(
  extractedTopics.map((t, index) => ({
    sessionId: new mongoose.Types.ObjectId(sessionId),
    userId: new mongoose.Types.ObjectId(userId),
    name: t.name,
    difficulty: t.difficulty,
    estimatedMinutes: t.estimatedMinutes,
    roadmapPosition: { x: 250, y: index * 150 },  // Vertical stack, 150px apart
  }))
);
```

---

#### A5. Frontend Polling + Roadmap Rendering

**When `data.processing === true`:** [useSessionStore.js L61-71](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useSessionStore.js#L61-L71)

```javascript
if (data.processing) {
  set({ topicsProcessing: true });
  pollForTopics(data.sessionId, (topics) => {
    const nodes = topics.map((t, i) => ({
      id: t._id, label: t.name, status: 'unstarted',
      position: { x: 250, y: i * 150 }, difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
    }));
    set({ topics, roadmapNodes: nodes, topicsProcessing: false });
  });
}
```

`pollForTopics` calls `GET /api/sessions/${sessionId}/topics` every **3 seconds** for up to **3 minutes** (60 attempts). When topics appear, it updates the store.

**When Onboarding proceeds to step 3**, [Onboarding.jsx L207-217](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Onboarding.jsx#L207-L217) renders a `MasteryRatingSlider` for each topic. After the user rates them and clicks "Generate Roadmap", `saveBaseline()` is called.

**When the user reaches the Roadmap page:** [Roadmap.jsx L21-25](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Roadmap.jsx#L21-L25) calls `fetchRoadmap(currentSession._id)`, which hits `GET /api/roadmap/${sessionId}` → [progress.controller.ts L42-80](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/progress.controller.ts#L42-L80) builds nodes + sequential edges → `RoadmapCanvas` renders them with React Flow.

---

### FLOW B: User Starts a Tutor Session (Clicks Topic Node → Start Learning)

---

#### B1. Frontend: Click Handler

**User clicks a topic node on the Roadmap:** [Roadmap.jsx L109](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Roadmap.jsx#L109)

```jsx
onStartTopic={(topic) => navigate(`/tutor/${topic._id || topic.id}?section=roadmap`)}
```

This navigates to `/tutor/6853f1a2b3c4...?section=roadmap`.

---

#### B2. Tutor.jsx mounts and resolves topic

**File:** [Tutor.jsx L43-107](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Tutor.jsx#L43-L107)

The `useEffect` fires on mount:

```
1. clearMessages()              — reset the chat
2. setChatHistoryId(null)       — clear any previous chat
3. GET /api/topics/${topicId}   — fetch topic name from MongoDB
4. findChatByTopicId(topicId)   — GET /api/chat-history/by-topic/${topicId}
5. If existing chat found:
     setChatHistoryId(existing._id)
     loadMessages(existing._id) — GET /api/chat-history/messages/${chatId}
6. If no existing chat:
     createChat({ sessionId, topicId, section: "roadmap", title: topicName })
     → POST /api/chat-history   (findOrCreate)
```

**No AI call is made yet.** The user sees the empty Tutor screen with "Start Teaching →" button.

---

#### B3. User clicks "Start Teaching" → sendMessage fires

**File:** [Tutor.jsx L159-161](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Tutor.jsx#L159-L161)

```javascript
const startTeachingText = `Start teaching me about ${topicName} from the beginning.`;
```

**sendMessage in useTutorStore:** [useTutorStore.js L54-160](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useTutorStore.js#L54-L160)

```javascript
// Optimistic UI: add user bubble immediately
set(state => ({ messages: [...state.messages, { sender: 'user', text: message }] }));
// Add empty AI bubble
set(state => ({ messages: [...state.messages, { sender: 'ai', text: '', isStreaming: true }] }));
// SSE request via fetch (not axios — axios doesn't support streaming)
const res = await createSSERequest('/api/tutor/chat', {
  topicId, message, type: 'teach', chatHistoryId, materialSessionIds: [],
});
```

---

#### B4. Backend: Controller loads ALL context before calling graph

**File:** [tutor.controller.ts L14-89](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L14-L89)

**Every MongoDB query before `runTutorGraph()`:**

```
Query 1: User.findById(userId)           → user.explanationLevel ("beginner")
Query 2: Topic.findById(topicId)          → topic.name, topic.masteryScore, topic.sessionId, topic.status
Query 3: ChatHistory.findById(chatHistoryId) → chat.messages (previous conversation)
Query 4: Session.find({ _id: { $in: materialSessionIds }, userId }) → materialSessions[].pineconeNamespace
```

**The EXACT state object passed to `graph.invoke()`:**

```typescript
const result = await runTutorGraph({
  userId:              "6712ab3f4e5d6c7b8a9f0e1d",
  topicId:             "6853f1a2b3c4d5e6f7a8b9c0",
  topicName:           "Round Robin Scheduling",
  message:             "Start teaching me about Round Robin Scheduling from the beginning.",
  messageType:         "teach",
  explanationLevel:    "beginner",
  masteryScore:        10,              // User rated it 1/10 during baseline
  chatHistory:         [],              // First message — empty history
  sessionId:           "6853a1b2c3d4e5f6a7b8c9d0",
  materialNamespaces:  [],              // No extra materials attached
  currentDateTime:     "2026-06-19T06:40:00.000Z",
});
```

---

#### B5. LangGraph: Router → tutorNode

**Router decision:** [router.ts L15-25](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/router.ts#L15-L25)

```typescript
export function routeMessage(state): "tutorNode" | "doubtNode" | "quizGeneratorNode" {
  if (state.message === "QUIZ_READY" || state.nextAction === "QUIZ_READY") return "quizGeneratorNode";
  if (state.messageType === "doubt") return "doubtNode";
  return "tutorNode";  // ← THIS fires. messageType is "teach"
}
```

**tutorNode runs:** [tutorNode.ts L13-122](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L13-L122)

**Step 1 — RAG retrieval:**
```typescript
allNamespaces = ["6712ab3f..._6853a1b2..."];  // one namespace
ragContext = await retrieveContext("Start teaching me about Round Robin Scheduling...",
  "6712ab3f...", "6853a1b2...");
```

This embeds the query via Cohere, queries Pinecone, and returns 5 chunks formatted as:
```
[Chunk 1]
Round Robin (RR) scheduling uses a time quantum...
---
[Chunk 2]
The time quantum in RR is typically 10-100ms...
...
```

**Step 2 — Build system prompt** with all placeholders replaced:

```
You are NeuralNest, an adaptive AI tutor...
CURRENT DATE AND TIME: 2026-06-19T06:40:00.000Z
⚠️ STRICT GUARDRAILS...
TEACHING RULES:
- Use the mastery score (10/10) to calibrate depth: lower score = simpler...
EXPLANATION LEVEL: beginner
CONTEXT FROM THEIR UPLOADED MATERIAL:
[Chunk 1]
Round Robin (RR) scheduling uses a time quantum...
---
[Chunk 2]
...
CONVERSATION STATUS: This is the start of the conversation.
CURRENT TOPIC: Round Robin Scheduling
CRITICAL OUTPUT FORMAT: You MUST output ONLY a raw JSON object...
```

**Step 3 — Call GPT-4o** at temperature 0.7 with `response_format: { type: "json_object" }`:

```typescript
const response = await model.invoke([
  { role: "system", content: systemPrompt },
  // No history messages (empty chat)
  { role: "user", content: "Start teaching me about Round Robin Scheduling from the beginning." },
]);
```

**GPT-4o returns a raw JSON string:**
```json
{
  "explanation": "## What is Round Robin Scheduling?\n\n> **Round Robin (RR)** is a CPU scheduling algorithm...\n\nImagine a teacher in a classroom...",
  "checkpoint_question": "If the time quantum is 4ms and a process needs 10ms of CPU time, how many times will this process be moved to the back of the queue?",
  "doubt_prompt": "Do you have any doubts or questions before we move on?",
  "next_action": "CONTINUE",
  "explanation_mode": "standard"
}
```

**Step 4 — Parse:** [tutorNode.ts L74-112](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L74-L112) uses 3-strategy parsing:

1. Strip markdown fences → extract first `{...}` → `JSON.parse` → check `obj.explanation` exists
2. Plain `JSON.parse` after fence removal
3. Fallback: treat entire raw content as explanation text

---

#### B6. SSE Streaming

**File:** [tutor.controller.ts L92-106](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L92-L106)

```typescript
const words = result.explanation.split(" ");
for (const word of words) {
  res.write(`data: ${JSON.stringify({ token: word + " " })}\n\n`);
  await new Promise((r) => setTimeout(r, 30));  // 30ms per word
}
// Send structured metadata
res.write(`data: ${JSON.stringify({
  done: true,
  checkpointQuestion: result.checkpointQuestion,
  doubtPrompt: result.doubtPrompt,
  nextAction: result.nextAction,
  explanationMode: result.explanationMode,
})}\n\n`);
res.write("data: [DONE]\n\n");
```

**Exact wire format of each SSE message:**
```
data: {"token":"## "}

data: {"token":"What "}

data: {"token":"is "}

data: {"token":"Round "}

...

data: {"done":true,"checkpointQuestion":"If the time quantum is 4ms...","doubtPrompt":"Do you have any doubts...","nextAction":"CONTINUE","explanationMode":"standard"}

data: [DONE]
```

> [!IMPORTANT]
> **This is simulated streaming.** The ENTIRE GPT-4o response is received first (could take 3-8 seconds), then split into words and dripped out at 30ms intervals. True token-by-token streaming from the LLM is NOT implemented. The user sees word-by-word animation, but the backend already has the full response.

---

#### B7. DB Writes (AFTER stream finishes)

**File:** [tutor.controller.ts L110-145](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L110-L145)

```
Write 1: ChatHistory.findByIdAndUpdate(chatHistoryId, {
           $push: { messages: [user msg, assistant msg] }
         })

Write 2: Topic.findByIdAndUpdate(topicId, {
           status: "learning",    // only if status was "unstarted"
           lastStudiedAt: new Date()
         })

Write 3: User.findByIdAndUpdate(userId, {
           $addToSet: { studyDays: today }  // heatmap
         })
```

> [!WARNING]
> **Yes, the stream can succeed but DB writes can fail.** The user already saw the AI response (streamed), but if `ChatHistory.findByIdAndUpdate` fails at line 124, the conversation is lost on page refresh. The `try/catch` at line 147 calls `next(err)`, but `res.write` has already sent data — Express can't send a 500 anymore.

---

#### B8. Frontend: Stream Consumption

**File:** [useTutorStore.js L89-137](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useTutorStore.js#L89-L137)

```javascript
const reader = res.body.getReader();
const decoder = new TextDecoder();
let accText = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const raw = line.slice(6).trim();

    if (raw === '[DONE]') {
      // Mark AI bubble as finished, show comprehension chips
      set(state => ({
        messages: state.messages.map((m, i) =>
          i === aiMsgIndex ? { ...m, isStreaming: false, showChips: true } : m
        ),
        isStreaming: false,
      }));
      return;
    }

    const parsed = JSON.parse(raw);
    if (parsed.token) {
      accText += parsed.token;
      // Update the AI bubble's text in place
      set(state => ({
        messages: state.messages.map((m, i) =>
          i === aiMsgIndex ? { ...m, text: accText } : m
        ),
      }));
    }
    if (parsed.done) {
      set({ checkpointQuestion: parsed.checkpointQuestion, ... });
    }
  }
}
```

**Comprehension chips** appear when `showChips: true` is set on the last AI message. The chips are "Understood", "Need more help", "Go deeper" — clicking one calls `handleChipClick` at [Tutor.jsx L145-151](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Tutor.jsx#L145-L151):

```javascript
const texts = {
  understood: "Understood! Let's proceed.",
  help: "I need more help — can you explain it more simply?",
  deeper: "Let's go deeper into this concept.",
};
handleSend(texts[chipType]);
```

---

### FLOW C: User Submits a Quiz

---

#### C1. Frontend: Answer Selection + Submit

**Component:** [Quiz.jsx L64-78](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Quiz.jsx#L64-L78)

```javascript
const handleOptionSelect = (idx) => {
  if (isAnswered) return;
  setSelectedOpt(idx);
  setIsAnswered(true);
  const isCorrect = idx === questions[currQ]?.correct;
  setAnswers(prev => ({ ...prev, [currQ]: { selected: idx, isCorrect } }));
  if (isCorrect) { setScore(p => p + 1); setXp(p => p + 20); }
  else { setLives(p => Math.max(0, p - 1)); }
};
```

**When user finishes all 10 questions or timer expires:** [Quiz.jsx L89-101](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Quiz.jsx#L89-L101)

```javascript
const handleFinish = async () => {
  pause();  // Stop timer
  setQuizFinished(true);
  const timeTaken = Math.round((Date.now() - startTime) / 60000);
  await submitQuiz({
    topicId,
    answers,                                       // { 0: {selected:2, isCorrect:true}, 1: ... }
    questions,                                     // The 10 question objects from generate
    selfRatingAfter: Math.round((score / Math.max(questions.length, 1)) * 10),
    examDate: exam?.examDate,
    timeTaken,
  });
};
```

**Store:** [useQuizStore.js L40-55](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useQuizStore.js#L40-L55)

```javascript
const { data } = await api.post('/api/quiz/submit', {
  topicId, answers, questions, selfRatingAfter, sessionDurationMinutes: 15,
  examDate, timeTaken
});
```

---

#### C2. Backend: Quiz Controller Scoring

**File:** [quiz.controller.ts L46-87](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L46-L87)

```
Step 1: Topic.findById(topicId)       → load topic for masteryScore, estimatedMinutes
Step 2: Normalize answers             → handle both number and {selected, isCorrect} formats
Step 3: Score questions in pure JS    → scoredQuestions array with isCorrect flags
Step 4: Topic.find({ userId })        → load ALL topics for allTopicMasteries (for recommendation)
```

---

#### C3. progressTrackerNode — Called DIRECTLY, NOT through graph

**File:** [quiz.controller.ts L98-117](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L98-L117)

```typescript
progressResult = await progressTrackerNode({
  ...AgentState.State,
  userId,
  topicId,
  topicName: topic.name,
  progressInput: {
    quizResults: { score: 8, total: 10, wrongQuestions: ["What is convoy effect?", "Difference between preemptive and non-preemptive?"] },
    selfRatingAfter: 8,
    sessionDurationMinutes: 25,
    estimatedMinutes: 30,
    previousMasteryScore: 10,       // Was 10 from baseline
    examDate: "2026-06-22T00:00:00Z",
    allTopicMasteries: [
      { topicId: "...", topicName: "FCFS Scheduling", masteryScore: 45 },
      { topicId: "...", topicName: "Round Robin Scheduling", masteryScore: 10 },
      { topicId: "...", topicName: "Process States", masteryScore: 80 },
      ...
    ],
  },
});
```

> [!IMPORTANT]
> `progressTrackerNode` is called **directly as a function** — NOT through the LangGraph `graph.invoke()`. The quiz controller imports it at [quiz.controller.ts L8](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L8) and calls it directly. This is intentional — the graph is for tutor/doubt routing only.

---

#### C4. Mastery Calculation — Step by Step with Real Numbers

**File:** [masteryCalculator.ts L23-46](file:///Users/solminde/Developer/Ai-tutor/backend/src/utils/masteryCalculator.ts#L23-L46)

Given: `score=8, total=10, selfRatingAfter=7, sessionDurationMinutes=25, estimatedMinutes=30`

```
Line 24: quizScore  = 8 / 10                    = 0.8
Line 25: selfRating = 7 / 10                    = 0.7
Line 26: estimatedMinutes                        = 30  (from topic)
Line 27: engagement = Math.min(25 / 30, 1.0)    = 0.833

Line 30: calculatedMastery = Math.round(
           (0.8 × 0.6) + (0.7 × 0.3) + (0.833 × 0.1) × 100
         )
       = Math.round(
           (0.48 + 0.21 + 0.0833) × 100
         )
       = Math.round(0.7733 × 100)
       = Math.round(77.33)
       = 77

Line 34: passed    = 0.8 >= 0.7                 = true
Line 35: nodeColor = 77 >= 70 ? "mastered"       = "mastered"
Line 37: xpEarned  = 8 × 20                     = 160
```

**Result from masteryCalculator:**
```javascript
{
  calculatedMastery: 77,
  previousMastery: 10,    // was 10 from baseline rating
  passed: true,
  nodeColor: "mastered",
  xpEarned: 160,
}
```

---

#### C5. LLM call for recommendations ONLY

**File:** [progressTrackerNode.ts L62-89](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/progressTrackerNode.ts#L62-L89)

The LLM receives the pre-calculated values and is told to include them **exactly** in its output. It ONLY generates `nextTopicRecommendation` and `studyPlanUpdate`:

```
Pre-calculated values (include these EXACTLY in your output):
masteryScore: 77
previousMastery: 10
nodeColorUpdate: mastered
xpEarned: 160
passed: true

Context for recommendations:
Topic: Round Robin Scheduling
Wrong Questions: ["What is convoy effect?", "Difference between preemptive and non-preemptive?"]
Exam Date: 2026-06-22T00:00:00Z
All Topic Masteries: [{"topicId":"...","topicName":"FCFS Scheduling","masteryScore":45},...]

Generate the full structured response now.
```

GPT-4o returns (enforced by `progressSchema`):
```json
{
  "masteryScore": 77,
  "masteryDelta": { "before": 10, "after": 77 },
  "nodeColorUpdate": "mastered",
  "xpEarned": 160,
  "passed": true,
  "nextTopicRecommendation": {
    "topicId": "...",
    "topicName": "FCFS Scheduling",
    "reason": "FCFS has the lowest mastery at 45%. Since your exam is in 3 days, prioritize your weakest topics."
  },
  "studyPlanUpdate": {
    "Day 1": ["FCFS Scheduling", "Priority Scheduling"],
    "Day 2": ["SJF Algorithm", "Process Synchronization"],
    "Day 3": ["Mock Exam"]
  }
}
```

---

#### C6. DB Writes — Sequential, No Transaction

**File:** [quiz.controller.ts L133-163](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L133-L163)

```
Write 1: QuizResult.create({...})           — score, questions, xpEarned, passed, timeTaken
Write 2: Topic.findByIdAndUpdate(topicId)   — masteryScore: 77, status: "mastered"
Write 3: User.findByIdAndUpdate($inc xp)    — xp += 160
Write 4: StudyPlan.findOneAndUpdate($set)   — only if examDate set + studyPlanUpdate non-empty
```

These are **4 separate sequential writes. No MongoDB transaction.**

---

#### C7. Frontend: Score Summary + Roadmap Update

**Response JSON:**
```json
{
  "score": 8, "total": 10, "passed": true,
  "masteryDelta": { "before": 10, "after": 77 },
  "nodeColorUpdate": "mastered",
  "xpEarned": 160,
  "nextTopicRecommendation": { "topicName": "FCFS Scheduling", "reason": "..." },
  "studyPlanUpdate": { "Day 1": ["FCFS Scheduling", "Priority Scheduling"], ... }
}
```

**Quiz.jsx renders ScoreSummary:** [Quiz.jsx L191-199](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Quiz.jsx#L191-L199)

```jsx
<ScoreSummary
  score={score}              // 8
  total={questions.length}    // 10
  xp={result?.xpEarned}      // 160
  passed={result?.passed}     // true
  masteryDelta={result?.masteryDelta}  // { before: 10, after: 77 }
  onRetry={handleRestart}
  onBack={() => navigate('/roadmap')}
/>
```

**XP toast** from [useQuizStore.js L48-49](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useQuizStore.js#L48-L49):
```javascript
toast.success(`+160 XP earned! 🎉 Topic mastered!`, { duration: 4000 });
```

**Roadmap node color update:** When the user navigates back to `/roadmap`, `fetchRoadmap` is called. The backend returns the topic with `status: "mastered"`, and `RoadmapCanvas` renders it with a green color.

> [!NOTE]
> The roadmap doesn't update in real-time. The user must navigate to `/roadmap` and trigger a refetch. There's no WebSocket or cache invalidation mechanism.

---

### FLOW D: Open Mode — No PDF

---

#### D1. Frontend Trigger

**Two entry points:**

1. **Onboarding step 1** with `inputType === 'topic'`: [Onboarding.jsx L53-54](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Onboarding.jsx#L53-L54)
```javascript
await openSession({ inputType: 'topic', content: singleTopic });
```

2. **Sidebar "New Session"** navigates to `/tutor/new` → [Tutor.jsx L33](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/Tutor.jsx#L33):
```javascript
const isNewSession = !topicId || topicId === 'new';
```

**Endpoint for topic mode:** `POST /api/tutor/open`
**Endpoint for chat mode:** `POST /api/tutor/chat` (with `topicId === null`)

---

#### D2. Backend: Open Mode Controller

**File:** [tutor.controller.ts L152-200](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L152-L200)

**If `inputType === "notes"`:**
```typescript
// Create session + ingest notes (full pipeline: chunk + embed + extract topics)
const session = await Session.create({
  userId, name: sessionName, inputMethod: "notes",
  pineconeNamespace: `${userId}_${new mongoose.Types.ObjectId()}`,
});
const result = await ingestText(content, userId, session._id.toString());
// Returns: { sessionId, topics, roadmapNodes }
```

**If `inputType === "topic"`** (most common open mode):
```typescript
const session = await Session.create({
  userId, name: content, inputMethod: "topic",
  pineconeNamespace: `${userId}_${new mongoose.Types.ObjectId()}`,
});
const topic = await Topic.create({
  sessionId: session._id, userId, name: content,
  difficulty: "medium", estimatedMinutes: 30,
});
res.json({ sessionId: session._id, topicId: topic._id, topics: [topic] });
```

---

#### D3. What is ragContext When There's No PDF?

When the user types a message in open/topic mode, `tutorChat` runs with:
- `sessionId = topic.sessionId` → points to the session created above
- But Pinecone namespace is **empty** — no vectors were embedded

`retrieveContext` queries Pinecone → gets 0 results → returns `"No relevant context found in the uploaded materials."`

This gets injected into the prompt as:
```
CONTEXT FROM THEIR UPLOADED MATERIAL:
No relevant context found in the uploaded materials.
```

The fallback at [tutorNode.ts L43](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L43):
```typescript
.replace("{ragContext}", ragContext || "No uploaded materials found. Use your knowledge.")
```

GPT-4o sees this and teaches from its training data. It does **not** tell the user "I couldn't find your materials" — it just teaches normally. This is correct behavior for topic-only mode.

---

### FLOW E: Exam Rescue Plan Generation

---

#### E1. Frontend Trigger

**Entry:** [ExamMode.jsx L51](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/ExamMode.jsx#L51) renders `ExamSetupWizard`. The wizard has 3 steps:

1. **Set subject + exam date** → `POST /api/exam/setup`
2. **Upload syllabus** (optional) → `POST /api/exam/upload-syllabus`
3. **Generate study plan** → `POST /api/studyplan/generate`

**Store call:** [useExamStore.js L82-92](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useExamStore.js#L82-L92)

```javascript
const { data } = await api.post('/api/studyplan/generate', { sessionId, examDate });
set({ rescuePlan: data.plan, loading: false, setupComplete: true });
```

---

#### E2. Backend: studyplan.controller.ts

**File:** [studyplan.controller.ts L22-64](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L22-L64)

**MongoDB queries before AI call:**
```
Query 1: Topic.find({ sessionId, userId })  → all topics with current mastery scores
```

**With real data (exam in 3 days, 5 topics):**

```typescript
const topicSummary = topics.map(t =>
  `${t.name} (mastery: ${t.masteryScore}%, est: ${t.estimatedMinutes}min)`
).join("\n");
// Result:
// "FCFS Scheduling (mastery: 45%, est: 25min)
//  Round Robin Scheduling (mastery: 77%, est: 30min)
//  Priority Scheduling (mastery: 20%, est: 25min)
//  Process Synchronization (mastery: 10%, est: 40min)
//  Deadlock Detection (mastery: 55%, est: 35min)"
```

---

#### E3. LLM Call — This is a SEPARATE agent, NOT progressTrackerNode

**File:** [studyplan.controller.ts L31-39](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L31-L39)

```typescript
const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 });
const structured = model.withStructuredOutput(studyPlanSchema);

const result = await structured.invoke([
  { role: "system", content: "You generate day-by-day exam study plans. Assign weakest topics first. Final day = Mock Exam. Return dates as ISO strings." },
  { role: "user", content: `Exam in 3 days (2026-06-22). Topics:\n${topicSummary}\n\nGenerate the plan.` },
]);
```

**Output schema:** [studyplan.controller.ts L12-19](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L12-L19)

```typescript
z.object({
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string(),
    topicNames: z.array(z.string()),
    isMockExam: z.boolean().default(false),
  })),
})
```

**GPT-4o returns:**
```json
{
  "days": [
    { "dayNumber": 1, "date": "2026-06-20", "topicNames": ["Process Synchronization", "Priority Scheduling"], "isMockExam": false },
    { "dayNumber": 2, "date": "2026-06-21", "topicNames": ["FCFS Scheduling", "Deadlock Detection"], "isMockExam": false },
    { "dayNumber": 3, "date": "2026-06-22", "topicNames": ["Mock Exam"], "isMockExam": true }
  ]
}
```

---

#### E4. DB Write + Frontend Rendering

**File:** [studyplan.controller.ts L54-58](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L54-L58)

```typescript
const plan = await StudyPlan.findOneAndUpdate(
  { userId, sessionId },           // Find existing or create new
  { userId, sessionId, examDate, generatedAt: new Date(), days },
  { upsert: true, new: true }
);
```

**Frontend:** [ExamMode.jsx L115-148](file:///Users/solminde/Developer/Ai-tutor/frontend/src/pages/ExamMode.jsx#L115-L148) renders the rescue timeline sidebar with day-by-day blocks. Each block shows topics for that day. Green for completed days, purple for mock exam day.

**Marking a day complete:** [useExamStore.js L101-116](file:///Users/solminde/Developer/Ai-tutor/frontend/src/stores/useExamStore.js#L101-L116) calls `PATCH /api/studyplan/day/${dayId}` → [studyplan.controller.ts L84-87](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L84-L87):

```typescript
await StudyPlan.findOneAndUpdate(
  { _id: planId, "days._id": dayId },
  { $set: { "days.$.completed": true } }
);
```

If `score < 60`, frontend shows a toast: "Weak score — topics added to tomorrow's plan 📅". But the actual topic pushing to the next day is **not implemented in the backend** — the comment at [studyplan.controller.ts L83](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L83) says `"handled on frontend for now"`, and the frontend only shows a toast — it doesn't actually modify the plan either.

---

## SECTION 15: What Is Actually Broken or Missing

---

### 1. Features in Planning Doc with NO Implementation

| Feature | Doc Reference | What's Missing |
|---|---|---|
| **Spaced repetition** | TECHNICAL_ANALYSIS.md "SM-2 algorithm for review scheduling" | No SM-2 implementation exists anywhere. No review scheduling. Once a topic is "mastered", there's no mechanism to resurface it. |
| **Real-time token streaming from LLM** | Doc says "true streaming" | [tutor.controller.ts L92-96](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L92-L96) — response is received in full FIRST, then simulated word-by-word at 30ms. Not true streaming. |
| **Topic push on weak quiz score** | [studyplan.controller.ts L83](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L83) | Comment says "handled on frontend for now" — frontend only shows a toast, doesn't modify the plan. Neither side implements it. |
| **Previous quiz score for adaptive difficulty** | [quizPrompt.ts L14](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/prompts/quizPrompt.ts#L14): "If previousQuizScore < 60: make this quiz SIMPLER" | [quizGeneratorNode.ts L43](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/quizGeneratorNode.ts#L43) always passes `Previous Quiz Score: null`. The previous score is never loaded from QuizResult. |
| **Metadata filter in Pinecone queries** | Doc says `filter: { userId, topicId }` | Actual code uses namespace isolation only. No `filter` parameter is passed. (This is actually better, but diverges from doc.) |
| **OpenAI embeddings (1536 dim)** | Doc says text-embedding-3-small | Actual code uses Cohere embed-english-v3.0 (1024 dim). |

---

### 2. Features That Are Partially Implemented

| Feature | What Works | What's Missing |
|---|---|---|
| **Doubt node chat history** | [doubtNode.ts L32-34](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/doubtNode.ts#L32-L34) — formats chat history as a flat string | tutorNode passes chat history as real LLM message turns ([tutorNode.ts L48-51](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L48-L51)). doubtNode passes it as a flat string in the system prompt. Inconsistent — doubt mode loses conversational context quality. |
| **Study plan day topics** | Plan is generated with topic names | [studyplan.controller.ts L46-48](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L46-L48): `topicMap[name.toLowerCase()]` lookup — if GPT returns a name with different casing or wording than the DB, it falls back to `topics[0]` (the first topic). Could assign wrong topics to days. |
| **Scanned PDF detection** | [exam.controller.ts L23](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L23) checks for empty text after pdf-parse | [ingest.ts L52-53](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L52-L53) in `ingestPDFEmbedOnly` does NOT check. A scanned PDF silently produces 0 chunks. |
| **Quiz active tracking** | [quiz.controller.ts L218-234](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L218-L234): `getActiveQuizzes` returns topics with `status: 'learning'` | This isn't truly "active quizzes" — it's just learning topics. There's no in-progress quiz state. If user starts a quiz and closes the tab, the quiz is gone. |

---

### 3. Error Handling Gaps

| Location | What Happens | Risk |
|---|---|---|
| [tutor.controller.ts L147-149](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L147-L149) | `next(err)` after SSE headers already sent | Express error handler sends HTTP 500, but headers were already sent as `text/event-stream`. This causes an `ERR_HTTP_HEADERS_SENT` crash. **Can crash the Node.js process.** |
| [upload.controller.ts L40-42](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L40-L42) | Background topic extraction logs error but doesn't notify user | User sees empty roadmap forever. No retry mechanism. |
| [studyplan.controller.ts L83](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L83) | `markDayComplete` — comment says score logic is "handled on frontend" | Neither frontend nor backend implements topic pushing. Dead code path. |
| [chatHistory.controller.ts L104](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L104) | `deleteChat` — deletes by ID without userId check | Any authenticated user could delete any chat by guessing the chatId. Missing `userId` filter. |
| [quiz.controller.ts L193](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L193) | `getQuizHistory` uses `req.params.userId` instead of `req.userId` | URL parameter userId isn't validated against JWT userId. User A can view User B's quiz history by changing the URL. |
| [exam.controller.ts L168](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L168) | `getExam` uses `req.params.userId` | Same issue — no authorization check. |
| [progress.controller.ts L12](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/progress.controller.ts#L12) | `getProgress` uses `req.params.userId` | Same issue. |

---

### 4. Data Consistency Risks

| Scenario | What Breaks | How It Happens |
|---|---|---|
| **Quiz partial write** | QuizResult saved, Topic not updated | [quiz.controller.ts L133-163](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L133-L163): 4 sequential writes with no transaction. If write 2 fails after write 1 succeeds, quiz history shows a result but roadmap node color doesn't change. |
| **Duplicate chat creation** | Two chats for same topic | [chatHistory.controller.ts L75-82](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L75-L82) uses `findOne` + `create` (not atomic `findOneAndUpdate`). Two concurrent requests can both pass the findOne check and create two chats. Protected only by frontend logic and the comment "React StrictMode / double-click". |
| **Orphaned sessions** | Session exists with no vectors or topics | If Pinecone upsert fails at [ingest.ts L24](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L24), Session.create at [upload.controller.ts L63](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L63) already succeeded. No cleanup. |
| **rawText stored in Session** | MongoDB document grows unboundedly | [Session.ts L21](file:///Users/solminde/Developer/Ai-tutor/backend/src/models/Session.ts#L21): `rawText: String` with no max length. A 60,000-char PDF stores the full text in MongoDB AND in Pinecone. Wastes ~60KB per session. |
| **Chat history grows unboundedly** | ChatHistory.messages array grows forever | No max message count. 100 messages = large document. All messages are loaded at [tutor.controller.ts L53-56](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L53-L56) and injected as LLM message turns, which can exceed token limits. |
| **Study plan topic name mismatch** | Wrong topics assigned to days | [studyplan.controller.ts L42-48](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L42-L48): `topicMap[name.toLowerCase()]` fails if GPT returns slightly different topic names. Falls back to `topics[0]`. |

---

### 5. Performance Risks That Would Show Up in a Demo

| Risk | Impact | File | Fix Priority |
|---|---|---|---|
| **No MongoDB indexes** (covered in Section 13) | Every query scans full collection | All model files | 🟡 Medium — fine at demo scale, but add indexes before any load testing |
| **60-120s topic extraction blocking onboarding flow** | User stuck on "Generating roadmap…" spinner | [upload.controller.ts L159](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L159) | 🔴 High — if GPT-4.1 is slow, user might refresh or navigate away |
| **Cold start on Render free tier** | First request takes 15-30s (server waking up) | Render deployment config | 🔴 High — demo starts with a long wait if server was sleeping |
| **Unbounded chat history in LLM context** | Token limit exceeded → 400 error from OpenAI | [tutor.controller.ts L53-56](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L53-L56) | 🟡 Medium — unlikely in a 90s demo, but would break in extended use |
| **Simulated streaming adds latency** | 500-word response × 30ms = 15 seconds of animation | [tutor.controller.ts L95](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L95) | 🟢 Low — animation looks nice, but adds time on top of GPT's 3-8s response time |
| **Cohere free tier rate limit** | Multiple simultaneous uploads fail | [pinecone.ts L8](file:///Users/solminde/Developer/Ai-tutor/backend/src/config/pinecone.ts#L8) | 🟡 Medium — unlikely with 1 demo user, but could hit during testing |

---

### Demo Failure Priority Ranking (Final)

| Rank | What Breaks | Likelihood | File | Seconds to Notice |
|---|---|---|---|---|
| 🔴 1 | **Server cold start on Render** | VERY HIGH | Render config | 0s (first click) |
| 🔴 2 | **Roadmap empty after PDF upload** | HIGH | [upload.controller.ts L159](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L159) | 10-20s into demo |
| 🔴 3 | **OpenAI/Cohere API key missing or over quota** | HIGH (first deploy) | `.env` on Render | 15s into demo |
| 🔴 4 | **SSE error after headers sent crashes server** | MEDIUM | [tutor.controller.ts L147](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L147) | 30s into demo |
| 🟡 5 | **Quiz shows wrong mastery (60% vs 70% threshold)** | MEDIUM | [quiz.controller.ts L122](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L122) vs [masteryCalculator.ts L34](file:///Users/solminde/Developer/Ai-tutor/backend/src/utils/masteryCalculator.ts#L34) | 60s into demo |
| 🟡 6 | **Tutor conversation lost on refresh** | MEDIUM | [tutor.controller.ts L124](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L124) | 45s into demo |
| 🟡 7 | **Study plan assigns wrong topics to days** | MEDIUM | [studyplan.controller.ts L47](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L47) | 75s into demo |
| 🟢 8 | **Scanned PDF produces empty RAG** | LOW | [ingest.ts L52-53](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L52-L53) | Only if specific PDF |
| 🟢 9 | **Chat deletion has no auth check** | LOW | [chatHistory.controller.ts L104](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L104) | Not visible in demo |
| 🟢 10 | **XP not updating** | LOW | [quiz.controller.ts L154](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L154) | Minor visual issue |
