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
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9] relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f559a] z-10" />
      </div>
    );
  }

  // Don't render SignIn if user is already signed in (prevents warning)
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9f9f9] p-4 sm:p-8 relative selection:bg-[#bdb2ff] selection:text-[#4b4185]">
      {/* Subtle background for Serene Sanctuary effect */}
      <div 
        className="absolute inset-0 z-[1] opacity-30 pointer-events-none mix-blend-multiply"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(189, 178, 255, 0.4), transparent 60%), radial-gradient(ellipse at bottom left, rgba(229, 222, 255, 0.5), transparent 60%)'
        }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 sm:mb-8 mt-8 sm:mt-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5f559a] mb-2 font-['Plus_Jakarta_Sans']">MindCare</h1>
          <p className="text-sm sm:text-base text-[#484550] font-medium tracking-wide">Sign in to your private sanctuary</p>
        </div>
        <div className="flex justify-center w-full shadow-2xl shadow-[#5f559a]/10 rounded-2xl overflow-hidden">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                card: "shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                primaryButton: "bg-[#5f559a] hover:bg-[#4b4185]"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}