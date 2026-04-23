'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserProfile as UserProfileComponent } from '@/components/user-profile';
import { dbHelpers, type HealthEntry, type UserProfile } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/loader/loading-skeleton';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadData();
    }
  }, [isLoaded, user]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      


      // 2. Load health entries
      const { data: entriesData, error: entriesError } = await dbHelpers.getUserHealthEntries(user.id);
      if (entriesError) {
        console.error('Error loading health entries:', entriesError);
        setEntries([]);
      } else {
        setEntries(entriesData || []);
      }

      // 3. Load user profile
      const { data: profileData, error: profileError } = await dbHelpers.getUserProfile(user.id);

      if (profileError) {
        console.error('Profile access error:', profileError);
        toast({
          title: 'Syncing Profile',
          description: 'Your profile is being synchronized. Please wait a moment...',
          variant: 'default'
        });
      }

      if (profileData) {
        console.log('Profile loaded successfully.');
        setUserProfile(profileData);
      } else {
        // If not found yet, wait 2 seconds and try one more time (webhook might be in flight)
        console.log('Profile not found yet, retrying in 2 seconds...');
        setTimeout(async () => {
          const { data: retryData } = await dbHelpers.getUserProfile(user.id);
          if (retryData) {
            setUserProfile(retryData);
          } else {
            toast({
              title: 'Completing Setup',
              description: 'Initial account setup is wrapping up. Please refresh the page in a moment.',
            });
          }
        }, 2500);
      }
    } catch (err: any) {
      console.error('Initialization exception:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  // Don't redirect here - let middleware handle it
  // This prevents the redirect loop issue
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 sm:pt-32">
      
      {/* Header */}
      <div className="bg-transparent mb-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
               <div className="w-1.5 h-12 sm:h-16 bg-[#bdb2ff] rounded-full hidden sm:block" />
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1b0c53] tracking-tighter font-['Plus_Jakarta_Sans'] leading-none">Self Profile</h1>
                <p className="text-base sm:text-xl text-[#5f559a]/60 font-medium mt-2 sm:mt-3 italic">Calibrating your essence within the sanctuary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connection Test Component */}
          {/* <SupabaseConnectionTest /> */}

          {loading ? (
            <div className="flex items-center justify-center py-12 w-full">
              <LoadingSkeleton />
            </div>
          ) : (
            <UserProfileComponent
              entries={entries}
              userProfile={userProfile}
              onProfileUpdate={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

