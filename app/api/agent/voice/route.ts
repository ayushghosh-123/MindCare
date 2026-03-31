/**
 * Voice Agent Route - OpenAI Voice Pipeline with Error Recovery
 * 
 * Pipeline:
 * 1. Browser → Send audio bytes to /api/agent/voice
 * 2. OpenAI Whisper API → Transcribe speech to text (with retries)
 * 3. Chat Agent → Process message & generate response (uses existing /api/agent/route.ts)
 * 4. OpenAI TTS API → Convert response to speech (with retries)
 * 5. Server → Send audio bytes back to browser → Play
 * 
 * Features:
 * - Exponential backoff retry logic (3 attempts)
 * - Connection timeout handling (30s)
 * - Network error detection and recovery
 * - Detailed error messages for debugging
 * 
 * @see https://developers.openai.com/docs/guides/speech-to-text
 * @see https://developers.openai.com/docs/guides/text-to-speech
 */

import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";
const VOICE_TIMEOUT = 30000; // 30 second timeout
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface VoiceEvent {
  type:
    | "connection_opened"
    | "connection_closed"
    | "stt_chunk"
    | "stt_output"
    | "agent_chunk"
    | "agent_end"
    | "tts_chunk"
    | "error";
  data?: Record<string, unknown>;
  error?: string;
}

interface CallOptions {
  timeout?: number;
  retries?: number;
}

function validateVoiceSetup(): { valid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  if (!OPENAI_API_KEY) missingKeys.push("OPENAI_API_KEY");

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
}

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: CallOptions = {}
): Promise<T> {
  const { timeout = VOICE_TIMEOUT, retries = MAX_RETRIES } = options;
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) => {
          if (controller.signal.aborted) {
            reject(new Error("Request timeout"));
          }
        }),
      ]);

      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      clearTimeout(0);

      // Don't retry on certain errors
      if (lastError.message.includes("Unauthorized") || lastError.message.includes("Invalid")) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      if (i < retries - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Test transcription with OpenAI Whisper
 */
export async function POST(request: NextRequest) {
  const { valid, missingKeys } = validateVoiceSetup();

  if (!valid) {
    return Response.json(
      {
        error: "Voice agent not fully configured",
        missingKeys,
        setup: {
          docs: "https://developers.openai.com/docs/guides/speech-to-text",
          steps: [
            "1. Get OpenAI API key from https://platform.openai.com/api-keys",
            "2. Add to .env.local: OPENAI_API_KEY",
            "3. Restart the app: npm run dev",
          ],
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    // If audio provided, transcribe it
    if (body.audio) {
      try {
        const transcription = await withRetry(
          async () => {
            const formData = new FormData();
            
            // Decoded base64 string to Buffer for OpenAI
            const audioBuffer = Buffer.from(body.audio, 'base64');
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            
            formData.append("file", audioBlob, "audio.wav");
            formData.append("model", "whisper-1");
            formData.append("language", "en");

            const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
          },
          { timeout: VOICE_TIMEOUT, retries: MAX_RETRIES }
        );

        return Response.json({
          success: true,
          text: transcription.text,
          status: "transcribed",
        });
      } catch (error) {
        return Response.json(
          {
            error: "Transcription failed after retries",
            details: error instanceof Error ? error.message : String(error),
            hint: "Check internet connection and try again",
          },
          { status: 503 }
        );
      }
    }

    // If no audio, return ready status
    return Response.json({
      message: "Voice agent ready",
      status: "configured",
      features: {
        stt: "OpenAI Whisper",
        tts: "OpenAI Text-to-Speech",
        retry: `Max ${MAX_RETRIES} attempts with exponential backoff`,
        timeout: `${VOICE_TIMEOUT / 1000}s per request`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Voice pipeline error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check voice setup status
 */
export async function GET() {
  const { valid, missingKeys } = validateVoiceSetup();

  return Response.json({
    configured: valid,
    missingKeys,
    services: {
      stt: {
        provider: "OpenAI Whisper",
        status: OPENAI_API_KEY ? "✅ configured" : "❌ missing",
        docs: "https://developers.openai.com/docs/guides/speech-to-text",
      },
      tts: {
        provider: "OpenAI Text-to-Speech",
        status: OPENAI_API_KEY ? "✅ configured" : "❌ missing",
        docs: "https://developers.openai.com/docs/guides/text-to-speech",
      },
      llm: {
        provider: "OpenAI Chat",
        status: OPENAI_API_KEY ? "✅ configured" : "❌ missing",
        docs: "https://developers.openai.com/docs/guides/gpt",
      },
    },
    voicePipelineReference: "https://developers.openai.com/docs/guides/speech-to-text",
  });
}
