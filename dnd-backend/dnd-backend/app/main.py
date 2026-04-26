# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.graph.workflow import dungeon_master_app
from app.schema.player import ChatRequest
from langchain_community.llms import Ollama
from pydantic import BaseModel
from typing import Optional
import asyncio

app = FastAPI(title="Neuro-Symbolic D&D DM")

# Allow Next.js dev server and production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared LLM instance
llm = Ollama(model="phi3:mini", num_predict=150)


# ── /chat ─────────────────────────────────────────────────────────────────────

@app.post("/chat")
async def handle_turn(request: ChatRequest):
    """
    Accepts a list of messages + systemContext from the frontend.
    Runs the LangGraph workflow (Mechanic -> Chronicler -> Narrator).
    Streams the DM's narrative response as plain text chunks.
    """
    user_message = ""
    for msg in reversed(request.messages):
        if msg["role"] == "user":
            user_message = msg["content"]
            break

    history_text = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in request.messages[:-1]
    )

    graph_input = {
        "user_input": user_message,
        "game_state": {
            "system_context": request.systemContext or "",
            "conversation_history": history_text,
        },
        "logic_results": {},
        "world_context": "",
        "narrative": "",
        "history": [],
    }

    async def stream_narrative():
        final_output = await dungeon_master_app.ainvoke(graph_input)
        narrative: str = final_output.get("narrative", "")

        chunk_size = 50
        for i in range(0, len(narrative), chunk_size):
            yield narrative[i : i + chunk_size]
            await asyncio.sleep(0.01)

    return StreamingResponse(
        stream_narrative(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── /generate-background ──────────────────────────────────────────────────────

class BackgroundRequest(BaseModel):
    characterName: str
    characterClass: Optional[str] = None
    characterRace: Optional[str] = None
    type: str = "character"  # "character" | "companion"


@app.post("/generate-background")
async def generate_background(req: BackgroundRequest):
    """
    Generates a short D&D backstory for a character or companion.
    Called by the Next.js proxy route /api/generate-background.
    """
    if req.type == "companion":
        prompt = (
            f"Write a 2-sentence D&D backstory for a companion named {req.characterName}. "
            f"Be concise and atmospheric."
        )
    else:
        race = req.characterRace or "Human"
        cls = req.characterClass or "Adventurer"
        prompt = (
            f"Write a 2-sentence D&D backstory for a {race} {cls} named {req.characterName}. "
            f"Be concise and atmospheric."
        )

    background = llm.invoke(prompt)
    return {"background": background}


# ── /health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}