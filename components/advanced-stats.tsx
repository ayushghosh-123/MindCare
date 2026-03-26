'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Moon, Droplets, Brain, Heart, Calendar, BarChart3, Target, Flame} from 'lucide-react';
import type { HealthEntry } from '@/lib/supabase';
import { calculateDayStreak, calculateAggregateStats, calculateTrend } from '@/lib/health-calculators';

interface AdvancedStatsProps {
  entries: HealthEntry[];
}

export function AdvancedStats({ entries }: AdvancedStatsProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg mb-2">No data to analyze yet</p>
          <p className="text-slate-400 text-sm">Start tracking your health to see insights</p>
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600" />
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore).split(' ')[0]}`}>
                {healthScore}
              </div>
              <div>
                <div className={`text-lg font-semibold ${getHealthScoreColor(healthScore).split(' ')[0]}`}>
                  {getHealthScoreLabel(healthScore)}
                </div>
                <div className="text-sm text-slate-600">
                  Based on mood, sleep, exercise, and nutrition
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <div className="text-2xl font-bold text-slate-800">{entries.length}</div>
                <div className="text-sm text-slate-600">Total Entries</div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 justify-end">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-600">{dayStreak}</div>
                </div>
                <div className="text-sm text-slate-600">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mood Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgMood.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(moodTrend)}
                <span className={`text-sm ${getTrendColor(moodTrend)}`}>
                  {moodTrend > 0 ? '+' : ''}{moodTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Average over {last30Days.length} days
            </div>
          </CardContent>
        </Card>

        {/* Sleep Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgSleep.toFixed(1)}h
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(sleepTrend)}
                <span className={`text-sm ${getTrendColor(sleepTrend)}`}>
                  {sleepTrend > 0 ? '+' : ''}{sleepTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {avgSleep >= 7 ? 'Good sleep duration' : 'Consider more sleep'}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {Math.round(avgExercise)}m
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(exerciseTrend)}
                <span className={`text-sm ${getTrendColor(exerciseTrend)}`}>
                  {exerciseTrend > 0 ? '+' : ''}{exerciseTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Daily average
            </div>
          </CardContent>
        </Card>

        {/* Water Intake Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgWater.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(waterTrend)}
                <span className={`text-sm ${getTrendColor(waterTrend)}`}>
                  {waterTrend > 0 ? '+' : ''}{waterTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Glasses per day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-600" />
            This Week&apos;s Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.length}
              </div>
              <div className="text-sm text-slate-600">Days Tracked</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.reduce((sum, entry) => sum + entry.exercise_minutes, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Exercise (min)</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.reduce((sum, entry) => sum + entry.water_intake, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Water (glasses)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
    </div>
  );
}
