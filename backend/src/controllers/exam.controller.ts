import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Exam } from "../models/Exam";
import { ingestPDF, ingestText } from "../pipelines/ingest";
import { analyzePYQ } from "../pipelines/pyqParser";
import { Topic } from "../models/Topic";
import { StudyPlan } from "../models/StudyPlan";
import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env";
import pdfParse from "pdf-parse";
import { Session } from "../models/Session";
import { NotFoundError, ValidationError, FileError } from "../utils/AppError";
import { createLogger } from "../config/logger";
import { generateStudyPlan } from "./studyplan.controller";
import mongoose from "mongoose";

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

    // Archive any existing active exam before creating a new one
    const existingActive = await Exam.findOne({ userId, status: "active" });
    if (existingActive) {
      const topics = await Topic.find({ userId, sessionId: existingActive.sessionId, archived: { $ne: true } });
      const total = topics.length;
      const mastered = topics.filter((t) => t.status === "mastered").length;
      const overallMastery = total > 0
        ? Math.round(topics.reduce((sum, t) => sum + t.masteryScore, 0) / total)
        : 0;

      await Exam.findByIdAndUpdate(existingActive._id, {
        status: "past",
        finalMasteryScore: overallMastery,
        finalMastered: mastered,
        finalTotal: total,
      });
      // Also clear the old study plan so the new exam gets a fresh one
      if (existingActive.sessionId) {
        await StudyPlan.findOneAndDelete({ userId, sessionId: existingActive.sessionId });
      }
      log.info("Archived previous active exam", { userId, examId: existingActive._id });
    }

    const exam = await Exam.create({
      userId,
      subject: subject.trim(),
      examDate: date,
      syllabusSource: "web",
      status: "active",
    });

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
    const exam = await Exam.findOne({ userId, status: "active" });
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
        await Exam.findByIdAndUpdate(exam._id, { syllabusSource: "upload", syllabusFileUrl: result.fileUrl, sessionId: session._id });
      } else {
        const rawText = await extractTextFromFile(req.file.buffer, req.file.originalname);
        result = await ingestText(rawText, userId, sessionId);
        await Exam.findByIdAndUpdate(exam._id, { syllabusSource: "upload", sessionId: session._id });
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
      await Exam.findByIdAndUpdate(exam._id, { sessionId: session._id });
      const topicDocs = await Topic.insertMany(
        parsed.topics.map((name: string, i: number) => ({
          sessionId, userId, name, difficulty: "medium", estimatedMinutes: 30,
          roadmapPosition: { x: 250, y: i * 150 },
        }))
      );
      topics = topicDocs.map((t) => ({ _id: t._id, name: t.name, difficulty: t.difficulty, estimatedMinutes: t.estimatedMinutes, status: t.status }));
      roadmapNodes = topicDocs.map((t) => ({ id: t._id.toString(), label: t.name, status: "unstarted", position: t.roadmapPosition, difficulty: t.difficulty, estimatedMinutes: t.estimatedMinutes }));
      log.info("Syllabus from web search complete", { sessionId, topicCount: topics.length });

      try {
        const pyqSearch = new TavilySearch({ maxResults: 3 });
        const pyqResults = await pyqSearch.invoke({
          query: `${exam.subject} previous year question paper site:*.edu OR site:*.ac.in`,
        });
        if (pyqResults && JSON.stringify(pyqResults).length > 100) {
          const topicNames = topics.map((t: any) => t.name);
          const freq = await analyzePYQ(JSON.stringify(pyqResults), topicNames);
          if (Object.keys(freq).length > 0) {
            await Exam.findByIdAndUpdate(exam._id, { pyqUploaded: true, topicFrequencies: freq });
            log.info("PYQ web search found frequencies", { freqCount: Object.keys(freq).length });
          }
        }
      } catch (pyqErr: any) {
        log.warn("PYQ web search failed — continuing without PYQ data", { error: pyqErr?.message });
      }
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
    const exam = await Exam.findOne({ userId, status: "active" });
    if (!exam) return next(new NotFoundError("Exam setup"));
    if (!req.file) return next(new ValidationError("Please upload a PYQ file (PDF, DOCX, TXT, or MD)."));

    const rawText = await extractTextFromFile(req.file.buffer, req.file.originalname);

    const topicQuery: any = { userId };
    if (exam.sessionId) topicQuery.sessionId = exam.sessionId;
    const topicNames = (await Topic.find(topicQuery)).map((t) => t.name);

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

    const existingPlan = await StudyPlan.findOne({ userId });
    let recalibrated = false;
    if (existingPlan && Object.keys(frequencies).length > 0) {
      await recalibrateTopicsFromPYQ(userId, exam.sessionId, frequencies);
      recalibrated = true;
    }

    res.json({ topicFrequencies: frequencies, recalibrated });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/exam/:userId ────────────────────────────────────────────────────
export async function getExam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId, status: "active" });
    if (!exam) { res.status(404).json({ error: "No active exam configured yet." }); return; }

    const query: any = { userId };
    if (exam.sessionId) query.sessionId = exam.sessionId;
    const topics = await Topic.find(query);

    const daysLeft = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    res.json({ exam, topics, daysLeft });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/exam/history ────────────────────────────────────────────────────
export async function getExamHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const history = await Exam.find({ userId, status: "past" }).sort({ examDate: -1 });
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/exam/archive ──────────────────────────────────────────────────
export async function archiveExam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId, status: "active" });
    if (!exam) { res.status(404).json({ error: "No active exam to archive." }); return; }

    // Snapshot progress stats at archive time
    const topics = await Topic.find({ userId, sessionId: exam.sessionId, archived: { $ne: true } });
    const total = topics.length;
    const mastered = topics.filter((t) => t.status === "mastered").length;
    const overallMastery = total > 0
      ? Math.round(topics.reduce((sum, t) => sum + t.masteryScore, 0) / total)
      : 0;

    await Exam.findByIdAndUpdate(exam._id, {
      status: "past",
      finalMasteryScore: overallMastery,
      finalMastered: mastered,
      finalTotal: total,
    });

    // Delete the study plan for this exam session
    if (exam.sessionId) {
      await StudyPlan.findOneAndDelete({ userId, sessionId: exam.sessionId });
    }

    log.info("Exam archived by user", { userId, examId: exam._id, subject: exam.subject });
    res.json({ success: true, archived: { subject: exam.subject, finalMasteryScore: overallMastery } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/exam/:userId — removes ACTIVE exam + study plan so user can start fresh
export async function deleteExam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId, status: "active" });
    await Promise.all([
      Exam.findOneAndDelete({ userId, status: "active" }),
      exam?.sessionId ? StudyPlan.findOneAndDelete({ userId, sessionId: exam.sessionId }) : null,
    ]);
    log.info("Active exam deleted", { userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Boost estimatedMinutes for high-frequency PYQ topics; reduce for never-asked ones
async function recalibrateTopicsFromPYQ(
  userId: string,
  sessionId: mongoose.Types.ObjectId | undefined,
  frequencies: Record<string, number>
): Promise<void> {
  const query: any = { userId };
  if (sessionId) query.sessionId = sessionId;
  const topics = await Topic.find(query);
  const maxFreq = Math.max(...Object.values(frequencies), 1);

  const bulkOps = topics.map((t) => {
    const freq = frequencies[t.name] || 0;
    const freqRatio = freq / maxFreq;
    const multiplier = freq > 0 ? 1.0 + (freqRatio * 0.5) : 0.8;
    const adjustedMinutes = Math.round(t.estimatedMinutes * multiplier);
    const bumpDifficulty = freqRatio > 0.6 && t.difficulty === "easy" ? "medium" : t.difficulty;

    return {
      updateOne: {
        filter: { _id: t._id },
        update: {
          $set: {
            estimatedMinutes: Math.max(10, Math.min(adjustedMinutes, 90)),
            difficulty: bumpDifficulty,
            pyqFrequency: freq,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Topic.bulkWrite(bulkOps);
    log.info("Topics recalibrated from PYQ", { topicCount: bulkOps.length, userId });
  }
}

export async function recalibrateExam(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const exam = await Exam.findOne({ userId, status: "active" });
    if (!exam) return next(new NotFoundError("Exam setup"));

    const sessionId = exam.sessionId?.toString();
    const examDate = exam.examDate.toISOString();

    req.body = { sessionId, examDate, pyqFrequencies: exam.topicFrequencies };
    return generateStudyPlan(req, res, next);
  } catch (err) {
    next(err);
  }
}
