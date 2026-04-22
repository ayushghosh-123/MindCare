'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit, Save, X, Heart, Target, Calendar, Activity, Moon, Leaf, Droplets, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { dbHelpers, type HealthEntry, type UserProfile as UserProfileType } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { calculateDayStreak, calculateAggregateStats } from '@/lib/health-calculators';

interface UserProfileProps {
  entries: HealthEntry[];
  userProfile?: UserProfileType | null;
  onProfileUpdate?: () => void;
}

interface UserHealthProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  healthGoals: string[];
  medicalConditions: string[];
  medications: string[];
  emergencyContact: string;
  doctorInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function UserProfile({ entries, userProfile: dbUserProfile, onProfileUpdate }: UserProfileProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize profile from database or Clerk user data
  const [profile, setProfile] = useState<UserHealthProfile>(() => {
    if (dbUserProfile) {
      return {
        id: dbUserProfile.id || user?.id || '',
        name: user?.fullName || user?.firstName || '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        age: dbUserProfile.age,
        height: dbUserProfile.height,
        weight: dbUserProfile.weight,
        healthGoals: dbUserProfile.health_goals || [],
        medicalConditions: dbUserProfile.medical_conditions || [],
        medications: dbUserProfile.medications || [],
        emergencyContact: dbUserProfile.emergency_contact || '',
        doctorInfo: dbUserProfile.doctor_info || '',
        notes: dbUserProfile.additional_notes || '',
        createdAt: dbUserProfile.created_at || new Date().toISOString(),
        updatedAt: dbUserProfile.updated_at || new Date().toISOString()
      };
    }
    return {
      id: user?.id || '',
      name: user?.fullName || user?.firstName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      age: undefined,
      height: undefined,
      weight: undefined,
      healthGoals: [],
      medicalConditions: [],
      medications: [],
      emergencyContact: '',
      doctorInfo: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Update profile when dbUserProfile changes
  useEffect(() => {
    if (dbUserProfile) {
      setProfile(prev => ({
        ...prev,
        age: dbUserProfile.age,
        height: dbUserProfile.height,
        weight: dbUserProfile.weight,
        healthGoals: dbUserProfile.health_goals || [],
        medicalConditions: dbUserProfile.medical_conditions || [],
        medications: dbUserProfile.medications || [],
        emergencyContact: dbUserProfile.emergency_contact || '',
        doctorInfo: dbUserProfile.doctor_info || '',
        notes: dbUserProfile.additional_notes || ''
      }));
    }
  }, [dbUserProfile]);

  const [newGoal, setNewGoal] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Calculate health metrics
  const calculateHealthMetrics = () => {
    if (entries.length === 0) return null;

    const last30Days = entries.slice(0, 30);
    const stats = calculateAggregateStats(last30Days);

    return {
      avgMood: stats.avgMood.toFixed(1),
      avgSleep: stats.avgSleep.toFixed(1),
      totalExercise: last30Days.reduce((sum, e) => sum + (e.exercise_minutes || 0), 0),
      avgWater: stats.avgWater.toFixed(1),
      totalEntries: entries.length,
      streak: calculateStreak()
    };
  };

  // Use the helper function for streak calculation
  const calculateStreak = () => calculateDayStreak(entries);

  const healthMetrics = calculateHealthMetrics();

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'error'
      });
      return;
    }

    try {
      setSaving(true);

      // Prepare profile data for database
      const profileData = {
        user_id: user.id,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        health_goals: profile.healthGoals,
        medical_conditions: profile.medicalConditions,
        medications: profile.medications,
        emergency_contact: profile.emergencyContact,
        doctor_info: profile.doctorInfo,
        additional_notes: profile.notes
      };

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await dbHelpers.getUserProfile(user.id);

      let result;
      if (existingProfile && !fetchError) {
        // Update existing profile
        result = await dbHelpers.updateUserProfile(user.id, profileData);
      } else {
        // Create new profile
        result = await dbHelpers.createUserProfile(profileData);
      }

      if (result.error) {
        throw result.error;
      }

      // Update local state immediately with saved data
      if (result.data) {
        // The onProfileUpdate callback will reload from database, but we can also update locally
        // This ensures the UI updates immediately
      }

      toast({
        title: 'Success',
        description: 'Profile saved successfully.',
        variant: 'default'
      });

      setIsEditing(false);

      // Refresh profile data from database to ensure consistency
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
    } catch (err: unknown) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setProfile(prev => ({
        ...prev,
        healthGoals: [...prev.healthGoals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setProfile(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-[#5f559a]/10 border border-white/60 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#e5deff]/40 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="mb-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white shadow-lg">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-[#e5deff]/30 text-[#5f559a] text-xl font-['Plus_Jakarta_Sans']">
                  <User className="h-10 w-10 sm:h-12 sm:w-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">{profile.name}</h2>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-slate-600 font-medium text-sm sm:text-base">{profile.email || "No email provided"}</p>
                  {!profile.email && (
                    <Badge variant="destructive" className="mx-auto sm:mx-0 w-fit text-[10px] py-0 px-2 animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Email Missing - AI Agent Disabled
                    </Badge>
                  )}
                </div>
                {healthMetrics && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {healthMetrics.streak} day streak
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      {healthMetrics.totalEntries} entries
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className={`w-full sm:w-auto rounded-full px-6 shadow-md font-['Plus_Jakarta_Sans'] font-bold ${isEditing ? 'bg-[#5f559a] hover:bg-[#4b4185] text-white' : 'text-[#5f559a] bg-white border-[#e5deff] hover:bg-[#e5deff]/50'}`}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Context'}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Sanctuary
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Personal Information */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-[#5f559a]/5 border border-white/60 relative overflow-hidden">
        <div className="mb-6">
          <h3 className="flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-[#1a1c1c]">
            <div className="p-2 rounded-full bg-[#bdb2ff]/20 text-[#5f559a]"><User className="h-5 w-5" /></div>
            Physical Context
          </h3>
        </div>
        <div>
          {isEditing ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="age" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Temporal Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                    placeholder="25"
                    className="h-16 px-6 bg-[#f3f3f3] border-none rounded-3xl text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="height" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Stature (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                    placeholder="170"
                    className="h-16 px-6 bg-[#f3f3f3] border-none rounded-3xl text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="weight" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Mass (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || undefined }))}
                    placeholder="70"
                    className="h-16 px-6 bg-[#f3f3f3] border-none rounded-3xl text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Age</Label>
                <div className="text-lg">{profile.age ? `${profile.age} years` : 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Height</Label>
                <div className="text-lg">{profile.height ? `${profile.height} cm` : 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Weight</Label>
                <div className="text-lg">{profile.weight ? `${profile.weight} kg` : 'Not specified'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Goals */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-[#5f559a]/5 border border-white/60 relative overflow-hidden">
        <div className="mb-6">
          <h3 className="flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-[#1a1c1c]">
            <div className="p-2 rounded-full bg-[#bdb2ff]/20 text-[#5f559a]"><Target className="h-5 w-5" /></div>
            Wellness Objectives
          </h3>
        </div>
        <div>
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Define a new objective..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  className="h-14 sm:h-16 px-6 bg-[#f3f3f3] border-none rounded-2xl sm:rounded-3xl text-base sm:text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                />
                <Button onClick={addGoal} className="h-14 sm:h-16 px-10 bg-[#1b0c53] text-white rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {profile.healthGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-6 pr-1 sm:pr-2 py-1 sm:py-2 bg-[#f3f3f3] rounded-full group">
                    <span className="text-xs sm:text-sm font-bold text-[#1b0c53]">{goal}</span>
                    <button
                      onClick={() => removeGoal(index)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5f559a] hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.healthGoals.length > 0 ? (
                profile.healthGoals.map((goal, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {goal}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500">No health goals set yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Medical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-xl shadow-[#5f559a]/5 border border-white/60 relative overflow-hidden">
          <div className="mb-6">
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#1a1c1c]">Medical History</h3>
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition..."
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                  />
                  <Button onClick={addCondition} size="sm">Add</Button>
                </div>
                <div className="space-y-2">
                  {profile.medicalConditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[#F0F0FF] rounded">
                      <span>{condition}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.medicalConditions.length > 0 ? (
                  profile.medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-500">No medical conditions recorded</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-xl shadow-[#5f559a]/5 border border-white/60 relative overflow-hidden">
          <div className="mb-6">
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#1a1c1c]">Medications</h3>
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add medication..."
                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Button onClick={addMedication} size="sm">Add</Button>
                </div>
                <div className="space-y-2">
                  {profile.medications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[#F0F0FF] rounded">
                      <span>{medication}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.medications.length > 0 ? (
                  profile.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {medication}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-500">No medications recorded</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Information */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-[#5f559a]/5 border border-white/60 relative overflow-hidden">
        <div className="mb-6">
          <h3 className="flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-[#1a1c1c]">
            <div className="p-2 rounded-full bg-[#bdb2ff]/20 text-[#5f559a]"><Heart className="h-5 w-5" /></div>
            Emergency Protocol
          </h3>
        </div>
        <div>
          {isEditing ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="emergencyContact" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Primary Kin Transmission</Label>
                <Input
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Name and celestial address"
                  className="h-16 px-6 bg-[#f3f3f3] border-none rounded-3xl text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="doctorInfo" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Healer Reference</Label>
                <Input
                  id="doctorInfo"
                  value={profile.doctorInfo}
                  onChange={(e) => setProfile(prev => ({ ...prev, doctorInfo: e.target.value }))}
                  placeholder="Physician or guide contact"
                  className="h-16 px-6 bg-[#f3f3f3] border-none rounded-3xl text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/50 ml-4">Subliminal Context</Label>
                <Textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e) => setProfile(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional observations for the sanctuary..."
                  rows={4}
                  className="px-6 py-6 bg-[#f3f3f3] border-none rounded-[2.5rem] text-lg font-bold text-[#1b0c53] focus:ring-4 focus:ring-[#bdb2ff]/20 transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                <div className="text-lg">{profile.emergencyContact || 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Doctor Information</Label>
                <div className="text-lg">{profile.doctorInfo || 'Not specified'}</div>
              </div>
              {profile.notes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Additional Notes</Label>
                  <div className="text-lg">{profile.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 justify-end items-center sticky bottom-6 bg-white/70 backdrop-blur-md p-4 rounded-full border border-white shadow-xl z-10 w-max ml-auto">
          <Button
            variant="ghost"
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="rounded-full px-6 font-semibold"
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#5f559a] text-white hover:bg-[#4b4185] rounded-full px-8 shadow-lg font-bold"
            disabled={saving}
          >
            {saving ? 'Synchronizing...' : 'Save Sanctuary'}
          </Button>
        </div>
      )}
    </div>
  );
}
