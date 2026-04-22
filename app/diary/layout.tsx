'use client';

import React from 'react';
import { DiaryProvider, useDiary } from '@/components/journal/DiaryContext';
import { cn } from '@/lib/utils';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { dbHelpers } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/hooks/use-toast';
import { Button } from '@/components/ui/button';


// this layout will wrap all /diary routes and provide the sidebar and main navbar
function DiarySidebar() {
  const { journals, selectedJournal, setSelectedJournal, refreshJournals, deleteJournal, loading } = useDiary();
  const { user } = useUser();
  const { toast } = useToast();

  const createJournal = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await dbHelpers.createJournal({
        user_id: user.id,
        title: 'New Journal',
        description: 'A place for my thoughts',
        color: '#e5deff',
        is_public: false,
      });
      if (error) throw error;
      await refreshJournals();
      setSelectedJournal(data);
      toast({ title: 'Success', description: 'Journal created!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create journal.' });
    }
  };

  return (
    <div className="w-[300px] h-[calc(100vh-6rem)] bg-white/40 backdrop-blur-md border-r border-[#c9c4d1]/30 flex flex-col p-8 sticky top-24 overflow-y-auto hidden lg:flex shrink-0 z-30 m-4 rounded-[2rem] shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black text-[#1b0c53] tracking-tighter font-['Outfit']">Journals</h2>
        <button 
          onClick={createJournal}
          className="p-2 rounded-xl bg-white border border-[#c9c4d1]/30 shadow-sm hover:scale-105 transition-all text-[#5f559a]"
          title="New Journal"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col gap-4 group/journals pb-10">
        {loading && journals.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[90px] w-full rounded-2xl bg-[#5f559a]/5 border border-[#5f559a]/10 animate-pulse" />
            ))}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-[#c9c4d1] bg-white/50 rounded-2xl">
             <BookOpen className="mx-auto text-[#5f559a] mb-3 opacity-50" size={32} strokeWidth={1.5} />
             <p className="text-sm font-semibold text-[#484550]">No journals yet.</p>
          </div>
        ) : (
          journals.map((journal) => (
            <div
              key={journal.id}
              onClick={() => setSelectedJournal(journal)}
              className={cn(
                "flex flex-col items-center justify-center text-center p-6 min-h-[100px] w-full rounded-3xl cursor-pointer transition-all duration-500 mx-auto group/journal relative border border-transparent shadow-sm mb-2",
                "hover:scale-[1.03] hover:shadow-xl hover:shadow-[#2C2A4A]/5",
                selectedJournal?.id === journal.id ? "bg-white ring-2 ring-[#5f559a]/20 scale-[1.03] shadow-xl shadow-[#2C2A4A]/5" : "opacity-90"
              )}
              style={{ backgroundColor: selectedJournal?.id === journal.id ? undefined : (journal.color || '#e5deff') }}
            >
              <p className="text-base font-bold px-4 truncate w-full text-slate-800">{journal.title}</p>
              <p className="text-xs font-semibold opacity-70 px-4 truncate w-full text-slate-800">{journal.description || 'A quiet place.'}</p>
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteJournal(journal.id);
                }}
                className="absolute -top-2 -right-2 p-1.5 rounded-full border border-red-200 bg-white hover:bg-red-500 hover:text-white text-red-500 opacity-0 group-hover/journal:opacity-100 transition-all duration-200 shadow-sm"
                title="Delete Journal"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Mobile journal picker that appears below the main navbar on smaller screens
function MobileJournalPicker() {
  const { journals, selectedJournal, setSelectedJournal, loading } = useDiary();

  if (loading && journals.length === 0) return null;
  if (journals.length === 0) return null;

  return (
    <div className="lg:hidden w-full bg-[#f9f9f9] border-b border-[#c9c4d1]/30 overflow-visible relative z-20">
      <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar scroll-smooth items-center">
        {journals.map((journal) => (
          <div
            key={journal.id}
            onClick={() => setSelectedJournal(journal)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center text-center h-[64px] w-[130px] rounded-2xl cursor-pointer transition-all duration-300 relative border shadow-sm",
              selectedJournal?.id === journal.id ? "ring-2 ring-offset-2 ring-[#5f559a] scale-[1.02] border-white/50" : "opacity-80 scale-95 border-transparent hover:scale-100 hover:opacity-100"
            )}
            style={{ backgroundColor: journal.color || '#e5deff' }}
          >
            <p className="text-sm font-bold text-slate-800 px-2 truncate w-full">{journal.title}</p>
            <p className="text-[10px] font-semibold text-slate-600 px-2 truncate w-full">{journal.description || 'A quiet place.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaryLayoutContent({ children }: { children: React.ReactNode }) {
  const { isWriting, setIsWriting } = useDiary();

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] relative font-sans text-slate-800 pt-24">
      {/* Subtle background for Serene Sanctuary effect */}
      <div 
        className="absolute inset-0 z-[1] opacity-30 pointer-events-none mix-blend-multiply"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(189, 178, 255, 0.2), transparent 50%), radial-gradient(ellipse at bottom left, rgba(229, 222, 255, 0.3), transparent 50%)'
        }}
      />
      <DiarySidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
          
        {/* Persistent Layout Header */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-[#c9c4d1]/30 sticky top-24 z-20 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#5f559a] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>My Diary</h1>
                  <p className="text-sm sm:text-base text-[#484550] font-medium mt-1">A private space for your thoughts</p>
                </div>
              </div>
              {!isWriting && (
                <button 
                  onClick={() => setIsWriting(true)} 
                  className="bg-[#5f559a] text-white px-6 py-2.5 rounded-full font-semibold flex items-center shadow-lg shadow-[#5f559a]/20 hover:scale-105 hover:bg-[#4b4185] transition-all"
                >
                  <Plus className="h-5 w-5 mr-2 stroke-[2.5]" /> New Entry
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Journal Picker */}
          <MobileJournalPicker />
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiaryProvider> 
      <DiaryLayoutContent>
        {children}
      </DiaryLayoutContent>
    </DiaryProvider>
  );
}
