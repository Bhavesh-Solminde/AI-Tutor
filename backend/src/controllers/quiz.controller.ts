import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Topic } from "../models/Topic";
import { QuizResult } from "../models/QuizResult";
import { User } from "../models/User";
import { StudyPlan } from "../models/StudyPlan";
import { quizGeneratorNode } from "../agents/nodes/quizGeneratorNode";
import { progressTrackerNode } from "../agents/nodes/progressTrackerNode";
import { AgentState } from "../agents/state";
import { NotFoundError } from "../utils/AppError";
import { createLogger } from "../config/logger";

const log = createLogger("controller:quiz");

// POST /api/quiz/generate
export async function generateQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) { return next(new NotFoundError("Topic")); }

    log.info("Generating quiz", { topicId, topicName: topic.name, masteryScore: topic.masteryScore });

    // Build minimal state for quizGeneratorNode
    const state = {
      ...AgentState.State,
      topicId,
      topicName: topic.name,
      masteryScore: topic.masteryScore,
      explanation: `Concepts from ${topic.name}`,
    };

    const result = await quizGeneratorNode(state as any);

    log.info("Quiz generated", { topicId, questionCount: result.questions?.length, timeLimit: result.timeLimit });
    res.json({
      questions: result.questions,
      timeLimit: result.timeLimit ?? 600,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/quiz/submit
export async function submitQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      topicId,
      answers,
      questions,
      selfRatingAfter = 5,
      sessionDurationMinutes = 15,
      examDate,
      timeTaken = 0,
    } = req.body;
    const userId = req.userId!;

    const topic = await Topic.findById(topicId);
    if (!topic) { return next(new NotFoundError("Topic")); }

    log.info("Quiz submission", { topicId, topicName: topic.name, userId });

    // Score the quiz
    // answers can be { [idx]: number } OR { [idx]: { selected: number, isCorrect: bool } }
    // depending on which frontend code path was used — normalise to a plain number array
    const normaliseAnswer = (a: any): number => {
      if (typeof a === "number") return a;
      if (a && typeof a === "object" && typeof a.selected === "number") return a.selected;
      return -1; // no answer
    };

    const scoredQuestions = questions.map((q: any, i: number) => {
      const userAnswer = normaliseAnswer(answers[i]);
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correct,
        userAnswer,
        isCorrect: userAnswer === q.correct,
        explanation: q.explanation,
      };
    });

    const score = scoredQuestions.filter((q: any) => q.isCorrect).length;
    const total = questions.length;

    // Get all topic masteries for recommendation
    const allTopics = await Topic.find({ userId });
    const allTopicMasteries = allTopics.map((t) => ({
      topicId: t._id.toString(),
      topicName: t.name,
      masteryScore: t.masteryScore,
    }));

    // Run progressTrackerNode — wrapped in try/catch so a LLM failure doesn't 500 the whole quiz
    let progressResult: any;
    try {
      progressResult = await progressTrackerNode({
        ...AgentState.State,
        userId,
        topicId,
        topicName: topic.name,
        progressInput: {
          quizResults: {
            score,
            total,
            wrongQuestions: scoredQuestions.filter((q: any) => !q.isCorrect).map((q: any) => q.question),
          },
          selfRatingAfter,
          sessionDurationMinutes,
          estimatedMinutes: topic.estimatedMinutes,
          previousMasteryScore: topic.masteryScore,
          examDate,
          allTopicMasteries,
        },
      } as any);
    } catch (progressErr) {
      log.warn("progressTrackerNode failed — using fallback calculation", { progressErr });
      // Fallback: simple pass/fail based on score without LLM
      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = pct >= 70;
      progressResult = {
        masteryDelta: { before: topic.masteryScore, after: Math.min(100, topic.masteryScore + (passed ? 20 : 5)) },
        nodeColorUpdate: passed ? "mastered" : "learning",
        xpEarned: passed ? 50 : 10,
        passed,
        nextTopicRecommendation: { topicId: "", topicName: "", reason: "" },
        studyPlanUpdate: {},
      };
    }

    // Save QuizResult
    await QuizResult.create({
      userId,
      topicId,
      questions: scoredQuestions,
      score,
      total,
      xpEarned: progressResult.xpEarned,
      passed: progressResult.passed,
      timeTaken,
    });

    // Update Topic
    await Topic.findByIdAndUpdate(topicId, {
      masteryScore: progressResult.masteryDelta?.after ?? topic.masteryScore,
      status: progressResult.nodeColorUpdate,
      selfRatingAfter,
      lastStudiedAt: new Date(),
    });

    // Update User XP (maps to n8n MongoDB (Update User XP))
    await User.findByIdAndUpdate(userId, { $inc: { xp: progressResult.xpEarned ?? 0 } });

    // Update StudyPlan if exists
    if (examDate && progressResult.studyPlanUpdate && Object.keys(progressResult.studyPlanUpdate).length > 0) {
      await StudyPlan.findOneAndUpdate(
        { userId },
        { $set: { generatedAt: new Date() } },
        { upsert: false }
      );
    }

    res.json({
      score,
      total,
      passed: progressResult.passed,
      masteryDelta: progressResult.masteryDelta,
      nodeColorUpdate: progressResult.nodeColorUpdate,
      xpEarned: progressResult.xpEarned,
      nextTopicRecommendation: progressResult.nextTopicRecommendation,
      studyPlanUpdate: progressResult.studyPlanUpdate,
    });
    log.info("Quiz submitted", {
      topicId,
      score,
      total,
      passed: progressResult.passed,
      xpEarned: progressResult.xpEarned,
      masteryBefore: topic.masteryScore,
      masteryAfter: progressResult.masteryDelta?.after,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz/history/:userId
export async function getQuizHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId;
    const history = await QuizResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(50)
      .lean();

    // Populate topic names
    const topicIds = [...new Set(history.map((h) => h.topicId?.toString()))];
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const topicMap = new Map(topics.map((t) => [t._id.toString(), t.name]));

    const enriched = history.map((h) => ({
      ...h,
      topicName: topicMap.get(h.topicId?.toString()) || h.topicId,
      correctAnswers: h.score,
      totalQuestions: h.total,
    }));

    res.json({ history: enriched });
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz/active/:userId
// Returns quiz sessions that were generated but not submitted (in-progress)
export async function getActiveQuizzes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Active quizzes: topics currently in 'learning' state
    const userId = req.params.userId;
    const learningTopics = await Topic.find({ userId, status: 'learning' }).lean();
    const active = learningTopics.map((t) => ({
      _id: t._id,
      topicId: t._id,
      topicName: t.name,
      answeredCount: 0,
      totalQuestions: 10,
    }));
    res.json({ active });
  } catch (err) {
    next(err);
  }
}
