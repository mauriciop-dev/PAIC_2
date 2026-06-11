import asyncio
import httpx
import os
from datetime import datetime

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
GRAN_HERMANO_URL = os.getenv("GRAN_HERMANO_URL", "http://localhost:3001")
AGENT_ID = os.getenv("AGENT_ID", "")

TEST_SUITES = [
    {"name": "login_flow", "endpoint": "/api/health", "method": "GET"},
    {
        "name": "chat_endpoint",
        "endpoint": "/api/chat",
        "method": "POST",
        "body": {"message": "test"},
    },
]


async def run_test(test: dict) -> dict:
    start = datetime.now()
    try:
        async with httpx.AsyncClient() as client:
            method = getattr(client, test["method"].lower())
            kwargs = {"url": f"{SUPABASE_URL}{test['endpoint']}"}
            if test.get("body"):
                kwargs["json"] = test["body"]
            r = await method(**kwargs, timeout=10.0)
        elapsed = (datetime.now() - start).total_seconds() * 1000
        return {
            "test": test["name"],
            "passed": r.status_code < 500,
            "status_code": r.status_code,
            "latency_ms": int(elapsed),
        }
    except Exception as e:
        return {"test": test["name"], "passed": False, "error": str(e)}


async def qa_loop():
    while True:
        results = await asyncio.gather(*[run_test(t) for t in TEST_SUITES])
        failed = [r for r in results if not r["passed"]]

        async with httpx.AsyncClient() as client:
            await client.post(
                f"{GRAN_HERMANO_URL}/api/agents/health",
                json={
                    "agent_id": AGENT_ID,
                    "status": "degraded" if failed else "ok",
                    "tests": results,
                    "timestamp": datetime.now().isoformat(),
                },
            )

        await asyncio.sleep(300)


if __name__ == "__main__":
    asyncio.run(qa_loop())
