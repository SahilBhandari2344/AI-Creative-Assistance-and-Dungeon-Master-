# app/agents/narrator.py

from app.graph.state import AgentState
from langchain_community.llms import Ollama

llm = Ollama(model="phi3:mini")


async def narrator_node(state: AgentState) -> dict:
    system_context: str = state["game_state"].get("system_context", "")
    history: str = state["game_state"].get("conversation_history", "")

    short_history = history[-300:] if len(history) > 300 else history

    # Translate mechanic results to plain English — never expose raw dict to LLM
    logic = state["logic_results"]
    action_type = logic.get("action_type", "other")
    success = logic.get("success", True)
    dice_roll = logic.get("dice_roll")
    target_id = logic.get("target_id")

    mechanic_parts = [f"The player attempted a {action_type} action"]
    if target_id:
        mechanic_parts.append(f"targeting {target_id}")
    mechanic_parts.append("which" + (" succeeded" if success else " failed"))
    if dice_roll is not None:
        mechanic_parts.append(f"(roll: {dice_roll})")
    mechanic_summary = " ".join(mechanic_parts) + "."

    system_prompt = f"""You are a D&D Dungeon Master. Be brief and clear.
{system_context}

OUTCOME: {mechanic_summary}
WORLD CONTEXT: {state['world_context']}
RECENT HISTORY: {short_history}

RULES — follow exactly:
- Write EXACTLY 2 sentences of narration. No more.
- Use present tense and second person ("You see...", "You hear...")
- Never use made-up words. Use only real English words.
- Never mention JSON, dice rolls, or game mechanics.
- After narration, ONE companion may speak. Format: **Name**: "short quote"
- Never write more than one companion line.
- Never add descriptions inside companion lines, only dialogue in quotes.
- End your response cleanly. No trailing symbols or brackets.
"""

    response = llm.invoke(
        system_prompt + f"\n\nPlayer says: {state['user_input']}"
    )

    response = response.strip().rstrip("}")

    return {"narrative": response}


async def proxy_node(state: AgentState) -> dict:
    """AI-controlled party member decides and acts."""
    party = state["game_state"].get("party", [])
    proxy_players = [p for p in party if p.get("is_ai_proxy")]

    if not proxy_players:
        return state  # type: ignore[return-value]

    active_player = proxy_players[0]

    prompt = f"""You are D&D character: {active_player['name']}.
Personality: {active_player.get('persona_profile', 'Brave and curious')}
Situation: {state['narrative']}

What do you do? Reply in 1 sentence only, in character.
"""

    response = llm.invoke(prompt)
    state["history"].append(f"{active_player['name']}: {response}")
    return state  # type: ignore[return-value]