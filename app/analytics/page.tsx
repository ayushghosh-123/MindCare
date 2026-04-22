'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AdvancedStats } from '@/components/status/advanced-stats';
import { dbHelpers, type HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { LoadingSkeleton } from '@/components/loader/loading-skeleton';

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadEntries();
    }
  }, [isLoaded, user]);

  const loadEntries = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserHealthEntries(user.id);
      if (error) throw error;
      setEntries(data || []);
    } catch (_err) {
      toast({
        title: 'Error',
        description: 'Failed to load health entries.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter'] pt-32">
      
      {/* Header */}
      <div className="bg-transparent mb-6 sm:mb-12">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
               <div className="w-1.5 h-12 sm:h-16 bg-[#bdb2ff] rounded-full hidden md:block" />
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1b0c53] tracking-tighter font-['Plus_Jakarta_Sans'] leading-none">Vital Intelligence</h1>
                <p className="text-lg sm:text-xl text-[#5f559a]/60 font-medium mt-2 sm:mt-3 italic">Analyzing the deep patterns of your well-being.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 w-full">
              <LoadingSkeleton />
            </div>
          ) : (
            <AdvancedStats entries={entries} />
          )}
        </div>
      </div>
    </div>
  );
}
