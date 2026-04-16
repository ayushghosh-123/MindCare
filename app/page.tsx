'use client';

import { useUser } from '@clerk/nextjs';
import { UnifiedDashboardToday } from '@/components/dashboard/unified-dashboard';
import { LoadingSkeleton } from '@/components/loader/loading-skeleton';
import { MindCareLanding } from '@/components/landing/MindCareLanding';

// --- Dashboard Component (Authenticated View) ---
const Dashboard = ({ user }: { user: any }) => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-4 md:mt-0">
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