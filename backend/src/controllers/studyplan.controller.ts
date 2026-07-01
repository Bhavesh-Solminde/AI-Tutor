import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { StudyPlan } from "../models/StudyPlan";
import { Topic } from "../models/Topic";
import { Exam } from "../models/Exam";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";
import { createLogger } from "../config/logger";
import { ValidationError } from "../utils/AppError";

const log = createLogger("controller:studyplan");

const studyPlanSchema = z.object({
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string(),
    topicNames: z.array(z.string()),
    isMockExam: z.boolean().default(false),
  })),
});

// ── Time estimation helpers ────────────────────────────────────────────────────

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  hard: 1.5,
  medium: 1.2,
  easy: 1.0,
};

const REVISION_MINUTES = 15; // revision slot for already-mastered topics (≥80%)

/**
 * Calculate how long a topic should take given mastery and difficulty.
 * Already-mastered topics (≥80%) get a short revision slot only.
 */
function getTopicMinutes(topic: any): number {
  if (topic.masteryScore >= 80) return REVISION_MINUTES;
  const base = topic.estimatedMinutes || 30;
  const mult = DIFFICULTY_MULTIPLIER[topic.difficulty] ?? 1.0;
  // Reduce time proportionally as mastery increases (50% mastered → 50% of time)
  const masteryReduction = 1 - (topic.masteryScore / 100) * 0.5;
  return Math.round(base * mult * masteryReduction);
}

/**
 * Priority score: high PYQ freq + low mastery = highest priority.
 * Numerical topics get 1.3× boost (need more practice).
 */
function topicPriorityScore(topic: any, pyqFrequencies: Record<string, number>): number {
  const freq = pyqFrequencies[topic.name] || 0;
  const typeBoost = topic.topicType === "numerical" ? 1.3 : topic.topicType === "mixed" ? 1.15 : 1.0;
  return ((100 - topic.masteryScore) + freq * 15) * typeBoost;
}

// POST /api/studyplan/generate
export async function generateStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, examDate, hoursPerDay: reqHours } = req.body;
    const userId = req.userId!;

    // ── Fetch topics ──────────────────────────────────────────────────────────
    let topics;
    if (sessionId) {
      topics = await Topic.find({ sessionId, userId, archived: { $ne: true } });
    }
    if (!topics || topics.length === 0) {
      log.warn("generateStudyPlan: no topics for sessionId, falling back to all user topics", { sessionId, userId });
      topics = await Topic.find({ userId, archived: { $ne: true } }).sort({ createdAt: -1 });
    }
    if (topics.length === 0) {
      next(new ValidationError("No topics found. Please upload a syllabus before generating a study plan."));
      return;
    }

    // ── PYQ frequencies ───────────────────────────────────────────────────────
    const exam = await Exam.findOne({ userId });
    const pyqFrequencies: Record<string, number> = exam?.topicFrequencies
      ? Object.fromEntries(exam.topicFrequencies as any)
      : {};
    const hasPYQData = Object.keys(pyqFrequencies).length > 0;

    // ── Time parameters ───────────────────────────────────────────────────────
    const daysLeft = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    // User-specified hours/day (from wizard prompt); fall back to sensible defaults
    const hoursPerDay = reqHours && reqHours > 0 ? Math.min(reqHours, 12) : (daysLeft <= 2 ? 10 : 6);
    const dailyBudgetMinutes = hoursPerDay * 60;

    log.info("Generating study plan", {
      userId, sessionId, topicCount: topics.length, daysLeft, hoursPerDay, hasPYQData,
    });

    // ── PYQ insights (always computed, returned to frontend) ──────────────────
    // Use same normalization as pyqParser so name variants don't cause false misses
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const pyqNormKeys = new Set(Object.keys(pyqFrequencies).map(normalize));

    const pyqTopics = Object.entries(pyqFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, freq]) => ({
        name,
        frequency: freq,
        importance: freq >= 5 ? "Critical" : freq >= 3 ? "High" : "Medium",
      }));

    // Coverage: how many syllabus topics appear (fuzzy) in PYQ data
    const coveredCount = topics.filter((t) => pyqNormKeys.has(normalize(t.name))).length;
    const coveragePercent = topics.length > 0
      ? Math.round((coveredCount / topics.length) * 100)
      : 0;

    // ── Sort topics by priority ───────────────────────────────────────────────
    const sortedTopics = [...topics].sort(
      (a, b) => topicPriorityScore(b, pyqFrequencies) - topicPriorityScore(a, pyqFrequencies)
    );

    // ── Edge case: Exam is today or past ─────────────────────────────────────
    if (daysLeft <= 0) {
      const focusTopics = sortedTopics.slice(0, 5);
      const plan = await StudyPlan.findOneAndUpdate(
        { userId, sessionId },
        {
          userId, sessionId,
          examDate: new Date(examDate),
          generatedAt: new Date(),
          days: [{
            dayNumber: 1,
            date: new Date(),
            topics: focusTopics.map((t) => ({
              topicId: t._id,
              topicName: t.name,
              estimatedMinutes: Math.min(getTopicMinutes(t), 20),
            })),
            isMockExam: false,
            completed: false,
          }],
        },
        { upsert: true, new: true }
      );
      res.json({
        plan,
        pyqInsights: { topTopics: pyqTopics, coveragePercent, topicCount: pyqTopics.length, unfeasibleTopics: [] },
        warning: "Exam is today! Generated a rapid review of your most critical topics.",
      });
      return;
    }

    // ── Edge case: 1-3 days — deterministic greedy plan (no LLM) ─────────────
    // This replaces the broken 20-min-cap approach.
    if (daysLeft <= 3) {
      const unfeasibleTopics: string[] = [];
      const allDays: any[] = [];

      let remaining = [...sortedTopics];

      for (let day = 1; day <= daysLeft; day++) {
        const isLastDay = day === daysLeft;
        const dayBudget = isLastDay ? dailyBudgetMinutes * 0.6 : dailyBudgetMinutes; // last day = 60% for revision
        let allocated = 0;
        const dayTopics: any[] = [];
        let hardCount = 0;

        for (const topic of remaining) {
          const mins = getTopicMinutes(topic);
          const isHard = topic.difficulty === "hard";

          // Hard topic cap per day: max 3 hard topics (they need deep focus)
          if (isHard && hardCount >= 3) continue;
          if (allocated + mins > dayBudget) continue;

          dayTopics.push({ topicId: topic._id, topicName: topic.name, estimatedMinutes: mins });
          allocated += mins;
          if (isHard) hardCount++;
        }

        // Remove assigned topics from remaining
        const assignedIds = new Set(dayTopics.map((t) => t.topicId.toString()));
        remaining = remaining.filter((t) => !assignedIds.has(t._id.toString()));

        allDays.push({
          dayNumber: day,
          date: new Date(Date.now() + (day - 1) * 86400000),
          topics: dayTopics,
          isMockExam: false,
          completed: false,
        });
      }

      // Any topic that didn't fit
      unfeasibleTopics.push(...remaining.map((t) => t.name));

      const plan = await StudyPlan.findOneAndUpdate(
        { userId, sessionId },
        { userId, sessionId, examDate: new Date(examDate), generatedAt: new Date(), days: allDays },
        { upsert: true, new: true }
      );

      const warnings: string[] = [];
      if (unfeasibleTopics.length > 0) {
        warnings.push(
          `⚠️ With only ${daysLeft} day(s) and ${hoursPerDay}h/day, ${unfeasibleTopics.length} topics were deprioritized: ${unfeasibleTopics.slice(0, 5).join(", ")}${unfeasibleTopics.length > 5 ? "…" : ""}`
        );
      }

      res.json({
        plan,
        pyqInsights: { topTopics: pyqTopics, coveragePercent, topicCount: pyqTopics.length, unfeasibleTopics },
        warnings,
      });
      return;
    }

    // ── Normal plan: LLM-based scheduling (4+ days) ───────────────────────────
    // Dynamic cap: topics/day based on realistic average topic time
    const avgTopicMinutes = Math.round(
      topics.reduce((s, t) => s + getTopicMinutes(t), 0) / topics.length
    );
    const maxTopicsPerDay = Math.max(3, Math.min(
      Math.floor(dailyBudgetMinutes / Math.max(avgTopicMinutes, 20)),
      8 // absolute cap: 8 topics per day regardless
    ));

    const topicSummary = topics.map((t) => {
      const mins = getTopicMinutes(t);
      const isRevision = t.masteryScore >= 80;
      return `${t.name} (mastery: ${t.masteryScore}%, time: ${mins}min${isRevision ? " [REVISION ONLY]" : ""}, difficulty: ${t.difficulty}, type: ${(t as any).topicType || "theory"}${pyqFrequencies[t.name] ? `, PYQ freq: ${pyqFrequencies[t.name]}` : ""})`;
    }).join("\n");

    const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2, apiKey: env.OPENAI_API_KEY });
    const structured = model.withStructuredOutput(studyPlanSchema);

    const result = await structured.invoke([
      {
        role: "system",
        content: `You generate realistic, achievable day-by-day exam study plans.

CRITICAL CONSTRAINTS — violating any of these makes the plan useless:
- Maximum ${maxTopicsPerDay} topics per day (hard cap — do not exceed)
- Maximum ${dailyBudgetMinutes} minutes of study per day (${hoursPerDay}h)
- Each topic's "time:" field shows how long it will take — respect this for time budgeting
- Topics marked [REVISION ONLY] have high mastery — schedule them for quick review only, near the end
- PRIORITIZE topics with high PYQ frequency — those are most likely to appear in the exam
- Hard topics count as 2 topic-slots (they need deep focus — max 3 per day)
- Final day = revision and mock exam practice ONLY (isMockExam: true)
- Skip or deprioritize topics with mastery > 80% unless they have high PYQ frequency
- Topics with 0 PYQ frequency and mastery > 60% can be skipped entirely if days are limited
${hasPYQData ? "- PYQ frequency data IS available — weight scheduling heavily by frequency" : "- No PYQ data — weight by difficulty and mastery only"}
- Return dates as ISO strings starting from tomorrow`,
      },
      {
        role: "user",
        content: `Exam in ${daysLeft} days (${examDate}). ${topics.length} topics total. ${hoursPerDay}h/day available.\n\nTopics:\n${topicSummary}\n\nGenerate the plan.`,
      },
    ]);

    // Build day objects with real topic IDs
    const days = result.days.map((d: any) => ({
      dayNumber: d.dayNumber,
      date: new Date(d.date),
      topics: d.topicNames.map((name: string) => {
        const nameLower = name.toLowerCase().trim();
        let t = topics.find((topic) => topic.name.toLowerCase().trim() === nameLower);
        if (!t) {
          t = topics.find((topic) => {
            const tnl = topic.name.toLowerCase().trim();
            return tnl.includes(nameLower) || nameLower.includes(tnl);
          });
        }
        if (!t) t = topics[0];
        return { topicId: t._id, topicName: t.name, estimatedMinutes: getTopicMinutes(t) };
      }),
      isMockExam: d.isMockExam,
      completed: false,
    }));

    const plan = await StudyPlan.findOneAndUpdate(
      { userId, sessionId },
      { userId, sessionId, examDate: new Date(examDate), generatedAt: new Date(), days },
      { upsert: true, new: true }
    );

    // Compute unfeasible topics
    const coveredNames = new Set(days.flatMap((d: any) => d.topics.map((t: any) => t.topicName)));
    const unfeasible = topics.filter((t) => !coveredNames.has(t.name)).map((t) => t.name);

    const warnings: string[] = [];
    if (daysLeft <= 5 && unfeasible.length > 0) {
      warnings.push(
        `⚠️ ${unfeasible.length} topic(s) deprioritized due to time constraints: ${unfeasible.slice(0, 4).join(", ")}${unfeasible.length > 4 ? "…" : ""}`
      );
    }

    log.info("Study plan generated", { userId, planId: plan._id, dayCount: days.length, hoursPerDay });
    res.json({
      plan,
      pyqInsights: { topTopics: pyqTopics, coveragePercent, topicCount: pyqTopics.length, unfeasibleTopics: unfeasible },
      warnings,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/studyplan/:userId
export async function getStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const plan = await StudyPlan.findOne({ userId }).sort({ createdAt: -1 });
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

    const plan = await StudyPlan.findOneAndUpdate(
      { _id: planId, "days._id": dayId },
      { $set: { "days.$.completed": true } },
      { new: true }
    );

    if (!plan) {
      res.status(404).json({ error: "Study plan or day not found." });
      return;
    }

    let pushed = false;
    if (score !== undefined && score < 60) {
      const completedDay = plan.days.find((d) => d._id?.toString() === dayId);
      const nextDay = plan.days.find((d) => !d.completed && d._id?.toString() !== dayId);
      if (completedDay && nextDay) {
        const existingTopicIds = new Set(nextDay.topics.map((t) => t.topicId?.toString()));
        const newTopics = completedDay.topics.filter((t) => !existingTopicIds.has(t.topicId?.toString()));
        if (newTopics.length > 0) {
          await StudyPlan.findOneAndUpdate(
            { _id: planId, "days._id": nextDay._id },
            { $push: { "days.$.topics": { $each: newTopics } } }
          );
          pushed = true;
        }
      }
    }

    res.json({ success: true, pushTopics: pushed });
  } catch (err) {
    next(err);
  }
}
