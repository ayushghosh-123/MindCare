'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {Activity, Calendar, Moon, GlassWater, Brain as BrainIcon, Zap} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dbHelpers, type HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import type { ChangeEvent } from 'react';

interface UnifiedDashboardTodayProps {
  userId: string;
  className?: string;
}

export function UnifiedDashboardToday({ userId, className }: UnifiedDashboardTodayProps) {
  const { toast } = useToast();

  // Today's entry from DB (null if none)
  const [todayEntry, setTodayEntry] = useState<HealthEntry | null>(null);

  // Loading state for overall component
  const [loading, setLoading] = useState<boolean>(true);
  // Saving state for form submit
  const [saving, setSaving] = useState<boolean>(false);

  // Form state (strings to keep inputs friendly; we'll convert before sending)
  const [form, setForm] = useState({
    sleep_hours: '',
    exercise_minutes: '',
    water_intake: '',
    mood: '',
    symptoms: '',
    notes: '',
    energy_level: '',
    stress_level: ''
  });

  // Helper: today's date in YYYY-MM-DD (matches DATE column)
  const todayIsoDate = new Date().toISOString().slice(0, 10);

  // Load entries and pick today's entry (called on mount and after save)
  useEffect(() => {
    void loadTodayEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /**
   * Load user's health entries and set today's entry & form values if present.
   */
  const loadTodayEntry = async () => {
    try {
      setLoading(true);

      const resp = await dbHelpers.getUserHealthEntries(userId);
      const entries: HealthEntry[] = resp?.data || [];

      // Find entry with entry_date === todayIsoDate
      const today = entries.find((e) => {
        const d = e.entry_date ? new Date(e.entry_date).toISOString().slice(0, 10) : '';
        return d === todayIsoDate;
      }) || null;

      setTodayEntry(today);

      // If entry exists, prefill form
      if (today) {
        setForm({
          sleep_hours: today.sleep_hours != null ? String(today.sleep_hours) : '',
          exercise_minutes: today.exercise_minutes != null ? String(today.exercise_minutes) : '',
          water_intake: today.water_intake != null ? String(today.water_intake) : '',
          mood: today.mood || '',
          symptoms: today.symptoms || '',
          notes: today.notes || '',
          energy_level: today.energy_level != null ? String(today.energy_level) : '',
          stress_level: today.stress_level != null ? String(today.stress_level) : ''
        });
      } else {
        // No entry yet — reset form to empty/defaults
        setForm({
          sleep_hours: '',
          exercise_minutes: '',
          water_intake: '',
          mood: '',
          symptoms: '',
          notes: '',
          energy_level: '',
          stress_level: ''
        });
      }
    } catch (err) {
      console.error('Failed to load health entries', err);
      toast({
        title: 'Load error',
        description: 'Could not load today\'s health entry.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple input change handler
  const onChange = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  /**
   * Calculate health score based on current form values
   */
  const computeHealthScore = (data?: {
    mood?: string;
    sleep_hours?: string | number;
    exercise_minutes?: string | number;
    water_intake?: string | number;
  }) => {
    const sourceData = data || form;
    
    const moodMap: Record<string, number> = {
      excellent: 5,
      good: 4,
      neutral: 3,
      poor: 2,
      terrible: 1
    };

    const moodVal = moodMap[String(sourceData.mood || '')] ?? 3;
    const sleepVal = parseFloat(String(sourceData.sleep_hours || '0'));
    const exerciseVal = parseFloat(String(sourceData.exercise_minutes || '0'));
    const waterVal = parseFloat(String(sourceData.water_intake || '0'));

    const partMood = (moodVal / 5) * 30;
    const partSleep = Math.min(sleepVal / 8, 1) * 25;
    const partExercise = Math.min(exerciseVal / 120, 1) * 25;
    const partWater = Math.min(waterVal / 8, 1) * 20;

    const rawScore = partMood + partSleep + partExercise + partWater;
    return Math.round(rawScore);
  };

  // Color helper for health score badge
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Mood badge color mapping
  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      neutral: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      terrible: 'bg-red-100 text-red-800'
    };
    return colors[mood] || 'bg-slate-100 text-slate-800';
  };

  /**
   * Save handler - creates or updates today's entry
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      // Calculate the health score
      const healthScore = computeHealthScore();

      // Prepare payload (health_score is calculated but not stored in DB schema)
      const payload: Partial<HealthEntry> = {
        user_id: userId,
        entry_date: todayIsoDate,
        mood: form.mood ? (form.mood as HealthEntry['mood']) : undefined,
        symptoms: form.symptoms || undefined,
        notes: form.notes || undefined,
        sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : 0,
        water_intake: form.water_intake ? parseFloat(form.water_intake) : 0,
        exercise_minutes: form.exercise_minutes ? parseInt(form.exercise_minutes) : 0,
        energy_level: form.energy_level ? parseInt(form.energy_level) : undefined,
        stress_level: form.stress_level ? parseInt(form.stress_level) : undefined,
      };

      if (todayEntry && todayEntry.id) {
        // Update existing record
        const result = await dbHelpers.updateHealthEntry(todayEntry.id, payload);
        if (result.error) {
          throw result.error;
        }
        toast({
          title: 'Updated Successfully',
          description: `Health entry updated. Score: ${healthScore}`,
        });
      } else {
        // Create new record
        const result = await dbHelpers.createHealthEntry(payload);
        if (result.error) {
          throw result.error;
        }
        toast({
          title: 'Saved Successfully',
          description: `Health entry saved. Score: ${healthScore}`,
        });
      }

      // Refresh data to show in right section
      await loadTodayEntry();
    } catch (err) {
      console.error('Save error', err);
      toast({
        title: 'Save failed',
        description: 'Could not save today\'s entry.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 gap-4">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-slate-200 rounded mb-4" />
              <div className="h-40 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Compute current score from form (live preview)
  const currentScore = computeHealthScore();
  
  // Calculate stored score from database entry (health_score is not stored, calculate from saved data)
  const storedScore = todayEntry ? computeHealthScore({
    mood: todayEntry.mood,
    sleep_hours: todayEntry.sleep_hours,
    exercise_minutes: todayEntry.exercise_minutes,
    water_intake: todayEntry.water_intake,
  }) : 0;

  return (
    <div className={cn('space-y-6', className)}>

      {/* Header / Welcome */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Today's Health</h2>
            <p className="text-sm text-slate-500">Log your sleep, water, exercise & mood for today.</p>
          </div>

          {/* Current health score preview */}
          <div className="flex flex-col gap-2">
            <div className={cn('rounded-full px-4 py-3 font-bold', getHealthScoreColor(currentScore))}>
              <div className="text-center text-lg">{currentScore}</div>
              <div className="text-xs text-slate-600 text-center">
                {todayEntry ? 'Preview' : 'Current'}
              </div>
            </div>
            {storedScore !== undefined && storedScore !== currentScore && (
              <div className="text-xs text-slate-500 text-center">
                Saved: {storedScore}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-600" />
                Today ({todayIsoDate})
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Sleep, Exercise, Water */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-600">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={form.sleep_hours}
                    onChange={onChange('sleep_hours')}
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 7.5"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Exercise (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.exercise_minutes}
                    onChange={onChange('exercise_minutes')}
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 30"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Water (cups)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.water_intake}
                    onChange={onChange('water_intake')}
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 5.0"
                  />
                </div>
              </div>

              {/* Mood, Energy, Stress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-600">Mood</label>
                  <select
                    value={form.mood}
                    onChange={onChange('mood')}
                    className="w-full p-2 border rounded mt-1"
                  >
                    <option value="">Select</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="poor">Poor</option>
                    <option value="terrible">Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600">Energy (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.energy_level}
                    onChange={onChange('energy_level')}
                    className="w-full p-2 border rounded mt-1"
                    placeholder="7"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Stress (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.stress_level}
                    onChange={onChange('stress_level')}
                    className="w-full p-2 border rounded mt-1"
                    placeholder="4"
                  />
                </div>
              </div>

              {/* Symptoms & Notes */}
              <div className="mb-3">
                <label className="text-xs text-slate-600">Symptoms (optional)</label>
                <input
                  type="text"
                  value={form.symptoms}
                  onChange={onChange('symptoms')}
                  className="w-full p-2 border rounded mt-1"
                  placeholder="e.g. headache, sore throat"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-600">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={onChange('notes')}
                  className="w-full p-2 border rounded mt-1 min-h-[80px]"
                  placeholder="How was your day? Anything to record?"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {todayEntry ? (saving ? 'Updating...' : 'Update Today') : (saving ? 'Saving...' : 'Save Today')}
                </button>

                <button
                  onClick={() => {
                    setForm({
                      sleep_hours: '',
                      exercise_minutes: '',
                      water_intake: '',
                      mood: '',
                      symptoms: '',
                      notes: '',
                      energy_level: '',
                      stress_level: ''
                    });
                  }}
                  className="px-3 py-2 border rounded text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>

                <div className="ml-auto text-xs text-slate-500">
                  {todayEntry ? 'Entry exists for today' : 'No entry yet'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: STORED DATA Snapshot (Shows saved data from database) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                {todayEntry ? 'Saved Data' : 'Today Snapshot'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {todayEntry ? (
                <div className="space-y-3">
                  {/* Display STORED values from database */}
                  
                  {/* Sleep - from DB */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-6 w-6 text-indigo-600" />
                      <div>
                        <div className="text-sm text-slate-500">Sleep</div>
                        <div className="font-medium text-slate-800">
                          {todayEntry.sleep_hours != null ? `${todayEntry.sleep_hours} h` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exercise - from DB */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="h-6 w-6 text-orange-600" />
                      <div>
                        <div className="text-sm text-slate-500">Exercise</div>
                        <div className="font-medium text-slate-800">
                          {todayEntry.exercise_minutes != null ? `${todayEntry.exercise_minutes} m` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water - from DB */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GlassWater className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-slate-500">Water</div>
                        <div className="font-medium text-slate-800">
                          {todayEntry.water_intake != null ? `${todayEntry.water_intake} cups` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mood - from DB */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BrainIcon className="h-6 w-6 text-pink-600" />
                      <div>
                        <div className="text-sm text-slate-500">Mood</div>
                        <div className="font-medium">
                          {todayEntry.mood ? (
                            <span className={cn('px-2 py-1 rounded text-xs', getMoodColor(todayEntry.mood))}>
                              {todayEntry.mood}
                            </span>
                          ) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Energy & Stress - from DB */}
                  {(todayEntry.energy_level || todayEntry.stress_level) && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {todayEntry.energy_level && (
                          <div>
                            <div className="text-slate-500">Energy</div>
                            <div className="font-semibold text-slate-800">{todayEntry.energy_level}/10</div>
                          </div>
                        )}
                        {todayEntry.stress_level && (
                          <div>
                            <div className="text-slate-500">Stress</div>
                            <div className="font-semibold text-slate-800">{todayEntry.stress_level}/10</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stored Health Score - from DB */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">Saved Health Score</div>
                    <div className={cn('text-2xl font-bold mt-1 p-3 rounded inline-block', getHealthScoreColor(storedScore || 0))}>
                      {storedScore || 0}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Last saved: {new Date(todayEntry.updated_at || todayEntry.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Symptoms & Notes - from DB */}
                  {(todayEntry.symptoms || todayEntry.notes) && (
                    <div className="pt-3 border-t border-slate-100">
                      {todayEntry.symptoms && (
                        <div className="mb-2">
                          <div className="text-xs text-slate-500">Symptoms</div>
                          <div className="text-sm text-slate-700">{todayEntry.symptoms}</div>
                        </div>
                      )}
                      {todayEntry.notes && (
                        <div>
                          <div className="text-xs text-slate-500">Notes</div>
                          <div className="text-sm text-slate-700 line-clamp-3">{todayEntry.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // No entry saved yet - show placeholder
                <div className="text-center py-8 text-slate-400">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No data saved yet</p>
                  <p className="text-xs mt-1">Fill in the form and click "Save Today"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}