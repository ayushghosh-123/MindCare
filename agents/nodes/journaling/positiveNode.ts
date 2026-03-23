// STEP 10 — agents/nodes/journaling/positiveNode.ts
// Runs on the positive path (sentiment === "positive").
// Generates an uplifting, encouraging response.

import { AgentState } from "../../types/state";
import { llm } from "../../config/llm";

export async function positiveResponseNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const content = state.JournalEntry?.content ?? state.userMessage;

  try {
    const result = await llm.invoke([
      {
        role: "system",
        content: `You are an encouraging wellness coach for MindCare.
The user has written a positive or uplifting journal entry.
Celebrate their progress genuinely. Reflect back what is going well.
Keep it to 2 paragraphs — warm and energising, not generic.
End with one specific suggestion to build on this positive momentum.`,
      },
      {
        role: "user",
        content: `Journal Entry:\n${content}\n\nSentiment Score: ${state.sentimentScore}/100`,
      },
    ]);

    return { response: result.content.toString() };
  } catch (err) {
    console.error("[positiveResponseNode]", err);
    return {
      response:
        "What a wonderful reflection! Keep nurturing this positive energy — you're doing great. Consider building on this momentum by setting one small wellness goal for tomorrow.",
    };
  }
}