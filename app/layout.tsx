import './globals.css';
import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { GlobalInitialization } from '@/components/webcom/GlobalInitialization';
import { MainNavbar } from '@/components/webcom/main-navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' });

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
        <body className={`${inter.variable} ${bricolage.variable} font-sans`} suppressHydrationWarning>
          <GlobalInitialization />
          <MainNavbar />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
