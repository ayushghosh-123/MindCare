'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Leaf, Send, User, Mail, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type HealthEntry } from '@/lib/supabase';
import { useAgent } from '@/components/hooks/use-agent';
import { EmailReviewPanel } from '@/components/EmailReviewPanel';
import { useToast } from '@/components/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface HealthChatbotProps {
  entries: HealthEntry[];
  className?: string;
  userId?: string;
}

// Suggestion chips based on what agent returned
function getSuggestions(agentType: string | null): string[] {
  if (agentType === 'data') {
    return [
      'Tell me more about my sleep',
      'How is my mood trending?',
      'Show my exercise patterns',
    ];
  }
  if (agentType === 'report') {
    return [
      'Make a weekly report',
      'How was my week overall?',
    ];
  }
  return [
    'How can I improve my sleep?',
    'What affects my mood?',
    'Make a report of today',
    'Show my health trends',
  ];
}

export function HealthChatbot({ className, userId }: HealthChatbotProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content:
        "Hello! I'm your MindCare health assistant. I can answer your health questions, analyze your data, and generate wellness reports. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        'Analyze my recent health trends',
        'How can I improve my sleep?',
        'Make a report of today',
        'How am I doing this week?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  
  const { 
    status, 
    result, 
    reviewPayload, 
    error: agentError, 
    sendEmailReport 
  } = useAgent();

  const [emailDraft, setEmailDraft] = useState<{
    sessionId: string;
    subject: string;
    body: string;
    evaluation?: never;
  } | null>(null);

  const isTyping = status === 'loading' || status === 'resuming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── UPDATED: calls real /api/agent instead of fake keyword matching ─────────
  const handleSendMessage = async () => {
    if (!input.trim() || !currentUserId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    try {
      // Call the real agent — main_agent routes to chat/data/report automatically
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userInput,
          sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error('Agent request failed');
      }

      const data = await res.json();

      const responseText =
        data.status === 'complete'
          ? data.response
          : data.reviewPayload?.sections?.body ?? 'Your report is ready for review.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseText ?? "I'm here to help! Could you tell me more?",
        timestamp: new Date(),
        suggestions: getSuggestions(data.agentType ?? null),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('[HealthChatbot] Agent error:', err);
      // ... error handling
    }
  };

  const handleSendEmailReport = async () => {
    if (!currentUserId) return;
    
    toast({
      title: "Generating Report",
      description: "AI is analyzing your wellness data...",
      variant: "info"
    });

    const draft = await sendEmailReport(sessionId);
    if (draft) {
      setEmailDraft(draft);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={cn('h-[600px] flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D3D3FF]/30 rounded-lg">
            <Leaf className="h-5 w-5 text-[#8A8AFF]" />
          </div>
          <div>
            <CardTitle className="text-lg">Health Assistant</CardTitle>
            <p className="text-sm text-slate-600">AI-powered health insights</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {emailDraft && (
            <div className="mx-auto w-full sticky top-0 z-50 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
               <EmailReviewPanel
                 initialSubject={emailDraft.subject}
                 initialBody={emailDraft.body}
                 evaluation={emailDraft.evaluation}
                 sessionId={emailDraft.sessionId}
                 onComplete={() => setEmailDraft(null)}
               />
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'bot' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-[#D3D3FF]/30 text-[#8A8AFF]">
                    <Leaf className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.type === 'user'
                    ? 'bg-[#D3D3FF] text-white'
                    : 'bg-slate-100 text-slate-800'
                )}
              >
                {/* Render each paragraph separately */}
                <div className="space-y-1">
                  {message.content.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">{line}</p>
                  ))}
                </div>

                {/* Suggestion chips */}
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#D3D3FF]/10 hover:border-[#D3D3FF] text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#D3D3FF]/30 text-[#8A8AFF]">
                  <Leaf className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex gap-1">
                  {[0, 100, 200].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health data…"
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping || !currentUserId}
              className="bg-[#D3D3FF] hover:bg-[#BDBDFE]"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSendEmailReport}
              disabled={isTyping || !currentUserId}
              className="border-[#D3D3FF]/50 text-[#8A8AFF] hover:bg-[#D3D3FF]/10"
              title="Send Wellness Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            Try: How is my health? · Make a report of today .I feel anxious
          </p>
        </div>

      </CardContent>
    </Card>
  );
}