"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Home,
  BookOpen,
  MessageSquare,
  BarChart3,
  User,
  Menu,
  X,
  Brain,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export  function MainNavbar() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Diary", href: "/diary", icon: <BookOpen size={18} /> },
    { name: "AI Assistant", href: "/chatbot", icon: <Brain size={18} /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart3 size={18} /> },
    { name: "Profile", href: "/profile", icon: <User size={18} /> },
  ];

  return (
    <>
      {/* 🌟 DESKTOP TOP CAPSULE NAV */}
      <nav className="hidden md:flex justify-center py-4 z-50 bg-transparent">
        <div className="flex items-center gap-6 px-8 py-3 bg-white shadow-md rounded-full border border-gray-200">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition font-medium"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {/* Auth */}
          <div className="ml-4">
            {user ? (
              <UserButton />
            ) : (
              <Link href="/sign-in">
                <Button className="rounded-full px-5 py-1">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 🌟 MOBILE FLOATING CAPSULE NAV */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <div className="flex items-center justify-between px-5 py-3 bg-white shadow-xl rounded-full border border-gray-300">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="flex flex-col items-center text-gray-700 hover:text-black transition"
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* OPTIONAL: MOBILE MENU BUTTON (if needed) */}
      <button
        className="md:hidden fixed top-4 right-4 bg-white shadow-md p-2 rounded-full border border-gray-200"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* OPTIONAL: FULL MOBILE MENU (if open) */}
      {open && (
        <div className="md:hidden fixed top-16 right-4 bg-white w-48 rounded-xl shadow-xl border border-gray-200 p-4">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-black"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          <div className="mt-3">
            {user ? (
              <UserButton />
            ) : (
              <Link href="/sign-in">
                <Button className="w-full rounded-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
