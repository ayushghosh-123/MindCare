'use client';

import { LogIn, UserPlus, Activity, Smile, Calendar, TrendingUp, Leaf, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedButton, AnimatedSignInButton } from '@/components/webcom/animated-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

// --- Sub-components for Landing Page ---

export const Navbar = ({ user }: { user: any }) => (
  <nav className="border-b border-slate-200 bg-[#F8F8FF]/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
    <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-[#5f559a]" />
        <span className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">MindCare</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-slate-600 hidden md:inline">
            Welcome, {user.firstName || user.emailAddresses?.[0]?.emailAddress}
          </span>
          <div className="flex items-center gap-2">
            <Link href="/diary">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Diary</span>
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <Leaf className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">AI Chat</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-slate-600 hover:text-[#5f559a] px-2 sm:px-4">
              <LogIn className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Sign In</span>
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-[#5f559a] to-[#4b4185] hover:opacity-90 text-white shadow-lg shadow-[#5f559a]/30 px-3 sm:px-4 border-0">
              <UserPlus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Start for Free</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  </nav>
);

export const AwarenessCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <motion.div
    className="flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 h-full"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ type: "spring", stiffness: 100, damping: 10 }}
  >
    <div className="px-6 py-8 sm:p-10 flex flex-col h-full">
      <div className="grid items-start justify-start w-full grid-cols-1 text-left flex-grow">
        <div>
          <div className="inline-flex p-3 bg-[#F0F0FF] rounded-2xl mb-8 text-[#5f559a]">
            {icon}
          </div>
          <h2 className="text-xl font-medium tracking-tighter text-slate-700 lg:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export const HowCard = ({ step, icon, title, desc }: { step: string | number; icon: React.ReactNode; title: string; desc: string; }) => (
  <motion.div
    className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#e5deff]/30 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ type: "spring", stiffness: 80, damping: 10 }}
  >
    <div className="absolute -right-4 -top-8 text-9xl font-black text-[#e5deff]/10 select-none pointer-events-none">
      {step}
    </div>

    <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full bg-[#e5deff]/20 border-2 border-[#e5deff] text-[#5f559a] z-10 relative bg-white">
      {icon}
    </div>

    <div className="flex-grow pt-2 z-10">
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Step {step}: {title}</h3>
      <p className="text-slate-600 text-lg leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);




const BrainDoodle = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-24 h-24 sm:w-32 sm:h-32 text-slate-900" strokeLinecap="round" strokeLinejoin="round">
    <path d="M45 25 C30 25 20 40 25 55 C20 70 30 85 45 80 C60 85 75 75 75 60 C85 50 75 30 55 25" fill="#FCF8E8" />
    <path d="M45 25 C50 35 48 50 45 60" />
    <path d="M60 30 C58 45 65 55 60 70" />
    <path d="M35 45 C40 50 38 65 35 70" />
    <path d="M80 20 Q85 10 95 15 M85 30 Q95 25 100 35" strokeWidth="1.5" />
    <circle cx="85" cy="18" r="2" fill="black" />
    <circle cx="95" cy="25" r="2" fill="black" />
  </svg>
);

const SleepDoodle = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-24 h-24 sm:w-32 sm:h-32 text-slate-900" strokeLinecap="round" strokeLinejoin="round">
    <path d="M65 25 A 30 30 0 1 0 70 80 A 35 35 0 0 1 65 25 Z" fill="#E2E8F0" />
    <path d="M30 55 Q 40 65 50 55" /> 
    <path d="M55 40 L 65 40 L 55 30 L 65 30 M 70 25 L 75 25 L 70 20 L 75 20" strokeWidth="1.5" />
    <path d="M10 20 L 15 25 L 10 30 M 15 25 L 5 25" strokeWidth="1.5" />
    <path d="M20 80 L 23 85 L 20 90" strokeWidth="1.5" />
  </svg>
);

const FoodDoodle = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-24 h-24 sm:w-32 sm:h-32 text-slate-900" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 35 C 30 30 20 40 25 70 C 30 85 45 90 50 85 C 55 90 70 85 75 70 C 80 40 70 30 50 35 Z" fill="#FDEAE8" />
    <path d="M50 35 C 50 25 55 20 55 15 M 55 25 C 65 15 75 25 60 30 Z" />
    <path d="M40 60 L 40 65 M 60 60 L 60 65" />
    <path d="M45 75 Q 50 80 55 75" />
  </svg>
);

const MoveDoodle = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-24 h-24 sm:w-32 sm:h-32 text-slate-900" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="25" r="12" fill="#E5F0E8" />
    <path d="M45 37 L 40 65 M 55 37 L 60 65" />
    <path d="M40 65 Q 50 70 60 65" />
    <path d="M45 45 C 30 40 25 55 15 50 M 55 45 C 70 50 75 35 85 40" />
    <path d="M42 65 L 35 90 M 58 65 L 75 80 L 65 95" />
    <path d="M 10 30 L 25 35 M 5 70 L 20 75 M 85 80 L 95 75" strokeWidth="1.5" />
  </svg>
);

export const LandingPage = ({ user }: { user: any }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#F8F8FF] via-[#e5deff]/20 to-[#E6E6FF]">
    <Navbar user={user} />

    {/* Hero Section */}
    <section className="text-center px-6 pt-24 pb-32 sm:pt-32 sm:pb-48 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-96 w-96 bg-[#e5deff]/20 rounded-full blur-3xl z-0 transform translate-x-1/2 -translate-y-1/4 hidden lg:block"></div>

      <div className="relative z-10">
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          A Smarter Way to  <span className="text-[#5f559a]">Understand Your Mind</span>
        </motion.h1>
        <motion.p
          className="text-slate-700 max-w-5xl mx-auto mb-12 text-lg sm:text-2xl font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          MindCare helps you track your daily habits, emotions, and routines and turns them into clear, meaningful insights so you can understand why you feel the way you do.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link href="/sign-up">
            <AnimatedButton text="Start Tracking Today" className="w-full sm:w-auto" />
          </Link>
          <Link href="/sign-in">
            <AnimatedSignInButton text="Existing User?" className="w-full sm:w-auto" />
          </Link>
        </motion.div>

        <p className='p-5 text-slate-700 max-w-5xl mx-auto mb-12 text-lg sm:text-2xl font-light'>
          Takes less than a minute. No pressure, just awareness 
        </p>
      </div>
    </section>

    {/* Doodle Feature Grid - 2x2 */}
    <section className="py-32 px-6 bg-[#FCFBFA]">
      <div className="container mx-auto max-w-[64rem]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 auto-rows-fr">
          
          {/* Card 1: Understand Patterns */}
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#F7F4EB] min-h-[380px] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500 ease-out border border-[#EBE6DA]">
            <div className="max-w-[280px]">
              <h3 className="text-3xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Understand your patterns</h3>
              <p className="text-[#4A4843] text-lg leading-relaxed font-medium">Turning scattered thoughts and daily logs into gentle, meaningful insights.</p>
            </div>
            <div className="self-end origin-bottom-right group-hover:rotate-2 group-hover:scale-105 transition-all duration-500 ease-out mt-8">
              <BrainDoodle />
            </div>
          </div>

          {/* Card 2: Sleep Better */}
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#E8ECF1] min-h-[380px] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500 ease-out border border-[#DBE3EC]">
            <div className="self-start origin-top-left group-hover:-rotate-3 group-hover:-translate-y-2 transition-all duration-500 ease-out mb-8">
              <SleepDoodle />
            </div>
            <div className="max-w-[280px]">
              <h3 className="text-3xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Sleep better</h3>
              <p className="text-[#3F4852] text-lg leading-relaxed font-medium">Because rest matters. Discover how your mind truly recovers, day after day.</p>
            </div>
          </div>

          {/* Card 3: Eat & Feel Right */}
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#F3EBEA] min-h-[380px] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500 ease-out border border-[#EADBE3]">
            <div className="self-start origin-top-left group-hover:rotate-3 group-hover:scale-110 transition-all duration-500 ease-out mb-8">
              <FoodDoodle />
            </div>
            <div className="max-w-[280px]">
              <h3 className="text-3xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Eat & feel right</h3>
              <p className="text-[#4D3F3B] text-lg leading-relaxed font-medium">A gentle look at how what you consume shapes how you feel inside.</p>
            </div>
          </div>

          {/* Card 4: Move Your Mind */}
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#EAEFEC] min-h-[380px] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-500 ease-out border border-[#D5DFD8]">
            <div className="max-w-[280px]">
              <h3 className="text-3xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Move your mind</h3>
              <p className="text-[#3C4A42] text-lg leading-relaxed font-medium">Find the quiet connection between physical movement and mental clarity.</p>
            </div>
            <div className="self-end origin-bottom-right group-hover:-translate-y-2 group-hover:-rotate-3 transition-all duration-500 ease-out mt-8">
              <MoveDoodle />
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* Mental Health Awareness Section */}
    <section className="bg-[#F0F0FF]/70 py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold text-[#5f559a] uppercase tracking-widest mb-2">The Foundation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Why Tracking Your Wellness Works</h2>
          <p className="text-slate-600 max-w-4xl mx-auto text-base sm:text-lg">
            MindCare moves beyond simple notes. It turns reflection into actionable insight, helping you preempt stress and cultivate lasting well-being.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <AwarenessCard icon={<Leaf className="text-[#5f559a] h-6 w-6" />} title="Understand Yourself" desc="Uncover the hidden correlations between your habits, environment, and emotional state." />
          <AwarenessCard icon={<Smile className="text-[#5f559a] h-6 w-6" />} title="Increase Resilience" desc="Reduce the intensity of stress and anxiety by identifying and mitigating personal triggers." />
          <AwarenessCard icon={<Activity className="text-[#5f559a] h-6 w-6" />} title="Optimize Energy" desc="Track sleep, movement, and nutrition to find the specific routine that maximizes your vitality." />
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section className="py-24 px-6 bg-[#F8F8FF]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#5f559a] uppercase tracking-widest mb-2">Simple Steps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Your Journey to Balance in 3 Steps</h2>
        </div>
        <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto relative">
          {/* Vertical connecting line for desktop timeline */}
          <div className="hidden sm:block absolute left-[3.25rem] top-10 bottom-10 w-[2px] bg-[#e5deff]/50 z-0"></div>

          <HowCard step="1" icon={<Calendar className="h-8 w-8" />} title="Daily Check-In" desc="Log your mood, physical symptoms, meals, and thoughts in a simple, guided format." />
          <HowCard step="2" icon={<TrendingUp className="h-8 w-8" />} title="Review Insights" desc="Our dashboard visualizes your data, revealing trends and patterns you might have missed." />
          <HowCard step="3" icon={<CheckCircle className="h-8 w-8" />} title="Take Action" desc="Use your insights to make informed, positive adjustments to your lifestyle and routine." />
        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="py-24 px-6 bg-slate-100/80">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#5f559a] uppercase tracking-widest mb-2">Frequently Asked Questions</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Your questions, answered</h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-base sm:text-lg mt-3">
            Everything you need to know before starting your MindCare journey.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <AccordionTrigger className="px-6 py-5 text-left text-base sm:text-lg font-semibold text-slate-800">
              WHAT IS MINDCARE?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 pt-0 text-slate-600 text-xl">
              MindCare is a simple yet powerful platform that helps you understand your mental clarity. It lets you log how you feel, track what you do, and see how everything connects — all in one place.
Use it anytime to move beyond guesswork and start seeing what truly affects your mental health.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <AccordionTrigger className="px-6 py-5 text-left text-base sm:text-lg font-semibold text-slate-800">
              WHY USE MINDCARE?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 pt-0 text-slate-600 text-xl">
              Because awareness changes everything. MindCare helps you see patterns in your emotions, build resilience, and improve your daily focus.
              Stop guessing — start understanding what truly impacts your well-being.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <AccordionTrigger className="px-6 py-5 text-left text-base sm:text-lg font-semibold text-slate-800">
              WHAT YOU CAN TRACK?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 pt-0 text-slate-600 text-xl">
             Track what truly matters. Monitor your mental health , sleep , diet , activity  and daily thoughts - all in one place.Everything is connected, helping you understand your life better.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <AccordionTrigger className="px-6 py-5 text-left text-base sm:text-lg font-semibold text-slate-800">
               HOW IT WORKS?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 pt-0 text-slate-600 text-xl">
              Your journey to clarity in 3 simple steps. Log your day, discover patterns, and take meaningful action.
              Small insights lead to real improvements.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#5f559a]/10">
      <div className="container mx-auto text-center rounded-2xl p-6 sm:p-10 bg-[#F8F8FF] shadow-2xl max-w-4xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
          Ready to Find Your Balance?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Start a healthier journey today. It takes less than a minute to sign up and begin your first entry.
        </p>
        <Link href="/sign-up">
          <AnimatedButton text="Start Your Free Health Diary" className="w-full sm:w-auto text-lg px-8 py-5" />
        </Link>
      </div>
    </section>

    <footer className="bg-slate-800 py-8 border-t text-center text-slate-400 text-sm">
      <p className="mb-2">A modern tool for mental and physical well-being.</p>
      © {new Date().getFullYear()} Reflect & Connect. All rights reserved.
    </footer>
  </div>
);