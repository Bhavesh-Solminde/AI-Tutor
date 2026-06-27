// Polyfill global `crypto` for Node < 19 — required by uuid, @langchain/*, @pinecone/* etc.
// Must be the very first line before any other imports.
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;

import "./config/env"; // Validate env vars first — fail fast
import { connectDB } from "./config/db";
import { logger } from "./config/logger";
import app from "./app";

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();

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
