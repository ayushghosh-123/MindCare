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
import { MainNavbar } from '@/components/webcom/main-navbar';
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

  // Ensure user is synced to Supabase when they visit Chat
  useEffect(() => {
    if (isLoaded && user) {
      (async () => {
        const token = await getToken();

        fetch('/api/users/sync', {
          method: 'POST',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch((err) => console.error('Failed to sync user in chat:', err));
      })();
    }
  }, [getToken, isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F0F0FF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!user) { router.push('/sign-in'); return null; }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#F8F8FF]">
      <MainNavbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Sidebar (Left Pane) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 md:w-[260px] lg:w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200",
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
          
          {/* Mobile menu toggle for sidebar (only shows on mobile) */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-[#F8F8FF] shadow-sm z-10 sticky top-0">
            <button 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-gray-800">
               {activeSession?.name || "New Chat"}
            </div>
            <div className="w-9"></div> {/* Spacer to center title */}
          </div>

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