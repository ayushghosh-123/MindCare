'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, Activity, LineChart, MessageSquare,
  ShieldCheck, Heart, User, Sparkles,
  ArrowRight, Check, X, Zap,
  Database, Shield, Cpu, RefreshCw,
  Search, BookOpen, Layers, Target,
  Phone, Mic, Clock, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from './LandingNavbar';

export function MindCareLanding() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-[#f9f9f9] selection:bg-[#bdb2ff] selection:text-[#4b4185] min-h-screen font-['Plus_Jakarta_Sans'] overflow-x-hidden">

      <LandingNavbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 sm:pt-48 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-to-br from-[#bdb2ff]/20 via-[#e5deff]/10 to-transparent blur-[80px] sm:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-tr from-[#5f559a]/10 via-transparent to-transparent blur-[60px] sm:blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-6 sm:mb-8"
            >
              <span className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-[#bdb2ff] animate-ping" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]">AI-Powered Sanctuary</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-['Outfit'] text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-[#1b0c53] leading-[1.1] sm:leading-[0.95] mb-6 sm:mb-8"
            >
              A Smart Way to Understand<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5f559a] via-[#bdb2ff] to-[#5f559a] bg-size-200 animate-gradient">Your Mind.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-[#484550]/80 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto px-2"
            >
              MindCare help you track your daily habits, emotions, and routines and turns them into clear, meaningful insights so you can understand why you feel the way you do
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full sm:w-auto px-6 sm:px-0"
            >
              <Link href="/sign-up">
                <Button className="w-full sm:w-auto bg-[#1b0c53] hover:bg-black text-white px-8 sm:px-10 py-6 sm:py-8 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl shadow-2xl shadow-[#1b0c53]/30 transition-all hover:scale-105 active:scale-95 group">
                  Get Started Free
                  <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-8 rounded-[1.5rem] sm:rounded-[2rem] border-[#c9c4d1]/40 font-bold text-lg sm:text-xl text-[#1b0c53] hover:bg-white transition-all shadow-sm">
                  Try Demo
                </Button>
              </Link>
            </motion.div>

            {/* Laptop UI Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="mt-16 sm:mt-24 w-full max-w-6xl relative px-2 sm:px-0"
            >
              <div className="relative rounded-[1.5rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 bg-gradient-to-b from-[#1b0c53]/20 to-[#bdb2ff]/20 shadow-[0px_30px_60px_-10px_rgba(44,42,74,0.3)] border border-white/20">
                <div className="bg-[#f3f3f3] rounded-[1rem] sm:rounded-[2rem] overflow-hidden border border-white/60 aspect-video sm:aspect-[16/10] relative group">
                  <img
                    src="/Image/hero_image.png"
                    alt="MindCare Interface Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b0c53]/40 via-transparent to-transparent" />

                  {/* Floating Cards (Hidden or simplified on mobile) */}
                  <div className="hidden md:block absolute top-1/4 right-10 w-64 p-6 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/60 animate-bounce duration-[5000ms]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#bdb2ff]/20 rounded-xl text-[#5f559a]">
                        <Sparkles size={20} />
                      </div>
                      <span className="font-bold text-[#1b0c53]">AI Insight</span>
                    </div>
                    <p className="text-xs text-[#5f559a] leading-relaxed">"Your focus has improved by 24% this week. Your evening reflections show deep emotional clarity."</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- ABOUT SECTION --- */}
        <section id="about" className="py-20 sm:py-32 px-4 sm:px-6 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 items-center">
              <div className="w-full lg:w-1/2">
                <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#1b0c53] leading-tight mb-6 sm:mb-8 text-center lg:text-left">
                  What is MindCare?
                </h2>
                <div className="space-y-6 text-center lg:text-left">
                  <p className="text-lg sm:text-xl text-[#484550] leading-relaxed">
                    Most people don’t lack effort - they lack clarity.
                    Some days feel off, but you don’t know why.
                  </p>

                  <p className="text-lg sm:text-xl text-[#484550] leading-relaxed">
                    Your mood, energy, and thoughts shift - without clear reasons.
                    Not because life is disconnected, but because it’s never seen together.
                  </p>

                  <p className="text-lg sm:text-xl text-[#484550] leading-relaxed">
                    MindCare connects your emotions, habits, sleep, food, and activity -
                    so you can understand the patterns behind how you feel.
                  </p>

                  <p className="text-lg sm:text-xl text-[#1b0c53] font-semibold">
                    Not just tracking - real understanding.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
                    <div className="p-6 bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2rem]">
                      <h4 className="font-bold text-[#1b0c53] mb-2">Insights</h4>
                      <p className="text-sm text-[#5f559a]">See what affects your mind.</p>
                    </div>

                    <div className="p-6 bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2rem]">
                      <h4 className="font-bold text-[#1b0c53] mb-2">Smart AI</h4>
                      <p className="text-sm text-[#5f559a]">Learns your patterns over time.</p>
                    </div>

                    <div className="p-6 bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2rem]">
                      <h4 className="font-bold text-[#1b0c53] mb-2">Private</h4>
                      <p className="text-sm text-[#5f559a]">Your data stays yours.</p>
                    </div>

                    <div className="p-6 bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2rem]">
                      <h4 className="font-bold text-[#1b0c53] mb-2">Clarity</h4>
                      <p className="text-sm text-[#5f559a]">Understand yourself better.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4 pt-8 sm:pt-12">
                  <div className="h-40 sm:h-64 bg-[#bdb2ff]/20 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center"><Heart className="text-[#bdb2ff] w-8 h-8 sm:w-12 sm:h-12" /></div>
                  <div className="h-32 sm:h-48 bg-[#1b0c53] rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center"><ShieldCheck className="text-white w-8 h-8 sm:w-12 sm:h-12" /></div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-32 sm:h-48 bg-[#5f559a] rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center"><Brain className="text-white w-8 h-8 sm:w-12 sm:h-12" /></div>
                  <div className="h-40 sm:h-64 bg-[#e5deff] rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center"><Activity className="text-[#5f559a] w-8 h-8 sm:w-12 sm:h-12" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PROBLEM vs SOLUTION --- */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#f3f3f3]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#1b0c53] leading-tight mb-4 sm:mb-6">
                Old Tracking vs. Real Intelligence
              </h2>
              <p className="text-lg sm:text-xl text-[#5f559a] font-medium italic">Why simple data points aren't enough.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              {/* Problem Card */}
              <div className="p-8 sm:p-16 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] sm:rounded-[3rem] shadow-xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 sm:mb-8">
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1b0c53] mb-6 sm:mb-8 tracking-tight">The Old Way Is Broken</h3>
                <ul className="space-y-4 sm:space-y-6">
                  {[
                    "You log data… but gain no real clarity",
                    "Insights feel generic and disconnected",
                    "Patterns stay hidden over time",
                    "Your emotions are reduced to numbers"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 sm:gap-4 text-base sm:text-lg text-[#5f559a] font-medium">
                      <div className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-red-400 mt-2.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution Card */}
              <div className="p-8 sm:p-16 bg-[#1b0c53] rounded-[2rem] sm:rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 h-64 bg-[#bdb2ff]/10 blur-[40px] sm:blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#bdb2ff] mb-6 sm:mb-8 relative z-10">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tight relative z-10">The MindCare Solution</h3>
                <ul className="space-y-4 sm:space-y-6 relative z-10">
                  {[
                    "AI that learns your behavior over time",
                    "Connects emotions, habits, and lifestyle signals",
                    "Gives insights that actually make sense",
                    "Personalized guidance that evolves with you"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 sm:gap-4 text-base sm:text-lg text-white/80 font-medium">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#bdb2ff] mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
              <div className="max-w-2xl">
                <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#1b0c53] leading-tight mb-4 sm:mb-6">
                  Ethereal Toolkit
                </h2>
                <p className="text-lg sm:text-xl text-[#5f559a] font-medium leading-relaxed">
                  Powerful features designed to help you navigate your inner world with clarity and grace.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#f3f3f3] text-[#1b0c53] font-black text-[10px] sm:text-xs uppercase tracking-widest">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#bdb2ff]" />
                Fully Workable v1.0
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { title: "Smart Journaling", desc: "Rich-text mood tracking, tags, and auto-save reflections.", icon: <BookOpen />, color: "bg-[#e5deff]" },
                { title: "AI Health Assistant", desc: "Multi-step reasoning engine with contextual memory.", icon: <Brain />, color: "bg-[#bdb2ff]" },
                { title: "Vital Analytics", desc: "Long-term mood trends and health score intelligence.", icon: <LineChart />, color: "bg-[#f3f3f3]" },
                { title: "Event-Driven UI", desc: "Real-time sync across your entire sanctuary experience.", icon: <RefreshCw />, color: "bg-[#f9f9f9]" },
                { title: "Archetype System", desc: "Profile calibration for medical and personal goals.", icon: <User />, color: "bg-[#e5deff]" },
                { title: "Human Protocol", desc: "You remain in control with human-in-the-loop validation.", icon: <ShieldCheck />, color: "bg-[#bdb2ff]" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-[#f3f3f3] shadow-lg shadow-[#2C2A4A]/5 flex flex-col items-start gap-6 sm:gap-8 group"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.color} rounded-2xl flex items-center justify-center text-[#1b0c53] group-hover:scale-110 transition-transform duration-500`}>
                    {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-[#1b0c53] mb-3 sm:mb-4 tracking-tight">{feature.title}</h4>
                    <p className="text-sm sm:text-base text-[#5f559a] font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- AI ARCHITECTURE --- */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#1b0c53] text-white overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-[#bdb2ff]/20 to-transparent blur-[100px] sm:blur-[150px] opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 text-center mb-12 sm:mb-20">
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 sm:mb-6">
              The Intelligence Pipeline
            </h2>
            <p className="text-lg sm:text-xl text-white/60 font-medium italic">How MindCare understands the context of your life.</p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 relative z-10">
            {[
              { icon: <MessageSquare />, label: "Input", sub: "Journal Reflection" },
              { icon: <Search />, label: "Context", sub: "Memory Retrieval" },
              { icon: <Cpu />, label: "Reasoning", sub: "LLM Processing" },
              { icon: <Target />, label: "Decision", sub: "Logic Path" },
              { icon: <Sparkles />, label: "Response", sub: "Personal Insight" }
            ].map((step, i) => (
              <div key={i} className={`flex flex-col items-center text-center group ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#bdb2ff] group-hover:text-[#1b0c53] transition-all duration-500 border border-white/10 group-hover:scale-110">
                  {React.cloneElement(step.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <h4 className="font-black text-lg sm:text-xl mb-1">{step.label}</h4>
                <p className="text-white/40 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{step.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- COMPARISON TABLE --- */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl font-black tracking-tighter text-[#1b0c53] text-center mb-12 sm:mb-16">
              Why MindCare Wins
            </h2>
            <div className="overflow-x-auto rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#f3f3f3] shadow-2xl shadow-[#2C2A4A]/5">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#f3f3f3]">
                    <th className="p-4 sm:p-8 font-black text-[#1b0c53] uppercase text-[10px] sm:text-xs tracking-widest">Core Feature</th>
                    <th className="p-4 sm:p-8 font-black text-[#5f559a]/60 uppercase text-[10px] sm:text-xs tracking-widest">Other Apps</th>
                    <th className="p-4 sm:p-8 font-black text-[#1b0c53] uppercase text-[10px] sm:text-xs tracking-widest bg-[#bdb2ff]/20">MindCare</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-base sm:text-lg">
                  {[
                    { feature: "AI Interaction", other: "Basic Chat", mind: "Multi-step reasoning" },
                    { feature: "Journaling", other: "Static Input", mind: "Context-aware memory" },
                    { feature: "Daily Insights", other: "Generic Advice", mind: "Pattern Intelligence" },
                    { feature: "Privacy", other: "Cloud-based", mind: "Sanctuary Protocol" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#f3f3f3]">
                      <td className="p-4 sm:p-8 text-[#1b0c53] font-bold">{row.feature}</td>
                      <td className="p-4 sm:p-8 text-[#5f559a]/40">{row.other}</td>
                      <td className="p-4 sm:p-8 text-[#1b0c53] font-black bg-[#bdb2ff]/10 italic">{row.mind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FUTURE SCOPE --- */}
        {/* <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#f3f3f3]">
          <div className="max-w-7xl mx-auto">
             <h2 className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#1b0c53] mb-12 sm:mb-16 text-center">
               Beyond the Horizon
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Wearables", icon: <Phone />, sub: "Real-time biometric sync" },
                  { label: "Voice Engine", icon: <Mic />, sub: "Natural audio journaling" },
                  { label: "Predictive Alerts", icon: <Zap />, sub: "Early fatigue detection" },
                  { label: "Global Presence", icon: <Globe />, sub: "Offline-first AI mode" }
                ].map((item, i) => (
                  <div key={i} className="p-8 sm:p-10 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                     <div className="text-[#bdb2ff] mb-4 sm:mb-6 group-hover:scale-125 transition-transform">{item.icon}</div>
                     <h4 className="font-black text-lg sm:text-xl text-[#1b0c53] mb-2">{item.label}</h4>
                     <p className="text-xs sm:text-sm text-[#5f559a] font-medium">{item.sub}</p>
                  </div>
                ))}
             </div>
          </div>
        </section> */}

        {/* --- FINAL CTA --- */}
        <section className="py-24 sm:py-40 px-4 sm:px-6 relative overflow-hidden bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#e5deff]/30 blur-[80px] sm:blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-['Outfit'] text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-[#1b0c53] leading-tight mb-8 sm:mb-10">
              Start Understanding <br className="hidden sm:block" /> Yourself Today.
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/sign-up">
                <Button className="w-full sm:w-auto bg-[#1b0c53] hover:bg-black text-white px-8 sm:px-16 py-6 sm:py-10 rounded-[1.5rem] sm:rounded-[3rem] font-black text-xl sm:text-2xl shadow-3xl shadow-[#1b0c53]/40 transition-all">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
            <p className="mt-8 sm:mt-10 text-[#5f559a] font-bold uppercase tracking-widest text-[8px] sm:text-xs">No credit card required • Infinite privacy</p>
          </div>
        </section>
      </main>

      <footer className="py-12 sm:py-20 px-4 sm:px-6 bg-white border-t border-[#f3f3f3]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10">
          <div className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#1b0c53] tracking-tighter flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 h-10 bg-[#bdb2ff] rounded-xl flex items-center justify-center text-white"><span className="text-lg sm:text-xl">M</span></div>
            mindcare
          </div>
          <div className="flex gap-6 sm:gap-8 text-[#5f559a] font-bold text-xs sm:text-sm">
            <a href="#" className="hover:text-[#1b0c53] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1b0c53] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1b0c53] transition-colors">Contact</a>
          </div>
          <p className="text-[#5f559a]/40 font-bold text-[8px] sm:text-xs uppercase tracking-[0.2em]">© 2025 MindCare Sanctuary</p>
        </div>
      </footer>
    </div>
  );
}
