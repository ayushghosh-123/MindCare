import React from 'react';
import { PlayCircle, Brain, Edit3, LineChart } from 'lucide-react';
import Image from 'next/image';

export default function SereneLandingPage() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#bdb2ff] selection:text-[#4b4185] font-['Inter'] min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0px_20px_40px_rgba(44,42,74,0.06)]">
        <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-[#5f559a]">MindCare</div>
          <div className="hidden md:flex items-center gap-10">
            <a className="font-['Plus_Jakarta_Sans'] text-sm tracking-tight text-[#5f559a] font-semibold border-b-2 border-[#5f559a] pb-1" href="#features">Features</a>
            <a className="font-['Plus_Jakarta_Sans'] text-sm tracking-tight text-slate-600 hover:text-[#5f559a] transition-all duration-300" href="#how-it-works">How it Works</a>
            <a className="font-['Plus_Jakarta_Sans'] text-sm tracking-tight text-slate-600 hover:text-[#5f559a] transition-all duration-300" href="#benefits">Benefits</a>
            <a className="font-['Plus_Jakarta_Sans'] text-sm tracking-tight text-slate-600 hover:text-[#5f559a] transition-all duration-300" href="#science">Science</a>
          </div>
          <button className="bg-[#5f559a] text-white px-6 py-2.5 rounded-full font-['Plus_Jakarta_Sans'] font-semibold text-sm scale-95 duration-200 ease-in-out hover:scale-100 shadow-md">
            Get Started
          </button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-start gap-8 relative z-10">
            <div className="max-w-2xl">
              <span className="text-[#5f559a] font-['Plus_Jakarta_Sans'] font-semibold tracking-widest uppercase text-xs mb-4 block">Ethereal Sanctuary</span>
              <h1 className="font-['Plus_Jakarta_Sans'] text-6xl md:text-8xl font-extrabold tracking-tighter text-[#1a1c1c] leading-[1.1] mb-6">
                A deep breath for <br/><span className="relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-2 after:bg-repeat-x after:opacity-60 after:-z-10 group-hover:after:opacity-100" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 5 Q 25 0, 50 5 T 100 5\' stroke=\'%23bdb2ff\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")' }}>your soul.</span>
              </h1>
              <p className="text-[#484550] text-xl md:text-2xl font-light leading-relaxed mb-10 max-w-xl">
                A digital environment that feels like a deep breath—spacious, weightless, and profoundly safe for your mental well-being.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#5f559a] text-white px-8 py-4 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-lg hover:opacity-90 transition-all shadow-xl">
                  Get Started Free
                </button>
                <button className="flex items-center gap-3 px-8 py-4 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#5f559a] hover:bg-[#c8bfff]/20 transition-all">
                  <PlayCircle className="w-6 h-6" />
                  Watch how it works
                </button>
              </div>
            </div>
          </div>
          {/* Hero Image/Background Decor */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 md:opacity-100 z-0 select-none pointer-events-none">
            <div className="relative w-full h-full">
              {/* Note: In a real app replace with Next/Image and a local asset */}
              <img className="w-full h-full object-cover rounded-bl-[10rem]" alt="Abstract 3D flowing shapes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB46uHRWTRLJkoLaXolKplmlMZ98s_JoAEwGY1VOx2qJlk1_rUBzcIaPJP5UIt5elDfZYG5FEt_E4UtU-FeWuJ9sd8KHri1nHs2FaKUJjhYC-xJt_pxhdcYn9Akb63vK4ZncqnzQI3J54S-mGkex5S2dvi9SzyuLgGIWqhArOx-wqTfO8_KyZM3lGOOxxPAExNrzcqqfBEODAcEeEWWZW4SqwQNyx6Tc4PcoDQxte4m0axu38dTaupTiBPPxnPCrh7kopHpMzLimfk" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f9f9f9]"></div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-8 bg-[#f3f3f3]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold tracking-tight text-[#1a1c1c] mb-4">Thoughtful Support</h2>
              <p className="text-[#484550] text-lg">Designed for users who seek clarity and calm.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Feature 1 */}
              <div className="md:col-span-7 bg-white/70 backdrop-blur-xl border border-[#c9c4d1]/20 rounded-[2rem] p-10 flex flex-col justify-between shadow-[0px_20px_40px_rgba(44,42,74,0.06)] group">
                <div>
                  <div className="w-14 h-14 bg-[#bdb2ff] rounded-full flex items-center justify-center text-[#5f559a] mb-8 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold mb-4 text-[#1a1c1c]">Context-Aware Memory</h3>
                  <p className="text-[#484550] text-lg leading-relaxed max-w-md">Our AI remembers your journey, recognizing patterns across weeks of reflection to provide deep, personal continuity.</p>
                </div>
                <div className="mt-12 h-40 w-full overflow-hidden rounded-xl bg-[#e8e8e8]/50">
                  <img className="w-full h-full object-cover mix-blend-overlay" alt="Abstract visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBEzDF9B8G66rLkxKcgyrQWmWx8pQS6tkQvT20o8Ft0dl1WBjjuqhyvHZnxGrk_kg6nUGxjwu5CGqaNFNzukJpAfFszzmeH_ImU1FSCWnEhw2-d2o42PfXTWvT0nbx16eUgqne-TlXfXrwb9deIGvqB2p4na_MyEwe95Y78VQHcb0EVCh7ReAwHz4CeYSF6-zkmxIK_yii-78y8TUtSFS362SH9fG09E1I_T9t4d0m5G9_XkLRAKwuOk9TJ-dOV22J11ETgOSGIAA" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-5 bg-[#5f559a] text-white rounded-[2rem] p-10 flex flex-col shadow-xl">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white mb-8">
                  <Edit3 className="w-8 h-8" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold mb-4">Therapeutic Journaling</h3>
                <p className="opacity-80 text-lg leading-relaxed mb-8">Guided prompts that evolve as you do, using clinical techniques to help you uncover your inner truth.</p>
                <div className="mt-auto">
                  <div className="flex -space-x-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-[#5f559a] bg-slate-200 overflow-hidden">
                        <img className="w-full h-full object-cover" alt="User avatar" src={`https://i.pravatar.cc/100?img=${i+44}`} />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-[#5f559a] bg-[#bdb2ff] flex items-center justify-center text-[#5f559a] text-xs font-bold">+12k</div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-12 bg-white/70 backdrop-blur-xl border border-[#c9c4d1]/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-12 shadow-[0px_20px_40px_rgba(44,42,74,0.06)]">
                <div className="md:w-1/2">
                  <div className="w-14 h-14 bg-[#e2dbfe] rounded-full flex items-center justify-center text-[#5f5b78] mb-8">
                    <LineChart className="w-8 h-8" />
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold mb-4 text-[#1a1c1c]">Personalized AI Insights</h3>
                  <p className="text-[#484550] text-lg leading-relaxed">Go beyond simple tracking. Receive weekly reports that translate your emotional data into actionable growth steps designed specifically for your temperament.</p>
                </div>
                <div className="md:w-1/2 w-full grid grid-cols-2 gap-4">
                  <div className="h-32 bg-[#bdb2ff]/20 rounded-xl flex items-center justify-center border border-[#5f559a]/10">
                    <span className="text-[#5f559a] font-['Plus_Jakarta_Sans'] font-bold text-2xl">89%</span>
                    <span className="text-[#5f559a]/60 text-xs ml-2">Clarity</span>
                  </div>
                  <div className="h-32 bg-[#e2dbfe]/20 rounded-xl flex items-center justify-center border border-[#5f5b78]/10">
                    <span className="text-[#5f5b78] font-['Plus_Jakarta_Sans'] font-bold text-2xl">Daily</span>
                    <span className="text-[#5f5b78]/60 text-xs ml-2">Relief</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-xl">
                <h2 className="font-['Plus_Jakarta_Sans'] text-5xl font-bold tracking-tight text-[#1a1c1c] mb-6">The Path to <br/>Serenity.</h2>
                <p className="text-[#484550] text-xl font-light">A simple three-step ritual designed to fit into your quietest moments.</p>
              </div>
              <div className="text-[#5f559a] text-9xl font-['Plus_Jakarta_Sans'] font-black opacity-5 select-none leading-none">PROCESS</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              {[
                { step: "01", title: "Sign Up", desc: "Join our sanctuary in seconds. Secure, anonymous, and focused entirely on your peace of mind." },
                { step: "02", title: "Reflect", desc: "Engage with guided journaling and context-aware conversations that meet you where you are today." },
                { step: "03", title: "Grow", desc: "Watch your landscape evolve as MindCare helps you identify breakthroughs and emotional milestones." }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="text-[#bdb2ff] font-['Plus_Jakarta_Sans'] font-bold text-8xl absolute -top-10 -left-6 opacity-40 group-hover:opacity-100 transition-opacity">{item.step}</div>
                  <div className="relative pt-12">
                    <h4 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4 text-[#1a1c1c]">{item.title}</h4>
                    <p className="text-[#484550] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-8 mb-20">
          <div className="max-w-7xl mx-auto bg-[#bdb2ff]/20 rounded-[3rem] p-16 md:p-32 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-['Plus_Jakarta_Sans'] text-5xl md:text-7xl font-bold text-[#5f559a] mb-8 leading-tight">Ready for a <br/>moment of calm?</h2>
              <p className="text-[#4b4185] text-xl md:text-2xl font-light mb-12 max-w-xl mx-auto">Start your journey today. Your first month of sanctuary is on us.</p>
              <button className="bg-[#5f559a] text-white px-12 py-5 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-xl shadow-2xl hover:scale-105 transition-transform">
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-12 bg-[#f3f3f3] dark:bg-slate-950 mt-20 tonal-shift-bg">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-[#5f559a]">MindCare</div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-slate-500 hover:text-[#5f559a] transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-slate-500 hover:text-[#5f559a] transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-slate-500 hover:text-[#5f559a] transition-colors opacity-80 hover:opacity-100" href="#">Contact Us</a>
            <a className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-slate-500 hover:text-[#5f559a] transition-colors opacity-80 hover:opacity-100" href="#">Press Kit</a>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-slate-500">© 2026 MindCare Sanctuary. Crafted for serenity.</div>
        </div>
      </footer>
    </div>
  );
}
