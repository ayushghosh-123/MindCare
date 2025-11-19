'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserProfile as UserProfileComponent } from '@/components/user-profile';
// import { SupabaseConnectionTest } from '@/components/supabase-connection-test';
import { dbHelpers, type HealthEntry, type UserProfile } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
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
      dbHelpers.createUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        full_name: user.fullName || '',
        username: user.username || user.firstName || '',
        avatar_url: user.imageUrl
      }).catch(() => {
        // Silently ignore - user might already exist (409 is expected and handled in createUser)
        // This prevents the error from blocking the page load
      });
      
      // Load health entries
      const { data: entriesData, error: entriesError } = await dbHelpers.getUserHealthEntries(user.id);
      if (entriesError) {
        console.error('Error loading health entries:', entriesError);
        // Don't throw - continue loading profile even if entries fail
        setEntries([]);
      } else {
        setEntries(entriesData || []);
      }
      
      // Load user profile from database
      const { data: profileData, error: profileError } = await dbHelpers.getUserProfile(user.id);
      
      // If profile doesn't exist (PGRST116 = no rows returned), create a default one
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist - create a default one
        const defaultProfileData = {
          user_id: user.id,
          age: 0,
          height: 0,
          weight: 0,
          health_goals: [],
          medical_conditions: [],
          medications: [],
          emergency_contact: '',
          doctor_info: '',
          additional_notes: ''
        };
        
        const { data: newProfile, error: createError } = await dbHelpers.createUserProfile(defaultProfileData);
        
        if (createError) {
          console.error('Failed to create profile:', createError);
          toast({
            title: 'Warning',
            description: 'Profile created but some data may not be saved. Please try editing your profile.',
            variant: 'default'
          });
        } else if (newProfile) {
          setUserProfile(newProfile);
          toast({
            title: 'Profile Created',
            description: 'Your profile has been created. You can now edit it to add your information.',
            variant: 'default'
          });
        } else {
          // Profile creation succeeded but no data returned - reload to get it
          const { data: reloadedProfile, error: reloadError } = await dbHelpers.getUserProfile(user.id);
          if (reloadedProfile) {
            setUserProfile(reloadedProfile);
          } else if (reloadError) {
            console.error('Failed to reload profile after creation:', reloadError);
          }
        }
      } else if (profileError) {
        // Other error (not "not found")
        console.error('Profile load error:', profileError);
        toast({
          title: 'Error',
          description: 'Failed to load profile. Please try refreshing the page.',
          variant: 'error'
        });
      } else if (profileData) {
        // Profile exists, use it
        setUserProfile(profileData);
      }
    } catch (err: any) {
      console.error('Load error:', err);
      // Don't show error toast for 409 conflicts - they're handled gracefully
      const isConflictError = 
        err?.status === 409 || 
        err?.statusCode === 409 ||
        err?.code === '23505' ||
        err?.message?.includes('409') ||
        err?.message?.includes('Conflict') ||
        err?.message?.includes('duplicate');
      
      if (!isConflictError) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try refreshing the page.',
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                <p className="text-slate-600">Manage your personal health information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connection Test Component */}
          {/* <SupabaseConnectionTest /> */}
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your profile...</p>
              </div>
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

