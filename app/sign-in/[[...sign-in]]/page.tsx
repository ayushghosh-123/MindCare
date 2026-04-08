'use client'
import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is already signed in
    if (isLoaded && user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D3D3FF]"></div>
      </div>
    );
  }

  // Don't render SignIn if user is already signed in (prevents warning)
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 mt-8 sm:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Health Diary</h1>
          <p className="text-sm sm:text-base text-slate-600">Sign in to track your wellness journey</p>
        </div>
        <div className="flex justify-center w-full">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
          />
        </div>
      </div>
    </div>
  );
}