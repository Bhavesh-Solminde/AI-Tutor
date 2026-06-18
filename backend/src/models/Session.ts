import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  inputMethod: "pdf" | "notes" | "topic";
  fileUrl?: string;
  rawText?: string;
  pineconeNamespace: string;
  examDate?: Date;
  isReference: boolean;   // true = chat reference material only (no roadmap)
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
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>("Session", SessionSchema);
