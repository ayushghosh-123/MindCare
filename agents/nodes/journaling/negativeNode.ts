// STEP 11 — agents/nodes/journaling/negativeNode.ts
// Runs AFTER diagnosisNode on the negative path.
// Generates a compassionate, personalised support response.
// Uses llmPro (gpt-4o) because this response goes to someone who is struggling.

import { AgentState } from "../../types/state";
import { llmPro } from "../../config/llm";

export async function negativeResponseNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const content = state.JournalEntry?.content ?? state.userMessage;

  try {
    const result = await llmPro.invoke([
      {
        role: "system",
        content: `You are a compassionate mental health support assistant for MindCare.
Write a warm, empathetic response to someone who is struggling emotionally.
Use their journal entry AND the diagnosis insights to make the response feel personal.
Reference specific things they wrote — do not be generic.
Keep it to 2-3 paragraphs.
End with ONE specific, actionable coping strategy they can try right now.
Never be clinical, cold, or dismissive. Never say "I understand" as an opener.`,
      },
      {
        role: "user",
        content: `Journal Entry:\n${content}\n\nInsights:\n${state.diagnosis}`,
      },
    ]);

    return { response: result.content.toString() };
  } catch (err) {
    console.error("[negativeResponseNode]", err);
    return {
      response:
        "Thank you for sharing what you're going through. Your feelings are valid and you are not alone. Consider reaching out to someone you trust today — even a short conversation can help.",
    };
  }
}