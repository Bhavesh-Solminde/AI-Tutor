import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Session } from "../models/Session";
import { ingestReference, ingestTextEmbedOnly, ingestPDFEmbedOnly } from "../pipelines/ingest";
import { extractTopicsFromText } from "../pipelines/topicExtractor";
import { Topic } from "../models/Topic";
import mongoose from "mongoose";
import { FileError } from "../utils/AppError";
import { createLogger } from "../config/logger";

const log = createLogger("controller:upload");

/**
 * Background job: extract topics via o4-mini and save to MongoDB.
 * Called AFTER the HTTP response has already been sent — no timeout risk.
 */
async function extractAndSaveTopics(
  rawText: string,
  userId: string,
  sessionId: string
): Promise<void> {
  const MAX_RETRIES = 2;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      log.info("Background: topic extraction started", { sessionId, attempt });
      const extractedTopics = await extractTopicsFromText(rawText);
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
      log.info("Background: topics saved", {
        sessionId,
        topicCount: extractedTopics.length,
        topicNames: extractedTopics.map((t) => t.name),
      });
      return; // Success — exit retry loop
    } catch (err: any) {
      log.error("Background: topic extraction failed", { sessionId, attempt, error: err.message });
      if (attempt < MAX_RETRIES) {
        // Wait before retrying (exponential backoff: 5s, 10s)
        const delayMs = attempt * 5000;
        log.info("Background: retrying topic extraction", { sessionId, nextAttempt: attempt + 1, delayMs });
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        // All retries exhausted — mark session with error message
        log.error("Background: all retries exhausted — marking session with error", { sessionId });
        await Session.findByIdAndUpdate(sessionId, { processingError: err.message || "Unknown error during topic extraction" });
      }
    }
  }
}

// POST /api/upload
export async function uploadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { sessionName, inputMethod, referenceOnly } = req.body;
    const isReferenceOnly = referenceOnly === "true" || referenceOnly === true;
    const userId = req.userId!;

    log.info("Upload request received", {
      fileName: file?.originalname,
      fileSize: file?.size,
      inputMethod: inputMethod || (file ? "file" : "text"),
      referenceOnly: isReferenceOnly,
      userId,
    });

    // Create session first
    const namespace = `${userId}_${new mongoose.Types.ObjectId()}`;
    const session = await Session.create({
      userId,
      name: sessionName || file?.originalname || "New Session",
      inputMethod: inputMethod || (file ? "pdf" : "notes"),
      pineconeNamespace: namespace,
      isReference: isReferenceOnly,
    });
    log.info("Session created", { sessionId: session._id, namespace, referenceOnly: isReferenceOnly });

    // ── Reference-only mode: embed only, no topic extraction ──────────────────
    if (isReferenceOnly) {
      const ext = file ? ("." + file.originalname.split(".").pop()?.toLowerCase()) : "";
      let refResult: { fileUrl: string; sessionId: string };

      if (file && ext === ".pdf") {
        refResult = await ingestReference(file.buffer, null, file.originalname, userId, session._id.toString());
      } else if (file) {
        let rawText = "";
        if ([".txt", ".md", ".markdown"].includes(ext)) {
          rawText = file.buffer.toString("utf-8");
        } else if (ext === ".docx") {
          const mammoth = await import("mammoth");
          const { value } = await mammoth.extractRawText({ buffer: file.buffer });
          rawText = value;
        } else {
          return next(new FileError(`Unsupported file type "${ext}".`));
        }
        if (!rawText.trim()) return next(new FileError("File appears empty."));
        refResult = await ingestReference(null, rawText, file.originalname, userId, session._id.toString());
      } else if (req.body.rawText) {
        refResult = await ingestReference(null, req.body.rawText, "Pasted notes", userId, session._id.toString());
      } else {
        return next(new FileError("No file or text provided."));
      }

      log.info("Reference-only upload complete", { sessionId: session._id, fileUrl: refResult.fileUrl });
      res.status(201).json({
        sessionId: session._id,
        sessionName: session.name,
        fileUrl: refResult.fileUrl,
      });
      return;
    }

    // ── Full ingest mode: embed synchronously → respond → extract topics in bg ─
    let rawText = "";
    let fileUrl = "";

    if (file) {
      const ext = "." + file.originalname.split(".").pop()?.toLowerCase();

      if (ext === ".pdf") {
        // Upload to Cloudinary + parse text + embed in Pinecone (no topic extraction yet)
        const result = await ingestPDFEmbedOnly(file.buffer, file.originalname, userId, session._id.toString());
        rawText = result.rawText;
        fileUrl = result.fileUrl;

      } else if ([".txt", ".md", ".markdown"].includes(ext)) {
        rawText = file.buffer.toString("utf-8");
        if (!rawText.trim()) return next(new FileError("The file appears to be empty. Please upload a file with content."));
        await ingestTextEmbedOnly(rawText, userId, session._id.toString());

      } else if (ext === ".docx") {
        try {
          const mammoth = await import("mammoth");
          const { value } = await mammoth.extractRawText({ buffer: file.buffer });
          rawText = value;
          if (!rawText.trim()) return next(new FileError("Couldn't extract text from the DOCX file."));
          await ingestTextEmbedOnly(rawText, userId, session._id.toString());
        } catch {
          return next(new FileError("Failed to parse the DOCX file. Try saving it as PDF and uploading again."));
        }

      } else {
        return next(new FileError(`Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or Markdown file.`));
      }

    } else if (req.body.rawText) {
      rawText = req.body.rawText;
      await ingestTextEmbedOnly(rawText, userId, session._id.toString());

    } else {
      return next(new FileError("No file or text provided. Please upload a file or paste your notes."));
    }

    // ✅ Respond immediately — Pinecone embedding done, topics extracting in background
    res.status(201).json({
      sessionId: session._id,
      sessionName: session.name,
      fileUrl,
      topics: [],        // empty — background job will populate these
      roadmapNodes: [],
      processing: true,  // tells frontend to poll /api/sessions/:id/topics
    });

    // 🔄 Fire-and-forget: extract topics (o4-mini, may take 60–120s)
    extractAndSaveTopics(rawText, userId, session._id.toString());

    log.info("Upload responded (topics extracting in background)", { sessionId: session._id });
  } catch (err) {
    next(err);
  }
}
