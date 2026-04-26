# app/agents/mechanic.py

import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_community.llms import Ollama
from app.graph.state import AgentState

llm = Ollama(model="phi3:mini", format="json")

MECHANIC_PROMPT = """You are the D&D 5e Mechanic. Analyze the user's input against the current game state.
Output ONLY a valid JSON object with these keys:
- "action_type": string (e.g. "attack", "move", "skill_check", "roleplay", "other")
- "dice_roll": integer (simulate a 1d20 roll, 1-20)
- "success": boolean (based on D&D 5e logic and the roll)
- "state_updates": object (e.g. {"enemy_hp": 10}) — use empty object {} if none
- "target_id": string or null (NPC/enemy identifier if applicable)
"""


async def mechanic_node(state: AgentState) -> dict:
    """
    Validates the player's action against D&D 5e rules and produces
    a structured logic result for the downstream agents.
    """
    response = llm.invoke([
        SystemMessage(content=MECHANIC_PROMPT),
        HumanMessage(
            content=f"Game State: {json.dumps(state['game_state'])}\nPlayer Input: {state['user_input']}"
        ),
    ])

    # Safely parse — fall back to a neutral result if the LLM output is malformed
    try:
        logic_data = json.loads(response)
    except (json.JSONDecodeError, TypeError):
        logic_data = {
            "action_type": "other",
            "dice_roll": 10,
            "success": True,
            "state_updates": {},
            "target_id": None,
        }

    return {"logic_results": logic_data}
