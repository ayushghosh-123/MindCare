
'use client';

import React from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function MindCareLanding() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleStart = () => {
    if (isSignedIn) {
      router.push('/diary');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-black selection:text-white pb-32">
      {/* Subtle Graph Paper Background */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* ── Navbar ── */}
      <nav className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white border-[3px] border-black h-14 rounded-full shadow-[4px_4px_0_#000] flex items-center justify-between px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-black flex items-center justify-center p-1.5 rounded-full">
               <svg viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-black text-black tracking-tight text-lg">MindCare</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-black text-black">
            <a href="#" className="hover:underline underline-offset-4 decoration-2">Solutions</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-2">Pricing</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-2">Company</a>
            <a href="#" className="hover:underline underline-offset-4 decoration-2">Support</a>
          </div>

          <button 
            className="bg-black text-white px-5 py-1.5 rounded-full text-xs font-black hover:translate-y-[1px] transition-all shadow-[2px_2px_0_#ccc]"
            onClick={() => router.push(isSignedIn ? '/diary' : '/sign-in')}
          >
            {isSignedIn ? 'Go to App' : 'Try for free'}
          </button>
        </div>
      </nav>

      <main className="relative pt-32 md:pt-40 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10 w-full">
        
        {/* Floating Doodle Accents */}
        <div className="absolute top-20 left-[10%] w-12 h-12 opacity-80 z-0 pointer-events-none animate-pulse">
           <svg viewBox="0 0 100 100" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
             <path d="M50 10 L50 30 M50 70 L50 90 M10 50 L30 50 M70 50 L90 50 M22 22 L36 36 M64 64 L78 78 M22 78 L36 64 M64 36 L78 22" />
           </svg>
        </div>
        <div className="absolute top-32 right-[12%] w-16 h-16 opacity-80 z-0 pointer-events-none transform rotate-12">
           <svg viewBox="0 0 100 100" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
             <path d="M20 50 C 40 10, 60 10, 70 40 C 90 30, 90 70, 70 80 C 60 100, 30 90, 20 70 C 0 60, 0 30, 20 50 Z" />
           </svg>
        </div>

        {/* Hand-drawn User Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 border-[3px] border-black px-4 py-2 bg-white rotate-[-2deg] shadow-[4px_4px_0_#000] rounded-full z-10 cursor-pointer hover:rotate-0 transition-transform"
        >
          <div className="flex -space-x-2">
            {[14, 15, 16].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-slate-100 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`} alt="User" />
              </div>
            ))}
          </div>
          <span className="text-sm font-black text-black">Over 1k happy users</span>
        </motion.div>

        {/* Typography-focused Headline */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold text-black leading-[1.0] tracking-tight relative z-10 max-w-5xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Regulate your mood<br className="hidden md:block"/> with our videos
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-lg sm:text-xl font-bold text-black/70 max-w-md sm:max-w-xl text-center z-10 leading-snug"
        >
          Our pre recorded sessions contain all the essentials<br className="hidden sm:block"/> to help you fix your mood in few sessions
        </motion.p>

        {/* Brutalist CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 z-20"
        >
           <button 
             onClick={handleStart} 
             className="bg-[#1A1A1A] text-white px-8 py-4 rounded-[14px] text-lg font-black flex items-center gap-2 hover:translate-y-[2px] transition-all shadow-[6px_6px_0_#000] hover:shadow-[3px_3px_0_#000] border-2 border-black"
           >
             Play Video <Zap className="w-5 h-5 fill-white stroke-black stroke-2" />
           </button>
           <button 
             className="bg-white text-black px-10 py-4 rounded-[14px] text-lg font-black border-[3px] border-black transition-all shadow-[6px_6px_0_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.1)]"
           >
             Learn More
           </button>
        </motion.div>

        {/* Massive Doodle Sticky Container */}
        {/* We use an absolute positioning context inside a relative wrapper to stack them naturally */}
        <div className="relative w-full max-w-5xl mx-auto h-[350px] sm:h-[450px] md:h-[550px] mt-16 md:mt-[100px] flex justify-center z-10">
          
          {/* Card 1: Left Blue Sun */}
          <motion.div 
            initial={{ y: 200, rotate: -25, opacity: 0 }}
            animate={{ y: 0, rotate: -8, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.3 }}
            className="absolute left-[0%] md:left-[5%] bottom-0 w-[240px] md:w-[320px] h-[350px] md:h-[480px] bg-[#38BDF8] rounded-t-[50px] border-[6px] md:border-[8px] border-black overflow-hidden shadow-[12px_12px_0_#000] z-10"
          >
            {/* Top Shine */}
            <div className="absolute top-3 left-6 right-6 h-4 bg-white/30 rounded-full" />
            
            {/* Confetti Details */}
            <div className="absolute top-[40px] left-[25px] w-3 h-8 bg-[#EF4444] border-[3px] border-black rounded-full rotate-45" />
            <div className="absolute top-[42px] right-[40px] w-4 h-4 bg-[#FACC15] border-[3px] border-black rounded-full" />
            <div className="absolute top-[100px] left-[50px] w-6 h-6 bg-[#9333EA] border-[3px] border-black rounded-full" />

            {/* Custom SVG Sun Sticker */}
            <svg viewBox="0 0 200 200" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-auto overflow-visible" fill="none">
              <path d="M100 0 L125 35 L170 25 L150 65 L190 90 L150 115 L170 155 L125 145 L100 180 L75 145 L30 155 L50 115 L10 90 L50 65 L30 25 L75 35 Z" fill="#FDE047" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
              {/* Smile Face */}
              <path d="M65 95 C75 115, 125 115, 135 95" stroke="#000" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="60" cy="100" rx="10" ry="6" fill="#F472B6" />
              <ellipse cx="140" cy="100" rx="10" ry="6" fill="#F472B6" />
              {/* Closed Eyes */}
              <path d="M 65 75 Q 75 65 85 75" stroke="#000" strokeWidth="6" strokeLinecap="round" />
              <path d="M 115 75 Q 125 65 135 75" stroke="#000" strokeWidth="6" strokeLinecap="round" />
            </svg>
            
            {/* Cloud overlap sticker at base */}
            <svg viewBox="0 0 300 100" className="absolute bottom-[-10px] left-[-20px] w-[120%] h-auto" fill="white">
              <path d="M20 80 Q40 40 70 50 Q100 20 150 30 Q200 10 250 40 Q280 60 270 90 Z" stroke="#000" strokeWidth="8" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* Card 3: Right Coral Flower (Rendered before center so center stacks on top) */}
          <motion.div 
            initial={{ y: 200, rotate: 20, opacity: 0 }}
            animate={{ y: 0, rotate: 10, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.4 }}
            className="absolute right-[0%] md:right-[5%] bottom-0 w-[240px] md:w-[320px] h-[350px] md:h-[480px] bg-[#FF7162] rounded-t-[50px] border-[6px] md:border-[8px] border-black overflow-hidden shadow-[12px_12px_0_#000] z-20"
          >
             <div className="absolute top-3 left-6 right-6 h-4 bg-white/30 rounded-full" />
             
             {/* Star Sparkle */}
             <svg viewBox="0 0 100 100" className="absolute top-10 right-10 w-20 h-20 rotate-12" fill="#0EA5E9">
               <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
             </svg>
             <div className="absolute top-[80px] left-[40px] w-5 h-5 bg-[#FDE047] border-[3px] border-black rounded-full" />

             {/* Cartoon Sunflower Sticker */}
             <svg viewBox="0 0 200 200" className="absolute bottom-[-20px] right-[-20px] w-[130%] h-auto overflow-visible" fill="none">
               <path d="M100 20 C130 -10, 150 10, 160 40 C190 30, 200 60, 180 80 C210 110, 190 140, 160 140 C170 170, 140 190, 110 170 C90 200, 60 190, 40 160 C10 170, -10 140, 10 110 C-20 80, 0 50, 30 60 C20 30, 50 0, 80 20 C90 -10, 120 -10, 100 20 Z" fill="#FDE047" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
               <circle cx="100" cy="100" r="50" fill="#4ADE80" stroke="#000" strokeWidth="8" />
               {/* Sly Eyes */}
               <ellipse cx="80" cy="85" rx="10" ry="16" fill="#fff" stroke="#000" strokeWidth="4" />
               <ellipse cx="120" cy="85" rx="10" ry="16" fill="#fff" stroke="#000" strokeWidth="4" />
               <circle cx="75" cy="85" r="4" fill="#000" />
               <circle cx="115" cy="85" r="4" fill="#000" />
               {/* Nose */}
               <circle cx="100" cy="108" r="6" fill="#EF4444" stroke="#000" strokeWidth="3" />
               {/* Smirk */}
               <path d="M85 125 C 95 130, 105 130, 115 120" stroke="#000" strokeWidth="4" strokeLinecap="round" />
               {/* Freckles/Cheeks */}
               <circle cx="70" cy="115" r="3" fill="#15803D" />
               <circle cx="130" cy="115" r="3" fill="#15803D" />
               <circle cx="60" cy="110" r="1.5" fill="#000" />
               <circle cx="140" cy="110" r="1.5" fill="#000" />
             </svg>
          </motion.div>

          {/* Card 2: Center Pink Peace Sign (Tallest & frontmost) */}
          <motion.div 
            initial={{ y: 250, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[270px] md:w-[350px] h-[380px] md:h-[550px] bg-[#F472B6] rounded-t-[50px] md:rounded-t-[70px] border-[6px] md:border-[8px] border-black shadow-[16px_16px_0_#000] z-30 flex flex-col items-center justify-end overflow-visible"
          >
            <div className="absolute top-3 left-6 right-6 h-4 bg-white/30 rounded-full" />
            
            {/* Background Hand-drawn Daisies */}
            <svg viewBox="0 0 100 100" className="absolute top-[20%] right-[-10px] w-20 h-20 md:w-24 md:h-24 rotate-[25deg]" fill="#A3E635">
              <path d="M50 0 A 20 20 0 0 1 70 20 A 20 20 0 0 1 100 50 A 20 20 0 0 1 70 80 A 20 20 0 0 1 50 100 A 20 20 0 0 1 30 80 A 20 20 0 0 1 0 50 A 20 20 0 0 1 30 20 A 20 20 0 0 1 50 0 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="15" fill="#FDE047" stroke="#000" strokeWidth="6" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute bottom-[40%] left-[-20px] w-16 h-16 md:w-20 md:h-20 -rotate-[15deg]" fill="#A3E635">
              <path d="M50 0 A 20 20 0 0 1 70 20 A 20 20 0 0 1 100 50 A 20 20 0 0 1 70 80 A 20 20 0 0 1 50 100 A 20 20 0 0 1 30 80 A 20 20 0 0 1 0 50 A 20 20 0 0 1 30 20 A 20 20 0 0 1 50 0 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="15" fill="#FDE047" stroke="#000" strokeWidth="6" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-[10%] left-[15%] w-12 h-12" fill="#FDE047">
              <path d="M50 5 L60 30 L95 50 L60 70 L50 95 L40 70 L5 50 L40 30 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
            </svg>

            {/* Huge Gloved Peace Hand Pattern */}
            <svg viewBox="0 0 200 250" className="w-[85%] h-auto mb-[60px] md:mb-[80px] overflow-visible" fill="white">
               {/* Wrist & Sleeve */}
               <path d="M75 190 L125 190 L125 260 L75 260 Z" fill="#0EA5E9" stroke="#000" strokeWidth="8" />
               {/* Cuff Line */}
               <path d="M60 190 L140 190" stroke="#000" strokeWidth="10" strokeLinecap="round"/>
               {/* Base Palm */}
               <rect x="50" y="100" width="100" height="90" rx="35" stroke="#000" strokeWidth="8" />
               {/* Back Fingers UP */}
               <rect x="58" y="10" width="35" height="110" rx="17.5" stroke="#000" strokeWidth="8" />
               <rect x="98" y="30" width="35" height="90" rx="17.5" stroke="#000" strokeWidth="8" />
               {/* Folded Pinky/Ring */}
               <rect x="135" y="120" width="40" height="30" rx="15" stroke="#000" strokeWidth="8" fill="white" transform="rotate(15 135 120)" />
               <rect x="125" y="150" width="40" height="30" rx="15" stroke="#000" strokeWidth="8" fill="white" transform="rotate(10 125 150)" />
               {/* Big Thumb Crossing Palm */}
               <rect x="25" y="125" width="85" height="35" rx="17.5" stroke="#000" strokeWidth="8" fill="white" transform="rotate(-30 25 125)" />
               
               {/* Glove Creases */}
               <path d="M75 160 L75 185" stroke="#000" strokeWidth="6" strokeLinecap="round" />
               <path d="M115 160 L115 185" stroke="#000" strokeWidth="6" strokeLinecap="round" />
            </svg>

            {/* IT'S OK - Sticker Ribbon overlapping the hand */}
            <div className="absolute bottom-8 bg-[#000] border-[4px] border-white px-6 py-2 transform rotate-[-4deg] shadow-[6px_6px_0_rgba(255,255,255,0.4)]">
               <span className="text-xl md:text-2xl font-black text-[#38BDF8] tracking-widest font-heading">IT'S OK</span>
            </div>
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}

