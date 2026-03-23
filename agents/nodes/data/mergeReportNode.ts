import { AgentState } from "../../types/state";
import { llmPro } from "../../config/llm";
import { REPORT_MERGE_PROMPT } from "../../prompts";

export async function mergeReportNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const journalInsight = state.response ?? "No journal data available for today.";
  const healthData = state.healthSummary ?? "No health metrics available.";

  try {
    const result = await llmPro.invoke([
      { role: "system", content: REPORT_MERGE_PROMPT },
      {
        role: "user",
        content: `
Journal / Emotional Insight:
${journalInsight}

Health Metrics Summary:
${healthData}

Date: ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        `.trim(),
      },
    ]);

    return { response: result.content.toString() };
  } catch (err) {
    console.error("[mergeReportNode]", err);
    // Fallback: just concatenate both summaries clearly
    return {
      response: `Your Journal Insight:\n${journalInsight}\n\nYour Health Summary:\n${healthData}`,
    };
  }
}