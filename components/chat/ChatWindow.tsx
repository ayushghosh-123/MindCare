// STEP 30 — components/chat/ChatWindow.tsx
// Main message area. Shows message history, typing indicator, and HITL panel.
// Voice: OpenAI Voice Pipeline (full) + browser fallback (free)

"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Mail } from "lucide-react";
import { Chat } from "@/lib/supabase";
import { MessageBubble } from "./MessageBubble";
import { AgentReviewPanel } from "@/components/journal/AgentReviewPanel";
import { EmailReviewPanel } from "@/components/EmailReviewPanel";
import { useVoiceAgent, getVoiceModeInfo } from "@/components/hooks/use-voice-agent-v2";
import type { HumanReviewPayload } from "@/agents/nodes/evaluateAgent";

interface AgentCompleteResult {
  response: string;
  sentiment: string | null;
  agentType: string | null;
  emailSent: boolean;
  email?: string | null;
}

interface ChatWindowProps {
  sessionName: string;
  messages: Chat[];
  isSending: boolean;
  isLoading: boolean;
  agentStatus: string;
  currentStage: string | null;
  reviewPayload: HumanReviewPayload | null;
  agentResult?: AgentCompleteResult | null;
  onApprove: (edited?: string) => void;
  onReject: () => void;
  onSendMessage: (text: string) => void;
  onSendEmailReport?: () => Promise<{ sessionId: string; subject: string; body: string; evaluation?: any } | null>;
}

export function ChatWindow({
  sessionName,
  messages,
  isSending,
  isLoading,
  agentStatus,
  currentStage,
  reviewPayload,
  agentResult,
  onApprove,
  onReject,
  onSendMessage,
  onSendEmailReport,
}: ChatWindowProps) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [emailDraft, setEmailDraft] = useState<{
    sessionId: string;
    subject: string;
    body: string;
    evaluation?: any;
    error?: string | null;
  } | null>(null);

  const [voiceMode, setVoiceMode] = useState<"full" | "fallback">("fallback");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSpokenResponseRef = useRef("");

  const {
    isSupported: isVoiceSupported,
    isListening,
    autoSpeak,
    error: voiceError,
    permissionState,
    mode,
    isRetrying,
    retryCount,
    networkStatus,
    isPlaying,
    toggleListening,
    startListening,
    stopListening,
    toggleAutoSpeak,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    retryLastAction,
  } = useVoiceAgent({
    onTranscriptChange: (transcript) => setInput(transcript),
    onTranscriptReady: (transcript) => {
      if (isSending) return;
      onSendMessage(transcript);
      setInput("");
    },
  });

  useEffect(() => {
    setVoiceMode(mode);
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatus]);

  useEffect(() => {
    if (isListening) {
      stopSpeaking();
    }
  }, [isListening, stopSpeaking]);

  useEffect(() => {
    if (!agentResult?.response || isListening) return;
    if (agentResult.response === lastSpokenResponseRef.current) return;

    speakText(agentResult.response);
    lastSpokenResponseRef.current = agentResult.response;
  }, [agentResult?.response, isListening, speakText]);

  function handleSend() {
    if (!input.trim() || isSending) return;
    if (isListening) stopListening();
    stopSpeaking();
    onSendMessage(input.trim());
    setInput("");
  }

  const voiceHintText = isListening
    ? "Listening now… speak naturally and your message will send when you stop."
    : !isVoiceSupported
      ? "Voice chat works in supported Chromium-based browsers like Chrome or Edge."
      : permissionState === "denied"
        ? "Microphone access is blocked. Click the lock icon in the address bar → allow Microphone → reload the page."
        : "";

  const modeInfo = getVoiceModeInfo(voiceMode);
  const isFallbackMode = voiceMode === "fallback";

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] relative">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[40vh] sm:h-[50vh]">
              <p className="text-sm text-gray-400 animate-pulse">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40dvh] sm:h-[50dvh] gap-4 sm:gap-6 text-center animate-in fade-in zoom-in duration-1000">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-2xl flex items-center justify-center relative">
                <span className="text-3xl sm:text-4xl">🕊️</span>
                <div className="absolute inset-0 bg-[#bdb2ff] rounded-full animate-ping opacity-10"></div>
              </div>
              <div className="px-4">
                <h3 className="text-2xl sm:text-4xl font-black text-[#1b0c53] tracking-tighter font-['Plus_Jakarta_Sans'] leading-tight mb-2 sm:mb-4">
                  Welcome to MindCare.
                </h3>
                <p className="text-base sm:text-xl text-[#5f559a]/60 font-medium italic">
                  I am here to hold space for your thoughts{user?.firstName ? `, ${user.firstName}` : ""}.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {/* Email Review Panel */}
          {emailDraft && (
            <div className="flex justify-center my-6 sticky top-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
               <EmailReviewPanel
                 initialSubject={emailDraft.subject}
                 initialBody={emailDraft.body}
                 evaluation={emailDraft.evaluation}
                 sessionId={emailDraft.sessionId}
                 error={emailDraft.error}
                 onComplete={() => setEmailDraft(null)}
               />
            </div>
          )}

          {/* Typing indicator */}
          {isSending && (
             <div className="flex justify-start mb-10 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 pl-2 sm:pl-4">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center text-base sm:text-lg mr-3 sm:mr-6 shrink-0 shadow-xl shadow-[#2C2A4A]/5">
                 ✨
               </div>
               <div className="bg-[#f3f3f3] rounded-[1.5rem] sm:rounded-[2rem] px-5 sm:px-8 py-3 sm:py-5 shadow-inner flex flex-col gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
                 <div className="flex items-center gap-2">
                   {[0, 150, 300].map((delay) => (
                     <span
                       key={delay}
                       className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#bdb2ff] rounded-full animate-bounce"
                       style={{ animationDelay: `${delay}ms` }}
                     />
                   ))}
                 </div>
                 {/* Progress Stage Message */}
                 <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 animate-pulse">
                    {currentStage || "Active Reasoning..."}
                 </p>
               </div>
             </div>
          )}

          {/* Agent HITL / Review Panel — Persists after completion as a receipt */}
          {(agentStatus === "interrupted" || agentStatus === "resuming" || agentStatus === "complete") && reviewPayload && (
            <div className="mt-6 mb-8">
              <AgentReviewPanel
                payload={reviewPayload}
                isResuming={agentStatus === "resuming"}
                isComplete={agentStatus === "complete"}
                result={agentResult}
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f9f9f9] via-white to-transparent pt-6 pb-[5.5rem] md:pb-6 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          {/* Voice Mode Info - Show when in fallback */}
          {isFallbackMode && isVoiceSupported && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <p className="font-medium mb-1">Running in Browser Fallback Mode</p>
                  <p className="text-xs mb-2">To unlock the full OpenAI voice experience (Whisper STT → Agent → TTS), add this to <code className="bg-amber-100 px-1 rounded">.env.local</code>:</p>
                  <div className="bg-[#F8F8FF] p-2 rounded text-xs font-mono text-gray-700 mb-2">
                    <div>OPENAI_API_KEY=your_api_key_here</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">Get your OpenAI API key</a></p>
                    <p className="mt-2">Then restart: <code className="bg-amber-100 px-1 rounded">npm run dev</code></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Error Alert - Show when voice error occurs */}
          {voiceError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-red-900 flex-1">
                  <p className="font-medium mb-1">Voice Recognition Issue</p>
                  <p className="text-xs mb-3">{voiceError}</p>
                  {networkStatus === "offline" && (
                    <div className="text-xs mb-2 p-2 bg-[#f9f9f9] rounded border border-red-100">
                      <p className="font-medium text-red-700">📡 No Internet Connection</p>
                      <p className="mt-1">Check your network and try again.</p>
                    </div>
                  )}
                  {isRetrying && retryCount > 0 && (
                    <div className="text-xs mb-2 p-2 bg-[#f9f9f9] rounded border border-orange-100">
                      <p className="font-medium text-orange-700">🔄 Auto-retrying ({retryCount}/3)…</p>
                    </div>
                  )}
                  {!isRetrying && networkStatus !== "offline" && retryCount > 0 && (
                    <button
                      onClick={retryLastAction}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Retry Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat input box wrapper */}
          <div className="relative flex items-end shadow-2xl shadow-[#2C2A4A]/10 bg-white/90 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 border border-[#5f559a]/10 focus-within:border-[#5f559a]/30 focus-within:shadow-[#5f559a]/15 transition-all duration-500 group">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.currentTarget.style.height = 'auto';
                }
              }}
              placeholder="Speak with MindCare..."
              className="flex-1 max-h-30 text-base sm:text-lg font-medium bg-transparent px-5 sm:px-7 py-4 sm:py-5 resize-none focus:outline-none placeholder:text-[#5f559a]/30 text-[#1a1c1c]"
            />
            <div className="p-1 sm:p-2 flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={!isVoiceSupported || isSending}
                className={`p-2.5 sm:p-3 rounded-full border transition-all duration-300 ${
                  isListening
                    ? "bg-[#bdb2ff]/20 text-[#5f559a] border-[#5f559a]/30 shadow-inner"
                    : "bg-transparent text-slate-500 border-transparent hover:bg-[#f9f9f9] hover:text-[#5f559a]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  isVoiceSupported
                    ? isListening
                      ? "Stop voice input"
                      : "Start voice input"
                    : "Voice input is not supported in this browser"
                }
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleAutoSpeak}
                className={`p-2.5 sm:p-3 rounded-full border transition-all duration-300 ${
                  autoSpeak
                    ? "bg-[#bdb2ff]/20 text-[#5f559a] border-[#5f559a]/30"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-[#f9f9f9] hover:text-slate-600"
                }`}
                title={autoSpeak ? "Mute spoken replies" : "Enable spoken replies"}
                aria-label={autoSpeak ? "Mute spoken replies" : "Enable spoken replies"}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Playback Controls (only visible when audio is playing or paused) */}
              {(isPlaying || lastSpokenResponseRef.current !== "") && autoSpeak && (
                 <button
                 type="button"
                 onClick={() => {
                   if (isPlaying) pauseSpeaking();
                   else if (lastSpokenResponseRef.current) resumeSpeaking();
                 }}
                 className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 transition-colors"
                 title={isPlaying ? "Pause playback" : "Resume playback"}
               >
                 {isPlaying ? (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                   </svg>
                 ) : (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M8 5v14l11-7z" />
                   </svg>
                 )}
               </button>
              )}


              <button
                type="button"
                onClick={() => {
                  handleSend();
                  const ta = document.querySelector("textarea");
                  if (ta) ta.style.height = "auto";
                }}
                disabled={isSending || !input.trim()}
                className="bg-[#5f559a] hover:bg-[#1b0c53] hover:scale-110 active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl shadow-[#5f559a]/30 disabled:scale-100 disabled:bg-[#f3f3f3] disabled:text-[#5f559a]/20 transition-all duration-500 flex items-center justify-center ml-1 sm:ml-2"
                title="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path d="M12 4L12 20M12 4L5.5 10.5M12 4L18.5 10.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">{voiceHintText}</p>
          {voiceError && (
            <p className="text-[11px] text-[#5f559a] mt-1 text-center">{voiceError}</p>
          )}
        </div>
      </div>
    </div>
  );
}