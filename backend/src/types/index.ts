import { Request } from "express";
import { IUser } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

export interface JwtPayload {
  userId: string;
}

export interface TopicData {
  _id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  status: "unstarted" | "learning" | "mastered";
  masteryScore: number;
  roadmapPosition: { x: number; y: number };
}

export interface RoadmapNode {
  id: string;
  label: string;
  status: "unstarted" | "learning" | "mastered";
  position: { x: number; y: number };
  difficulty: string;
  estimatedMinutes: number;
  masteryScore?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
