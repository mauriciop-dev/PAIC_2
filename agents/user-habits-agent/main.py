import asyncio
import httpx
import os
from datetime import datetime

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
GRAN_HERMANO_URL = os.getenv("GRAN_HERMANO_URL", "http://localhost:3001")
AGENT_ID = os.getenv("AGENT_ID", "")


async def analyze_usage_patterns():
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/get_usage_stats",
                headers={"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"},
                json={"days": 7},
                timeout=10.0,
            )
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return {}


async def habits_loop():
    while True:
        stats = await analyze_usage_patterns()

        async with httpx.AsyncClient() as client:
            await client.post(
                f"{GRAN_HERMANO_URL}/api/agents/health",
                json={
                    "agent_id": AGENT_ID,
                    "status": "ok",
                    "stats": stats,
                    "timestamp": datetime.now().isoformat(),
                },
            )

        await asyncio.sleep(3600)


if __name__ == "__main__":
    asyncio.run(habits_loop())
