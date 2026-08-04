import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from dyno_worker.processes.market_status import check_market_open
from dyno_worker.processes.market_prices import collect_prices

async def main() -> None:
    scheduler = AsyncIOScheduler(timezone="America/New_York")

    scheduler.add_job(
        check_market_open,
        trigger=CronTrigger(
            day_of_week="mon-fri",
            second="*/5",
            timezone="America/New_York"
        ),
        id="check_market_status",
        replace_existing=True,
        max_instances=1,
        coalesce=True
    )

    scheduler.add_job(
        collect_prices,
        trigger=CronTrigger(
            day_of_week="mon-fri",
            second="0",
            timezone="America/New_York"
        ),
        id="collect_prices",
        replace_existing=True,
        max_instances=1,
        coalesce=True
    )

    scheduler.start()
    print("Dyno Worker Started...")

    try:
        await asyncio.Event().wait()
    finally:
        scheduler.shutdown(wait=True)

if __name__ == "__main__":
    asyncio.run(main())