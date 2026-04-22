'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Droplets, Activity, TrendingUp } from 'lucide-react';
import type { HealthEntry } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  entries: HealthEntry[];
}

export function StatsOverview({ entries }: StatsOverviewProps) {
  if (entries.length === 0) return null;

  const last7Days = entries.slice(0, 7);

  const avgSleep = last7Days.length > 0
    ? (last7Days.reduce((sum, e) => sum + Number(e.sleep_hours), 0) / last7Days.length).toFixed(1)
    : '0';

  const avgWater = last7Days.length > 0
    ? (last7Days.reduce((sum, e) => sum + Number(e.water_intake), 0) / last7Days.length).toFixed(1)
    : '0';

  const avgExercise = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + Number(e.exercise_minutes), 0) / last7Days.length)
    : 0;

  const totalEntries = entries.length;

  const stats = [
    {
      title: 'Avg Sleep',
      value: `${avgSleep}h`,
      icon: Moon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Avg Water',
      value: `${avgWater} glasses`,
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Avg Exercise',
      value: `${avgExercise} min`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Entries',
      value: totalEntries,
      icon: TrendingUp,
      color: 'text-[#5f559a]',
      bgColor: 'bg-[#e5deff]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isPrimary = stat.title === 'Total Entries';

        return (
          <div key={stat.title} className="relative p-10 bg-white rounded-[2rem] shadow-xl shadow-[#2C2A4A]/5 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f3f3f3] rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:scale-110" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40">
                {stat.title}
              </span>
              <div className={cn(
                "p-4 rounded-2xl shadow-sm transition-all group-hover:rotate-12",
                isPrimary ? "bg-[#1b0c53] text-white" : "bg-[#f3f3f3] text-[#5f559a]"
              )}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="text-4xl font-black text-[#1b0c53] tracking-tighter">
                {stat.value}
              </div>
              <p className="text-[10px] font-black text-[#5f559a]/30 mt-4 uppercase tracking-widest italic">
                {isPrimary ? 'Celestial Record' : 'Recent Cycle'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
