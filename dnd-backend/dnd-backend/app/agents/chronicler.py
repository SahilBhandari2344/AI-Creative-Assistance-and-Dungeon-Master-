# app/agents/chronicler.py

import os
from app.graph.state import AgentState

# Neo4j is optional — the graph still works without it
try:
    from neo4j import GraphDatabase
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    NEO4J_AVAILABLE = True
except Exception:
    driver = None
    NEO4J_AVAILABLE = False


async def chronicler_node(state: AgentState) -> dict:
    """
    Retrieves world/lore context for the target entity from Neo4j.
    Falls back to an empty context string if Neo4j is not configured.
    """
    if not NEO4J_AVAILABLE or driver is None:
        return {"world_context": ""}

    target = state["logic_results"].get("target_id")
    if not target:
        return {"world_context": ""}

    query = """
    MATCH (t:Entity {id: $target_id})-[:ALLEGIANCE_TO]->(f:Faction)
    MATCH (f)-[:ENEMIES_WITH]->(p_faction:Faction)
    RETURN f.name AS faction, p_faction.name AS enemy_faction
    """

    try:
        with driver.session() as session:
            result = session.run(query, target_id=target).single()

        context = ""
        if result:
            context = (
                f"The target belongs to {result['faction']}, "
                f"who are bitter rivals with {result['enemy_faction']}."
            )
        return {"world_context": context}
    except Exception:
        # Neo4j query failed — continue without lore context
        return {"world_context": ""}
