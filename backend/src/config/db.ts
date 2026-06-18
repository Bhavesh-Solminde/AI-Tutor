import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", { error: (error as Error).message });
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB runtime error", { error: err.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
