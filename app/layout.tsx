import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { GlobalInitialization } from '@/components/webcom/GlobalInitialization';
import { MainNavbar } from '@/components/webcom/main-navbar';

export const metadata: Metadata = {
  title: 'MindCare | AI Mental Wellness',
  description: 'AI-powered health and wellness tracking that finally understands you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans" suppressHydrationWarning>
          <GlobalInitialization />
          <MainNavbar />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
