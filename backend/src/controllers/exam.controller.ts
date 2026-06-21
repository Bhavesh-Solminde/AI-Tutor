import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Exam } from "../models/Exam";
import { ingestPDF, ingestText } from "../pipelines/ingest";
import { analyzePYQ } from "../pipelines/pyqParser";
import { Topic } from "../models/Topic";
import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env";
import pdfParse from "pdf-parse";
import { Session } from "../models/Session";
import { NotFoundError, ValidationError, FileError } from "../utils/AppError";
import { createLogger } from "../config/logger";

const log = createLogger("controller:exam");

// ─── Shared file → text extraction ───────────────────────────────────────────
async function extractTextFromFile(buffer: Buffer, originalname: string): Promise<string> {
  const ext = "." + originalname.split(".").pop()?.toLowerCase();

  if (ext === ".pdf") {
    const parsed = await pdfParse(buffer);
    if (!parsed.text.trim()) throw new FileError("Couldn't extract text from the PDF. Make sure it's not scanned/image-only.");
    return parsed.text;
  }

  if ([".txt", ".md", ".markdown"].includes(ext)) {
    const text = buffer.toString("utf-8");
    if (!text.trim()) throw new FileError("The file appears to be empty. Please upload a file with content.");
    return text;
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    if (!value.trim()) throw new FileError("Couldn't extract text from the DOCX file. Make sure it's not empty or password-protected.");
    return value;
  }

  throw new FileError(`Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or Markdown (.md) file.`);
}

// ─── POST /api/exam/setup ─────────────────────────────────────────────────────
export async function examSetup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { subject, examDate } = req.body;
    if (!subject?.trim()) return next(new ValidationError("Subject name is required."));
    if (!examDate) return next(new ValidationError("Exam date is required."));
    const date = new Date(examDate);
    if (isNaN(date.getTime())) return next(new ValidationError("Invalid exam date format."));
    if (date <= new Date()) return next(new ValidationError("Exam date must be in the future."));

    const userId = req.userId!;
    const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const exam = await Exam.findOneAndUpdate(
      { userId },
      { userId, subject: subject.trim(), examDate: date, syllabusSource: "web" },
      { upsert: true, new: true }
    );
    log.info("Exam setup saved", { userId, subject: subject.trim(), daysLeft, examId: exam._id });
    res.json({ exam, daysLeft });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/exam/upload-syllabus ──────────────────────────────────────────
export async function uploadSyllabus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId });
    if (!exam) return next(new NotFoundError("Exam setup"));

    log.info("Syllabus upload", { userId, hasFile: !!req.file, fileName: req.file?.originalname });

    let sessionId: string;
    let topics: any[];
    let roadmapNodes: any[];

    if (req.file) {
      const ext = "." + req.file.originalname.split(".").pop()?.toLowerCase();
      const session = await Session.create({
        userId,
        name: `${exam.subject} Syllabus`,
        inputMethod: ext === ".pdf" ? "pdf" : "notes",
        pineconeNamespace: `${userId}_exam_${Date.now()}`,
        examDate: exam.examDate,
      });
      sessionId = session._id.toString();

      let result;
      if (ext === ".pdf") {
        result = await ingestPDF(req.file.buffer, req.file.originalname, userId, sessionId);
        await Exam.findByIdAndUpdate(exam._id, { syllabusSource: "upload", syllabusFileUrl: result.fileUrl });
      } else {
        // .md / .txt / .docx — extract text, then ingest
        const rawText = await extractTextFromFile(req.file.buffer, req.file.originalname);
        result = await ingestText(rawText, userId, sessionId);
        await Exam.findByIdAndUpdate(exam._id, { syllabusSource: "upload" });
      }
      topics = result.topics;
      roadmapNodes = result.roadmapNodes;

    } else {
      // No file — web search fallback via Tavily
      log.info("No syllabus file — falling back to Tavily web search", { subject: exam.subject });
      const search = new TavilySearch({ maxResults: 5 });
      const searchResults = await search.invoke({ query: `${exam.subject} exam syllabus topics 2024` });
      const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.3, apiKey: env.OPENAI_API_KEY });
      const topicResponse = await model.invoke([
        { role: "system", content: "Extract a list of exam topics from search results. Return JSON: { topics: string[] }" },
        { role: "user", content: `Search results:\n${JSON.stringify(searchResults)}` },
      ]);
      const parsed = JSON.parse((topicResponse.content as string).replace(/```json|```/g, "").trim());
      const session = await Session.create({
        userId,
        name: `${exam.subject} (Web Syllabus)`,
        inputMethod: "topic",
        pineconeNamespace: `${userId}_exam_web_${Date.now()}`,
        examDate: exam.examDate,
      });
      sessionId = session._id.toString();
      const topicDocs = await Topic.insertMany(
        parsed.topics.map((name: string, i: number) => ({
          sessionId, userId, name, difficulty: "medium", estimatedMinutes: 30,
          roadmapPosition: { x: 250, y: i * 150 },
        }))
      );
      topics = topicDocs.map((t) => ({ _id: t._id, name: t.name, difficulty: t.difficulty, estimatedMinutes: t.estimatedMinutes, status: t.status }));
      roadmapNodes = topicDocs.map((t) => ({ id: t._id.toString(), label: t.name, status: "unstarted", position: t.roadmapPosition, difficulty: t.difficulty, estimatedMinutes: t.estimatedMinutes }));
      log.info("Syllabus from web search complete", { sessionId, topicCount: topics.length });
    }

    log.info("Syllabus upload complete", { sessionId, topicCount: topics.length });
    res.json({ sessionId, topics, roadmapNodes });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/exam/upload-pyq ────────────────────────────────────────────────
export async function uploadPYQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId });
    if (!exam) return next(new NotFoundError("Exam setup"));
    if (!req.file) return next(new ValidationError("Please upload a PYQ file (PDF, DOCX, TXT, or MD)."));

    // Extract text regardless of file type
    const rawText = await extractTextFromFile(req.file.buffer, req.file.originalname);
    const topicNames = (await Topic.find({ userId })).map((t) => t.name);

    // analyzePYQ is best-effort — any failure falls back to empty frequencies.
    // The PYQ is still marked as uploaded so the roadmap generates normally.
    let frequencies: Record<string, number> = {};
    try {
      frequencies = await analyzePYQ(rawText, topicNames);
    } catch (pyqErr: any) {
      log.error("PYQ analysis failed — continuing with empty frequencies", { error: pyqErr?.message, userId });
    }

    await Exam.findByIdAndUpdate(exam._id, {
      pyqUploaded: true,
      topicFrequencies: frequencies,
    });

    res.json({ topicFrequencies: frequencies });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/exam/:userId ────────────────────────────────────────────────────
export async function getExam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exam = await Exam.findOne({ userId: req.params.userId });
    if (!exam) { res.status(404).json({ error: "No exam configured yet." }); return; }
    const topics = await Topic.find({ userId: req.params.userId });
    const daysLeft = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    res.json({ exam, topics, daysLeft });
  } catch (err) {
    next(err);
  }
}
