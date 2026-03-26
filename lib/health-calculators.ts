import type { HealthEntry } from './supabase';

/**
 * Maps mood string to a numeric value 1-5
 */
export function moodToScore(mood: string | null | undefined): number {
  const moodMap: Record<string, number> = {
    excellent: 5,
    good: 4,
    neutral: 3,
    poor: 2,
    terrible: 1
  };
  return moodMap[mood || ''] ?? 3;
}

/**
 * Calculates a health score (0-100) based on mood, sleep, exercise, and water intake.
 * Unifies the target metrics:
 * - Mood: 30% (5/5 = 30 pts)
 * - Sleep: 25% (8h = 25 pts)
 * - Exercise: 25% (60m = 25 pts) -- Unified to 60m daily target
 * - Water: 20% (8 units = 20 pts)
 */
export function calculateHealthScore(params: {
  mood?: string | null;
  sleep_hours?: number;
  exercise_minutes?: number;
  water_intake?: number;
}): number {
  const moodVal = moodToScore(params.mood);
  const sleepVal = params.sleep_hours ?? 0;
  const exerciseVal = params.exercise_minutes ?? 0;
  const waterVal = params.water_intake ?? 0;

  const partMood = (moodVal / 5) * 30;
  const partSleep = Math.min(sleepVal / 8, 1) * 25;
  const partExercise = Math.min(exerciseVal / 60, 1) * 25; // Unified target: 60 mins
  const partWater = Math.min(waterVal / 8, 1) * 20;

  return Math.round(partMood + partSleep + partExercise + partWater);
}

/**
 * Calculates a streak of consecutive days with at least one health entry.
 */
export function calculateDayStreak(entries: HealthEntry[]): number {
  if (!entries || entries.length === 0) return 0;

  // Extract unique dates in YYYY-MM-DD format and sort descending
  const dates = Array.from(new Set(
    entries
      .filter(e => e.entry_date)
      .map(e => new Date(e.entry_date as string).toISOString().split('T')[0])
  )).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If the most recent entry isn't today or yesterday, the streak is broken
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let currentDate = new Date(dates[0]);

  for (const dateStr of dates) {
    const entryDate = new Date(dateStr);
    const expectedDateStr = currentDate.toISOString().split('T')[0];

    if (dateStr === expectedDateStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates averages and trends over a set of entries (usually last 30 days).
 */
export function calculateAggregateStats(entries: HealthEntry[]) {
  if (!entries || entries.length === 0) {
    return {
      avgMood: 3,
      avgSleep: 0,
      avgExercise: 0,
      avgWater: 0,
      healthScore: 0,
      count: 0
    };
  }

  const count = entries.length;
  const totalMood = entries.reduce((sum, e) => sum + moodToScore(e.mood), 0);
  const totalSleep = entries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0);
  const totalExercise = entries.reduce((sum, e) => sum + (e.exercise_minutes || 0), 0);
  const totalWater = entries.reduce((sum, e) => sum + (e.water_intake || 0), 0);

  const avgMood = totalMood / count;
  const avgSleep = totalSleep / count;
  const avgExercise = totalExercise / count;
  const avgWater = totalWater / count;

  // Aggregate health score is based on averages
  const healthScore = calculateHealthScore({
    mood: undefined, // Handled manually below since we have avgMood numeric
    sleep_hours: avgSleep,
    exercise_minutes: avgExercise,
    water_intake: avgWater
  });

  // Re-calculate the mood part since we have a float average
  const partMood = (avgMood / 5) * 30;
  const partSleep = Math.min(avgSleep / 8, 1) * 25;
  const partExercise = Math.min(avgExercise / 60, 1) * 25;
  const partWater = Math.min(avgWater / 8, 1) * 20;
  
  const finalScore = Math.round(partMood + partSleep + partExercise + partWater);

  return {
    avgMood,
    avgSleep,
    avgExercise,
    avgWater,
    healthScore: finalScore,
    count
  };
}

/**
 * Calculates a percentage trend between two halves of a value array.
 */
export function calculateTrend(values: number[]) {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (firstAvg === 0) return secondAvg > 0 ? 100 : 0;
  return ((secondAvg - firstAvg) / firstAvg) * 100;
}
