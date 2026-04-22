'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { UnifiedDashboardToday } from '@/components/dashboard/unified-dashboard';
import { LoadingSkeleton } from '@/components/loader/loading-skeleton';
import { MindCareLanding } from '@/components/landing/MindCareLanding';

// --- Dashboard Component (Authenticated View) ---
const Dashboard = ({ user }: { user: any }) => (
  <div className="min-h-screen bg-white pb-32">
    <main className="container mx-auto px-6 pt-32 pb-12">
      <UnifiedDashboardToday userId={user?.id || ''} />
    </main>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <MindCareLanding />;
}