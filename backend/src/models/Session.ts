import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  inputMethod: "pdf" | "notes" | "topic";
  fileUrl?: string;
  rawText?: string;
  pineconeNamespace: string;
  examDate?: Date;
  isReference: boolean;
  deleted: boolean;
  processingError?: string;
  // GPT-generated summary of document topics, produced once at ingestion time.
  // Injected directly into the AI prompt so meta-questions ("what does this cover?")
  // are answered from structured data, not unreliable RAG retrieval.
  topicSummary?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    inputMethod: { type: String, enum: ["pdf", "notes", "topic"], required: true },
    fileUrl: { type: String },
    rawText: { type: String },
    pineconeNamespace: { type: String, required: true },
    examDate: { type: Date },
    isReference: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    processingError: { type: String },
    topicSummary: { type: String },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, isReference: 1 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
