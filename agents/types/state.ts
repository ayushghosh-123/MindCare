import { JournalEntry, HealthEntry, Chat } from "@/lib/supabase";

export interface AgentState{

    userId: string;
    sessionId: string;

    userMessage: string;
    JournalEntry?: Partial<JournalEntry>;
    healthEntry?: Partial<HealthEntry>

    agentType: "journaling"| "chat" | "data" | "report"| null;

    sentiment: "positive"|"negative"|null;
    sentimentScore: number | null;
    diagnosis: string |null;

    healthSummary: string|null;
    
    response: string | null;
    chatHistory: Partial<Chat>[];

    humanApproved: boolean;
    humanFeedback: string | null;

    emailSent: boolean;
    email: string | null;
    emailSubject?: string | null;
    emailBody?: string | null;
    evaluationResult?: {
      status: "approved" | "needs_edit";
      issues: string[];
    } | null;
    error: string | null;
}


export type SentimentType = "positive" | "negative";
export type AgentType = "journaling" | "chat" | "data" | "report";