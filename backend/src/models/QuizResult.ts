import mongoose, { Document, Schema } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  score: number;
  total: number;
  xpEarned: number;
  passed: boolean;
  timeTaken: number;
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        userAnswer: Number,
        isCorrect: Boolean,
        explanation: String,
      },
    ],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
    passed: { type: Boolean, required: true },
    timeTaken: { type: Number, default: 0 },
  },
  { timestamps: true }
);

QuizResultSchema.index({ userId: 1, createdAt: -1 });

export const QuizResult = mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);
