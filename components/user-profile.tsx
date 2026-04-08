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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-[#D3D3FF]/30 text-[#8A8AFF] text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-600 font-medium">{profile.email || "No email provided"}</p>
                  {!profile.email && (
                    <Badge variant="destructive" className="w-fit text-[10px] py-0 px-2 animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Email Missing - AI Agent Disabled
                    </Badge>
                  )}
                </div>
                {healthMetrics && (
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {healthMetrics.streak} day streak
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
              className="w-full sm:w-auto"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#8A8AFF]" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || undefined }))}
                    placeholder="70"
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
        </CardContent>
      </Card>

      {/* Health Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#8A8AFF]" />
            Health Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a health goal..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <Button onClick={addGoal} size="sm">Add</Button>
              </div>
              <div className="space-y-2">
                {profile.healthGoals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#F0F0FF] rounded">
                    <span>{goal}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
        </CardContent>
      </Card>

      {/* Medical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medical Conditions</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medications</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Emergency Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#8A8AFF]" />
            Emergency & Medical Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Name and phone number"
                />
              </div>
              <div>
                <Label htmlFor="doctorInfo">Doctor Information</Label>
                <Input
                  id="doctorInfo"
                  value={profile.doctorInfo}
                  onChange={(e) => setProfile(prev => ({ ...prev, doctorInfo: e.target.value }))}
                  placeholder="Doctor name and contact"
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e) => setProfile(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional health information..."
                  rows={3}
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
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#D3D3FF] hover:bg-[#BDBDFE]"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
