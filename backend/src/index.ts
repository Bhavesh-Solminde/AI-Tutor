// Polyfill global `crypto` for Node < 19 — required by uuid, @langchain/*, @pinecone/* etc.
// Must be the very first line before any other imports.
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;

import "./config/env"; // Validate env vars first — fail fast
import { connectDB } from "./config/db";
import { logger } from "./config/logger";
import app from "./app";

const PORT = process.env.PORT || 5000;

/** One-time migration: drop the old unique {userId:1} index on Exam
 *  and backfill status:'active' on any docs that lack it. */
async function runMigrations() {
  try {
    const { Exam } = await import("./models/Exam");
    const collection = Exam.collection;

    // Drop the old unique index if it still exists
    const indexes = await collection.indexes();
    const oldUniqueIdx = indexes.find(
      (idx) =>
        idx.unique === true &&
        Object.keys(idx.key).length === 1 &&
        idx.key.userId !== undefined
    );
    if (oldUniqueIdx?.name) {
      await collection.dropIndex(oldUniqueIdx.name);
      logger.info("Migration: dropped old unique Exam index", { name: oldUniqueIdx.name });
    }

    // Backfill status:'active' for any exams that predate the field
    const result = await collection.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    if (result.modifiedCount > 0) {
      logger.info("Migration: backfilled Exam.status='active'", { count: result.modifiedCount });
    }
  } catch (err: any) {
    // Non-fatal — log and continue
    logger.warn("Migration warning (non-fatal)", { error: err?.message });
  }
}

async function main() {
  await connectDB();
  await runMigrations();

  app.listen(PORT, () => {
    logger.info("NeuralNest backend started", {
      port: PORT,
      env: process.env.NODE_ENV || "development",
      langsmith: process.env.LANGCHAIN_TRACING_V2 === "true" ? "enabled" : "disabled",
    });
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", { error: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});
