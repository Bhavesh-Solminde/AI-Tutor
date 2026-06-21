import mongoose, { Document, Schema } from "mongoose";

export interface IStudyPlanDay {
  _id?: mongoose.Types.ObjectId;
  dayNumber: number;
  date: Date;
  topics: Array<{
    topicId: mongoose.Types.ObjectId;
    topicName: string;
    estimatedMinutes: number;
  }>;
  isMockExam: boolean;
  completed: boolean;
}

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  examDate: Date;
  generatedAt: Date;
  days: IStudyPlanDay[];
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    examDate: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
    days: [
      {
        dayNumber: { type: Number, required: true },
        date: { type: Date, required: true },
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
            topicName: String,
            estimatedMinutes: { type: Number, default: 30 },
          },
        ],
        isMockExam: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

StudyPlanSchema.index({ userId: 1, sessionId: 1 });

export const StudyPlan = mongoose.model<IStudyPlan>("StudyPlan", StudyPlanSchema);
