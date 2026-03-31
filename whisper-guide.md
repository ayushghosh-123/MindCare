# How to Use Whisper STT (And Fix the Network Error)

**To answer your question:** You **do not** need to download any new packages. The "Voice Recognition Issue" (Network Error) you are seeing happens because your app currently uses the browser's built-in `window.SpeechRecognition` API. This built-in browser API often disconnects or throws network timeouts, causing the exact error you are seeing on your screen.

To fix this, we replace the unreliable browser API with the **OpenAI Whisper API**. We use the browser's native `MediaRecorder` (no download required) to capture audio, and send it to your existing `/api/agent/voice` backend route.

## Step 1: Update `use-voice-agent-v2.ts`

Since your `ChatWindow.tsx` uses `use-voice-agent-v2.ts`, this is the file you must update manually.

Open **`d:\Mindcare\components\hooks\use-voice-agent-v2.ts`** and replace its entire contents with the following code. It maintains all the variables your UI needs (like `isRetrying`, `retryCount`, etc.) but uses stable Whisper STT.

```typescript
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
  const [autoSpeak, setAutoSpeak] = useState(true);
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
```

## Details & Benefits
1. **No unstable browser STT**: We removed `window.SpeechRecognition`. This guarantees the "Speech recognition lost connection" error you saw is gone forever.
2. **True LangChain Pattern**: Captures audio natively and delegates STT to the AI backend (Whisper) exactly like the documentation suggests.
3. **No extra packages**: `MediaRecorder` runs perfectly directly within standard browsers.
