import test from "node:test";
import assert from "node:assert";
import { calculateMastery } from "./masteryCalculator";

test("Mastery Calculator Tests", async (t) => {
  await t.test("should not mark as mastered when quiz score is low (e.g. 3/10) even with high self-rating and engagement", () => {
    const result = calculateMastery({
      quizResults: { score: 3, total: 10 },
      selfRatingAfter: 10,
      sessionDurationMinutes: 30,
      estimatedMinutes: 30,
    });
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.nodeColor, "learning");
  });

  await t.test("should mark as mastered when quiz score is high (e.g. 8/10) and self-rating + engagement are high", () => {
    const result = calculateMastery({
      quizResults: { score: 8, total: 10 },
      selfRatingAfter: 9,
      sessionDurationMinutes: 30,
      estimatedMinutes: 30,
    });
    assert.strictEqual(result.passed, true);
    assert.ok(result.calculatedMastery >= 70);
    assert.strictEqual(result.nodeColor, "mastered");
  });

  await t.test("should not mark as mastered when quiz score passes but calculatedMastery is < 70 due to low self-rating/engagement", () => {
    const result = calculateMastery({
      quizResults: { score: 7, total: 10 }, // passed (0.7)
      selfRatingAfter: 1, // extremely low self-rating (0.1)
      sessionDurationMinutes: 2, // very low engagement (2/30 = 0.06)
      estimatedMinutes: 30,
    });
    assert.strictEqual(result.passed, true);
    // calculatedMastery: (0.7 * 0.6 + 0.1 * 0.3 + 0.06 * 0.1) * 100 = (0.42 + 0.03 + 0.006) * 100 = 46
    assert.ok(result.calculatedMastery < 70);
    assert.strictEqual(result.nodeColor, "learning");
  });

  await t.test("should handle boundary conditions (exactly 70% quiz score with adequate ratings to pass calculatedMastery threshold)", () => {
    const result = calculateMastery({
      quizResults: { score: 7, total: 10 },
      selfRatingAfter: 8,
      sessionDurationMinutes: 30,
      estimatedMinutes: 30,
    });
    assert.strictEqual(result.passed, true);
    // calculatedMastery: (0.7 * 0.6 + 0.8 * 0.3 + 1.0 * 0.1) * 100 = (0.42 + 0.24 + 0.10) * 100 = 76
    assert.strictEqual(result.nodeColor, "mastered");
  });
});
