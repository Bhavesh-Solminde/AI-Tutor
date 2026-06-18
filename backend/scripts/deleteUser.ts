#!/usr/bin/env tsx
/**
 * NeuralNest — User Data Purge Script
 * =====================================
 * Deletes ALL data for a given user email across:
 *   - MongoDB:  User, Sessions, Topics, ChatHistory, QuizResults, Exams, StudyPlans
 *   - Pinecone: All namespaces belonging to the user
 *
 * Usage:
 *   npx tsx scripts/deleteUser.ts <email>
 *   npx tsx scripts/deleteUser.ts bhaveshsolminde@gmail.com
 *
 * Safe to re-run — idempotent (missing docs are just skipped).
 */

import dotenv from "dotenv";
import path from "path";

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";

// ─── Config ─────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "neuralnest-os";

if (!MONGODB_URI || !PINECONE_API_KEY) {
  console.error("❌  MONGODB_URI and PINECONE_API_KEY must be set in .env");
  process.exit(1);
}

// ─── Mongoose models (inline — no import cycle risk) ─────────────────────────
const UserSchema = new mongoose.Schema({ email: String }, { strict: false });
const SessionSchema = new mongoose.Schema(
  { userId: mongoose.Schema.Types.ObjectId, pineconeNamespace: String },
  { strict: false }
);
const TopicSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { strict: false });
const ChatHistorySchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { strict: false });
const QuizResultSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { strict: false });
const ExamSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { strict: false });
const StudyPlanSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { strict: false });

const UserModel = mongoose.model("User", UserSchema);
const SessionModel = mongoose.model("Session", SessionSchema);
const TopicModel = mongoose.model("Topic", TopicSchema);
const ChatHistoryModel = mongoose.model("ChatHistory", ChatHistorySchema);
const QuizResultModel = mongoose.model("QuizResult", QuizResultSchema);
const ExamModel = mongoose.model("Exam", ExamSchema);
const StudyPlanModel = mongoose.model("StudyPlan", StudyPlanSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(emoji: string, msg: string, detail?: string) {
  const suffix = detail ? `  (${detail})` : "";
  console.log(`${emoji}  ${msg}${suffix}`);
}

async function deleteMany(
  model: mongoose.Model<any>,
  filter: object,
  label: string
): Promise<number> {
  const res = await model.deleteMany(filter);
  const n = res.deletedCount ?? 0;
  log(n > 0 ? "🗑️ " : "✅", `${label}`, `${n} deleted`);
  return n;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/deleteUser.ts <email>");
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log(`║  NeuralNest User Purge — ${email}`);
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. Connect to MongoDB
  log("🔌", "Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  log("✅", "MongoDB connected");

  // 2. Find the user
  const user = await UserModel.findOne({ email });
  if (!user) {
    log("⚠️ ", `No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  }
  const userId = user._id as mongoose.Types.ObjectId;
  log("👤", `Found user`, `${user.get("name") || "—"} | _id: ${userId}`);

  // 3. Collect Pinecone namespaces BEFORE deleting sessions
  const sessions = await SessionModel.find({ userId });
  const namespaces: string[] = sessions.map((s) => s.get("pineconeNamespace")).filter(Boolean);
  log("📦", `Found ${sessions.length} session(s)`, `${namespaces.length} Pinecone namespace(s)`);

  // 4. Delete MongoDB collections in dependency order
  console.log("\n── MongoDB ─────────────────────────────────────");
  await deleteMany(ChatHistoryModel, { userId }, "ChatHistory");
  await deleteMany(QuizResultModel, { userId }, "QuizResults");
  await deleteMany(ExamModel, { userId }, "Exams");
  await deleteMany(StudyPlanModel, { userId }, "StudyPlans");
  await deleteMany(TopicModel, { userId }, "Topics");
  await deleteMany(SessionModel, { userId }, "Sessions");
  await UserModel.deleteOne({ _id: userId });
  log("🗑️ ", "User document deleted");

  // 5. Delete Pinecone namespaces
  console.log("\n── Pinecone ────────────────────────────────────");
  if (namespaces.length === 0) {
    log("✅", "No Pinecone namespaces to delete");
  } else {
    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pinecone.Index(PINECONE_INDEX);

    for (const ns of namespaces) {
      try {
        // deleteAll removes every vector in the namespace
        await index.namespace(ns).deleteAll();
        log("🗑️ ", `Pinecone namespace cleared`, ns);
      } catch (err: any) {
        // Namespace may already be empty — not an error
        log("⚠️ ", `Namespace skipped (may be empty)`, ns);
      }
    }
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log(`║  ✅  All data for ${email} deleted`);
  console.log("╚══════════════════════════════════════════════╝\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌  Script failed:", err.message);
  process.exit(1);
});
