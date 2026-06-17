# Deep Analysis — 3 Agent JSON Files vs Project Specifications

> **Files Analyzed:**
> - [tutor_agent.json](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json) (398 lines)
> - [quiz_generator_agent.json](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json) (500 lines)
> - [progress_tracking_agent.json](file:///Users/solminde/Developer/Ai-tutor/progress_tracking_agent.json) (113 lines)
>
> **Compared Against:**
> - [TECHNICAL_ANALYSIS.md](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md) (the authoritative spec)
> - [complete_plan.md](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md) (the implementation plan)

---

## 1. What These Files Actually Are

> [!IMPORTANT]
> These are **n8n workflow export files** — NOT LangChain/LangGraph TypeScript agent code.

All three JSON files are exported n8n (workflow automation platform) workflows. They use n8n-specific node types like:
- `n8n-nodes-base.webhook` (HTTP triggers)
- `@n8n/n8n-nodes-langchain.agent` (n8n's LangChain wrapper)
- `@n8n/n8n-nodes-langchain.chainLlm` (n8n's LLM chain wrapper)
- `@n8n/n8n-nodes-langchain.vectorStorePinecone` (n8n's Pinecone wrapper)

This is **architecturally different** from what [complete_plan.md](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md) Plan 2 (lines 212–420) specifies. The plan calls for **LangGraph TypeScript code** running inside a Node.js/Express backend, not n8n workflows running on a separate n8n server.

---

## 2. Agent-by-Agent Analysis

---

### 2.1 Tutor Agent — [tutor_agent.json](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json)

#### What it does (correctly)

| Feature | Status | Reference |
|---|---|---|
| File upload webhook (`POST /upload-document`) | ✅ Exists | Lines 3–19 |
| PDF text extraction via `extractFromFile` | ✅ Exists | Lines 20–31 |
| Pinecone vector insert with embeddings | ✅ Exists | Lines 33–92 |
| Recursive text splitter (chunkOverlap: 200) | ✅ Matches spec | Line 81, matches [TECHNICAL_ANALYSIS.md L928](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L928) |
| Topic extraction via OpenAI | ✅ Exists | Lines 93–107 |
| Save topics to MongoDB | ✅ Exists | Lines 108–123 |
| RAG retrieval via Pinecone Vector Store Tool | ✅ Exists | Lines 198–241 |
| Window Buffer Memory (conversation history) | ✅ Exists | Lines 187–197 |
| Webhook for tutor chat (`POST /ask-tutor`) | ✅ Exists | Lines 137–153 |

#### What is WRONG ❌

**Issue 1 — Wrong model: `gpt-4o-mini` instead of `gpt-4o`**

[tutor_agent.json L173](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L173):
```json
"model": "gpt-4o-mini"
```

The spec says `gpt-4o` at [TECHNICAL_ANALYSIS.md L1339](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1339):
> *"Call GPT-4o (streaming)"*

And [complete_plan.md L398](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L398):
> *`model: "gpt-4o"  →  new ChatOpenAI({ model: "gpt-4o", temperature: 0.7 })`*

**Verdict:** `gpt-4o-mini` is cheaper but significantly less capable for the adaptive teaching, explanation-level calibration, and structured JSON output this agent needs. The spec explicitly says `gpt-4o`.

---

**Issue 2 — Wrong temperature: `0` instead of `0.7`**

[tutor_agent.json L175](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L175):
```json
"temperature": 0
```

[complete_plan.md L398](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L398):
> *`new ChatOpenAI({ model: "gpt-4o", temperature: 0.7 })`*

**Verdict:** Temperature 0 makes the tutor rigid and deterministic. The adaptive explanation fallback chain (simpler → analogy → step-by-step, from [TECHNICAL_ANALYSIS.md L1013-1014](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1013-L1014)) requires creative variation, which needs `temperature: 0.7`.

---

**Issue 3 — System prompt is the WRONG version**

The system prompt in [tutor_agent.json L159](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L159) says:

> *"You are a strict, structured Tutor Agent. Your primary directive is to teach the user based ONLY on the provided context..."*

This prompt:
- ❌ Does NOT include `explanationLevel` calibration (beginner/intermediate/advanced) — the spec at [TECHNICAL_ANALYSIS.md L1017-1037](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1017-L1037) explicitly defines all three levels
- ❌ Does NOT include `{ragContext}`, `{chatHistory}`, `{topicName}`, `{masteryLevel}` template variables — the spec at [TECHNICAL_ANALYSIS.md L1039-1046](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1039-L1046) shows these as required
- ❌ Uses a **different output schema** — the prompt expects `checkpoint_question` as an object with `{question, options[], correct_answer}` (which is a quiz-style MCQ), but the spec at [TECHNICAL_ANALYSIS.md L1050-1057](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1050-L1057) says `checkpoint_question` is a simple string (e.g. "Did that click?")
- ❌ Missing `doubt_prompt` field from output schema
- ❌ Missing `explanation_mode` field from output schema
- ❌ Missing the explanation fallback chain instructions
- ❌ Uses `next_action: "wait_for_user_answer"` which doesn't exist in the spec. The spec at [TECHNICAL_ANALYSIS.md L1054](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1054) says: `"CONTINUE | GO_DEEPER | GO_SIMPLER | ANSWER_DOUBT"`

**Compare** — the correct prompt from the spec at [TECHNICAL_ANALYSIS.md L1008-1046](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1008-L1046):

```
You are NeuralNest, an adaptive AI tutor. You teach one concept at a time.
Rules:
- NEVER dump the full topic. Teach in a single focused chunk.
- Always end with exactly one comprehension check question.
- If the user says they are confused, COMPLETELY CHANGE your explanation style.
  Never repeat the same phrasing. Try: simpler language → analogy → step-by-step.
- User mastery score is {masteryLevel}/10...
Explanation Level: {explanationLevel}
  BEGINNER: ... INTERMEDIATE: ... ADVANCED: ...
Context from their material: {ragContext}
Conversation history: {chatHistory}
Current topic: {topicName}
```

---

**Issue 4 — Input only sends `question`, missing required fields**

[tutor_agent.json L157](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L157):
```json
"text": "={{ $json.body.question }}"
```

The spec at [TECHNICAL_ANALYSIS.md L1335](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1335) requires:
```
{ topicId, message, userId }
```

And the complete Plan 2 state definition at [complete_plan.md L299-309](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L299-L309) requires:
```
userId, topicId, topicName, message, messageType, explanationLevel, masteryScore
```

The tutor prompt needs `topicName`, `masteryLevel`, `explanationLevel` to function correctly — none of these are passed in.

---

**Issue 5 — No SSE streaming**

The webhook uses `"responseMode": "lastNode"` (line 8, line 141) which means n8n waits for the entire agent response and returns it in one shot.

The spec at [TECHNICAL_ANALYSIS.md L957-970](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L957-L970) explicitly requires SSE streaming:

```javascript
res.setHeader('Content-Type', 'text/event-stream')
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`)
}
```

> [!WARNING]
> n8n webhooks **cannot do SSE streaming**. This is a fundamental platform limitation. SSE streaming requires a custom Express endpoint, which is what the spec calls for.

---

**Issue 6 — `roadmapNodes` is always returned empty**

[tutor_agent.json L126](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L126):
```javascript
return { topics: extractedData.topics, roadmapNodes: [] }
```

The spec at [TECHNICAL_ANALYSIS.md L940](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L940) says the response should be:
```
Response: { topics: [...], roadmapNodes: [...] }
```

Roadmap nodes should include `{ id, label, status, position, edges[] }` for React Flow rendering as stated at [complete_plan.md L475](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L475). Returning `[]` means the roadmap page will have nothing to render.

---

### 2.2 Quiz Generator Agent — [quiz_generator_agent.json](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json)

This file is a **combined workflow** that includes the full tutor agent (lines 1–241, 311–493) PLUS the quiz generator (lines 242–310).

#### What the Quiz Generator section does (correctly)

| Feature | Status | Reference |
|---|---|---|
| Webhook for quiz generation (`POST /generate-quiz`) | ✅ Exists | Lines 242–258 |
| Uses GPT-4o for quiz generation | ✅ Correct model | Line 284 |
| Structured output parser with JSON schema | ✅ Exists | Lines 298–310 |
| Schema has `question`, `options`, `correct`, `explanation` | ✅ Matches spec | Line 300, matches [TECHNICAL_ANALYSIS.md L1091-1099](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1091-L1099) |
| Difficulty calibration based on mastery level | ✅ Exists in prompt | Line 268 |
| "If previousQuizScore < 60: make quiz SIMPLER" | ✅ Matches spec | Line 268, matches [TECHNICAL_ANALYSIS.md L1082](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1082) |

#### What is WRONG ❌

**Issue 7 — Generates 5 questions instead of MINIMUM 10**

[quiz_generator_agent.json L268](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json#L268):
```
"Generate exactly 5 multiple-choice questions..."
```

The spec says **minimum 10** in multiple places:
- [TECHNICAL_ANALYSIS.md L42](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L42): *"passed quiz with ≥ 70% on minimum 10 questions"*
- [TECHNICAL_ANALYSIS.md L553](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L553): *"takes quiz (minimum 10 questions)"*
- [TECHNICAL_ANALYSIS.md L991](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L991): *"Generates minimum 10 MCQ questions"*
- [TECHNICAL_ANALYSIS.md L1277](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1277): *"Generate minimum 10 MCQs for a topic (timed)"*
- [complete_plan.md L349](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L349): *"Returns exactly 10 MCQs"*

> [!CAUTION]
> This is the **most critical error**. The entire quiz/mastery system assumes 10 questions. The pass threshold is 70% (7/10). With 5 questions, 70% is 3.5 — you can't score 3.5, so the pass logic breaks. The frontend quiz steps panel ([TECHNICAL_ANALYSIS.md L698-705](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L698-L705)) renders 10 numbered steps.

---

**Issue 8 — Tutor Agent in this file has BETTER prompt but still wrong temperature**

The tutor agent inside this combined file at [quiz_generator_agent.json L157-159](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json#L157-L159) has the **correct** prompt format with `explanationLevel`, `topicName`, `masteryLevel`, `doubt_prompt`, `explanation_mode`, and the fallback chain. This is significantly better than the prompt in `tutor_agent.json`.

However:
- Temperature is `0.2` (line 175) — spec says `0.7` at [complete_plan.md L398](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L398)
- Still uses `gpt-4o-mini` (line 173) — spec says `gpt-4o`

**This means there are TWO different versions of the tutor agent prompt across files**, which creates confusion about which is authoritative.

---

**Issue 9 — Quiz output schema doesn't enforce array length**

[quiz_generator_agent.json L300](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json#L300):
```json
"questions": {
  "type": "array",
  "items": { ... }
}
```

The schema accepts **any number** of questions. There's no `"minItems": 10` or `"maxItems": 10` constraint. Combined with the prompt saying "exactly 5", this means the agent could return 3, 5, 8, or any number.

---

**Issue 10 — Quiz Generator is `chainLlm` not `agent`**

[quiz_generator_agent.json L275](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json#L275):
```json
"type": "@n8n/n8n-nodes-langchain.chainLlm"
```

The Quiz Generator uses `chainLlm` (simple LLM chain), not `agent` (agent with tools). This means it has **no access to the Pinecone vector store** — it cannot retrieve the actual concepts taught in the session. It relies entirely on whatever `conceptsCovered` string is passed in the webhook body.

The spec at [TECHNICAL_ANALYSIS.md L990-991](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L990-L991) says:
> *"Reads concepts covered in session → Generates minimum 10 MCQ questions"*

If the frontend doesn't pass a complete `conceptsCovered` string, the quiz will test random things the LLM knows rather than what was taught.

---

**Issue 11 — Duplicate file upload + tutor workflow**

Lines 1–241 and 311–493 of `quiz_generator_agent.json` are a **copy-paste** of the entire tutor agent workflow from `tutor_agent.json`. The same webhook paths (`upload-document`, `ask-tutor`) with different node IDs means:
- Importing both workflows into n8n would create **conflicting webhook paths**
- The tutor agent logic is duplicated across files — changes in one won't reflect in the other

---

### 2.3 Progress Tracking Agent — [progress_tracking_agent.json](file:///Users/solminde/Developer/Ai-tutor/progress_tracking_agent.json)

#### What it does (correctly)

| Feature | Status | Reference |
|---|---|---|
| Webhook for progress tracking (`POST /track-progress`) | ✅ Exists | Lines 3–19 |
| Mastery formula: score×0.6 + selfRating×0.3 + engagement×0.1 | ✅ Matches spec | Line 29, matches [TECHNICAL_ANALYSIS.md L1121-1124](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1121-L1124) and [complete_plan.md L352-353](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L352-L353) |
| Next topic recommendation based on lowest mastery | ✅ Matches spec | Line 29, matches [TECHNICAL_ANALYSIS.md L1127](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1127) |
| Rescue plan generation if exam date set | ✅ Matches spec | Line 29, matches [TECHNICAL_ANALYSIS.md L1129-1134](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1129-L1134) |
| Output schema matches spec (masteryScore, masteryDelta, nodeColorUpdate, nextTopicRecommendation, studyPlanUpdate) | ✅ Matches spec | Line 61, matches [TECHNICAL_ANALYSIS.md L1139-1149](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1139-L1149) |
| Uses GPT-4o | ✅ Correct model | Line 45 |
| Temperature 0.2 (low for deterministic calculations) | ✅ Appropriate | Line 47 |
| Input includes all required fields | ✅ Complete | Line 23 |
| Structured output parser | ✅ Exists | Lines 59–71 |

#### What is WRONG ❌

**Issue 12 — No MongoDB write-back**

The workflow goes: `Webhook → LLM Chain → response`. But the spec at [TECHNICAL_ANALYSIS.md L1358-1361](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1358-L1361) says:

```
Progress Agent runs
Calculate masteryScore
Update Topics.status ──→ MongoDB
Update StudyPlan if needed
```

And [complete_plan.md L353-356](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L353-L356):
```
3. Determines node color: >= 70 → mastered, else learning
5. Returns mastery delta + node color update + next topic + study plan
```

The progress agent **calculates** the mastery but doesn't **write** it anywhere. There's no MongoDB node to update:
- `Topic.masteryScore`
- `Topic.status` (learning → mastered)
- `User.xp` (should add `20 × correctAnswers`)
- `StudyPlan` (if exam date set)

The response goes back to the webhook caller, but if the caller doesn't handle the MongoDB write, the data is lost.

---

**Issue 13 — No XP calculation**

The spec at [complete_plan.md L505](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L505) says the quiz submit response includes `xpEarned`:
```
Response: { score, total, passed, masteryDelta, nodeColorUpdate, xpEarned }
```

And [TECHNICAL_ANALYSIS.md L713](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L713):
> *"Correct! You gained +20 XP."*

The progress agent's output schema (line 61) has no `xpEarned` field, and the system prompt (line 29) doesn't mention XP at all.

---

**Issue 14 — No `passed` boolean in output**

The spec at [complete_plan.md L505](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L505):
```
Response: { score, total, passed, ... }
```

And [TECHNICAL_ANALYSIS.md L724-726](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L724-L726):
```
Pass threshold: 70% (7/10+ correct)
Pass → node turns 🟢 Green
Fail → node stays 🟡 Yellow (no regression to gray)
```

The output schema has `nodeColorUpdate` but no explicit `passed` boolean. The frontend needs this to decide whether to show the "Mastered!" celebration or "Keep practicing" message.

---

**Issue 15 — nodeColorUpdate schema allows any string**

[progress_tracking_agent.json L61](file:///Users/solminde/Developer/Ai-tutor/progress_tracking_agent.json#L61):
```json
"nodeColorUpdate": { "type": "string" }
```

This allows the LLM to return anything — "green", "mastered", "learning", "yellow", "complete", etc. The spec at [complete_plan.md L322](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L322) defines an enum:
```typescript
nodeColorUpdate: Annotation<"unstarted" | "learning" | "mastered">
```

The schema should use `"enum": ["unstarted", "learning", "mastered"]`.

---

**Issue 16 — LLM doing math instead of deterministic code**

The mastery formula (`score×0.6 + selfRating×0.3 + engagement×0.1`) is in the **system prompt**, meaning the LLM is asked to **calculate** it. LLMs are unreliable at math. 

The spec at [complete_plan.md L352-353](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L352-L353) shows this as a deterministic calculation:
```
2. Calculates mastery: score × 0.6 + selfRating × 0.3 + engagement × 0.1
3. Determines node color: >= 70 → mastered, else learning
```

This should be done in code (a Code node in n8n, or a JS function in the backend), NOT by the LLM.

---

## 3. Cross-Cutting Issues (Affect All Agents)

**Issue 17 — Platform Mismatch: n8n vs LangGraph**

| What the specs say | What the JSON files do |
|---|---|
| [complete_plan.md L212-420](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L212-L420): LangChain.js + LangGraph TypeScript code in `backend/src/agents/` | n8n workflow JSON files running on a separate n8n server |
| [complete_plan.md L294-326](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L294-L326): LangGraph `Annotation` state graph with shared state between agents | Each agent is a standalone webhook — no shared state |
| [TECHNICAL_ANALYSIS.md L977](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L977): "All three agents share a state graph. They are called sequentially" | Each agent has its own separate webhook endpoint with no graph connection |

> [!IMPORTANT]
> **This is the biggest architectural question.** If you're going with n8n (low-code), the entire Plan 2 of [complete_plan.md](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md) needs to be rewritten for n8n. If you're going with LangGraph (code-first), these JSON files are prototypes/references only and need to be converted to TypeScript.

**Issue 18 — No Pinecone namespace filtering**

The spec at [TECHNICAL_ANALYSIS.md L949-950](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L949-L950) says:
```
Pinecone similarity search (top_k: 5)
  → filter: { userId, topicId }
```

And [complete_plan.md L125](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md#L125):
```
Pinecone upsert with metadata: { userId, sessionId, chunkIndex, text }
```

But in all three files, the Pinecone index is:
```json
"pineconeIndex": { "value": "your-pinecone-index-name", "mode": "list" }
```

- The index name is a placeholder
- No namespace or metadata filter is applied
- This means ALL users' documents are in one undifferentiated index — User A would get User B's content in their tutor sessions

---

## 4. Summary Scorecard

| Category | tutor_agent.json | quiz_generator_agent.json | progress_tracking_agent.json |
|---|---|---|---|
| **Correct Architecture** | ⚠️ n8n not LangGraph | ⚠️ n8n not LangGraph | ⚠️ n8n not LangGraph |
| **Correct Model** | ❌ gpt-4o-mini | ✅ gpt-4o (quiz) / ❌ gpt-4o-mini (tutor) | ✅ gpt-4o |
| **Correct Temperature** | ❌ 0 (should be 0.7) | ❌ 0.2 tutor (should be 0.7) / ⚠️ 0.5 quiz | ✅ 0.2 (appropriate) |
| **Correct Prompt** | ❌ Wrong version | ⚠️ Better but still incomplete | ✅ Matches spec |
| **Correct Output Schema** | ❌ Wrong fields | ✅ Matches (but 5 Qs not 10) | ⚠️ Missing xpEarned, passed |
| **Correct Question Count** | N/A | ❌ 5 instead of 10 | N/A |
| **SSE Streaming** | ❌ Missing | N/A (quiz isn't streamed) | N/A |
| **MongoDB Writes** | ✅ Topics saved | ❌ No quiz result saved | ❌ No mastery/XP update |
| **Pinecone Filtering** | ❌ No filter | ❌ No filter | N/A |
| **Standalone (no duplication)** | ✅ | ❌ Duplicates entire tutor | ✅ |

---

## 5. Correction Plan

### Priority 1 — Critical (breaks core functionality)

| # | Fix | File(s) | What to change |
|---|---|---|---|
| 1 | **Quiz: 5 → 10 questions** | quiz_generator_agent.json L268 | Change `"Generate exactly 5"` → `"Generate exactly 10"` |
| 2 | **Add `minItems: 10` to quiz schema** | quiz_generator_agent.json L300 | Add `"minItems": 10, "maxItems": 10` to the `questions` array |
| 3 | **Fix tutor model** | tutor_agent.json L173 | Change `"gpt-4o-mini"` → `"gpt-4o"` |
| 4 | **Fix tutor temperature** | tutor_agent.json L175 | Change `0` → `0.7` |
| 5 | **Replace tutor prompt** | tutor_agent.json L159 | Use the correct prompt from [TECHNICAL_ANALYSIS.md L1008-1046](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1008-L1046) with explanationLevel, ragContext, chatHistory, topicName |
| 6 | **Add tutor input fields** | tutor_agent.json L157 | Change to include `topicName`, `masteryLevel`, `explanationLevel` from webhook body |

### Priority 2 — Important (data integrity)

| # | Fix | File(s) | What to change |
|---|---|---|---|
| 7 | **Add MongoDB write to Progress agent** | progress_tracking_agent.json | Add MongoDB Update node after the LLM chain to write `masteryScore`, `status`, `xp` |
| 8 | **Add `xpEarned` and `passed` to output** | progress_tracking_agent.json L61 | Add `"xpEarned": {"type":"number"}` and `"passed": {"type":"boolean"}` to schema |
| 9 | **Constrain nodeColorUpdate** | progress_tracking_agent.json L61 | Add `"enum": ["unstarted", "learning", "mastered"]` |
| 10 | **Move mastery math to Code node** | progress_tracking_agent.json | Add a Code node before the LLM that calculates mastery deterministically; pass result to LLM for recommendations only |
| 11 | **Set Pinecone index name** | All 3 files | Replace `"your-pinecone-index-name"` with `"neuralnest-os"` per [TECHNICAL_ANALYSIS.md L1430](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1430) |
| 12 | **Add Pinecone namespace filter** | tutor_agent.json, quiz_generator_agent.json | Add `filter: { userId }` to Pinecone retrieval |

### Priority 3 — Architecture (design decision needed)

| # | Fix | Requires Decision |
|---|---|---|
| 13 | **Deduplicate tutor workflow** | Remove the tutor+upload portion from `quiz_generator_agent.json` — keep it only in `tutor_agent.json` |
| 14 | **Generate roadmapNodes** | In the Format Webhook Response code node, generate `roadmapNodes` with positions instead of returning `[]` |
| 15 | **n8n vs LangGraph decision** | See question below |

---

## 6. Open Questions

> [!IMPORTANT]
> **Question 1: Are you using n8n or LangGraph for the backend agents?**
>
> Your JSON files are n8n workflows, but [complete_plan.md](file:///Users/solminde/Developer/Ai-tutor/complete_plan.md) Plan 2 specifies LangGraph TypeScript code inside a Node.js backend.
>
> - **Option A (n8n):** Use these n8n workflows as the agent runtime. Your Express backend calls the n8n webhooks. This is easier to build but you lose SSE streaming and shared state graph.
> - **Option B (LangGraph):** Convert these JSON files into LangGraph TypeScript code as originally planned. These files serve as prompt/schema references only.
> - **Suggested answer:** If this is for a hackathon demo, n8n is faster to ship. If this is a real product, LangGraph gives you more control.

> [!IMPORTANT]
> **Question 2: The spec says minimum 10 questions in many places, but the TECHNICAL_ANALYSIS spec prompt also says "exactly 5"**
>
> There's an internal contradiction:
> - [TECHNICAL_ANALYSIS.md L1075](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1075): *"Generate exactly 5 multiple-choice questions"* (in the prompt text)
> - [TECHNICAL_ANALYSIS.md L42](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L42): *"minimum 10 questions"* (in the feature rules)
> - [TECHNICAL_ANALYSIS.md L991](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L991): *"minimum 10 MCQ questions"*
> - [TECHNICAL_ANALYSIS.md L1277](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L1277): *"minimum 10 MCQs"*
>
> The prompt example text says 5, but the feature rules in 4 other places say 10. The frontend quiz UI ([TECHNICAL_ANALYSIS.md L698-705](file:///Users/solminde/Developer/Ai-tutor/docs/TECHNICAL_ANALYSIS.md#L698-L705)) renders 10 steps. Your quiz_generator copied the prompt's "5" instead of the rules' "10".
> - **Suggested answer:** Use **10** — the 4 rule references override the 1 prompt reference. The prompt text at L1075 was likely written before the "minimum 10" rule was finalized.

> [!WARNING]
> **Question 3: Why are there two different tutor prompts?**
>
> - [tutor_agent.json L159](file:///Users/solminde/Developer/Ai-tutor/tutor_agent.json#L159) — older, incomplete prompt (no explanationLevel, wrong schema)
> - [quiz_generator_agent.json L157-159](file:///Users/solminde/Developer/Ai-tutor/quiz_generator_agent.json#L157-L159) — newer, better prompt (has explanationLevel, correct schema fields)
>
> Which one did you intend to use? The `quiz_generator_agent.json` version is closer to the spec but still uses wrong model/temperature.
> - **Suggested answer:** Use the prompt from `quiz_generator_agent.json` as the base, fix the model to `gpt-4o`, fix temperature to `0.7`, and remove the duplicate from `quiz_generator_agent.json`.
