import { connectDB } from "../config/db";
import { Topic } from "../models/Topic";
import { ChatHistory } from "../models/ChatHistory";
import { QuizResult } from "../models/QuizResult";
import { Session } from "../models/Session";
import { Exam } from "../models/Exam";
import { StudyPlan } from "../models/StudyPlan";
import mongoose from "mongoose";
import { logger } from "../config/logger";

async function main() {
  await connectDB();
  logger.info("Syncing indexes for Topic...");
  await Topic.syncIndexes();
  logger.info("Syncing indexes for ChatHistory...");
  await ChatHistory.syncIndexes();
  logger.info("Syncing indexes for QuizResult...");
  await QuizResult.syncIndexes();
  logger.info("Syncing indexes for Session...");
  await Session.syncIndexes();
  logger.info("Syncing indexes for Exam...");
  await Exam.syncIndexes();
  logger.info("Syncing indexes for StudyPlan...");
  await StudyPlan.syncIndexes();
  logger.info("MongoDB indexes synced successfully.");
  await mongoose.connection.close();
}

main().catch((err) => {
  logger.error("Error creating indexes", { error: err.message });
  process.exit(1);
});
