import { User } from "../models/User";
import { createLogger } from "../config/logger";

const log = createLogger("util:learningProfile");

interface ProfileUpdateInput {
  userId: string;
  topicName: string;
  gradeClassification: "UNDERSTOOD" | "CONFUSED" | "PARTIAL" | "DOUBT";
  explanationMode: string;
}

/**
 * Updates the user's learning profile after each gradeNode classification.
 * Called fire-and-forget from tutor.controller — never blocks the SSE response.
 *
 * What it tracks:
 * - conceptsStruggled: increments count when student is CONFUSED or PARTIAL
 * - preferredExplanationStyle: records the mode that led to UNDERSTOOD
 * - lastSessionSummary: a short string summary for the next session's prompt
 */
export async function updateLearningProfile(input: ProfileUpdateInput): Promise<void> {
  try {
    const user = await User.findById(input.userId);
    if (!user) return;

    // Initialise profile if it doesn't exist (first time)
    if (!user.learningProfile) {
      user.learningProfile = {
        conceptsStruggled: new Map<string, number>(),
        preferredExplanationStyle: "standard",
        lastSessionSummary: "",
      };
    }

    const profile = user.learningProfile;

    // Track struggle count per topic
    if (input.gradeClassification === "CONFUSED" || input.gradeClassification === "PARTIAL") {
      const current = profile.conceptsStruggled.get(input.topicName) ?? 0;
      profile.conceptsStruggled.set(input.topicName, current + 1);

      log.debug("Struggle recorded", {
        userId: input.userId,
        topicName: input.topicName,
        newCount: current + 1,
      });
    }

    // Track the explanation style that resolved confusion (led to UNDERSTOOD)
    if (
      input.gradeClassification === "UNDERSTOOD" &&
      input.explanationMode !== "standard"
    ) {
      profile.preferredExplanationStyle = input.explanationMode as
        | "analogy"
        | "step_by_step"
        | "visual"
        | "standard";
    }

    // Write a short summary string for prompt injection on next session
    const struggledTopics = Array.from(profile.conceptsStruggled.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count}x)`)
      .join(", ");

    profile.lastSessionSummary = struggledTopics
      ? `Student has struggled with: ${struggledTopics}. Preferred style: ${profile.preferredExplanationStyle}.`
      : `No significant struggles recorded yet. Preferred style: ${profile.preferredExplanationStyle}.`;

    await User.findByIdAndUpdate(input.userId, {
      $set: { learningProfile: profile },
    });

    log.info("Learning profile updated", {
      userId: input.userId,
      classification: input.gradeClassification,
      topicName: input.topicName,
      preferredStyle: profile.preferredExplanationStyle,
    });
  } catch (err: any) {
    // Non-fatal: profile update failure should never crash the tutor
    log.error("Failed to update learning profile", { error: err.message });
  }
}
