"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice Agent Events - Matches LangChain Voice Pipeline Pattern
 * @see https://docs.langchain.com/oss/javascript/langchain/voice-agent
 */
export type VoiceAgentEvent =
  | { type: "stt_chunk"; transcript: string; ts: number }
  | { type: "stt_output"; transcript: string; ts: number }
  | { type: "agent_chunk"; text: string; ts: number }
  | { type: "tts_chunk"; audio: string; ts: number }
  | { type: "error"; message: string; ts: number };

interface UseVoiceAgentOptions {
  onTranscriptReady?: (text: string) => void;
  onTranscriptChange?: (text: string) => void;
  onEvent?: (event: VoiceAgentEvent) => void;
}

interface UseVoiceAgentReturn {
  isSupported: boolean;
  isListening: boolean;
  autoSpeak: boolean;
  error: string | null;
  permissionState: PermissionState | "unsupported";
  mode: "full" | "fallback";
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleAutoSpeak: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

/**
 * Robust Voice Agent Hook - Integrated with Brain (Whisper STT → Agent → Browser TTS)
 */
export function useVoiceAgent({
  onTranscriptReady,
  onTranscriptChange,
  onEvent,
}: UseVoiceAgentOptions = {}): UseVoiceAgentReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "unsupported">("prompt");
  const [mode, setMode] = useState<"full" | "fallback">("full");

  // Helper to emit events and trigger callbacks
  const processEvent = useCallback((event: VoiceAgentEvent) => {
    onEvent?.(event);
    if (event.type === "stt_output") {
      onTranscriptReady?.(event.transcript);
    }
    if (event.type === "stt_chunk") {
      onTranscriptChange?.(event.transcript);
    }
    if (event.type === "error") {
      setError(event.message);
    }
  }, [onEvent, onTranscriptReady, onTranscriptChange]);

  // Support check
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported(!!navigator.mediaDevices?.getUserMedia && !!window.MediaRecorder);
  }, []);

  // Monitor permission state
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    navigator.permissions.query({ name: "microphone" as PermissionName }).then((status) => {
      setPermissionState(status.state);
      status.onchange = () => setPermissionState(status.state);
    }).catch(() => {});
  }, []);

  const stopListening = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState("granted");
      setError(null);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Pipeline: Send to Whisper STT API
        try {
          const res = await fetch("/api/agent/voice", {
            method: "POST",
            body: JSON.stringify({ audio: await blobToBase64(audioBlob) }),
            headers: { "Content-Type": "application/json" }
          });

          if (!res.ok) throw new Error("STT failed");
          
          const data = await res.json();
          if (data.text) {
            processEvent({ type: "stt_output", transcript: data.text, ts: Date.now() });
          } else if (data.events) {
            data.events.forEach((e: VoiceAgentEvent) => processEvent(e));
          }
        } catch (err) {
          processEvent({ type: "error", message: "Voice recognition failed. Check your network.", ts: Date.now() });
        }

        // Clean up tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      processEvent({ type: "stt_chunk", transcript: "Listening...", ts: Date.now() });

    } catch (err) {
      setPermissionState("denied");
      setError("Microphone access denied or not found.");
    }
  }, [isSupported, processEvent]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const toggleAutoSpeak = useCallback(() => setAutoSpeak(v => !v), []);

  const speakText = useCallback((text: string) => {
    if (!autoSpeak || typeof window === "undefined" || !text.trim()) return;

    processEvent({ type: "agent_chunk", text, ts: Date.now() });

    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    
    processEvent({ type: "tts_chunk", audio: "browser", ts: Date.now() });
  }, [autoSpeak, processEvent]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
  }, []);

  return {
    isSupported,
    isListening,
    autoSpeak,
    error,
    permissionState,
    mode,
    toggleListening,
    startListening,
    stopListening,
    toggleAutoSpeak,
    speakText,
    stopSpeaking,
  };
}

// Utility to convert blob to base64 for JSON transport
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
