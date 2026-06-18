import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { StudyPlan } from "../models/StudyPlan";
import { Topic } from "../models/Topic";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";
import { createLogger } from "../config/logger";

const log = createLogger("controller:studyplan");

const studyPlanSchema = z.object({
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string(),
    topicNames: z.array(z.string()),
    isMockExam: z.boolean().default(false),
  })),
});

// POST /api/studyplan/generate
export async function generateStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, examDate } = req.body;
    const userId = req.userId!;
    const topics = await Topic.find({ sessionId, userId });
    const daysLeft = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    log.info("Generating study plan", { userId, sessionId, topicCount: topics.length, daysLeft });

    const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2, apiKey: env.OPENAI_API_KEY });
    const structured = model.withStructuredOutput(studyPlanSchema);

    const topicSummary = topics.map((t) => `${t.name} (mastery: ${t.masteryScore}%, est: ${t.estimatedMinutes}min)`).join("\n");

    const result = await structured.invoke([
      { role: "system", content: "You generate day-by-day exam study plans. Assign weakest topics first. Final day = Mock Exam. Return dates as ISO strings." },
      { role: "user", content: `Exam in ${daysLeft} days (${examDate}). Topics:\n${topicSummary}\n\nGenerate the plan.` },
    ]);

    // Build day objects with real topic IDs
    const topicMap = Object.fromEntries(topics.map((t) => [t.name.toLowerCase(), t]));
    const days = result.days.map((d: any) => ({
      dayNumber: d.dayNumber,
      date: new Date(d.date),
      topics: d.topicNames.map((name: string) => {
        const t = topicMap[name.toLowerCase()] || topics[0];
        return { topicId: t._id, topicName: t.name, estimatedMinutes: t.estimatedMinutes };
      }),
      isMockExam: d.isMockExam,
      completed: false,
    }));

    const plan = await StudyPlan.findOneAndUpdate(
      { userId, sessionId },
      { userId, sessionId, examDate: new Date(examDate), generatedAt: new Date(), days },
      { upsert: true, new: true }
    );

    log.info("Study plan generated", { userId, planId: plan._id, dayCount: days.length });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// GET /api/studyplan/:userId
export async function getStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await StudyPlan.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/studyplan/day/:dayId
export async function markDayComplete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dayId } = req.params;
    const { planId, score } = req.body;
    const update: any = { "days.$.completed": true };
    // If score < 60%, push topics to next day (handled on frontend for now)
    await StudyPlan.findOneAndUpdate(
      { _id: planId, "days._id": dayId },
      { $set: update }
    );
    res.json({ success: true, pushTopics: score < 60 });
  } catch (err) {
    next(err);
  }
}
