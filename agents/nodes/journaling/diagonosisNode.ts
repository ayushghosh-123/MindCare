// STEP 9 — agents/nodes/journaling/diagnosisNode.ts
// Runs ONLY on the negative path (sentiment === "negative").
// Extracts possible concerns and coping strategies from the journal entry.
// Uses llmPro (gpt-4o) because this is high-stakes — wrong output affects real people.

import { AgentState } from "../../types/state";
import { llmPro, parseLLMJson } from "../../config/llm";
import { DIAGNOSIS_PROMPT } from "../../prompts";
import { DiagnosisResponseSchema, DiagnosisResponse } from "../../schemas/responseSchema";

export async function DiagnosisNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const content = state.JournalEntry?.content ?? state.userMessage;

  try {
    const result = await llmPro.invoke([
      { role: "system", content: DIAGNOSIS_PROMPT },
      {
        role: "user",
        content: `Journal Entry:\n${content}\n\nSentiment Score: ${state.sentimentScore}/100`,
      },
    ]);

    const parsed = parseLLMJson<DiagnosisResponse>(result.content.toString());
    const validated = DiagnosisResponseSchema.safeParse(parsed);

    if (!validated.success) {
      return {
        diagonosis: "Unable to complete analysis. You are not alone — support is available.",
      };
    }

    const d = validated.data;

    // Build a structured string that negativeNode will use to personalise its response
    const diagnosisText = [
      `Summary: ${d.summary}`,
      `Concerns: ${d.possibleConcerns.join(", ")}`,
      `Coping Strategies: ${d.copingStrategies.join("; ")}`,
      d.recommendProfessional
        ? "Note: Speaking with a mental health professional would be beneficial."
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return { diagonosis: diagnosisText };
  } catch (err) {
    console.error("[diagnosisNode]", err);
    return {
      diagonosis: "Analysis unavailable. You are not alone — support is available.",
      error: String(err),
    };
  }
}