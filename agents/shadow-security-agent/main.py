import asyncio
import httpx
import os
from datetime import datetime, timedelta

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
GRAN_HERMANO_URL = os.getenv("GRAN_HERMANO_URL", "http://localhost:3001")
AGENT_ID = os.getenv("AGENT_ID", "")


async def check_rls_isolation() -> list:
    alerts = []
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{SUPABASE_URL}/rest/v1/rpc/check_rls",
                headers={"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"},
                timeout=10.0,
            )
        if r.status_code != 200:
            alerts.append(
                {
                    "type": "rls_check_failed",
                    "severity": "alta",
                    "message": f"RLS check returned {r.status_code}",
                }
            )
    except Exception as e:
        alerts.append({"type": "rls_error", "severity": "critica", "message": str(e)})
    return alerts


async def security_loop():
    while True:
        alerts = await check_rls_isolation()

        async with httpx.AsyncClient() as client:
            for alert in alerts:
                await client.post(
                    f"{GRAN_HERMANO_URL}/api/agents/alert",
                    json={
                        "agent_id": AGENT_ID,
                        **alert,
                        "timestamp": datetime.now().isoformat(),
                    },
                )

        await asyncio.sleep(600)


if __name__ == "__main__":
    asyncio.run(security_loop())
