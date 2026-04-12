import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider, SignedIn } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { GlobalInitialization } from '@/components/webcom/GlobalInitialization';
import { MainNavbar } from '@/components/webcom/main-navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health Diary',
  description: 'Track your daily health and wellness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning>
          <GlobalInitialization />
          <SignedIn>
            <MainNavbar />
          </SignedIn>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
