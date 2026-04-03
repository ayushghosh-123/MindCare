// agents/nodes/email/draftNode.ts
import { AgentState } from "../../types/state";
import { llmPro } from "../../config/llm";
import { EMAIL_DRAFT_PROMPT } from "../../prompts";

/**
 * Node for generating the subject and body of the wellness email.
 */
export async function draftNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.healthSummary) {
    return { error: "No context summary provided for draft generation." };
  }

  console.log(`[draftNode] Generating initial email draft for: ${state.email}`);

  try {
    const result = await llmPro.invoke([
         { role: "system", content: EMAIL_DRAFT_PROMPT },
         { role: "user", content: `User Context Summary: ${state.healthSummary}` }
    ]);

    const content = JSON.parse(result.content.toString());

    return { 
      emailSubject: content.subject, 
      emailBody: content.body 
    };

  } catch (err: any) {
    console.error("[draftNode] Failed to generate email draft:", err.message);
    return { error: `Email drafting failed: ${err.message}` };
  }
}
