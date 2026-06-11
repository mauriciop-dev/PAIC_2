import asyncio
import httpx
import os
from datetime import datetime

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
GRAN_HERMANO_URL = os.getenv("GRAN_HERMANO_URL", "http://localhost:3001")
AGENT_ID = os.getenv("AGENT_ID", "")


async def check_latency():
    start = datetime.now()
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{SUPABASE_URL}/rest/v1/health", timeout=5.0)
        latency = (datetime.now() - start).total_seconds() * 1000
        return {"status": "ok", "latency_ms": int(latency)}
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def report_health(status: dict):
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{GRAN_HERMANO_URL}/api/agents/health",
            json={"agent_id": AGENT_ID, **status},
        )


async def sre_loop():
    while True:
        status = await check_latency()
        await report_health(status)
        await asyncio.sleep(60)


if __name__ == "__main__":
    asyncio.run(sre_loop())
