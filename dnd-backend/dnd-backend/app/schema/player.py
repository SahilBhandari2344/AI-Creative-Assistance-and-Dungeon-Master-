# app/schema/player.py

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ── Message shape from the frontend ──────────────────────────────────────────

class ChatMessage(BaseModel):
    """Single turn in the conversation, matching the frontend DMMessage type."""
    role: str  # "user" | "model"  (frontend also sends "dm" — treated as "model")
    content: str


class ChatRequest(BaseModel):
    """
    Payload sent by the frontend's sendDMMessage() call in src/lib/api.ts.
    Shape: { messages: DMMessage[], systemContext?: string }
    """
    messages: List[Dict[str, str]]  # keep as dict so role values stay flexible
    systemContext: Optional[str] = None


# ── In-game entity models (used by agents internally) ────────────────────────

class Stats(BaseModel):
    hp: int
    max_hp: int
    ac: int
    strength: int
    dexterity: int
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10


class Player(BaseModel):
    id: str
    name: str
    is_ai_proxy: bool = False
    stats: Stats
    inventory: List[str] = []
    persona_profile: str = Field(default="", description="Traits for the Proxy Agent to mimic")


class GameState(BaseModel):
    """Full structured game state — used internally and for future /state endpoint."""
    game_id: str
    current_location: str
    party: List[Player]
    combat_active: bool = False
    turn_index: int = 0
