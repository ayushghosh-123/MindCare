// STEP 13 — agents/nodes/data/dataNode.ts
// Fetches health metrics from your health_entries table and generates insights.
//
// IMPORTANT: This node behaves differently based on agentType:
// - "data"   → writes to state.response  (standalone query, shown directly to user)
// - "report" → writes to state.healthSummary (parallel branch, fed to merge_report)
//
// This is how the parallel report mode works safely:
// journaling_agent writes state.response
// data_agent writes state.healthSummary  ← different field, no overwrite
// merge_report reads BOTH and combines them

import { AgentState } from "../../types/state";
import { llm } from "../../config/llm";
import { DATA_PROMPT } from "../../prompts";
import { buildHealthSummary } from "../../tools/supbaseTool";

export async function dataNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const isReportMode = state.agentType === "report";

  try {
    const summary = await buildHealthSummary(state.userId);

    if (summary.totalEntries === 0) {
      const msg =
        "You haven't logged any health entries yet. Start tracking your sleep, water intake, and mood to get personalised insights.";
      return isReportMode ? { healthSummary: msg } : { response: msg };
    }

    const topMood =
      Object.entries(summary.moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      "not recorded";

    const mealSummary = summary.recentMeals
      .map(m => `- ${m.date}: ${[m.breakfast, m.lunch, m.dinner].filter(Boolean).join(', ')}`)
      .join('\n');

    const summaryText = `
Last ${summary.totalEntries} health entries summary:
- Average sleep: ${summary.avgSleep} hours per night
- Average water intake: ${summary.avgWater} units per day
- Average exercise: ${summary.avgExercise} minutes per day
- Average energy level: ${summary.avgEnergy}/10
- Average stress level: ${summary.avgStress}/10
- Most common mood: ${topMood}

Recent Diet & Nutrition:
${mealSummary || 'No recent meal data recorded.'}

- User's question: ${state.userMessage}
    `.trim();

    const result = await llm.invoke([
      { role: "system", content: DATA_PROMPT },
      { role: "user", content: summaryText },
    ]);

    const responseText = result.content.toString();

    // Write to different field depending on mode
    return isReportMode
      ? { healthSummary: responseText }
      : { response: responseText };
  } catch (err) {
    console.error("[dataNode]", err);
    const fallback = "I couldn't load your health data right now. Please try again.";
    return isReportMode ? { healthSummary: fallback } : { response: fallback };
  }
}