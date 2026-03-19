import { ChatOpenAI } from "@langchain/openai";

// llm the openapi chat model
export const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
  maxTokens: 1000,
  apiKey: process.env.OPENAI_API_KEY,
});

// llm for extreme high chat model 
export const llmPro = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.2,
  maxTokens: 1500,
  apiKey: process.env.OPENAI_API_KEY,
});

export function parseLLMJson<T>(text: string): T | null {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as T;
  } catch {
    console.error("[llm] Failed to parse JSON:", text);
    return null;
  }
}