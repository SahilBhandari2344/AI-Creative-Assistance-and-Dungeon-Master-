// src/lib/api.ts
//
// All DM AI calls go to the FastAPI backend (Python / LangGraph).
// Import from this file instead of gemini.ts everywhere in the app.

export interface DMMessage {
  role: 'user' | 'model';
  content: string;
}

// Point at the FastAPI server. In development this is localhost:8000.
// Set NEXT_PUBLIC_API_URL in .env.local for other environments.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── System context builder ────────────────────────────────────────────────────

export function buildSystemContext(
  character: {
    name: string;
    race: string;
    class: string;
    level: number;
    background?: string;
    trait?: string;
    flaw?: string;
    skills?: string[];
    companions?: Array<{ name: string; personality: string }>;
  },
  adventure: { title: string; prompt: string }
): string {
  return `Character: ${character.name} (Level ${character.level} ${character.race} ${character.class})
Background: ${character.background || 'Unknown'}
Personality Trait: ${character.trait || 'Unknown'}
Flaw: ${character.flaw || 'None'}
Key Skills: ${character.skills?.join(', ') || 'Standard'}

Adventure: ${adventure.title}
${adventure.prompt}

Companions:
${
  character.companions?.map(c => `- ${c.name}: ${c.personality}`).join('\n') ||
  '- Thorin, Elena, Finn'
}

CRITICAL: Format ALL companion dialogue EXACTLY as:
**Name**: "dialogue here"
Example: **Thorin**: "Let's move, we're wasting daylight!"`;
}

// ── Main streaming call ───────────────────────────────────────────────────────

/**
 * Sends the conversation to the FastAPI /chat endpoint and returns
 * a ReadableStream reader that yields plain-text chunks — exactly
 * what ChatInterface.tsx's streamDMResponse() already expects.
 */
export async function sendDMMessage(
  messages: DMMessage[],
  systemContext?: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemContext }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`DM API error ${response.status}: ${text}`);
  }

  if (!response.body) {
    throw new Error('DM API returned no body');
  }

  return response.body.getReader();
}

// ── Background generation ─────────────────────────────────────────────────────

/**
 * Generates a character/companion backstory via the Next.js proxy route,
 * which in turn calls the FastAPI /generate-background endpoint.
 * The route is kept server-side to protect any API keys.
 */
export async function generateBackground(params: {
  characterName: string;
  characterClass?: string;
  characterRace?: string;
  type: 'character' | 'companion';
}): Promise<string> {
  const response = await fetch('/api/generate-background', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Background generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.background as string;
}
