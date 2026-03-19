import { dbHelpers, JournalEntry, HealthEntry, Chat } from "@/lib/supabase";

//  for save the journal into database
export async function saveJournalEntry(entryData: Partial<JournalEntry>) {
  const { data, error } = await dbHelpers.createJournalEntry(entryData);
  if (error) console.error("[supabaseTool] saveJournalEntry:", error);
  return data ?? null;
}

// fetch recent journal entries
export async function fetchRecentEntries(journalId: string, limit = 10) {
  const { data, error } = await dbHelpers.getJournalEntries(journalId);
  if (error) console.error("[supabaseTool] fetchRecentEntries:", error);
  return (data ?? []).slice(0, limit) as JournalEntry[];
}

// fetch recent health entries
export async function fetchHealthEntries(userId: string, limit = 14) {
  const { data, error } = await dbHelpers.getUserHealthEntries(userId);
  if (error) console.error("[supabaseTool] fetchHealthEntries:", error);
  return (data ?? []).slice(0, limit) as HealthEntry[];
}

// save the chat message 
export async function saveChatMessage(
  userId: string, sessionId: string, message: string, isUserMessage: boolean
) {
  const { error } = await dbHelpers.saveChatMessage({
    user_id: userId, session_id: sessionId, message, is_user_message: isUserMessage,
  });
  if (error) console.error("[supabaseTool] saveChatMessage:", error);
}


// fetch the chat history 
export async function fetchChatHistory(userId: string, sessionId: string) {
  const { data, error } = await dbHelpers.getChatHistory(userId, sessionId);
  if (error) console.error("[supabaseTool] fetchChatHistory:", error);
  return (data ?? []) as Chat[];
}

export interface HealthSummary {
  avgSleep: number;
  avgWater: number;
  avgExercise: number;
  avgEnergy: number;
  avgStress: number;
  moodCounts: Record<string, number>;
  totalEntries: number;
}

// function to make the health_entry 
export async function buildHealthSummary(userId: string): Promise<HealthSummary> {
  const entries = await fetchHealthEntries(userId, 14);
  if (entries.length === 0) {
    return { avgSleep: 0, avgWater: 0, avgExercise: 0, avgEnergy: 0, avgStress: 0, moodCounts: {}, totalEntries: 0 };
  }

  const sum = entries.reduce(
    (acc, e) => ({
      sleep: acc.sleep + (e.sleep_hours ?? 0),
      water: acc.water + (e.water_intake ?? 0),
      exercise: acc.exercise + (e.exercise_minutes ?? 0),
      energy: acc.energy + (e.energy_level ?? 0),
      stress: acc.stress + (e.stress_level ?? 0),
    }),
    { sleep: 0, water: 0, exercise: 0, energy: 0, stress: 0 }
  );

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1; });

  const n = entries.length;
  return {
    avgSleep: +(sum.sleep / n).toFixed(1),
    avgWater: +(sum.water / n).toFixed(1),
    avgExercise: +(sum.exercise / n).toFixed(0),
    avgEnergy: +(sum.energy / n).toFixed(1),
    avgStress: +(sum.stress / n).toFixed(1),
    moodCounts,
    totalEntries: n,
  };
}

