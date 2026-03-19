import { z } from 'zod'

export const SentimentResponseSchema = z.object({
    sentiment: z.enum(['positive', 'negative']),
    score: z.number().min(0).max(100),
    keywords: z.array(z.string()).max(5),
})

export const DiagnosisResponseSchema = z.object({
  summary: z.string(),
  possibleConcerns: z.array(z.string()).max(3),
  copingStrategies: z.array(z.string()).max(4),
  urgencyLevel: z.enum(["low", "medium", "high"]),
  recommendProfessional: z.boolean(),
})

export const RoutingResponseSchema = z.object({
  agentType: z.enum(["journaling", "chat", "data", "report"]),
  reason: z.string(),
});


export type SentimentResponse = z.infer<typeof SentimentResponseSchema>;
export type DiagnosisResponse = z.infer<typeof DiagnosisResponseSchema>;
export type RoutingResponse = z.infer<typeof RoutingResponseSchema>;