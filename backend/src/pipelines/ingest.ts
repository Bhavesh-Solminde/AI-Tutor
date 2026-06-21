import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import pdfParse from "pdf-parse";
import { cohereEmbeddings, getPineconeIndex } from "../config/pinecone";
import { uploadPdfToCloudinary } from "../utils/cloudinaryUpload";
import { extractTopicsFromText } from "./topicExtractor";
import { Topic } from "../models/Topic";
import { Session } from "../models/Session";
import mongoose from "mongoose";
import { createLogger } from "../config/logger";

const log = createLogger("pipeline:ingest");

// ─── Shared chunk + embed helper ─────────────────────────────────────────────
async function embedText(
  rawText: string,
  userId: string,
  sessionId: string
): Promise<void> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await splitter.createDocuments([rawText], [{ userId, sessionId }]);
  const namespace = `${userId}_${sessionId}`;
  const pineconeIndex = getPineconeIndex();
  await PineconeStore.fromDocuments(chunks, cohereEmbeddings, { pineconeIndex, namespace });
  log.info("Pinecone upsert complete", { namespace, chunkCount: chunks.length });
}

/**
 * Embed-only for text — chunks + upserts to Pinecone, no topic extraction.
 * Used by the upload controller so it can respond fast and extract topics in bg.
 */
export async function ingestTextEmbedOnly(
  rawText: string,
  userId: string,
  sessionId: string
): Promise<void> {
  await Session.findByIdAndUpdate(sessionId, { rawText });
  await embedText(rawText, userId, sessionId);
}

/**
 * Embed-only for PDF — Cloudinary + pdf-parse + Pinecone, no topic extraction.
 * Returns { rawText, fileUrl } so the caller can run topic extraction later.
 */
export async function ingestPDFEmbedOnly(
  buffer: Buffer,
  originalName: string,
  userId: string,
  sessionId: string
): Promise<{ rawText: string; fileUrl: string }> {
  const fileUrl = await uploadPdfToCloudinary(buffer, originalName);
  const parsed = await pdfParse(buffer);
  const rawText = parsed.text;
  if (!rawText.trim()) {
    log.warn("PDF has no extractable text (scanned/image-only PDF)", { originalName, sessionId });
    throw new Error("Couldn't extract text from the PDF. It may be a scanned/image-only document.");
  }
  await Session.findByIdAndUpdate(sessionId, { fileUrl, rawText });
  await embedText(rawText, userId, sessionId);
  return { rawText, fileUrl };
}



export interface IngestResult {
  fileUrl: string;
  sessionId: string;
  topics: Array<{
    _id: string;
    name: string;
    difficulty: string;
    estimatedMinutes: number;
    status: string;
  }>;
  roadmapNodes: Array<{
    id: string;
    label: string;
    status: string;
    position: { x: number; y: number };
    difficulty: string;
    estimatedMinutes: number;
  }>;
}

/**
 * Full ingestion pipeline:
 * PDF Buffer → Cloudinary → pdf-parse → RecursiveCharacterTextSplitter
 * → CohereEmbeddings (embed-english-v3.0, 1024 dim) → Pinecone
 * → GPT-4o topic extraction → MongoDB Topics
 *
 * Maps to n8n: File Type Switch → Extract PDF → Default Data Loader
 * → Recursive Text Splitter → Embeddings Cohere1 → Pinecone (Insert)
 * → OpenAI Topic Extractor → MongoDB (Save Topics)
 */
export async function ingestPDF(
  buffer: Buffer,
  originalName: string,
  userId: string,
  sessionId: string
): Promise<IngestResult> {
  log.info("ingestPDF started", { originalName, userId, sessionId });

  // 1. Upload PDF to Cloudinary (raw mode)
  const fileUrl = await uploadPdfToCloudinary(buffer, originalName);
  log.info("Step 1: Cloudinary upload done", { fileUrl });

  // 2. Extract text from PDF
  const parsed = await pdfParse(buffer);
  const rawText = parsed.text;
  log.info("Step 2: PDF parsed", { charCount: rawText.length });

  // 3. Update session with file URL and raw text
  await Session.findByIdAndUpdate(sessionId, { fileUrl, rawText });

  // 4. Chunk the text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.createDocuments(
    [rawText],
    [{ userId, sessionId }]
  );
  log.info("Step 3: Text chunked", { chunkCount: chunks.length, chunkSize: 1000 });

  // 5. Embed and upsert to Pinecone (LangSmith traces this)
  const namespace = `${userId}_${sessionId}`;
  const pineconeIndex = getPineconeIndex();
  await PineconeStore.fromDocuments(chunks, cohereEmbeddings, {
    pineconeIndex,
    namespace,
  });
  log.info("Step 4: Pinecone upsert complete", { namespace, chunkCount: chunks.length });

  // 6. Extract topics using GPT-4o (LangSmith traces this)
  const extractedTopics = await extractTopicsFromText(rawText);

  // 7. Save topics to MongoDB
  const topicDocs = await Topic.insertMany(
    extractedTopics.map((t, index) => ({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId),
      name: t.name,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
      roadmapPosition: { x: 250, y: index * 150 },
    }))
  );
  log.info("Step 5: Topics saved to MongoDB", {
    topicCount: topicDocs.length,
    topicNames: topicDocs.map((d) => d.name),
  });

  // 8. Build roadmap nodes for React Flow
  const roadmapNodes = topicDocs.map((doc) => ({
    id: doc._id.toString(),
    label: doc.name,
    status: "unstarted" as const,
    position: doc.roadmapPosition,
    difficulty: doc.difficulty,
    estimatedMinutes: doc.estimatedMinutes,
  }));

  return {
    fileUrl,
    sessionId,
    topics: topicDocs.map((d) => ({
      _id: d._id.toString(),
      name: d.name,
      difficulty: d.difficulty,
      estimatedMinutes: d.estimatedMinutes,
      status: d.status,
    })),
    roadmapNodes,
  };
}

/**
 * Ingest raw text (pasted notes) — skips Cloudinary and pdf-parse.
 */
export async function ingestText(
  rawText: string,
  userId: string,
  sessionId: string
): Promise<IngestResult> {
  log.info("ingestText started", { charCount: rawText.length, userId, sessionId });

  await Session.findByIdAndUpdate(sessionId, { rawText });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.createDocuments([rawText], [{ userId, sessionId }]);
  log.info("Text chunked", { chunkCount: chunks.length });

  const namespace = `${userId}_${sessionId}`;
  const pineconeIndex = getPineconeIndex();
  await PineconeStore.fromDocuments(chunks, cohereEmbeddings, {
    pineconeIndex,
    namespace,
  });
  log.info("Pinecone upsert complete", { namespace, chunkCount: chunks.length });

  const extractedTopics = await extractTopicsFromText(rawText); // LangSmith traces this
  const topicDocs = await Topic.insertMany(
    extractedTopics.map((t, index) => ({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId),
      name: t.name,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
      roadmapPosition: { x: 250, y: index * 150 },
    }))
  );
  log.info("Topics saved to MongoDB", { topicCount: topicDocs.length, topicNames: topicDocs.map((d) => d.name) });

  const roadmapNodes = topicDocs.map((doc) => ({
    id: doc._id.toString(),
    label: doc.name,
    status: "unstarted" as const,
    position: doc.roadmapPosition,
    difficulty: doc.difficulty,
    estimatedMinutes: doc.estimatedMinutes,
  }));

  return {
    fileUrl: "",
    sessionId,
    topics: topicDocs.map((d) => ({
      _id: d._id.toString(),
      name: d.name,
      difficulty: d.difficulty,
      estimatedMinutes: d.estimatedMinutes,
      status: d.status,
    })),
    roadmapNodes,
  };
}

/**
 * Reference-only ingestion — embeds content in Pinecone for RAG retrieval
 * WITHOUT extracting topics or creating roadmap nodes.
 * Used when a user attaches a material during a chat session.
 */
export async function ingestReference(
  buffer: Buffer | null,
  rawText: string | null,
  originalName: string,
  userId: string,
  sessionId: string
): Promise<{ fileUrl: string; sessionId: string }> {
  log.info("ingestReference started", { originalName, userId, sessionId });

  let fileUrl = "";
  let text = rawText || "";

  if (buffer && !rawText) {
    // Upload to Cloudinary for reference URL
    fileUrl = await uploadPdfToCloudinary(buffer, originalName);
    log.info("ingestReference: Cloudinary upload done", { fileUrl });

    // Parse PDF text
    const parsed = await pdfParse(buffer);
    text = parsed.text;
    log.info("ingestReference: PDF parsed", { charCount: text.length });

    // Store fileUrl on session
    await Session.findByIdAndUpdate(sessionId, { fileUrl, rawText: text });
  } else {
    await Session.findByIdAndUpdate(sessionId, { rawText: text });
  }

  // Chunk and embed
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await splitter.createDocuments([text], [{ userId, sessionId }]);
  log.info("ingestReference: text chunked", { chunkCount: chunks.length });

  const namespace = `${userId}_${sessionId}`;
  const pineconeIndex = getPineconeIndex();
  await PineconeStore.fromDocuments(chunks, cohereEmbeddings, { pineconeIndex, namespace });
  log.info("ingestReference: Pinecone upsert complete", { namespace, chunkCount: chunks.length });

  return { fileUrl, sessionId };
}
