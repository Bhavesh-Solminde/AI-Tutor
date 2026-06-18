import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;  // which Topic this chat belongs to
  section: "exam" | "roadmap" | "other";
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    section: {
      type: String,
      enum: ["exam", "roadmap", "other"],
      default: "other",
    },
    title: { type: String, default: "New Chat" },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
