import mongoose, { Document, Schema } from "mongoose";

export interface ITopic extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  masteryScore: number;
  selfRatingBefore: number;
  selfRatingAfter: number;
  status: "unstarted" | "learning" | "mastered";
  topicType: "theory" | "numerical" | "mixed";
  lastStudiedAt?: Date;
  roadmapPosition: { x: number; y: number };
  archived: boolean;
  prerequisites: string[]; // names of topics that must be completed first (strings, not ObjectIds)
  pyqFrequency: number;   // how many times this topic appeared in PYQs (0 = never/unknown)
  createdAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    estimatedMinutes: { type: Number, default: 30 },
    masteryScore: { type: Number, default: 0, min: 0, max: 100 },
    selfRatingBefore: { type: Number, default: 0, min: 0, max: 10 },
    selfRatingAfter: { type: Number, default: 0, min: 0, max: 10 },
    status: {
      type: String,
      enum: ["unstarted", "learning", "mastered"],
      default: "unstarted",
    },
    lastStudiedAt: { type: Date },
    roadmapPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    archived: { type: Boolean, default: false },
    prerequisites: [{ type: String }],
    pyqFrequency: { type: Number, default: 0 },
    topicType: { type: String, enum: ["theory", "numerical", "mixed"], default: "theory" },
  },
  { timestamps: true }
);

TopicSchema.index({ userId: 1 });
TopicSchema.index({ sessionId: 1 });
TopicSchema.index({ userId: 1, sessionId: 1 });

export const Topic = mongoose.model<ITopic>("Topic", TopicSchema);
