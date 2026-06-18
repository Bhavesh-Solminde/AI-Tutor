/**
 * Pure TypeScript mastery calculator.
 * Direct port of the n8n "Mastery Calculator" Code node from progress_tracking_agent.json.
 * NO LLM involved — deterministic formula only.
 */

export interface MasteryInput {
  quizResults: { score: number; total: number };
  selfRatingAfter: number; // 1-10
  sessionDurationMinutes: number;
  estimatedMinutes?: number; // default 30
  previousMasteryScore?: number;
}

export interface MasteryOutput {
  calculatedMastery: number; // 0-100
  previousMastery: number;
  passed: boolean; // score/total >= 0.7
  nodeColor: "unstarted" | "learning" | "mastered";
  xpEarned: number; // score * 20
}

export function calculateMastery(input: MasteryInput): MasteryOutput {
  const quizScore = input.quizResults.score / input.quizResults.total;
  const selfRating = input.selfRatingAfter / 10;
  const estimatedMinutes = input.estimatedMinutes ?? 30;
  const engagement = Math.min(input.sessionDurationMinutes / estimatedMinutes, 1.0);

  // Weighted formula: quiz 60% + self-rating 30% + engagement 10%
  const calculatedMastery = Math.round(
    (quizScore * 0.6 + selfRating * 0.3 + engagement * 0.1) * 100
  );

  const passed = input.quizResults.score >= 6;
  const nodeColor: MasteryOutput["nodeColor"] =
    calculatedMastery >= 70 ? "mastered" : "learning";
  const xpEarned = input.quizResults.score * 20;

  return {
    calculatedMastery,
    previousMastery: input.previousMasteryScore ?? 0,
    passed,
    nodeColor,
    xpEarned,
  };
}
