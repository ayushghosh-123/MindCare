// agents/nodes/email/evaluationNode.ts
import { AgentState } from "../../types/state";
import { llmPro } from "../../config/llm";
import { EMAIL_EVALUATION_PROMPT } from "../../prompts";

/**
 * Node for evaluating the draft's tone, safety, and clarity.
 * Returns a structured JSON result with status and issues.
 */
export async function evaluationNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.emailSubject || !state.emailBody) {
    return { error: "Missing email draft for evaluation." };
  }

  try {
    const result = await llmPro.invoke([
        { role: "system", content: EMAIL_EVALUATION_PROMPT },
        { role: "user", content: `Subject: ${state.emailSubject}\nBody: ${state.emailBody}` }
    ]);

    const evalResult = JSON.parse(result.content.toString());

    return { evaluationResult: evalResult };

  } catch (err: any) {
    console.error("[evaluationNode] Evaluation failed:", err.message);
    return { error: `Email evaluation failed: ${err.message}` };
  }
}
