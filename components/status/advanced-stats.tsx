'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Moon, Droplets, Leaf, Heart, Calendar, BarChart3, Target, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { HealthEntry } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { calculateDayStreak, calculateAggregateStats, calculateTrend } from '@/lib/health-calculators';

interface AdvancedStatsProps {
  entries: HealthEntry[];
}

export function AdvancedStats({ entries }: AdvancedStatsProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 bg-[#f3f3f3] rounded-full flex items-center justify-center mb-8">
          <BarChart3 className="h-12 w-12 text-[#5f559a]/20" />
        </div>
        <h3 className="text-3xl font-black text-[#1b0c53] tracking-tighter mb-2">No data to analyze yet</h3>
        <p className="text-lg text-[#5f559a]/60 font-medium italic">Start tracking your health to see insights</p>
      </div>
    );
  }

  const last30Days = entries.slice(0, 30);
  const last7Days = entries.slice(0, 7);
  
  // Calculate day streak
  const dayStreak = calculateDayStreak(entries);

  // Use aggregate stats for last 30 days
  const stats = calculateAggregateStats(last30Days);
  const { avgMood, avgSleep, avgExercise, avgWater, healthScore } = stats;

  // Calculate trends
  const moodScores = last30Days.map(entry => {
    const moodMap: Record<string, number> = {
      excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1
    };
    return moodMap[entry.mood as keyof typeof moodMap] || 3;
  });
  const moodTrend = calculateTrend(moodScores);

  const sleepHours = last30Days.map(entry => entry.sleep_hours);
  const sleepTrend = calculateTrend(sleepHours);

  const exerciseMinutes = last30Days.map(entry => entry.exercise_minutes);
  const exerciseTrend = calculateTrend(exerciseMinutes);

  const waterIntake = last30Days.map(entry => entry.water_intake);
  const waterTrend = calculateTrend(waterIntake);

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-slate-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-slate-600';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-10"
    >
      {/* Health Score Overview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-[#2C2A4A]/5 overflow-hidden border border-white/40"
      >
        <div className="p-8 sm:p-12 bg-[#f3f3f3] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#bdb2ff]/10 blur-[60px] sm:blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#1b0c53] tracking-tighter flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="w-12 h-12 sm:w-14 h-12 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-[#bdb2ff] fill-[#bdb2ff]/10" />
            </div>
            Vitality Projection
          </h2>
        </div>
        <div className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 w-full md:w-auto">
              <div className={cn(
                "font-['Outfit'] text-6xl sm:text-8xl font-black tracking-tighter p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-inner border border-white bg-white w-full sm:w-auto text-center",
                getHealthScoreColor(healthScore).split(' ')[0]
              )}>
                {healthScore}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-['Outfit'] text-3xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-3",
                  getHealthScoreColor(healthScore).split(' ')[0]
                )}>
                  {getHealthScoreLabel(healthScore)}
                </div>
                <p className="text-lg sm:text-xl text-[#5f559a]/60 font-medium italic">
                  Your behavioral patterns indicate a <span className="font-bold text-[#1b0c53]">{getHealthScoreLabel(healthScore).toLowerCase()}</span> state.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 sm:gap-4 w-full md:w-auto">
               <div className="flex-1 md:flex-none flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-[#f3f3f3] rounded-full justify-center md:justify-start">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#1b0c53]">30-Day Intel</span>
               </div>
               <div className="flex-1 md:flex-none flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-[#e5deff]/40 rounded-full justify-center md:justify-start">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#bdb2ff]" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#5f559a]">Context Aware</span>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: 'Avg Mood', value: avgMood.toFixed(1), trend: moodTrend, icon: <Sparkles />, color: 'bg-[#bdb2ff]/20' },
          { label: 'Avg Sleep', value: `${avgSleep.toFixed(1)}h`, trend: sleepTrend, icon: <Moon />, color: 'bg-[#e5deff]/40' },
          { label: 'Avg Exercise', value: `${Math.round(avgExercise)}m`, trend: exerciseTrend, icon: <Activity />, color: 'bg-[#f3f3f3]' },
          { label: 'Avg Water', value: `${avgWater.toFixed(1)}L`, trend: waterTrend, icon: <Droplets />, color: 'bg-[#f9f9f9]' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-[#2C2A4A]/5 border border-white/60 flex flex-col items-start gap-6 sm:gap-8 group"
          >
             <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-[#1b0c53] group-hover:scale-110 transition-transform duration-500", stat.color)}>
                {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24 })}
             </div>
             <div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 mb-1 sm:mb-2">{stat.label}</div>
                <div className="font-['Outfit'] text-3xl sm:text-4xl font-black text-[#1b0c53] mb-3 sm:mb-4">{stat.value}</div>
                <div className="flex items-center gap-2">
                   {getTrendIcon(stat.trend)}
                   <span className={cn("text-[10px] sm:text-xs font-bold", getTrendColor(stat.trend))}>
                     {Math.abs(stat.trend).toFixed(0)}% trend
                   </span>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-[3rem] shadow-2xl shadow-[#2C2A4A]/5 overflow-hidden border border-white/40"
      >
        <div className="p-8 sm:p-10 bg-[#f3f3f3]">
          <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#1b0c53] tracking-tighter flex items-center gap-3 sm:gap-4">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-[#5f559a]" />
            Epoch Summary
          </h2>
        </div>
        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            <div className="text-center p-8 sm:p-10 bg-[#f3f3f3] rounded-[2rem] sm:rounded-[2.5rem] shadow-inner border border-white">
               <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 mb-4 sm:mb-6">Cycles Tracked</div>
              <div className="font-['Outfit'] text-5xl sm:text-6xl font-black text-[#1b0c53] tracking-tighter">
                {last7Days.length}
              </div>
            </div>
            <div className="text-center p-8 sm:p-10 bg-[#f3f3f3] rounded-[2rem] sm:rounded-[2.5rem] shadow-inner border border-white">
               <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 mb-4 sm:mb-6">Total Vigor (min)</div>
              <div className="font-['Outfit'] text-5xl sm:text-6xl font-black text-[#1b0c53] tracking-tighter">
                {last7Days.reduce((sum, entry) => sum + entry.exercise_minutes, 0)}
              </div>
            </div>
            <div className="text-center p-8 sm:p-10 bg-[#f3f3f3] rounded-[2rem] sm:rounded-[2.5rem] shadow-inner border border-white">
               <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 mb-4 sm:mb-6">Total Osmosis</div>
              <div className="font-['Outfit'] text-5xl sm:text-6xl font-black text-[#1b0c53] tracking-tighter">
                {last7Days.reduce((sum, entry) => sum + entry.water_intake, 0).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
