import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  googleId?: string;
  githubId?: string;
  email: string;
  passwordHash?: string;
  authProvider: "google" | "github" | "local";
  name: string;
  avatar?: string;
  explanationLevel: "beginner" | "intermediate" | "advanced";
  onboarded: boolean;
  xp: number;
  streak: number;
  studyDays: Date[];
  totalXp: number;
  createdAt: Date;
  updatedAt: Date;
  // ─── Learning Profile (written by gradeNode, read by tutor on next session) ─
  learningProfile?: {
    conceptsStruggled: Map<string, number>;   // topicName → confusion count
    preferredExplanationStyle: "analogy" | "step_by_step" | "visual" | "standard";
    lastSessionSummary: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, sparse: true, unique: true },
    githubId: { type: String, sparse: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, select: false },
    authProvider: {
      type: String,
      enum: ["google", "github", "local"],
      required: true,
    },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    explanationLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    xp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    studyDays: [{ type: Date }],
    onboarded: { type: Boolean, default: false },
    learningProfile: {
      conceptsStruggled: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      preferredExplanationStyle: {
        type: String,
        enum: ["analogy", "step_by_step", "visual", "standard"],
        default: "standard",
      },
      lastSessionSummary: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
