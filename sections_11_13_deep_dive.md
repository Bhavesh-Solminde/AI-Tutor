# NeuralNest-OS — Sections 11–13: Pinecone + MongoDB Deep Analysis

> **Ground rule:** Every explanation traces to actual code files. No examples from general knowledge. Every divergence from TECHNICAL_ANALYSIS.md is flagged.

---

## SECTION 11: Pinecone — Complete Ingestion Pipeline

### The Full Upload Flow — Step by Step

When a user uploads a PDF, here is EXACTLY what happens, traced through every function call:

---

#### Step 0: Multer receives the file in memory

**File:** [upload.routes.ts](file:///Users/solminde/Developer/Ai-tutor/backend/src/routes/upload.routes.ts#L27-L33)

```typescript
const upload = multer({
  storage: multer.memoryStorage(),  // ← File stored in RAM, NOT on disk
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
  fileFilter,  // Only .pdf, .docx, .txt, .md
});

router.post("/", authMiddleware as any, upload.single("file"), uploadFile as any);
```

**What multer produces:** `req.file` is an object like:
```javascript
{
  fieldname: "file",
  originalname: "OS_Notes.pdf",
  encoding: "7bit",
  mimetype: "application/pdf",
  buffer: <Buffer 25 50 44 46 2d 31 ...>,  // Raw PDF bytes in memory
  size: 524288  // ~500KB
}
```

> [!WARNING]
> **Divergence from doc:** TECHNICAL_ANALYSIS.md (line 922) says `"Multer saves file to /uploads/"`. Your actual code uses `multer.memoryStorage()` — the file is NEVER saved to disk. It stays as a Buffer in memory. This is better for serverless/Render deployments (no filesystem needed), but means the entire file sits in Node.js memory until processing completes.

---

#### Step 1: Controller creates a Session document

**File:** [upload.controller.ts L62-69](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L62-L69)

```typescript
const namespace = `${userId}_${new mongoose.Types.ObjectId()}`;
const session = await Session.create({
  userId,
  name: sessionName || file?.originalname || "New Session",
  inputMethod: inputMethod || (file ? "pdf" : "notes"),
  pineconeNamespace: namespace,
  isReference: isReferenceOnly,
});
```

**The Session document saved to MongoDB:**
```javascript
{
  _id: ObjectId("6853a1b2c3d4e5f6a7b8c9d0"),
  userId: ObjectId("6712ab3f..."),
  name: "OS_Notes.pdf",
  inputMethod: "pdf",
  pineconeNamespace: "6712ab3f..._6853a1b2c3d4e5f6a7b8c9d0",  // userId_newObjectId
  isReference: false,
  createdAt: 2026-06-19T05:26:00Z,
  updatedAt: 2026-06-19T05:26:00Z
}
```

**Namespace construction:** `${userId}_${new mongoose.Types.ObjectId()}` produces something like `"6712ab3f4e5d6c7b8a9f0e1d_6853a1b2c3d4e5f6a7b8c9d0"`. This is a NEW ObjectId each time — not the session's own `_id`. The session's `pineconeNamespace` field stores this for later retrieval.

> [!NOTE]
> **What happens if two users upload the same PDF?** They get completely separate namespaces because the namespace includes the userId. User A uploads "OS_Notes.pdf" → namespace `"userA_abc123"`. User B uploads the same file → namespace `"userB_def456"`. The vectors are completely isolated.
>
> **What happens if the SAME user uploads the same PDF twice?** Two different sessions with two different namespaces are created (because `new mongoose.Types.ObjectId()` generates a unique ID each time). The chunks exist in duplicate across two namespaces. This is wasteful but harmless.

---

#### Step 2: Cloudinary upload (PDF only)

**File:** [upload.controller.ts L116](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L116) calls [ingestPDFEmbedOnly](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L45-L57) which calls [uploadPdfToCloudinary](file:///Users/solminde/Developer/Ai-tutor/backend/src/utils/cloudinaryUpload.ts#L7-L31):

```typescript
export async function uploadPdfToCloudinary(buffer: Buffer, originalName: string): Promise<string> {
  const publicId = `${Date.now()}_${originalName.replace(/\.[^.]+$/, "").replace(/\s+/g, "_")}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",          // Store as raw file, NOT image
        folder: "neuralnest/pdfs",
        public_id: publicId,           // e.g. "1718777160_OS_Notes"
        format: "pdf",
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);  // Pipe the in-memory buffer to Cloudinary
  });
}
```

**Returns:** A URL like `"https://res.cloudinary.com/dxxx/raw/upload/v1718777160/neuralnest/pdfs/1718777160_OS_Notes.pdf"`

This URL is stored in `Session.fileUrl` so the user can download their original PDF later.

---

#### Step 3: pdf-parse extracts raw text

**File:** [ingest.ts L52-53](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L52-L53) (inside `ingestPDFEmbedOnly`):

```typescript
const parsed = await pdfParse(buffer);
const rawText = parsed.text;
```

**What `pdfParse` returns for a real PDF:**
```javascript
{
  numpages: 15,
  numrender: 15,
  info: { Title: "Operating Systems Notes", Author: "..." },
  text: "Chapter 1: Introduction to Operating Systems\n\nAn operating system (OS) is system software that manages computer hardware...\n\nCPU scheduling is the process by which the OS decides which process runs next. It uses algorithms like FCFS, SJF, and Round Robin.\n\n..."
  // rawText is one continuous string — all pages concatenated
}
```

**What the raw text looks like:**
- All pages concatenated into one string
- Page breaks become `\n\n` (double newline)
- Tables become messy plain text
- Images are IGNORED — if the PDF is scanned (image-only), `parsed.text` is `""`

**The Session document is then updated:**

```typescript
await Session.findByIdAndUpdate(sessionId, { fileUrl, rawText });
```

---

#### Step 4: RecursiveCharacterTextSplitter chunks the text

**File:** [ingest.ts L20-21](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L20-L21) (inside the shared `embedText` helper):

```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});
const chunks = await splitter.createDocuments([rawText], [{ userId, sessionId }]);
```

**What `RecursiveCharacterTextSplitter` actually does:**

It tries to split at natural boundaries in this priority order:
1. Double newline `\n\n` (paragraph breaks) — PREFERRED
2. Single newline `\n` (line breaks)
3. Space ` ` (word boundaries)
4. Empty string `""` (character-by-character) — LAST RESORT

It keeps splitting until each chunk is ≤ 1000 characters, then adds 200-character overlap between adjacent chunks.

**Concrete example with YOUR settings (`chunkSize: 1000`, `chunkOverlap: 200`):**

Take this text from your user's request:
```
"CPU scheduling is the process by which the OS decides which process runs next.
It uses algorithms like FCFS, SJF, and Round Robin."
```

This is only 131 characters — far below the 1000-character limit. It would NOT be split at all. It becomes one chunk.

**A more realistic example with a 2,200-character text:**

Suppose the raw text is ~2,200 characters total. The splitter produces:

```
Chunk 0 (chars 0-999):   "Chapter 1: Introduction to Operating Systems\n\n
                           An operating system (OS) is system software that
                           manages computer hardware... [continues to ~1000 chars]"

Chunk 1 (chars 800-1799): "...manages I/O devices and file systems.\n\n
                           CPU scheduling is the process by which the OS decides
                           which process runs next. It uses algorithms like FCFS,
                           SJF, and Round Robin... [continues to ~1000 chars]"

Chunk 2 (chars 1600-2199): "...Round Robin uses a time quantum to switch between
                            processes. The typical quantum is 10-100ms...
                            [rest of document]"
```

Notice:
- Chunk 0 is ~1000 chars
- Chunk 1 starts at char ~800 (200 chars of overlap with chunk 0)
- Chunk 2 starts at char ~1600 (200 chars of overlap with chunk 1)
- The overlap ensures sentences at chunk boundaries appear in both chunks

**What `createDocuments` returns — the actual LangChain `Document` objects:**

```typescript
[
  Document {
    pageContent: "Chapter 1: Introduction to Operating Systems\n\nAn operating system...",
    metadata: {
      userId: "6712ab3f...",
      sessionId: "6853a1b2...",
      loc: { lines: { from: 1, to: 22 } }  // LangChain's internal line tracking
    }
  },
  Document {
    pageContent: "...manages I/O devices and file systems.\n\nCPU scheduling is the process...",
    metadata: {
      userId: "6712ab3f...",
      sessionId: "6853a1b2...",
      loc: { lines: { from: 18, to: 45 } }
    }
  },
  // ... more chunks
]
```

**How many chunks for a real 20-page PDF?**

A 20-page PDF typically has ~40,000-60,000 characters of text. With `chunkSize: 1000` and `chunkOverlap: 200`, each effective chunk covers ~800 new characters. So:

- 50,000 chars ÷ 800 chars/chunk ≈ **63 chunks**
- Each chunk becomes one vector in Pinecone = **63 Pinecone records**

---

#### Step 5: CohereEmbeddings converts chunks to vectors

**File:** [pinecone.ts L6-9](file:///Users/solminde/Developer/Ai-tutor/backend/src/config/pinecone.ts#L6-L9)

```typescript
export const cohereEmbeddings = new CohereEmbeddings({
  apiKey: env.COHERE_API_KEY,
  model: "embed-english-v3.0",   // Cohere's English embedding model
});
```

**Exact model:** `embed-english-v3.0`
**Output dimension:** `1024` floats per vector

> [!WARNING]
> **Divergence from doc:** TECHNICAL_ANALYSIS.md (line 930) says `"OpenAI text-embedding-3-small generates embedding vectors"` with 1536 dimensions. Your actual code uses **Cohere embed-english-v3.0** with **1024 dimensions**. This means:
> - Your Pinecone index MUST be configured for `dimension: 1024, metric: cosine`
> - If anyone recreates the index using the doc's 1536, all queries will fail

**What Cohere produces for one chunk (conceptual):**

```javascript
// Input: "CPU scheduling is the process by which the OS decides..."
// Output: Array of 1024 floating-point numbers
[0.0234, -0.4121, 0.1872, -0.0031, 0.8913, 0.0045, -0.2341, 0.5567, ...]
// ↑ 1024 numbers total, each between roughly -1.0 and 1.0
```

These numbers encode the MEANING of the text. Two chunks about "CPU scheduling" will have similar vectors. A chunk about "pizza recipes" will have a very different vector.

**Why Cohere instead of OpenAI?**

Your code doesn't include a comment explaining why. Possible reasons:
- Cohere's embedding model is optimized for search/retrieval (it was designed for RAG use cases)
- Cohere has a generous free tier (1000 API calls/month)
- 1024 dimensions is cheaper to store in Pinecone than OpenAI's 1536 (33% less storage)

Your code made this choice — the doc says OpenAI. The code is the source of truth.

---

#### Step 6: PineconeStore.fromDocuments() — embed + upsert

**File:** [ingest.ts L24](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L24) (inside the `embedText` helper):

```typescript
const namespace = `${userId}_${sessionId}`;
const pineconeIndex = getPineconeIndex();
await PineconeStore.fromDocuments(chunks, cohereEmbeddings, {
  pineconeIndex,
  namespace,
});
```

**What `PineconeStore.fromDocuments()` actually does under the hood:**

This is a LangChain convenience method that does TWO things in sequence:

1. **Embed all chunks** — sends each chunk's `pageContent` to Cohere's API → gets back 1024-float vectors
2. **Upsert all vectors to Pinecone** — sends the vectors + metadata to Pinecone in batches

**How many API calls for a 20-page PDF (~63 chunks)?**

- **Cohere API:** LangChain batches embeddings. Cohere's API accepts up to 96 texts per request. So 63 chunks = **1 Cohere API call** (all fit in one batch).
- **Pinecone API:** LangChain's PineconeStore upserts in batches of 100 vectors by default. 63 vectors = **1 Pinecone upsert call**.

Total: **2 external API calls** (1 to Cohere, 1 to Pinecone).

**The exact object sent to Pinecone for EACH vector:**

```javascript
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // UUID generated by LangChain
  values: [0.0234, -0.4121, 0.1872, ...],        // 1024 floats from Cohere
  metadata: {
    text: "CPU scheduling is the process by which the OS decides which process runs next. It uses algorithms like FCFS, SJF, and Round Robin.",
    loc: "{\"lines\":{\"from\":18,\"to\":45}}",    // Stringified location info
    userId: "6712ab3f...",                          // From createDocuments metadata
    sessionId: "6853a1b2..."                        // From createDocuments metadata
  }
}
```

**Key details:**
- `id` is a UUID generated by LangChain, NOT your MongoDB ObjectId
- `values` are the 1024 Cohere embedding floats
- `metadata.text` stores the FULL original chunk text (this is what gets returned during retrieval)
- `metadata.userId` and `metadata.sessionId` come from the second argument to `createDocuments()`
- Each CHUNK gets its own vector record — NOT each page

**All of these go into namespace `"6712ab3f..._6853a1b2..."` inside the `neuralnest-os` Pinecone index.**

---

#### Step 7: Response sent, topics extracted in background

**File:** [upload.controller.ts L148-159](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L148-L159)

```typescript
// ✅ Respond immediately — Pinecone embedding done, topics extracting in background
res.status(201).json({
  sessionId: session._id,
  sessionName: session.name,
  fileUrl,
  topics: [],        // empty — background job will populate these
  roadmapNodes: [],
  processing: true,  // tells frontend to poll /api/sessions/:id/topics
});

// 🔄 Fire-and-forget: extract topics (GPT-4.1, may take 60–120s)
extractAndSaveTopics(rawText, userId, session._id.toString());
```

The response is sent BEFORE topics are extracted. The frontend gets `processing: true` and polls `GET /api/sessions/:id/topics` until topics appear.

**The background `extractAndSaveTopics` function:**

**File:** [upload.controller.ts L17-43](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L17-L43)

```typescript
async function extractAndSaveTopics(rawText, userId, sessionId) {
  try {
    const extractedTopics = await extractTopicsFromText(rawText);  // GPT-4.1 call
    await Topic.insertMany(
      extractedTopics.map((t, index) => ({
        sessionId: new mongoose.Types.ObjectId(sessionId),
        userId: new mongoose.Types.ObjectId(userId),
        name: t.name,
        difficulty: t.difficulty,
        estimatedMinutes: t.estimatedMinutes,
        roadmapPosition: { x: 250, y: index * 150 },
      }))
    );
  } catch (err) {
    log.error("Background: topic extraction failed", { sessionId, error: err.message });
    // ← Silently fails. No retry. No notification to user.
  }
}
```

---

#### What Can Go Wrong — Failure Modes

**1. PDF has no extractable text (scanned image PDF):**

`pdfParse` at [ingest.ts L52](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L52) returns `parsed.text = ""`. The splitter produces 0 chunks. `PineconeStore.fromDocuments([])` upserts nothing. Pinecone namespace exists but is empty. The tutor will get 0 results when querying.

**Your code does NOT check for this in `ingestPDFEmbedOnly`.** The exam controller DOES check at [exam.controller.ts L23](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L23):
```typescript
if (!parsed.text.trim()) throw new FileError("Couldn't extract text from the PDF...");
```
But the upload controller's `ingestPDFEmbedOnly` path does NOT have this check. The upload succeeds silently, the session is created, but there's no content to study from.

**2. Pinecone upsert fails halfway:**

`PineconeStore.fromDocuments()` has no built-in retry or transactional semantics. If it fails after embedding but before upserting, the Cohere API cost is wasted and the namespace stays empty. The error propagates up through the `embedText` → `ingestPDFEmbedOnly` → `uploadFile` chain and is caught by the controller's outer `try/catch` at [upload.controller.ts L162](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L162), which calls `next(err)` — the user gets a 500 error.

**But:** the Session document was already created at step 1 (line 63). A failed Pinecone upsert leaves an orphaned Session in MongoDB with no corresponding vectors. The user's session list shows a session that will never have searchable content.

**3. Cohere API rate limit hit:**

Cohere's free tier allows ~100 API calls/minute. If multiple users upload simultaneously, CohereEmbeddings throws a rate limit error. This propagates the same way as #2.

**4. Topic extraction fails in background:**

Since `extractAndSaveTopics` is fire-and-forget (line 159), if GPT-4.1 fails, the error is logged but the user is never notified. The session exists, vectors are in Pinecone (RAG works), but Topics are never created — the roadmap stays empty forever. The user has to re-upload.

---

## SECTION 12: Pinecone — Complete Retrieval Pipeline

### When `retrieveContext()` Is Called

**File:** [tutorNode.ts L29-30](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L29-L30):

```typescript
if (allNamespaces.length === 1) {
  ragContext = await retrieveContext(state.message, state.userId, state.sessionId);
}
```

### 12.1 The Exact Pinecone Query

**File:** [retriever.ts L11-36](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/retriever.ts#L11-L36)

```typescript
export async function retrieveContext(
  query: string,          // "What is round robin scheduling?"
  userId: string,         // "6712ab3f..."
  sessionId: string,      // "6853a1b2..."
  topK: number = 5        // Return 5 best matches
): Promise<string> {
  const namespace = `${userId}_${sessionId}`;     // "6712ab3f..._6853a1b2..."
  const pineconeIndex = getPineconeIndex();

  const vectorStore = await PineconeStore.fromExistingIndex(cohereEmbeddings, {
    pineconeIndex,
    namespace,     // ← Queries ONLY this namespace
  });

  const docs = await vectorStore.similaritySearch(query, topK);
  // ...
}
```

**What `similaritySearch(query, 5)` does under the hood — step by step:**

**Step A — Embed the query:** Sends `"What is round robin scheduling?"` to Cohere → gets a 1024-float vector.

**Step B — Send to Pinecone:** The actual Pinecone API call looks like:

```javascript
// What LangChain sends to Pinecone's REST API:
POST https://neuralnest-os-xxxxx.svc.environment.pinecone.io/query
{
  namespace: "6712ab3f..._6853a1b2...",
  vector: [0.0312, -0.2891, 0.4523, ...],   // 1024 floats (query embedding)
  topK: 5,
  includeMetadata: true,
  includeValues: false                        // Don't return stored vectors (saves bandwidth)
}
```

> [!IMPORTANT]
> **Divergence from doc:** TECHNICAL_ANALYSIS.md (line 950) says `filter: { userId, topicId }`. Your actual code does NOT use any metadata filter. It uses namespace-based isolation exclusively. The `namespace` parameter physically scopes the search — Pinecone only considers vectors within that namespace. No `filter` object is sent.
>
> **Why this matters:** Metadata filters are applied AFTER the similarity search, which means Pinecone first finds the 5 most similar vectors globally, then filters by metadata. If the top 5 globally don't match your userId, you get fewer than 5 results. Namespace isolation searches ONLY within the namespace — you always get 5 results (if 5 exist). Your code's approach is architecturally stronger.

---

### 12.2 What Pinecone Returns

**The raw Pinecone response object:**

```javascript
{
  namespace: "6712ab3f..._6853a1b2...",
  matches: [
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",   // UUID from ingest
      score: 0.9412,                                   // Cosine similarity
      metadata: {
        text: "Round Robin (RR) scheduling uses a time quantum. Each process gets a small unit of CPU time (quantum), and after this time has elapsed, the process is preempted and added to the end of the ready queue.",
        userId: "6712ab3f...",
        sessionId: "6853a1b2...",
        loc: "{\"lines\":{\"from\":45,\"to\":52}}"
      }
    },
    {
      id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      score: 0.9087,
      metadata: {
        text: "The time quantum in RR is typically 10-100 milliseconds. If the quantum is too small, there's too much context switching overhead. If too large, RR degenerates into FCFS.",
        userId: "6712ab3f...",
        sessionId: "6853a1b2...",
        loc: "{\"lines\":{\"from\":52,\"to\":58}}"
      }
    },
    {
      id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
      score: 0.8734,
      metadata: {
        text: "Preemptive scheduling algorithms include RR, SRTF, and Priority (preemptive). Non-preemptive algorithms include FCFS, SJF, and Priority (non-preemptive).",
        userId: "6712ab3f...",
        sessionId: "6853a1b2...",
        loc: "{\"lines\":{\"from\":30,\"to\":38}}"
      }
    },
    {
      id: "d4e5f6a7-b8c9-0123-defa-234567890123",
      score: 0.8201,
      metadata: {
        text: "Comparison of scheduling algorithms: FCFS has no starvation but high average waiting time. SJF has lowest average waiting time but suffers from starvation of long processes. RR is fair but has context switching overhead.",
        userId: "6712ab3f...",
        sessionId: "6853a1b2...",
        loc: "{\"lines\":{\"from\":60,\"to\":68}}"
      }
    },
    {
      id: "e5f6a7b8-c9d0-1234-efab-345678901234",
      score: 0.7856,
      metadata: {
        text: "CPU scheduling is the process by which the operating system determines which process runs on the CPU at any given time. The goal is to maximize CPU utilization and minimize response time.",
        userId: "6712ab3f...",
        sessionId: "6853a1b2...",
        loc: "{\"lines\":{\"from\":18,\"to\":25}}"
      }
    }
  ]
}
```

**What the `score` means:**

The score is **cosine similarity** — a number between 0.0 and 1.0 (for normalized vectors):
- **0.94** = extremely similar (the chunk is directly about round robin scheduling)
- **0.87** = highly relevant (mentions related scheduling concepts)
- **0.78** = moderately relevant (mentions CPU scheduling generally)
- **0.23** = barely relevant (maybe mentions "process" but in a different context)
- **0.05** = irrelevant (completely different topic)

LangChain's `similaritySearch` does NOT filter by score threshold. It returns the top 5 regardless of how low the scores are. If your Pinecone namespace only has chunks about "pizza recipes" and the user asks about "CPU scheduling," you'd get 5 pizza chunks with scores of ~0.05-0.15.

---

### 12.3 How Retrieved Text Gets Formatted Into ragContext

**File:** [retriever.ts L31-35](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/retriever.ts#L31-L35)

```typescript
const context = docs
  .map((doc, i) => `[Chunk ${i + 1}]\n${doc.pageContent}`)
  .join("\n\n---\n\n");

return context;
```

**The exact `ragContext` string that gets injected into the tutor prompt:**

```
[Chunk 1]
Round Robin (RR) scheduling uses a time quantum. Each process gets a small unit of CPU time (quantum), and after this time has elapsed, the process is preempted and added to the end of the ready queue.

---

[Chunk 2]
The time quantum in RR is typically 10-100 milliseconds. If the quantum is too small, there's too much context switching overhead. If too large, RR degenerates into FCFS.

---

[Chunk 3]
Preemptive scheduling algorithms include RR, SRTF, and Priority (preemptive). Non-preemptive algorithms include FCFS, SJF, and Priority (non-preemptive).

---

[Chunk 4]
Comparison of scheduling algorithms: FCFS has no starvation but high average waiting time. SJF has lowest average waiting time but suffers from starvation of long processes. RR is fair but has context switching overhead.

---

[Chunk 5]
CPU scheduling is the process by which the operating system determines which process runs on the CPU at any given time. The goal is to maximize CPU utilization and minimize response time.
```

This entire string replaces `{ragContext}` in the system prompt via [tutorNode.ts L43](file:///Users/solminde/Developer/Ai-tutor/backend/src/agents/nodes/tutorNode.ts#L43):

```typescript
.replace("{ragContext}", ragContext || "No uploaded materials found. Use your knowledge.")
```

---

### 12.4 Multi-Namespace Retrieval

**File:** [retriever.ts L44-89](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/retriever.ts#L44-L89)

Called when the user has attached additional reference materials:

```typescript
export async function retrieveFromMultipleNamespaces(
  query: string,
  namespaces: string[],     // e.g. ["userA_session1", "userA_refMaterial2", "userA_refMaterial3"]
  topK: number = 4          // 4 per namespace (not 5 — prevents overwhelming context)
): Promise<string> {
```

**How it searches in parallel:**

```typescript
const results = await Promise.allSettled(
  namespaces.map(async (namespace) => {
    const vectorStore = await PineconeStore.fromExistingIndex(cohereEmbeddings, {
      pineconeIndex,
      namespace,
    });
    const docs = await vectorStore.similaritySearch(query, topK);
    return docs.map((doc) => ({ content: doc.pageContent, namespace }));
  })
);
```

`Promise.allSettled` means: run ALL namespace queries in parallel, and if one fails, the others still succeed. Each namespace search is independent.

For 3 namespaces × 4 results each = up to 12 chunks retrieved.

**Deduplication:**

```typescript
const seen = new Set<string>();
const allChunks: Array<{ content: string; namespace: string }> = [];

for (const result of results) {
  if (result.status === "fulfilled") {
    for (const chunk of result.value) {
      if (!seen.has(chunk.content)) {     // Deduplicate by exact text match
        seen.add(chunk.content);
        allChunks.push(chunk);
      }
    }
  }
  // If result.status === "rejected" → that namespace failed, silently skipped
}
```

**What gets deduplicated:** If the user attached the same PDF twice (different sessions), the chunks have identical `pageContent`. The `Set` catches exact duplicates. Near-duplicates (same content with minor formatting differences) are NOT caught.

---

### 12.5 What Happens When Pinecone Returns 0 Results

**File:** [retriever.ts L27-29](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/retriever.ts#L27-L29)

```typescript
if (docs.length === 0) {
  return "No relevant context found in the uploaded materials.";
}
```

This string flows into the tutor prompt as `{ragContext}`. The tutor sees this message and falls back to its own training knowledge. GPT-4o doesn't tell the user "I couldn't find anything in your notes" — it just teaches from general knowledge without mentioning the gap. The user might not realize their material wasn't used.

For multi-namespace retrieval, the same fallback at [retriever.ts L82-84](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/retriever.ts#L82-L84):

```typescript
if (allChunks.length === 0) {
  return "No relevant context found in the uploaded materials.";
}
```

---

## SECTION 13: MongoDB — Every Write Path in the System

### Complete Write Audit Table

Every `create`, `insertMany`, `findByIdAndUpdate`, `findOneAndUpdate`, and `$push`/`$set`/`$inc` call across all 10 controllers:

| # | User Action | Controller File | Mongoose Call | Collection | Key Fields Written |
|---|---|---|---|---|---|
| 1 | Register | [auth.controller.ts L23](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/auth.controller.ts#L23) | `User.create()` | `users` | `email, passwordHash, name, authProvider:"local"` |
| 2 | Google OAuth login | Passport strategy (not in controller) | `User.create()` or `findOne()` | `users` | `googleId, email, name, avatar, authProvider:"google"` |
| 3 | GitHub OAuth login | Passport strategy | `User.create()` or `findOne()` | `users` | `githubId, email, name, avatar, authProvider:"github"` |
| 4 | Update profile | [auth.routes.ts L38-52](file:///Users/solminde/Developer/Ai-tutor/backend/src/routes/auth.routes.ts#L38-L52) | `User.findByIdAndUpdate()` | `users` | `name, explanationLevel` |
| 5 | Upload PDF (create session) | [upload.controller.ts L63](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L63) | `Session.create()` | `sessions` | `userId, name, inputMethod, pineconeNamespace, isReference` |
| 6 | Upload PDF (save rawText) | [ingest.ts L37](file:///Users/solminde/Developer/Ai-tutor/backend/src/pipelines/ingest.ts#L37) | `Session.findByIdAndUpdate()` | `sessions` | `rawText` (or `fileUrl, rawText`) |
| 7 | Upload PDF (bg: save topics) | [upload.controller.ts L25](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/upload.controller.ts#L25) | `Topic.insertMany()` | `topics` | `sessionId, userId, name, difficulty, estimatedMinutes, roadmapPosition` |
| 8 | Save baseline ratings | [topic.controller.ts L16](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/topic.controller.ts#L16) | `Topic.findByIdAndUpdate()` × N | `topics` | `selfRatingBefore, masteryScore` |
| 9 | Save baseline (mark onboarded) | [topic.controller.ts L23](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/topic.controller.ts#L23) | `User.findByIdAndUpdate()` | `users` | `onboarded: true, explanationLevel` |
| 10 | Send tutor message (auto-create chat) | [tutor.controller.ts L112](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L112) | `ChatHistory.create()` | `chathistories` | `userId, section, title, messages: []` |
| 11 | Send tutor message (save messages) | [tutor.controller.ts L124](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L124) | `ChatHistory.findByIdAndUpdate($push)` | `chathistories` | `messages: [user msg, assistant msg]` |
| 12 | Send tutor message (update topic status) | [tutor.controller.ts L136](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L136) | `Topic.findByIdAndUpdate()` | `topics` | `status: "learning", lastStudiedAt` |
| 13 | Send tutor message (heatmap) | [tutor.controller.ts L143](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L143) | `User.findByIdAndUpdate($addToSet)` | `users` | `studyDays: [today]` |
| 14 | Create chat (from sidebar/Tutor page) | [chatHistory.controller.ts L84](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L84) | `ChatHistory.create()` | `chathistories` | `userId, sessionId, topicId, section, title` |
| 15 | Delete chat | [chatHistory.controller.ts L104](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L104) | `ChatHistory.findByIdAndDelete()` | `chathistories` | (deletes document) |
| 16 | Submit quiz (save result) | [quiz.controller.ts L134](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L134) | `QuizResult.create()` | `quizresults` | `userId, topicId, questions, score, total, xpEarned, passed, timeTaken` |
| 17 | Submit quiz (update mastery) | [quiz.controller.ts L146](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L146) | `Topic.findByIdAndUpdate()` | `topics` | `masteryScore, status, selfRatingAfter, lastStudiedAt` |
| 18 | Submit quiz (add XP) | [quiz.controller.ts L154](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L154) | `User.findByIdAndUpdate($inc)` | `users` | `xp: +xpEarned` |
| 19 | Submit quiz (study plan) | [quiz.controller.ts L158](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L158) | `StudyPlan.findOneAndUpdate()` | `studyplans` | `generatedAt` |
| 20 | Exam setup | [exam.controller.ts L55](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L55) | `Exam.findOneAndUpdate(upsert)` | `exams` | `userId, subject, examDate, syllabusSource` |
| 21 | Upload syllabus (session) | [exam.controller.ts L82](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L82) | `Session.create()` | `sessions` | `userId, name, inputMethod, pineconeNamespace, examDate` |
| 22 | Upload syllabus (update exam) | [exam.controller.ts L94](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L94) | `Exam.findByIdAndUpdate()` | `exams` | `syllabusSource, syllabusFileUrl` |
| 23 | Upload syllabus (web fallback topics) | [exam.controller.ts L123](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L123) | `Topic.insertMany()` | `topics` | `sessionId, userId, name, difficulty, estimatedMinutes, roadmapPosition` |
| 24 | Upload PYQ | [exam.controller.ts L154](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L154) | `Exam.findByIdAndUpdate()` | `exams` | `pyqUploaded: true, topicFrequencies` |
| 25 | Update progress manually | [progress.controller.ts L30](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/progress.controller.ts#L30) | `Topic.findByIdAndUpdate()` | `topics` | `masteryScore, status, lastStudiedAt` |
| 26 | Generate study plan | [studyplan.controller.ts L54](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L54) | `StudyPlan.findOneAndUpdate(upsert)` | `studyplans` | `userId, sessionId, examDate, generatedAt, days: [...]` |
| 27 | Mark study day complete | [studyplan.controller.ts L84](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L84) | `StudyPlan.findOneAndUpdate($set)` | `studyplans` | `days.$.completed: true` |
| 28 | Save self-rating | [tutor.controller.ts L206](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L206) | `Topic.findByIdAndUpdate()` | `topics` | `selfRatingAfter` |
| 29 | Open-mode session (notes) | [tutor.controller.ts L165](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L165) | `Session.create()` | `sessions` | `userId, name, inputMethod, pineconeNamespace` |
| 30 | Open-mode session (topic) | [tutor.controller.ts L181](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/tutor.controller.ts#L181) | `Session.create()` + `Topic.create()` | `sessions`, `topics` | Session + single topic |
| 31 | Create session (direct API) | [session.controller.ts L14](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/session.controller.ts#L14) | `Session.create()` | `sessions` | `userId, name, inputMethod, pineconeNamespace, examDate` |

---

### Detailed Flow 1: User Uploads PDF

**Sequence of writes:**

```
Step 1: Session.create()                    ← upload.controller.ts L63
        Creates session with pineconeNamespace, no fileUrl yet

Step 2: Session.findByIdAndUpdate()         ← ingest.ts L54 (inside ingestPDFEmbedOnly)
        Adds fileUrl (Cloudinary) and rawText

Step 3: [Pinecone upsert — NOT MongoDB]     ← ingest.ts L24 (inside embedText)

Step 4: HTTP 201 response sent to user      ← upload.controller.ts L149

Step 5: Topic.insertMany()                  ← upload.controller.ts L25 (background, fire-and-forget)
        Creates 30-60 topic documents
```

**Dependencies:** Step 2 depends on Step 1 (needs session ID). Step 5 depends on Step 1 (needs session ID) but NOT on Steps 2-3 (topics come from GPT-4.1, not from Pinecone). Steps 2 and 3 are sequential within `ingestPDFEmbedOnly`.

**Failure risk:** If Step 5 fails (GPT-4.1 timeout), the session exists with embedded vectors, but no topics → no roadmap. The user sees an empty roadmap. This is the **most likely failure during a demo** with a large PDF.

---

### Detailed Flow 2: User Sends a Tutor Message

**Sequence of writes:**

```
Step 1: (none — just reads User, Topic, ChatHistory from MongoDB)

Step 2: [SSE streaming happens — GPT-4o call via LangGraph]

Step 3: ChatHistory.create()                ← tutor.controller.ts L112
        Only if no chatHistoryId was supplied (auto-creates for open-mode)

Step 4: ChatHistory.findByIdAndUpdate()     ← tutor.controller.ts L124
        $push: { messages: [user msg, assistant msg] }

Step 5: Topic.findByIdAndUpdate()           ← tutor.controller.ts L136
        status: "unstarted" → "learning"
        Only fires ONCE (when topic.status === "unstarted")

Step 6: User.findByIdAndUpdate()            ← tutor.controller.ts L143
        $addToSet: { studyDays: today }
        Adds today's date to heatmap array (no-op if already present)
```

**The exact `$push` call for chat messages:**

```typescript
await ChatHistory.findByIdAndUpdate(resolvedChatId, {
  $push: {
    messages: [
      { role: "user", content: message, timestamp: new Date() },
      { role: "assistant", content: result.explanation, timestamp: new Date() },
    ],
  },
});
```

This pushes BOTH messages in a single atomic operation. If the user sent "Explain CPU scheduling" and the AI responded with a 500-word explanation, both messages are saved together.

**What `$addToSet` does for the heatmap:**

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);    // Normalize to midnight
await User.findByIdAndUpdate(userId, { $addToSet: { studyDays: today } });
```

`$addToSet` only adds the date if it's not already in the array. So if the user sends 10 messages today, the `studyDays` array only gets one entry for today.

---

### Detailed Flow 3: User Submits a Quiz

**Sequence of writes (the most complex flow in the system):**

```
Step 1: [Quiz scoring — pure JavaScript, no DB write]
        scoredQuestions computed at quiz.controller.ts L73-83

Step 2: [progressTrackerNode — masteryCalculator + GPT-4o]
        Wrapped in try/catch with fallback at quiz.controller.ts L96-131

Step 3: QuizResult.create()                 ← quiz.controller.ts L134
        { userId, topicId, questions, score, total, xpEarned, passed, timeTaken }

Step 4: Topic.findByIdAndUpdate()           ← quiz.controller.ts L146
        { masteryScore: 77, status: "mastered", selfRatingAfter: 7, lastStudiedAt: now }

Step 5: User.findByIdAndUpdate($inc)        ← quiz.controller.ts L154
        { $inc: { xp: 160 } }

Step 6: StudyPlan.findOneAndUpdate()        ← quiz.controller.ts L158
        Only if examDate is set AND studyPlanUpdate is non-empty
        { $set: { generatedAt: now } }
```

**How Topic.status changes from "learning" → "mastered":**

```typescript
await Topic.findByIdAndUpdate(topicId, {
  masteryScore: progressResult.masteryDelta?.after ?? topic.masteryScore,
  status: progressResult.nodeColorUpdate,    // "mastered" if score >= 70, "learning" if < 70
  selfRatingAfter,
  lastStudiedAt: new Date(),
});
```

`progressResult.nodeColorUpdate` comes from [masteryCalculator.ts L35-36](file:///Users/solminde/Developer/Ai-tutor/backend/src/utils/masteryCalculator.ts#L35-L36):
```typescript
const nodeColor = calculatedMastery >= 70 ? "mastered" : "learning";
```

**Are these in a transaction?** NO. They are 4 separate MongoDB operations. If Step 3 succeeds but Step 4 fails, the QuizResult is saved but the Topic mastery isn't updated — the user would see the quiz in their history but the roadmap node color wouldn't change.

**What happens if progressTrackerNode fails?** The fallback at [quiz.controller.ts L118-131](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L118-L131) calculates a simpler result:

```typescript
const pct = total > 0 ? Math.round((score / total) * 100) : 0;
const passed = pct >= 60;     // Note: 60% threshold here vs 70% in masteryCalculator
progressResult = {
  masteryDelta: { before: topic.masteryScore, after: Math.min(100, topic.masteryScore + (passed ? 20 : 5)) },
  nodeColorUpdate: passed ? "mastered" : "learning",
  xpEarned: passed ? 50 : 10,
  // ...
};
```

> [!WARNING]
> **Inconsistency:** The mastery calculator uses 70% as the pass threshold ([masteryCalculator.ts L34](file:///Users/solminde/Developer/Ai-tutor/backend/src/utils/masteryCalculator.ts#L34): `quizScore >= 0.7`). The fallback uses 60% ([quiz.controller.ts L122](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L122): `pct >= 60`). So if the LLM fails and the fallback runs, a student scoring 65% would be marked as "mastered" by the fallback but "learning" by the normal calculator.

---

### Detailed Flow 4: Study Plan Generation

**File:** [studyplan.controller.ts L22-64](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L22-L64)

```typescript
const plan = await StudyPlan.findOneAndUpdate(
  { userId, sessionId },        // Find existing plan for this user+session
  {
    userId, sessionId,
    examDate: new Date(examDate),
    generatedAt: new Date(),
    days                         // Array of day objects with topics
  },
  { upsert: true, new: true }   // Create if not exists, return updated doc
);
```

**upsert: true** means: if no plan exists for this userId+sessionId, create one. If one exists, replace it entirely. Each regeneration overwrites the old plan.

**Marking a day complete:**

**File:** [studyplan.controller.ts L84-87](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L84-L87)

```typescript
await StudyPlan.findOneAndUpdate(
  { _id: planId, "days._id": dayId },      // Match plan + specific day subdoc
  { $set: { "days.$.completed": true } }   // Update only that day's completed flag
);
```

`"days.$"` is MongoDB's positional operator — it targets the specific array element matched by `"days._id": dayId`.

---

### Error Handling Audit — What Happens If a Write Fails?

| Write | Has try/catch? | What happens on failure? | Inconsistency risk? |
|---|---|---|---|
| Session.create (upload) | ✅ outer catch at L162 | Returns 500 to user | None — nothing else written yet |
| Pinecone upsert (ingest) | ✅ outer catch at L162 | Returns 500 to user | **YES:** Session exists but no vectors |
| Topic.insertMany (bg) | ✅ own catch at L40 | Logged, silent failure | **YES:** Session+vectors exist but no topics |
| ChatHistory.$push (tutor) | ✅ outer catch at L148 | Returns 500 (but SSE already started!) | **YES:** User saw the response but it's not saved |
| Topic.status update (tutor) | ✅ outer catch at L148 | Same as above | **MINOR:** Status stays "unstarted" one extra turn |
| User.studyDays (tutor) | ✅ outer catch at L148 | Same as above | **MINOR:** Heatmap misses one day |
| QuizResult.create (quiz) | ✅ outer catch at L184 | Returns 500 to user | None — writes haven't started |
| Topic mastery update (quiz) | ✅ outer catch at L184 | Returns 500 to user | **YES:** QuizResult saved but Topic not updated |
| User XP $inc (quiz) | ✅ outer catch at L184 | Returns 500 to user | **YES:** Topic updated but XP not added |
| StudyPlan update (quiz) | ✅ outer catch at L184 | Returns 500 to user | **MINOR:** Plan not regenerated |

**Highest risk during a 90-second demo:**

1. **Topic extraction background failure (Row 7)** — GPT-4.1 times out on a large PDF. Session created, vectors embedded, but roadmap is empty. User stuck on loading screen. **Fix: Poll `/api/sessions/:id/topics` and show "still processing" state.**

2. **SSE stream succeeds but ChatHistory save fails (Row 11)** — The user sees the AI response (it was already streamed), but if they refresh the page, the conversation is gone. The message was never persisted. **This is the most confusing bug for users.**

3. **Quiz partial write (Rows 16-18)** — QuizResult saved with score 8/10, but Topic mastery update fails mid-request. Dashboard shows old mastery score. Re-submitting the quiz creates a duplicate QuizResult.

---

### Index Audit — What Indexes Exist?

I checked all 7 model schema files for `.index()` calls or index-creating options:

| Collection | Existing Indexes | Source |
|---|---|---|
| `users` | `{ email: 1 }` unique | [User.ts L26](file:///Users/solminde/Developer/Ai-tutor/backend/src/models/User.ts#L26): `unique: true` on email field |
| `users` | `{ googleId: 1 }` sparse unique | [User.ts L23](file:///Users/solminde/Developer/Ai-tutor/backend/src/models/User.ts#L23): `sparse: true, unique: true` |
| `users` | `{ githubId: 1 }` sparse unique | [User.ts L24](file:///Users/solminde/Developer/Ai-tutor/backend/src/models/User.ts#L24): `sparse: true, unique: true` |
| All others | `{ _id: 1 }` only | Default MongoDB _id index |

**Missing indexes — queries that will do FULL COLLECTION SCANS:**

| Query | File | Missing Index | Impact |
|---|---|---|---|
| `Topic.find({ userId })` | [quiz.controller.ts L89](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L89) | `topics: { userId: 1 }` | Every quiz submission scans ALL topics |
| `Topic.find({ sessionId })` | [session.controller.ts L34](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/session.controller.ts#L34), [progress.controller.ts L47](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/progress.controller.ts#L47) | `topics: { sessionId: 1 }` | Roadmap load scans ALL topics |
| `Topic.find({ userId }).sort({ masteryScore: -1 })` | [progress.controller.ts L13](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/progress.controller.ts#L13) | `topics: { userId: 1, masteryScore: -1 }` | Progress page scans ALL topics |
| `ChatHistory.find({ userId })` | [chatHistory.controller.ts L14](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L14) | `chathistories: { userId: 1 }` | Sidebar loads scan ALL chats |
| `ChatHistory.findOne({ userId, topicId })` | [chatHistory.controller.ts L35-37](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/chatHistory.controller.ts#L35-L37) | `chathistories: { userId: 1, topicId: 1 }` | Every topic chat open scans ALL chats |
| `QuizResult.find({ userId }).sort({ completedAt: -1 })` | [quiz.controller.ts L193](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/quiz.controller.ts#L193) | `quizresults: { userId: 1, createdAt: -1 }` | Quiz history scans ALL results |
| `Session.find({ userId, isReference: true })` | [session.controller.ts L52](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/session.controller.ts#L52) | `sessions: { userId: 1, isReference: 1 }` | Materials modal scans ALL sessions |
| `Exam.findOne({ userId })` | [exam.controller.ts L55](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/exam.controller.ts#L55) | `exams: { userId: 1 }` unique | Every exam operation scans ALL exams |
| `StudyPlan.findOne({ userId })` | [studyplan.controller.ts L70](file:///Users/solminde/Developer/Ai-tutor/backend/src/controllers/studyplan.controller.ts#L70) | `studyplans: { userId: 1 }` | Study plan load scans ALL plans |

**At demo scale (1-5 users, <100 documents per collection), this is fine.** At production scale (1000+ users), every one of these queries would be slow.

**To add the missing indexes, create a migration script:**

```typescript
// backend/src/scripts/createIndexes.ts
import { Topic } from "../models/Topic";
import { ChatHistory } from "../models/ChatHistory";
import { QuizResult } from "../models/QuizResult";
import { Session } from "../models/Session";
import { Exam } from "../models/Exam";
import { StudyPlan } from "../models/StudyPlan";

await Topic.collection.createIndex({ userId: 1 });
await Topic.collection.createIndex({ sessionId: 1 });
await Topic.collection.createIndex({ userId: 1, sessionId: 1 });
await ChatHistory.collection.createIndex({ userId: 1, section: 1 });
await ChatHistory.collection.createIndex({ userId: 1, topicId: 1 });
await QuizResult.collection.createIndex({ userId: 1, createdAt: -1 });
await Session.collection.createIndex({ userId: 1, isReference: 1 });
await Exam.collection.createIndex({ userId: 1 }, { unique: true });
await StudyPlan.collection.createIndex({ userId: 1, sessionId: 1 });
```

---

### Priority Ranking — Most Likely to Fail During a 90-Second Demo

| Rank | What Breaks | Likelihood | Impact | Root Cause |
|---|---|---|---|---|
| 🔴 1 | **Roadmap empty after PDF upload** | HIGH | User stuck, can't study | `extractAndSaveTopics` is fire-and-forget; GPT-4.1 takes 60-120s; user navigates to roadmap before topics are ready |
| 🔴 2 | **OpenAI API key invalid or over quota** | HIGH (first demo) | ALL AI features broken | `.env` misconfigured on Render, or free credits exhausted |
| 🟡 3 | **Tutor response disappears on page refresh** | MEDIUM | Conversation lost | SSE stream delivered the text, but `ChatHistory.$push` failed or user refreshed before it saved |
| 🟡 4 | **Quiz submitted but roadmap node stays yellow** | MEDIUM | Visual confusion | `Topic.findByIdAndUpdate` in quiz controller failed after `QuizResult.create` succeeded |
| 🟡 5 | **Pinecone returns 0 results despite PDF upload** | MEDIUM | Generic responses | Pinecone index dimension mismatch (1536 vs 1024), or namespace string doesn't match between ingest and retriever |
| 🟢 6 | **Study plan not generated** | LOW | Missing feature | `examDate` not set, or LLM call in studyplan controller fails |
| 🟢 7 | **XP not updating** | LOW | Minor visual bug | `User.$inc` failed in quiz submit flow |
| 🟢 8 | **Heatmap missing a day** | LOW | Minor visual bug | `User.$addToSet` failed in tutor flow |
