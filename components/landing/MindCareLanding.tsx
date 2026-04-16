
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
          
          {/* Card 1: Left - Sleep */}
          <motion.div 
            initial={{ y: 200, rotate: -25, opacity: 0 }}
            animate={{ y: 0, rotate: -6, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.3 }}
            className="absolute left-[0%] md:left-[5%] bottom-0 w-[240px] md:w-[320px] h-[350px] md:h-[480px] bg-[#E0E7FF] rounded-t-[50px] border-[6px] md:border-[8px] border-black overflow-hidden shadow-[12px_12px_0_#000] z-10"
          >
            {/* Top Shine */}
            <div className="absolute top-3 left-6 right-6 h-4 bg-white/40 rounded-full" />
            
            {/* Soft Floating Wrapper */}
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="w-full h-full relative">
              {/* Moon & Stars Details */}
              <div className="absolute top-[40px] left-[40px] w-4 h-4 bg-[#FEF08A] border-[3px] border-black rounded-sm rotate-45" />
              <div className="absolute top-[60px] right-[50px] w-6 h-6 bg-[#FEF08A] border-[3px] border-black rounded-sm rotate-[12deg]" />
              <div className="absolute top-[140px] left-[30px] w-3 h-3 bg-[#FEF08A] border-[3px] border-black rounded-full" />
              <div className="absolute top-[100px] right-[20px] w-5 h-5 bg-white border-[3px] border-black rounded-full" />
              
              {/* Custom SVG Sleep Character */}
              <svg viewBox="0 0 200 200" className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] h-auto overflow-visible" fill="none">
                 {/* Face Base */}
                 <circle cx="100" cy="100" r="70" fill="#FFF" stroke="#000" strokeWidth="8" />
                 
                 {/* Closed Eyes */}
                 <path d="M 60 100 Q 75 115 90 100" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                 <path d="M 110 100 Q 125 115 140 100" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                 
                 {/* Gentle Smile */}
                 <path d="M 90 125 C 95 130, 105 130, 110 125" stroke="#000" strokeWidth="5" strokeLinecap="round" />
                 
                 {/* Rosy Cheeks */}
                 <ellipse cx="50" cy="115" rx="8" ry="5" fill="#FBCFE8" />
                 <ellipse cx="150" cy="115" rx="8" ry="5" fill="#FBCFE8" />

                 {/* Zzz marks */}
                 <path d="M140 50 L160 50 L140 70 L160 70" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M165 20 L180 20 L165 35 L180 35" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                 {/* Small Moon */}
                 <path d="M 30 50 A 15 15 0 1 0 50 20 A 10 10 0 1 1 30 50 Z" fill="#FDE047" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Card 3: Right - Physical Activity (Rendered before center so center stacks on top) */}
          <motion.div 
            initial={{ y: 200, rotate: 20, opacity: 0 }}
            animate={{ y: 0, rotate: 8, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.4 }}
            className="absolute right-[0%] md:right-[5%] bottom-0 w-[240px] md:w-[320px] h-[350px] md:h-[480px] bg-[#FED7AA] rounded-t-[50px] border-[6px] md:border-[8px] border-black overflow-hidden shadow-[12px_12px_0_#000] z-20"
          >
             <div className="absolute top-3 left-6 right-6 h-4 bg-white/30 rounded-full" />
             
             <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-full h-full relative">
               {/* Motion Lines */}
               <svg viewBox="0 0 100 100" className="absolute top-10 right-10 w-20 h-20 rotate-12" fill="none">
                 <path d="M20 20 L40 30 M20 40 L50 40 M20 60 L40 50" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               <div className="absolute top-[80px] left-[50px] w-4 h-4 bg-white border-[3px] border-black rounded-full" />
               <div className="absolute top-[130px] right-[40px] w-3 h-3 bg-[#F97316] border-[3px] border-black rounded-full" />

               {/* Cartoon Running Blob */}
               <svg viewBox="0 0 200 200" className="absolute bottom-16 right-[-10px] w-[90%] h-auto overflow-visible" fill="none">
                  {/* Arms (Thick strokes placed behind body) */}
                  <path d="M120 100 C 140 80, 160 70, 170 40" stroke="#000" strokeWidth="12" strokeLinecap="round" />
                  <path d="M80 110 C 50 120, 20 120, 10 90" stroke="#000" strokeWidth="12" strokeLinecap="round" />
                  
                  {/* Legs (Thick strokes placed behind body) */}
                  <path d="M90 150 C 70 170, 40 170, 20 190" stroke="#000" strokeWidth="12" strokeLinecap="round" />
                  <path d="M120 140 C 140 160, 150 190, 140 210" stroke="#000" strokeWidth="12" strokeLinecap="round" />

                  {/* Body Blob */}
                  <path d="M100 80 C 130 80, 140 130, 110 160 C 80 180, 60 130, 70 90 C 75 70, 90 80, 100 80 Z" fill="#FDBA74" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
                  
                  {/* Head */}
                  <circle cx="120" cy="50" r="30" fill="#FFF" stroke="#000" strokeWidth="8" />
                  
                  {/* Face */}
                  <circle cx="115" cy="45" r="4" fill="#000" />
                  <circle cx="135" cy="45" r="4" fill="#000" />
                  {/* Happy open mouth */}
                  <path d="M 115 55 C 120 70, 135 70, 140 55 Z" fill="#EF4444" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
                  
                  {/* Sweat drop */}
                  <path d="M 160 20 C 170 30, 165 45, 155 40 C 145 35, 155 15, 160 20 Z" fill="#60A5FA" stroke="#000" strokeWidth="3" />
               </svg>
             </motion.div>
          </motion.div>

          {/* Card 2: Center - Nutrition (Tallest) */}
          <motion.div 
            initial={{ y: 250, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[270px] md:w-[350px] h-[380px] md:h-[550px] bg-[#D9F99D] rounded-t-[50px] md:rounded-t-[70px] border-[6px] md:border-[8px] border-black shadow-[16px_16px_0_#000] z-30 flex flex-col items-center justify-end overflow-visible"
          >
            <div className="absolute top-3 left-6 right-6 h-4 bg-white/30 rounded-full" />
            
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="w-full h-full relative z-10">
               {/* Background Mini Leaves */}
               <svg viewBox="0 0 100 100" className="absolute top-[20%] right-[5%] w-16 h-16 rotate-[25deg]" fill="#4ADE80">
                 <path d="M50 0 C 70 20, 80 40, 50 100 C 20 40, 30 20, 50 0 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
               </svg>
               <svg viewBox="0 0 100 100" className="absolute bottom-[40%] left-[5%] w-12 h-12 -rotate-[15deg]" fill="#4ADE80">
                 <path d="M50 0 C 70 20, 80 40, 50 100 C 20 40, 30 20, 50 0 Z" stroke="#000" strokeWidth="6" strokeLinejoin="round"/>
               </svg>
               <div className="absolute top-[15%] left-[15%] w-4 h-4 bg-white border-[3px] border-black rounded-full" />

               {/* Huge Apple Doodle */}
               <svg viewBox="0 0 200 200" className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[85%] h-auto overflow-visible" fill="white">
                  {/* Stem */}
                  <path d="M 100 70 C 90 40, 95 20, 110 30" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" />
                  {/* Leaf */}
                  <path d="M 110 35 C 140 10, 170 30, 140 60 C 120 50, 110 40, 110 35 Z" fill="#4ADE80" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
                  {/* Apple Body */}
                  <path d="M 100 75 C 140 50, 190 80, 180 140 C 170 180, 110 190, 100 175 C 90 190, 30 180, 20 140 C 10 80, 60 50, 100 75 Z" fill="#FECACA" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
                  
                  {/* Happy Face */}
                  <circle cx="70" cy="130" r="6" fill="#000" />
                  <circle cx="130" cy="130" r="6" fill="#000" />
                  <ellipse cx="50" cy="140" rx="8" ry="4" fill="#F87171" />
                  <ellipse cx="150" cy="140" rx="8" ry="4" fill="#F87171" />
                  <path d="M 90 140 C 90 155, 110 155, 110 140 Z" fill="#EF4444" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
               </svg>
            </motion.div>
            
          </motion.div>
        </div>
      </main>

      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <CTASection handleStart={handleStart} />
      <Footer />
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Find Clarity",
      desc: "Untangle your thoughts with guided video sessions.",
      color: "bg-[#E0E7FF]",
      doodle: (
        <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mb-4 overflow-visible">
          <path d="M 30 50 C 10 50, 10 30, 30 30 C 35 15, 60 15, 70 30 C 90 30, 90 50, 70 50 C 70 70, 30 70, 30 50 Z" stroke="#000" strokeWidth="5" strokeLinejoin="round" fill="#E0E7FF"/>
          <path d="M 40 40 L 60 40 M 45 50 L 55 50" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: "Build Resilience",
      desc: "Develop long-term coping mechanisms, step-by-step.",
      color: "bg-[#FED7AA]",
      doodle: (
        <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mb-4 overflow-visible">
          <path d="M 50 15 L 80 25 L 80 50 C 80 75, 50 90, 50 90 C 50 90, 20 75, 20 50 L 20 25 Z" stroke="#000" strokeWidth="5" strokeLinejoin="round" fill="#FED7AA"/>
          <path d="M 50 15 L 50 90 M 20 35 L 80 35" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: "Deepen Understanding",
      desc: "Track emotional patterns without the clinical dashboard feel.",
      color: "bg-[#D9F99D]",
      doodle: (
        <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mb-4 overflow-visible">
          <path d="M 20 50 C 20 50, 40 30, 50 30 C 60 30, 80 50, 80 50 C 80 50, 60 70, 50 70 C 40 70, 20 50, 20 50 Z" stroke="#000" strokeWidth="5" strokeLinejoin="round" fill="#D9F99D"/>
          <circle cx="50" cy="50" r="10" stroke="#000" strokeWidth="5" fill="#FFF"/>
        </svg>
      )
    }
  ];

  return (
    <section className="relative py-32 px-6 max-w-7xl mx-auto z-10 w-full mt-20">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
          Not a dashboard.<br/>A companion.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.15 }}
            className={`group relative bg-white border-[4px] border-black rounded-[32px] p-8 md:p-10 shadow-[8px_8px_0_#000] hover:shadow-[4px_4px_0_#000] hover:translate-y-[4px] hover:translate-x-[4px] transition-all cursor-crosshair overflow-hidden`}
          >
            {/* Background Blob */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-20 ${f.color}`} />
            
            <div className="relative z-10 flex flex-col items-start text-left">
              <div className="p-3 bg-slate-50 border-[3px] border-black rounded-2xl mb-6 shadow-[3px_3px_0_#000] group-hover:-rotate-6 transition-transform">
                {f.doodle}
              </div>
              <h3 className="text-2xl font-black text-black mb-3">{f.title}</h3>
              <p className="text-black/80 font-bold text-lg leading-snug">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Hit Play.",
      desc: "Choose a session based on how you feel right now. No overthinking.",
      color: "bg-[#E0E7FF]"
    },
    {
      num: "02",
      title: "Breathe.",
      desc: "Follow the guided video. Let the visuals ground your mind.",
      color: "bg-[#FED7AA]"
    },
    {
      num: "03",
      title: "Reflect.",
      desc: "Jot down a few thoughts. Or don't. Progress happens naturally.",
      color: "bg-[#D9F99D]"
    }
  ];

  return (
    <section className="relative py-28 px-6 w-full bg-[#FAFAFA] border-y-[4px] border-black overflow-hidden">
      {/* Background doodles */}
      <div className="absolute top-20 left-[10%] opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 rotate-12">
          <path d="M10 50 Q 30 10, 50 50 T 90 50" stroke="#000" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto z-10 relative">
        <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tight text-center mb-24" style={{ fontFamily: 'var(--font-heading)' }}>
          How it works
        </h2>

        <div className="relative pb-10">
          {/* Vertical Line */}
          <div className="absolute left-[26px] md:left-1/2 top-0 bottom-0 w-[6px] bg-black -translate-x-1/2 rounded-full" />
          
          <div className="space-y-16 md:space-y-24 pt-4">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col md:flex-row items-start ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8 md:gap-16`}
              >
                {/* Center Node */}
                <div className="absolute left-[26px] md:left-1/2 top-6 w-14 h-14 -translate-x-1/2 -translate-y-1/2 bg-white border-[5px] border-black rounded-full z-10 flex items-center justify-center shadow-[4px_4px_0_#000]">
                  <div className={`w-4 h-4 rounded-full ${step.color} border-[3px] border-black`} />
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16 md:text-right'}`}>
                   <div className={`${step.color} border-[4px] border-black p-8 md:p-10 rounded-[32px] shadow-[8px_8px_0_#000] rotate-[-1deg] hover:rotate-[1deg] transition-transform text-left ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                     <span className="inline-block px-4 py-1.5 bg-white border-[3px] border-black rounded-full text-sm font-black mb-6 shadow-[3px_3px_0_#000]">Step {step.num}</span>
                     <h3 className="text-3xl lg:text-4xl font-black text-black mb-3">{step.title}</h3>
                     <p className="text-black/80 font-bold text-lg md:text-xl leading-snug">{step.desc}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="relative py-40 px-6 max-w-5xl mx-auto z-10 w-full text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-[2rem] md:text-[3.5rem] lg:text-[4.2rem] font-bold text-black leading-[1.1]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        We believe that feeling <span className="bg-[#E0E7FF] px-2 md:px-4 py-1 border-[4px] border-black rounded-[14px] md:rounded-[20px] shadow-[6px_6px_0_#000] inline-block -rotate-2 mx-1 whitespace-nowrap">calm</span><br className="hidden md:block" /> doesn't require a 10-step routine.<br /> It just requires <span className="bg-[#D9F99D] px-2 md:px-4 py-1 border-[4px] border-black rounded-[14px] md:rounded-[20px] shadow-[6px_6px_0_#000] inline-block rotate-1 mx-1 mt-3 md:mt-0 whitespace-nowrap">understanding.</span>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-20 text-center"
      >
        <div className="w-16 h-16 mx-auto bg-white border-[4px] border-black rounded-full flex items-center justify-center animate-bounce shadow-[6px_6px_0_#000]">
          <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </motion.div>
    </section>
  );
}

function CTASection({ handleStart }: { handleStart: () => void }) {
  return (
    <section className="relative py-20 px-6 max-w-5xl mx-auto z-10 w-full text-center mb-10">
      <div className="bg-[#FED7AA] border-[5px] border-black py-16 px-6 md:p-24 rounded-[40px] shadow-[16px_16px_0_#000] relative overflow-hidden">
        {/* Wavy background lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none object-cover">
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,20 Q100,-20 200,20 T400,20" fill="none" stroke="#000" strokeWidth="8" />
            <path d="M0,80 Q100,40 200,80 T400,80" fill="none" stroke="#000" strokeWidth="8" />
          </svg>
        </div>

        <h2 className="text-[3rem] md:text-[4.5rem] font-bold text-black tracking-tight relative z-10 mb-6 leading-[1.0]" style={{ fontFamily: 'var(--font-heading)' }}>
          Ready to feel better?
        </h2>
        <p className="text-xl md:text-2xl font-bold text-black/80 relative z-10 max-w-2xl mx-auto mb-12">
          Join over 1k+ happy users who have transformed how they handle their daily emotions.
        </p>

        <button 
          onClick={handleStart}
          className="bg-[#1A1A1A] text-white px-10 py-5 rounded-[20px] text-xl md:text-2xl font-black flex items-center gap-3 mx-auto transition-transform shadow-[8px_8px_0_rgba(255,255,255,0.4)] relative z-10 border-4 border-transparent hover:border-white group"
        >
          Start for free <Zap className="w-6 h-6 fill-white stroke-black stroke-[1.5] group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 px-6 w-full border-t-[5px] border-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 border-b-[2px] border-white/10 pb-20">
        
        {/* Brand */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center p-2 border-2 border-transparent rounded-full">
               <svg viewBox="0 0 24 24" fill="black"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-black text-white tracking-tight text-2xl">MindCare</span>
          </div>
          <p className="text-white/60 font-bold max-w-sm text-xl leading-snug">
            Take care of your mind.<br/>It's the only one you have.
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="font-black text-sm tracking-widest uppercase text-white/40">Product</h4>
          <ul className="space-y-4 font-bold text-white/80 text-lg">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Wall of Love</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-black text-sm tracking-widest uppercase text-white/40">Legal</h4>
          <ul className="space-y-4 font-bold text-white/80 text-lg">
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mt-10 text-white/40 font-bold text-base">
        <p>© 2026 MindCare. All rights reserved.</p>
        <div className="flex gap-6 mt-6 md:mt-0">
           <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.53-4H14V7a1 1 0 0 1 1-1h3z"></path></svg>
           </a>
           <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
           </a>
        </div>
      </div>
    </footer>
  );
}
