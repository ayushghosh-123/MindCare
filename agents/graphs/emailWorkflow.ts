// agents/graphs/emailWorkflow.ts
import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { AgentState } from "../types/state";
import { getCheckpointer } from "@/lib/agent-memory";
import { contextNode } from "../nodes/email/contextNode";
import { draftNode } from "../nodes/email/draftNode";
import { evaluationNode } from "../nodes/email/evaluationNode";
import { emailNode } from "../nodes/email/emailNode";
import { interrupt } from "@langchain/langgraph";

// Re-using the state structure (simplified for the Email Agent workflow)
const EmailState = Annotation.Root({
  userId: Annotation<string>({ reducer: (_, b) => b }),
  sessionId: Annotation<string>({ reducer: (_, b) => b }),
  email: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  healthSummary: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  emailSubject: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  emailBody: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  evaluationResult: Annotation<AgentState["evaluationResult"]>({ reducer: (_, b) => b, default: () => null }),
  humanApproved: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  humanFeedback: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  emailSent: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  sentiment: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  error: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
});

/**
 * Orchestrates the Email Agent workflow.
 */
export function buildEmailGraph() {
  const checkpointer = getCheckpointer();
  const graph = new StateGraph(EmailState) as any;

  // 1. Add all nodes
  graph.addNode("context_node", contextNode);
  graph.addNode("draft_node", draftNode);
  graph.addNode("evaluation_node", evaluationNode);

  // 2. Human Approval Node (INTERRUPT)
  graph.addNode("human_approval", async (state: any) => {
    console.log(`[emailWorkflow] Graph paused for Human Approval: ${state.userId}`);
    
    return interrupt<any, { approved: boolean; feedback?: string }>({
      subject: state.emailSubject,
      body: state.emailBody,
      evaluation: state.evaluationResult,
      email: state.email,
      error: state.error,
    });
  });

  // 3. Email Node
  graph.addNode("email_node", emailNode);

  // 4. Final Processing Node
  graph.addNode("final_processing", (state: any) => {
     return state;
  });

  // 5. Define Edges (Logical Flow)
  graph.addEdge("__start__", "context_node");
  
  // Conditional routing from context_node to handle errors early
  graph.addConditionalEdges("context_node", (state: any) => {
    if (state.error) {
      console.warn(`[emailWorkflow] Routing to human_approval due to error: ${state.error}`);
      return "human_approval";
    }
    return "draft_node";
  });
  
  graph.addEdge("draft_node", "evaluation_node");
  graph.addEdge("evaluation_node", "human_approval");
  graph.addEdge("human_approval", "final_processing");

  // Conditional routing from final_processing after human resume
  graph.addConditionalEdges("final_processing", (state: any) => {
    if (state.humanApproved) return "email_node";
    if (state.humanFeedback) return "draft_node";
    return END;
  });

  graph.addEdge("email_node", END);

  return graph.compile({ checkpointer });
}
