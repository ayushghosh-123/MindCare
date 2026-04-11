'use client';

import React from 'react';
import { DiaryProvider, useDiary } from '@/components/journal/DiaryContext';
import { cn } from '@/lib/utils';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { dbHelpers } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MainNavbar } from '@/components/webcom/main-navbar';


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
        color: '#8A8AFF',
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
    <div className="w-[300px] h-screen bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 overflow-y-auto hidden lg:flex shrink-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800">My Journals</h2>
        <button 
          onClick={createJournal}
          className="p-2 rounded-full hover:bg-slate-100 text-[#8A8AFF] transition-colors"
          title="New Journal"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-[15px] group/journals pb-10">
        {loading && journals.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[100px] w-full rounded-[10px] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
             <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
             <p className="text-sm text-slate-500 text-center">No journals yet.</p>
          </div>
        ) : (
          journals.map((journal) => (
            <div
              key={journal.id}
              onClick={() => setSelectedJournal(journal)}
              className={cn(
                "flex flex-col items-center justify-center text-center h-[100px] bg-indigo-500 w-full rounded-[10px] text-white cursor-pointer transition-all duration-[400ms] mx-auto group/journal relative overflow-hidden",
                "group-hover/journals:blur-[10px] group-hover/journals:scale-[0.9] hover:!blur-none hover:!scale-[1.1] shadow-md",
                selectedJournal?.id === journal.id ? "ring-4 ring-offset-2 ring-slate-200 !blur-none !scale-[1.05]" : ""
              )}
              style={{ backgroundColor: journal.color || '#6366F1' }}
            >
              <p className="text-base font-bold px-4 truncate w-full">{journal.title}</p>
              <p className="text-[0.7em] opacity-90 px-4 truncate w-full">{journal.description || 'Lorem Ipsum'}</p>
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteJournal(journal.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/10 hover:bg-red-500/80 text-white opacity-0 group-hover/journal:opacity-100 transition-all duration-200"
                title="Delete Journal"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Mobile journal picker that appears below the main navbar on smaller screens. It allows users to quickly switch between journals without needing to open the sidebar. It uses a horizontal scroll layout and highlights the selected journal.

function MobileJournalPicker() {
  const { journals, selectedJournal, setSelectedJournal, loading } = useDiary();

  if (loading && journals.length === 0) return null;
  if (journals.length === 0) return null;

  return (
    <div className="lg:hidden w-full bg-white border-b border-slate-100 overflow-visible">
      <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar scroll-smooth">
        {journals.map((journal) => (
          <div
            key={journal.id}
            onClick={() => setSelectedJournal(journal)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center text-center h-[70px] w-[140px] rounded-xl text-white cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden",
              selectedJournal?.id === journal.id ? "ring-2 ring-offset-2 ring-slate-200 scale-[1.05]" : "opacity-70 scale-95"
            )}
            style={{ backgroundColor: journal.color || '#6366F1' }}
          >
            <p className="text-sm font-bold px-2 truncate w-full">{journal.title}</p>
            <p className="text-[0.6em] opacity-80 px-2 truncate w-full">{journal.description || 'Lorem Ipsum'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// This component wraps the main layout of the diary section, including the sidebar and main navbar. It also includes a persistent header that contains the page title and a "New Entry" button that is always visible when not in writing mode. The header has a backdrop blur effect to create a sense of depth and separation from the content below. The MobileJournalPicker is included within the header to ensure it remains accessible on smaller screens without taking up additional vertical space.
function DiaryLayoutContent({ children }: { children: React.ReactNode }) {
  const { isWriting, setIsWriting } = useDiary();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DiarySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MainNavbar />
        
        {/* Persistent Layout Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">My Diary</h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium">Write and organize your thoughts</p>
                </div>
              </div>
              {!isWriting && (
                <Button 
                  onClick={() => setIsWriting(true)} 
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-300 font-bold"
                >
                  <Plus className="h-5 w-5 mr-2" /> New Entry
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile Journal Picker */}
          <MobileJournalPicker />
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto">
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
