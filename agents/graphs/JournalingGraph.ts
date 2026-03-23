// journaling garph code written here 
// STEP 18 — agents/graphs/journalingGraph.ts
// The journaling sub-graph — compiled separately and used as a single node
// inside mainGraph. This mirrors the right side of your original diagram.
//
// Flow:
//   START → find_sentiment → [diamond: +ve / -ve]
//     +ve → positive_response → END
//     -ve → run_diagnosis → negative_response → END
//
// This graph is reused in TWO situations:
// 1. Normal journaling path (user submits a diary entry)
// 2. Report mode parallel branch (runs alongside data_agent)

import { StateGraph, END,  Annotation } from "@langchain/langgraph";
import { AgentState } from "../types/state";
import { SentimentNode } from "../nodes/journaling/sentimentNode";
import { DiagnosisNode } from "../nodes/journaling/diagonosisNode";
import { positiveResponseNode } from "../nodes/journaling/positiveNode";
import { negativeResponseNode } from "../nodes/journaling/negativeNode";

// State annotation — must match AgentState fields used by these nodes
const JournalingState = Annotation.Root({
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

// The diamond in your diagram — routes based on sentiment
function routeBySentiment(
  state: typeof JournalingState.State
): "run_diagnosis" | "positive_response" {
  return state.sentiment === "negative" ? "run_diagnosis" : "positive_response";
}

export function buildJournalingGraph() {
 // ✅ FINAL FIX: cast to any once — bypasses all broken LangGraph type errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph = new StateGraph(JournalingState) as any;
 
  // Nodes
  graph.addNode("find_sentiment", SentimentNode);
  graph.addNode("run_diagnosis", DiagnosisNode);
  graph.addNode("positive_response", positiveResponseNode);
  graph.addNode("negative_response", negativeResponseNode);
 
  // Entry point
  graph.addEdge("__start__", "find_sentiment");
 
  // Diamond routing — positive vs negative
  graph.addConditionalEdges("find_sentiment", routeBySentiment, {
    run_diagnosis: "run_diagnosis",
    positive_response: "positive_response",
  });
 
  // Negative path
  graph.addEdge("run_diagnosis", "negative_response");
  graph.addEdge("negative_response", END);
 
  // Positive path
  graph.addEdge("positive_response", END);
 
  return graph.compile();
}