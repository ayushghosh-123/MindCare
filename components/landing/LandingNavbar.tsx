'use client';

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function LandingNavbar() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#process" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between px-6 sm:px-10 py-3 sm:py-4 bg-white/95 backdrop-blur-3xl shadow-[0px_25px_60px_-15px_rgba(44,42,74,0.12)] rounded-[1.5rem] sm:rounded-full border border-white/60">
          
          {/* Logo / Brand */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#bdb2ff] rounded-xl flex items-center justify-center text-white shadow-xl shadow-[#bdb2ff]/30 group-hover:rotate-6 transition-transform">
              <span className="font-['Outfit'] font-black text-lg sm:text-2xl">M</span>
            </div>
            <span className="font-['Outfit'] font-black text-lg sm:text-2xl text-[#1b0c53] tracking-tighter">mindcare</span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <a
                href={item.href}
                key={item.name}
                className="px-4 py-2 rounded-full transition-all duration-300 font-['Plus_Jakarta_Sans'] font-bold text-[10px] uppercase tracking-widest text-[#5f559a]/60 hover:text-[#1b0c53] hover:bg-[#f3f3f3]"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* User / Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-6 border-l border-[#f3f3f3]">
            {user ? (
              <div className="flex items-center gap-3 sm:gap-6">
                <Link href="/diary" className="hidden sm:block">
                  <Button className="rounded-2xl px-6 bg-[#5f559a] text-white font-bold hover:bg-[#1b0c53] transition-all shadow-lg shadow-[#5f559a]/20">Enter Sanctuary</Button>
                </Link>
                <div className="scale-100 sm:scale-110">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/sign-in">
                  <Button variant="ghost" className="rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#5f559a] hover:bg-[#bdb2ff]/10 px-4">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-full px-5 sm:px-8 h-10 sm:h-12 bg-[#1b0c53] hover:bg-black text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-[#1b0c53]/20 hover:scale-105 active:scale-95 transition-all">Get Started</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-[#1b0c53]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] border border-white/60 shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            {navItems.map((item) => (
              <a
                href={item.href}
                key={item.name}
                onClick={() => setIsMenuOpen(false)}
                className="font-bold text-[#5f559a] hover:text-[#1b0c53] text-lg py-2 border-b border-[#f3f3f3] last:border-0"
              >
                {item.name}
              </a>
            ))}
            {user && (
              <Link href="/diary" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full rounded-xl bg-[#5f559a] text-white font-bold h-12">Enter Sanctuary</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
