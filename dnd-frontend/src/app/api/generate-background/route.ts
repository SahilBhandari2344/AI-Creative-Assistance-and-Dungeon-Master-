// src/app/api/generate-background/route.ts
//
// Server-side proxy so the FastAPI backend URL is never exposed to the browser.
// The FastAPI server must expose a POST /generate-background endpoint.
// If it doesn't yet, see the note at the bottom of this file.

import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL ?? 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE}/generate-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Backend generate-background error:', response.status, text);
      return NextResponse.json(
        { error: 'Failed to generate background' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Background generation proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate background' },
      { status: 500 }
    );
  }
}

/*
  NOTE: You need to add a POST /generate-background endpoint to the FastAPI backend.
  Example addition to app/main.py:

  class BackgroundRequest(BaseModel):
      characterName: str
      characterClass: Optional[str] = None
      characterRace: Optional[str] = None
      type: str = "character"   # "character" | "companion"

  @app.post("/generate-background")
  async def generate_background(req: BackgroundRequest):
      from langchain_community.llms import Ollama
      llm = Ollama(model="qwen2:1.5b")
      if req.type == "companion":
          prompt = f"Write a 2-3 sentence D&D backstory for a companion named {req.characterName}."
      else:
          prompt = (
              f"Write a 2-3 sentence D&D backstory for a {req.characterRace} {req.characterClass} "
              f"named {req.characterName}."
          )
      background = llm.invoke(prompt)
      return {"background": background}
*/
