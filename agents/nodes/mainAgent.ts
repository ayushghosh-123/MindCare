// STEP 15 — agents/nodes/mainAgent.ts
// First node in the main graph. Routes the request to the correct sub-agent.
// Sets state.agentType which the conditional edge reads to decide the path.

import { AgentState } from "../types/state";
import { llm, parseLLMJson } from "../config/llm";
import { ROUTING_PROMPT } from "../prompts";
import { RoutingResponseSchema, RoutingResponse } from "../schemas/responseSchema";

export async function mainAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    const result = await llm.invoke([
      { role: "system", content: ROUTING_PROMPT },
      { role: "user", content: state.userMessage },
    ]);

    const parsed = parseLLMJson<RoutingResponse>(result.content.toString());
    const validated = RoutingResponseSchema.safeParse(parsed);

    if (!validated.success) {
      console.warn("[mainAgent] Routing parse failed, defaulting to chat");
      return { agentType: "chat" };
    }

    console.log(
      `[mainAgent] Routing → ${validated.data.agentType} (${validated.data.reason})`
    );
    return { agentType: validated.data.agentType };
  } catch (err) {
    console.error("[mainAgent]", err);
    return { agentType: "chat", error: "Routing failed, defaulted to chat" };
  }
}