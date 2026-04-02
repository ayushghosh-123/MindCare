import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json(
      { error: "OpenAI API key missing" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { text, voice = "nova" } = body;

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS Error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
