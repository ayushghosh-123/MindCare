// STEP 12 — agents/nodes/chat/chatNode.ts
// Conversational support agent.
// Saves every message to your chats table and loads full history for context.
// Also updates the chat_sessions table with message count and last message preview.

import { AgentState } from "../../types/state";
import { llm } from "../../config/llm";
import { CHAT_PROMPT } from "../../prompts";
import { saveChatMessage, fetchChatHistory } from "../../tools/supbaseTool";
import { chatSessionHelpers } from "@/lib/supabase-chat";

export async function chatNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  try {
    // 1. Save user message to DB first
    await saveChatMessage(state.userId, state.sessionId, state.userMessage, true);

    // 2. Fetch last 20 messages for context window
    const history = await fetchChatHistory(state.userId, state.sessionId);
    const contextWindow = history.slice(-20);

    // 3. Build messages array including conversation history
    const messages = [
      { role: "system" as const, content: CHAT_PROMPT },
      ...contextWindow.map((msg) => ({
        role: msg.is_user_message ? ("user" as const) : ("assistant" as const),
        content: msg.message ?? "",
      })),
      { role: "user" as const, content: state.userMessage },
    ];

    // 4. Get AI response
    const result = await llm.invoke(messages);
    const response = result.content.toString();

    // 5. Save AI response to DB
    await saveChatMessage(state.userId, state.sessionId, response, false);

    // 6. Update session metadata — powers the sidebar preview and message count
    await chatSessionHelpers.updateSessionProgress(
      state.sessionId,
      state.userMessage // last user message shown as preview in sidebar
    );

    return { response, chatHistory: contextWindow };
  } catch (err) {
    console.error("[chatNode]", err);
    return {
      response:
        "I'm here for you. Could you tell me a bit more about how you're feeling today?",
      error: String(err),
    };
  }
}