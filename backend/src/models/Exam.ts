import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  subject: string;
  examDate: Date;
  syllabusSource: "upload" | "web";
  syllabusFileUrl?: string;
  pyqUploaded: boolean;
  pyqFileUrl?: string;
  topicFrequencies: Record<string, number>;
  createdAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    syllabusSource: { type: String, enum: ["upload", "web"], default: "web" },
    syllabusFileUrl: { type: String },
    pyqUploaded: { type: Boolean, default: false },
    pyqFileUrl: { type: String },
    topicFrequencies: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

ExamSchema.index({ userId: 1 }, { unique: true });

export const Exam = mongoose.model<IExam>("Exam", ExamSchema);
