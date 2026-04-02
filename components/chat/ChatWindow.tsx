// STEP 30 — components/chat/ChatWindow.tsx
// Main message area. Shows message history, typing indicator, and HITL panel.
// Voice: OpenAI Voice Pipeline (full) + browser fallback (free)

"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Chat } from "@/lib/supabase";
import { MessageBubble } from "./MessageBubble";
import { AgentReviewPanel } from "@/components/journal/AgentReviewPanel";
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
  reviewPayload: HumanReviewPayload | null;
  agentResult?: AgentCompleteResult | null;
  onApprove: (edited?: string) => void;
  onReject: () => void;
  onSendMessage: (text: string) => void;
}

export function ChatWindow({
  sessionName,
  messages,
  isSending,
  isLoading,
  agentStatus,
  reviewPayload,
  agentResult,
  onApprove,
  onReject,
  onSendMessage,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
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
    <div className="flex flex-col h-full bg-white relative">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[50vh]">
              <p className="text-sm text-gray-400 animate-pulse">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-center">
              <span className="text-4xl text-gray-300">👋</span>
              <p className="text-lg text-gray-700 font-medium">How can I help you today?</p>
              <p className="text-sm text-gray-500 max-w-sm">
                Ask about your wellness, share how you&apos;re feeling, or request a daily report.
              </p>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {/* Typing indicator */}
          {isSending && (
             <div className="flex justify-start mb-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm mr-4 shrink-0 shadow-sm">
                 🤖
               </div>
               <div className="bg-white border text-gray-800 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-2">
                 {[0, 150, 300].map((delay) => (
                   <span
                     key={delay}
                     className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                     style={{ animationDelay: `${delay}ms` }}
                   />
                 ))}
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-[5.5rem] md:pb-6 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          {/* Voice Mode Info - Show when in fallback */}
          {isFallbackMode && isVoiceSupported && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <p className="font-medium mb-1">Running in Browser Fallback Mode</p>
                  <p className="text-xs mb-2">To unlock the full OpenAI voice experience (Whisper STT → Agent → TTS), add this to <code className="bg-amber-100 px-1 rounded">.env.local</code>:</p>
                  <div className="bg-white p-2 rounded text-xs font-mono text-gray-700 mb-2">
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
                    <div className="text-xs mb-2 p-2 bg-white rounded border border-red-100">
                      <p className="font-medium text-red-700">📡 No Internet Connection</p>
                      <p className="mt-1">Check your network and try again.</p>
                    </div>
                  )}
                  {isRetrying && retryCount > 0 && (
                    <div className="text-xs mb-2 p-2 bg-white rounded border border-orange-100">
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

          <div className="relative flex items-end shadow-lg border border-gray-200 bg-white rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-200 focus-within:border-violet-400 transition-all">
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
              placeholder="Message Mindcare..."
              className="flex-1 max-h-50 text-base bg-transparent px-4 py-3.5 resize-none focus:outline-none placeholder:text-gray-400"
            />
            <div className="p-2 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={!isVoiceSupported || isSending}
                className={`p-2 rounded-xl border transition-colors ${
                  isListening
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                } disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-100`}
                title={
                  isVoiceSupported
                    ? isListening
                      ? "Stop voice input"
                      : "Start voice input"
                    : "Voice input is not supported in this browser"
                }
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleAutoSpeak}
                className={`p-2 rounded-xl border transition-colors ${
                  autoSpeak
                    ? "bg-violet-50 text-violet-600 border-violet-200"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
                title={autoSpeak ? "Mute spoken replies" : "Enable spoken replies"}
                aria-label={autoSpeak ? "Mute spoken replies" : "Enable spoken replies"}
              >
                {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Playback Controls (only visible when audio is playing or paused) */}
              {(isPlaying || lastSpokenResponseRef.current !== "") && autoSpeak && (
                 <button
                 type="button"
                 onClick={() => {
                   if (isPlaying) pauseSpeaking();
                   else if (lastSpokenResponseRef.current) resumeSpeaking();
                 }}
                 className="p-2 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 transition-colors"
                 title={isPlaying ? "Pause playback" : "Resume playback"}
               >
                 {isPlaying ? (
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                   </svg>
                 ) : (
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
                className="bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
                title="Send message"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M12 4L12 20M12 4L5.5 10.5M12 4L18.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">{voiceHintText}</p>
          {voiceError && (
            <p className="text-[11px] text-rose-500 mt-1 text-center">{voiceError}</p>
          )}
        </div>
      </div>
    </div>
  );
}