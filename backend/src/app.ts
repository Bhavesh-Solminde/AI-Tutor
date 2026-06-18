import express from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger } from "./middleware/requestLogger";
import passport from "./config/passport";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import sessionRoutes from "./routes/session.routes";
import topicRoutes from "./routes/topic.routes";
import tutorRoutes from "./routes/tutor.routes";
import quizRoutes from "./routes/quiz.routes";
import progressRoutes from "./routes/progress.routes";
import studyplanRoutes from "./routes/studyplan.routes";
import examRoutes from "./routes/exam.routes";
import chatHistoryRoutes from "./routes/chatHistory.routes";
import { authMiddleware } from "./middleware/auth";
import { getRoadmap } from "./controllers/progress.controller";

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/roadmap", authMiddleware as any, (req: any, res, next) => getRoadmap(req, res, next));
app.use("/api/studyplan", studyplanRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
