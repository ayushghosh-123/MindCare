
// STEP 19 — agents/graphs/mainGraph.ts
// The full orchestration graph. Wires every node together.
//
// Key patterns used here:
// 1. addConditionalEdges — routes based on agentType (diamond shapes)
// 2. Send() — parallel fan-out for report mode
// 3. MemorySaver — checkpointer required for interrupt() / HITL to work
// 4. routeAfterEvaluate — skips email if human rejected

import { StateGraph, END,  Annotation, Send } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { AgentState } from "../types/state";

// Nodes
import { mainAgentNode } from "../nodes/mainAgent";
import { chatNode } from "../nodes/chat/chatNode";
import { dataNode } from "../nodes/data/dataNode";
import { mergeReportNode } from "../nodes/data/mergeReportNode";
import { evaluateAgentNode } from "../nodes/evaluateAgent";
import { emailAgentNode } from "../nodes/emailAgent";

// Journaling sub-graph compiled once, reused as a single node
import {buildJournalingGraph} from "./JournalingGraph";

const journalingSubGraph = buildJournalingGraph();

// Wraps the sub-graph as a node — used by BOTH journaling and report paths
async function journalingAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const result = await journalingSubGraph.invoke(state);
  return {
    response: result.response,
    sentiment: result.sentiment,
    sentimentScore: result.sentimentScore,
    diagonosis: result.diagnosis,
  };
}

// ── State annotation ────────────────────────────────────────────────────────
const MainState = Annotation.Root({
  userId: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  sessionId: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  userMessage: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  journalEntry: Annotation<AgentState["JournalEntry"]>({ reducer: (_, b) => b, default: () => undefined }),
  healthEntry: Annotation<AgentState["healthEntry"]>({ reducer: (_, b) => b, default: () => undefined }),
  agentType: Annotation<AgentState["agentType"]>({ reducer: (_, b) => b, default: () => null }),
  sentiment: Annotation<AgentState["sentiment"]>({ reducer: (_, b) => b, default: () => null }),
  sentimentScore: Annotation<number | null>({ reducer: (_, b) => b, default: () => null }),
  diagnosis: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  healthSummary: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  response: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  chatHistory: Annotation<AgentState["chatHistory"]>({ reducer: (_, b) => b, default: () => [] }),
  humanApproved: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  humanFeedback: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  emailSent: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  error: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
});

// ── Routing: after main_agent ───────────────────────────────────────────────
// Returns a string for single-path routing or Send[] for parallel execution
function routeAfterMainAgent(
  state: typeof MainState.State
): string | Send[] {
  switch (state.agentType) {
    case "journaling":
      return "journaling_agent";

    case "chat":
      return "chat_agent";

    case "data":
      return "data_agent";

    case "report":
      // Parallel fan-out using Send()
      // journaling_agent writes → state.response
      // data_agent writes       → state.healthSummary  (different field — no overwrite)
      // LangGraph waits for BOTH then moves to merge_report
      return [
        new Send("journaling_agent", state),
        new Send("data_agent", { ...state, agentType: "report" }),
      ];

    default:
      return "chat_agent";
  }
}

// ── Routing: after evaluate_agent ───────────────────────────────────────────
// HITL gate — only sends email if human approved
function routeAfterEvaluate(
  state: typeof MainState.State
): "email_agent" | typeof END {
  return state.humanApproved ? "email_agent" : END;
}

// ── Graph builder ────────────────────────────────────────────────────────────
export function buildMainGraph() {
   // MemorySaver required for interrupt() HITL — swap for PostgresSaver in prod
  const checkpointer = new MemorySaver();
 
  // ✅ FINAL FIX: cast to any once — bypasses all broken LangGraph type errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph = new StateGraph(MainState) as any;
 
  // Register ALL nodes before adding ANY edges
  graph.addNode("main_agent", mainAgentNode);
  graph.addNode("journaling_agent", journalingAgentNode);
  graph.addNode("chat_agent", chatNode);
  graph.addNode("data_agent", dataNode);
  graph.addNode("merge_report", mergeReportNode);
  graph.addNode("evaluate_agent", evaluateAgentNode);
  graph.addNode("email_agent", emailAgentNode);
 
  // Entry point
  graph.addEdge("__start__", "main_agent");
 
  // After main_agent: conditional routing or parallel Send
  graph.addConditionalEdges("main_agent", routeAfterMainAgent, {
    journaling_agent: "journaling_agent",
    chat_agent: "chat_agent",
    data_agent: "data_agent",
  });
 
  // Normal paths or parallel paths join at merge/evaluate
  graph.addConditionalEdges("journaling_agent", (state: any) => 
    state.agentType === "report" ? "merge_report" : "evaluate_agent"
  );
  graph.addEdge("chat_agent", "evaluate_agent");
  graph.addConditionalEdges("data_agent", (state: any) => 
    state.agentType === "report" ? "merge_report" : "evaluate_agent"
  );
 
  // Report parallel paths → merge → evaluate
  graph.addEdge("merge_report", "evaluate_agent");
 
  // HITL gate — email only if human approved
  graph.addConditionalEdges("evaluate_agent", routeAfterEvaluate, {
    email_agent: "email_agent",
    [END]: END,
  });
 
  graph.addEdge("email_agent", END);
 
  return graph.compile({ checkpointer });
}