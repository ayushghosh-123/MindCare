import { z } from 'zod'

export const JournalEntryInputSchema = z.object({
    journal_id: z.string().uuid(),
    user_id: z.string(),
    title: z.string().optional(),
    content: z.string().min(1),
    mood: z.enum(["excellent", "poor", "good", "neutral", "terrible"]).optional(),
    tags: z.array(z.string()).optional(),
    is_private: z.boolean().default(true),
    word_count: z.number().default(0),
    reading_time: z.number().default(0)
})

export const AgentRequestSchema = z.object({
  userMessage: z.string().min(1),
  sessionId: z.string().default(() => crypto.randomUUID()),
  journalEntry: JournalEntryInputSchema.optional(),
  resume: z
    .object({
      threadId: z.string(),
      humanApproved: z.boolean(),
      humanFeedback: z.string().optional(),
    })
    .optional(),
});
 
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type JournalEntryInput = z.infer<typeof JournalEntryInputSchema>;