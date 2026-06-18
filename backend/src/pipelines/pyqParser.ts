import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";

const pyqSchema = z.object({
  topicFrequencies: z.record(z.string(), z.number()),
});

/**
 * PYQ (Previous Year Questions) frequency analyzer.
 * Maps to n8n: Progress Tracking Agent's PYQ analysis sub-flow.
 * Uses GPT-4o to classify each question by topic and count frequencies.
 */
export async function analyzePYQ(
  pyqText: string,
  topicNames: string[]
): Promise<Record<string, number>> {
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    apiKey: env.OPENAI_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(pyqSchema);

  const topicList = topicNames.join(", ");

  // Process in chunks if text is very long
  const truncatedText = pyqText.slice(0, 12000);

  const result = await structuredModel.invoke([
    {
      role: "system",
      content: `You are analyzing Previous Year Exam Questions (PYQ) to count 
how many questions relate to each topic. 

Known topics: ${topicList}

For each question in the text, identify which topic it belongs to and count frequencies.
Return a topicFrequencies object where keys are topic names and values are question counts.
Only include topics that appear in the questions.`,
    },
    {
      role: "user",
      content: `Analyze these previous year questions and count topic frequencies:\n\n${truncatedText}`,
    },
  ]);

  return result.topicFrequencies;
}
