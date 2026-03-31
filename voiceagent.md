# Voice Agent Integration Guide

This document outlines the integration of the LangChain Voice Agent into the MindCare application, following the architectural patterns described in the [LangChain Voice Agent Documentation](https://docs.langchain.com/oss/javascript/langchain/voice-agent).

## Overview

The voice agent follows a three-stage pipeline (STT → Agent → TTS):
1. **Speech-to-Text (STT)**: Converts user's spoken audio into text transcripts.
2. **Chat Agent (Logic)**: Processes the transcript using the MindCare LangGraph agent.
3. **Text-to-Speech (TTS)**: Converts the agent's text response back into spoken audio.

## Components

### 1. `useVoiceAgent` Hook (`components/hooks/use-voice-agent.ts`)
The primary interface for voice interaction. It manages the following:
- Microphone permissions and browser support checks.
- Event-driven state updates (`isListening`, `isSpeaking`, `transcript`).
- Integration with the Chat Agent to send processed transcripts.

### 2. Voice Pipeline Agent (`agents/nodes/chat/chatNode.ts`)
The existing chat agent is used to process transcripts. The pipeline ensures that:
- Transcripts are processed as `stt_output` events.
- Agent responses are streamed or captured as `agent_chunk` events.

### 3. Voice API Route (`app/api/agent/voice/route.ts`)
Handles server-side processing for robust STT/TTS (currently configured for OpenAI Whisper and TTS).

## Data Flow

1. **User Speaks**: The browser captures audio and sends it to the STT processor.
2. **Transcript Event**: Once speech is detected and finalized, an `stt_output` event is emitted.
3. **Agent Process**: The transcript is passed to `useChat.sendMessage()`.
4. **Response Event**: The AI response triggers an `agent_chunk` event.
5. **Speech Playback**: The `speakText()` function converts the response to audio using TTS.

## Setup & Configuration

To enable the full voice pipeline, ensure the following environment variables are set:
- `OPENAI_API_KEY`: Required for Whisper STT and OpenAI TTS.

## Best Practices
- **Auto-Speak**: Spoken replies can be toggled to ensure user privacy in public spaces.
- **Visual Feedback**: The UI provides real-time updates on listening status and transcriptions.
- **Error Recovery**: Automatic retries and fallback to browser Web Speech API when the cloud pipeline is unavailable.
