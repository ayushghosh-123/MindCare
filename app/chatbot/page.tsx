'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useChat } from '@/components/hooks/use-chat';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatSession } from '@/lib/supabase-chat';
import { MainNavbar } from '@/components/main-navbar';

export default function ChatbotPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Use the chat hook to manage the full state
  const {
    activeSession,
    messages,
    isLoading,
    isSending,
    agent,
    loadSession,
    startNewSession,
    sendMessage,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!user) { router.push('/sign-in'); return null; }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <MainNavbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
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
        />
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
        </div>

        {/* Main Chat Area (Right Pane) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Mobile menu toggle for sidebar (only shows on mobile) */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white shadow-sm z-10 sticky top-0">
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
              reviewPayload={agent.reviewPayload}
              agentResult={agent.result}
              onApprove={agent.approve}
              onReject={agent.reject}
              onSendMessage={sendMessage}
            />
          </div>

        </div>
      </div>
    </div>
  );
}