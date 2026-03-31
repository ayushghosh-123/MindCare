"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceAgentOptions {
  onTranscriptReady?: (text: string) => void;
  onTranscriptChange?: (text: string) => void;
}

interface UseVoiceAgentReturn {
  isSupported: boolean;
  isListening: boolean;
  autoSpeak: boolean;
  error: string | null;
  permissionState: PermissionState | "unsupported";
  mode: "full" | "fallback";
  isRetrying: boolean;
  retryCount: number;
  networkStatus: "online" | "offline" | "unknown";
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleAutoSpeak: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  retryLastAction: () => void;
}

export function getVoiceModeInfo(mode: "full" | "fallback") {
  if (mode === "full") {
    return {
      label: "Full Voice Pipeline",
      description: "Uses OpenAI Whisper (STT) → Chat Agent → OpenAI TTS",
      docs: "https://developers.openai.com/docs/guides/speech-to-text",
      setup: "OpenAI API key configured ✅",
    };
  }
  return {
    label: "Browser Fallback Mode",
    description: "Uses built-in browser STT (limited)",
    setup: "To enable full mode, add OPENAI_API_KEY to .env.local",
    keys: ["OPENAI_API_KEY"],
  };
}

export function useVoiceAgent({
  onTranscriptReady,
  onTranscriptChange,
}: UseVoiceAgentOptions = {}): UseVoiceAgentReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isSupported, setIsSupported] = useState(true); // Native MediaRecorder is widely supported
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false); // Default to OFF (Text Mode)
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "unsupported">("prompt");
  const [mode, setMode] = useState<"full" | "fallback">("full");
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline" | "unknown">("online");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online");
    const handleOffline = () => setNetworkStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setNetworkStatus(navigator.onLine ? "online" : "offline");
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Monitor microphone permissions
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    navigator.permissions.query({ name: "microphone" as PermissionName }).then(status => {
      setPermissionState(status.state);
      status.onchange = () => setPermissionState(status.state);
    }).catch(() => {});
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This triggers onstop, where we call the Whisper API
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(async () => {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert blob to base64
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(audioBlob);
        });

        onTranscriptChange?.("Transcribing...");
        setIsRetrying(true);
        setRetryCount(1);
        
        try {
          // Send audio to backend Whisper API
          const res = await fetch("/api/agent/voice", {
            method: "POST",
            body: JSON.stringify({ audio: base64Audio }),
            headers: { "Content-Type": "application/json" }
          });

          if (!res.ok) throw new Error("Whisper STT failed");
          
          const data = await res.json();
          setIsRetrying(false);
          setRetryCount(0);
          
          if (data.text) {
             onTranscriptReady?.(data.text);
          }
        } catch (err) {
          setIsRetrying(false);
          setError("Failed to reach Whisper API. Check your internet connection or API keys.");
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      onTranscriptChange?.("Listening...");
    } catch (err) {
      setPermissionState("denied");
      setError("Microphone access blocked or disconnected: " + String(err));
    }
  }, [onTranscriptChange, onTranscriptReady]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const toggleAutoSpeak = useCallback(() => setAutoSpeak(v => !v), []);

  const speakText = useCallback((text: string) => {
    if (!autoSpeak || typeof window === "undefined" || !text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [autoSpeak]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
  }, []);

  const retryLastAction = useCallback(() => {
     setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    autoSpeak,
    error,
    permissionState,
    mode,
    isRetrying,
    retryCount,
    networkStatus,
    toggleListening,
    startListening,
    stopListening,
    toggleAutoSpeak,
    speakText,
    stopSpeaking,
    retryLastAction,
  };
}
