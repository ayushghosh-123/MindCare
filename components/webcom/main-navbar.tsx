"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {Home, BookOpen, BarChart3, User, Menu, X, Leaf} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Diary", href: "/diary", icon: <BookOpen size={18} /> },
    { name: "AI Assistant", href: "/chatbot", icon: <Leaf size={18} /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart3 size={18} /> },
    { name: "Profile", href: "/profile", icon: <User size={18} /> },
  ];

  // Only show MainNavbar if user is logged in
  // Landing page uses its own LandingNavbar
  if (!user) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between px-6 sm:px-10 py-3 sm:py-4 bg-white/95 backdrop-blur-3xl shadow-[0px_25px_60px_-15px_rgba(44,42,74,0.12)] rounded-[1.5rem] sm:rounded-full border border-white/60">
          
          {/* Logo / Brand */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#bdb2ff] rounded-xl flex items-center justify-center text-white shadow-xl shadow-[#bdb2ff]/30 group-hover:rotate-6 transition-transform">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            </div>
            <span className="font-['Outfit'] font-black text-lg sm:text-2xl text-[#1b0c53] tracking-tighter">mindcare</span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-['Plus_Jakarta_Sans'] font-bold text-[10px] uppercase tracking-widest ${isActive ? 'bg-[#5f559a] text-white shadow-lg shadow-[#5f559a]/20 scale-105' : 'text-[#5f559a]/60 hover:text-[#1b0c53] hover:bg-[#f3f3f3]'}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User / Mobile Menu */}
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-6 border-l border-[#f3f3f3]">
            <div className="scale-100 sm:scale-110">
              <UserButton />
            </div>
            <button 
              className="md:hidden p-2 text-[#5f559a] hover:bg-[#f3f3f3] rounded-xl transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="md:hidden mt-4 mx-4 p-6 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.name}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-['Plus_Jakarta_Sans'] font-bold ${pathname === item.href ? 'bg-[#bdb2ff]/20 text-[#1b0c53]' : 'text-[#5f559a] hover:bg-[#f3f3f3]'}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
