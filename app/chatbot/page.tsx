'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useChat } from '@/components/hooks/use-chat';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatSession } from '@/lib/supabase-chat';
import { useToast } from '@/components/hooks/use-toast';

export default function ChatbotPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  // Use the chat hook to manage the full state
  const {
    activeSession,
    messages,
    isLoading,
    isSending,
    error,
    agent,
    loadSession,
    startNewSession,
    sendMessage,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
      });
    }
  }, [error, toast]);



  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) { router.push('/sign-in'); return null; }

  return (
    <div className="flex flex-col h-screen md:h-[100dvh] overflow-hidden bg-background pt-[88px] md:pt-0">
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Sidebar (Left Pane) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[150] w-72 md:w-[280px] lg:w-80 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0 bg-[#f3f3f3] shadow-2xl md:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <ChatSidebar
          activeSessionId={activeSession?.id ?? null}
          onSelectSession={(session: ChatSession) => {
            loadSession(session.id);
            setSidebarOpen(false); // Close on mobile after selection
          }}
          onNewSession={(session: ChatSession) => {
            startNewSession(session);
            setSidebarOpen(false); // Close on mobile
          }}
          onClose={() => setSidebarOpen(false)}
        />
        </div>

        {/* Main Chat Area (Right Pane) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Floating Mobile menu toggle for sidebar */}
          <button 
            className="md:hidden fixed top-[104px] left-6 p-4 text-[#5f559a] bg-white/90 backdrop-blur-3xl shadow-2xl shadow-[#2C2A4A]/10 hover:bg-[#bdb2ff]/20 rounded-2xl transition-all z-40 active:scale-95 border border-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Chat Window Component */}
          <div className="flex-1 overflow-hidden">
             <ChatWindow
              sessionName={activeSession?.name || "New Chat"}
              messages={messages}
              isSending={isSending}
              isLoading={isLoading}
              agentStatus={agent.status}
              currentStage={agent.currentStage}
              reviewPayload={agent.reviewPayload}
              agentResult={agent.result}
              onApprove={agent.approve}
              onReject={agent.reject}
              onSendMessage={sendMessage}
              onSendEmailReport={activeSession ? () => agent.sendEmailReport(activeSession.id) : undefined}
            />
          </div>

        </div>
      </div>
    </div>
  );
}