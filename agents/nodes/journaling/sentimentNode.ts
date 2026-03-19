 
import { AgentState } from "../../types/state"
import {llm , parseLLMJson} from '../../config/llm'
import {SENTIMENT_PROMPT} from '../../prompts/index'
import {SentimentResponseSchema, SentimentResponse} from '../../schemas/responseSchema'

export async function SentimentNode(state: AgentState): Promise<Partial<AgentState>>{
    const content = state.journalEntry?.content ?? state.usermessage;

    try {
        const result = await llm.invoke(
            [
                { role: "system", content: SENTIMENT_PROMPT },
                { role: "user", content },
            ]
        )

        const parsed = parseLLMJson<SentimentResponse>(result.content.toString())
        const validated = SentimentResponseSchema.safeParse(parsed);
 
         if (!validated.success) {
            console.warn("[sentimentNode] Parse failed, defaulting to negative for safety");
            // Default to negative when uncertain — safer for a mental health app
            return { sentiment: "negative", sentimentScore: 40 };
        }
 
    return {
      sentiment: validated.data.sentiment,
      sentimentScore: validated.data.score,
    };

    } catch (error) {
        console.error("[sentimentNode]", err);
        return { sentiment: "negative", sentimentScore: 40, error: String(err) };
    }
}