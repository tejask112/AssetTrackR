import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from dyno_worker.processes.market_prices import collect_prices
from dyno_worker.processes.company_stats import refresh_all_company_stats
from dyno_worker.processes.news import collect_news

async def main() -> None:
    scheduler = AsyncIOScheduler(timezone="America/New_York")

    # scheduler.add_job(
    #     collect_prices,
    #     trigger=CronTrigger(
    #         day_of_week="mon-fri",
    #         second="5",
    #         timezone="America/New_York"
    #     ),
    #     id="collect_prices",
    #     replace_existing=True,
    #     max_instances=1,
    #     coalesce=True
    # )

    # scheduler.add_job(
    #     refresh_all_company_stats,
    #     trigger=CronTrigger(
    #         day_of_week="mon-fri",
    #         hour="8",
    #         minute="30",
    #         second="0",
    #         timezone="America/New_York"
    #     ),
    #     id="refresh_all_company_stats",
    #     replace_existing=True,
    #     max_instances=1,
    #     coalesce=True
    # )

    scheduler.add_job(
        collect_news,
        trigger=CronTrigger(
            second="0",
        ),
        id="collect_news",
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