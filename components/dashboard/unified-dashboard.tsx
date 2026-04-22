'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Leaf, Sparkles, Activity as ActivityIcon, Droplets, Moon, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dbHelpers, type HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import type { ChangeEvent } from 'react';
import { calculateHealthScore } from '@/lib/health-calculators';
// import { CommunityWall } from './community-wall';

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
    stress_level: '',
    breakfast: '',
    lunch: '',
    dinner: ''
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

      let userNotes = today?.notes || '';
      let bfast = '', lun = '', din = '';

      if (today?.notes && today.notes.startsWith('{')) {
        try {
          const parsed = JSON.parse(today.notes);
          userNotes = parsed.text || '';
          bfast = parsed.breakfast || '';
          lun = parsed.lunch || '';
          din = parsed.dinner || '';
        } catch (e) {
          // Keep as text if failed to parse
        }
      }

      // If entry exists, prefill form
      if (today) {
        setForm({
          sleep_hours: today.sleep_hours != null ? String(today.sleep_hours) : '',
          exercise_minutes: today.exercise_minutes != null ? String(today.exercise_minutes) : '',
          water_intake: today.water_intake != null ? String(today.water_intake) : '',
          mood: today.mood || '',
          symptoms: today.symptoms || '',
          notes: userNotes,
          energy_level: today.energy_level != null ? String(today.energy_level) : '',
          stress_level: today.stress_level != null ? String(today.stress_level) : '',
          breakfast: bfast,
          lunch: lun,
          dinner: din
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
          stress_level: '',
          breakfast: '',
          lunch: '',
          dinner: ''
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
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  }) => {
    const sourceData = data || form;
    
    // Default to form data for meals if not explicitly passed
    const bfast = 'breakfast' in sourceData ? sourceData.breakfast : form.breakfast;
    const lun = 'lunch' in sourceData ? sourceData.lunch : form.lunch;
    const din = 'dinner' in sourceData ? sourceData.dinner : form.dinner;

    const mealsLogged = [bfast, lun, din]
      .filter((m) => typeof m === 'string' && m.trim().length > 0).length;

    return calculateHealthScore({
      mood: String(sourceData.mood || ''),
      sleep_hours: parseFloat(String(sourceData.sleep_hours || '0')),
      exercise_minutes: parseFloat(String(sourceData.exercise_minutes || '0')),
      water_intake: parseFloat(String(sourceData.water_intake || '0')),
      meals_logged: mealsLogged
    });
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

      const notesPayload = JSON.stringify({
        text: form.notes,
        breakfast: form.breakfast,
        lunch: form.lunch,
        dinner: form.dinner
      });

      // Prepare payload (health_score is calculated but not stored in DB schema)
      const payload: Partial<HealthEntry> = {
        user_id: userId,
        entry_date: todayIsoDate,
        mood: form.mood ? (form.mood as HealthEntry['mood']) : undefined,
        symptoms: form.symptoms || undefined,
        notes: notesPayload,
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

  // Loading skeleton layout that closely matches the actual UI to prevent CLS
  if (loading) {
    return (
      <div className={cn('space-y-6 sm:space-y-10 animate-pulse', className)}>
        <div className="h-24 sm:h-32 bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          <div className="lg:col-span-2 h-[400px] sm:h-[600px] bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2.5rem]" />
          <div className="h-[300px] sm:h-[400px] bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  // Compute current score from form (live preview)
  const currentScore = computeHealthScore();

  let entryBreakfast = '';
  let entryLunch = '';
  let entryDinner = '';

  if (todayEntry?.notes && todayEntry.notes.startsWith('{')) {
    try {
      const parsed = JSON.parse(todayEntry.notes);
      entryBreakfast = parsed.breakfast || '';
      entryLunch = parsed.lunch || '';
      entryDinner = parsed.dinner || '';
    } catch (e) {
      // Keep empty
    }
  }

  // Calculate stored score from database entry (health_score is not stored, calculate from saved data)
  const storedScore = todayEntry ? computeHealthScore({
    mood: todayEntry.mood,
    sleep_hours: todayEntry.sleep_hours,
    exercise_minutes: todayEntry.exercise_minutes,
    water_intake: todayEntry.water_intake,
    breakfast: entryBreakfast,
    lunch: entryLunch,
    dinner: entryDinner,
  }) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn('space-y-10', className)}
    >

      {/* 🚀 CONSOLIDATED HEADER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#2C2A4A]/5 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="flex-1 p-6 sm:p-12 bg-[#f3f3f3] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-[#bdb2ff]/10 blur-[40px] sm:blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-7xl font-black text-[#1b0c53] tracking-tighter leading-none mb-4 sm:mb-6 relative z-10">
              Daily Calibration
            </h2>
            <div className="flex items-center gap-3 sm:gap-4 text-base sm:text-xl text-[#5f559a]/60 font-medium italic relative z-10">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#bdb2ff]" />
              <span className="truncate">{todayIsoDate} — The sanctuary awaits.</span>
            </div>
          </div>
          <div className="w-full md:w-96 p-8 sm:p-12 flex flex-col items-center justify-center bg-white border-l border-[#f3f3f3]">
             <div className="relative group">
                <div className="absolute inset-0 bg-[#bdb2ff]/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000" />
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#f3f3f3] flex flex-col items-center justify-center shadow-inner border border-white">
                   <div className="text-4xl sm:text-6xl font-black text-[#1b0c53] tracking-tighter font-['Outfit']">{currentScore}</div>
                   <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#5f559a]/40 mt-1">Vitality Score</div>
                </div>
             </div>
             {storedScore !== undefined && storedScore !== currentScore && (
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-6 sm:mt-8 animate-pulse flex items-center gap-2">
                 <Sparkles className="h-3 w-3" />
                 Unsaved Manifestation
               </p>
             )}
          </div>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Entry Form */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-[#2C2A4A]/5 p-6 sm:p-12 space-y-10 sm:space-y-16 border border-white/40"
          >
            
            {/* Core Metrics */}
            <div className="space-y-10">
              <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-[0.3em] text-[#5f559a]/40 flex items-center gap-4">
                Metabolic Pulse
                <div className="flex-1 h-px bg-[#f3f3f3]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Sleep (Hours)</label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={form.sleep_hours}
                    onChange={onChange('sleep_hours')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-xl sm:text-2xl font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner font-['Outfit']"
                    placeholder="7.5"
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ActivityIcon className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Vigor (Minutes)</label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.exercise_minutes}
                    onChange={onChange('exercise_minutes')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-xl sm:text-2xl font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner font-['Outfit']"
                    placeholder="30"
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Osmosis (Litres)</label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.water_intake}
                    onChange={onChange('water_intake')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-xl sm:text-2xl font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner font-['Outfit']"
                    placeholder="3.0"
                  />
                </div>
              </div>
            </div>

            {/* Emotional Alignment */}
            <div className="space-y-10">
              <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-[0.3em] text-[#5f559a]/40 flex items-center gap-4">
                Emotional Alignment
                <div className="flex-1 h-px bg-[#f3f3f3]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Mood State</label>
                  </div>
                  <select
                    value={form.mood}
                    onChange={onChange('mood')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner appearance-none font-['Outfit']"
                  >
                    <option value="">Choose State</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="poor">Poor</option>
                    <option value="terrible">Terrible</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Energy (1-10)</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.energy_level}
                    onChange={onChange('energy_level')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-xl sm:text-2xl font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner font-['Outfit']"
                    placeholder="7"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ActivityIcon className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Stress (1-10)</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.stress_level}
                    onChange={onChange('stress_level')}
                    className="w-full h-16 sm:h-20 px-6 sm:px-8 bg-[#f3f3f3] border-2 border-transparent rounded-[1.5rem] sm:rounded-[2rem] text-xl sm:text-2xl font-black text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner font-['Outfit']"
                    placeholder="4"
                  />
                </div>
              </div>
            </div>

            {/* Narratives */}
            <div className="space-y-10">
              <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-[0.3em] text-[#5f559a]/40 flex items-center gap-4">
                Daily Narratives
                <div className="flex-1 h-px bg-[#f3f3f3]" />
              </h3>
              <div className="space-y-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-[#bdb2ff]" />
                    <label className="text-[10px] font-black text-[#1b0c53] uppercase tracking-widest">Deep Observations</label>
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={onChange('notes')}
                    className="w-full p-6 sm:p-10 bg-[#f3f3f3] border-2 border-transparent rounded-[2rem] sm:rounded-[3rem] text-lg sm:text-xl font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 focus:border-[#bdb2ff]/40 transition-all shadow-inner min-h-[200px] sm:min-h-[250px] resize-none leading-relaxed"
                    placeholder="How was your day? Anything to record in the sanctuary?"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto h-24 px-16 bg-[#1b0c53] hover:bg-black text-white rounded-[2rem] transition-all disabled:opacity-50 font-black text-xs uppercase tracking-[0.3em] shadow-3xl shadow-[#1b0c53]/40 active:scale-95"
              >
                {todayEntry ? (saving ? 'Synchronizing...' : 'Update Reflection') : (saving ? 'Synchronizing...' : 'Log Reflection')}
              </motion.button>

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
                    stress_level: '',
                    breakfast: '',
                    lunch: '',
                    dinner: ''
                  });
                }}
                className="w-full sm:w-auto px-12 h-24 text-[#5f559a] hover:bg-[#f3f3f3] rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all"
              >
                Clear Stream
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Community & Feed */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1b0c53] rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-10 shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#bdb2ff]/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
             <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center shadow-sm relative z-10 group-hover:rotate-6 transition-transform">
                <Leaf className="h-12 w-12 text-[#bdb2ff]" />
             </div>
             <div className="space-y-4 relative z-10">
                <h4 className="font-['Outfit'] text-2xl font-black text-white tracking-tighter">Sanctuary Insights</h4>
                <p className="text-base text-white/60 font-medium leading-relaxed italic">
                  Complete your daily calibration to unlock personalized wellness projections and behavior patterns.
                </p>
             </div>
             <div className="w-full h-px bg-white/10" />
             <div className="w-full flex justify-between items-center px-4 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Active</span>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}