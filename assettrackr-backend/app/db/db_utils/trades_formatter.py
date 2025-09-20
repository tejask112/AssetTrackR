from datetime import datetime, timezone
from zoneinfo import ZoneInfo 
from typing import Any, List

from ..db_utils.dates import roundTo15Min

def formatTrades(trades):
    grouped: dict[datetime, dict[str, List[dict[str, Any]]]] = {}

    for row in trades:
        m = getattr(row, "_mapping", row)

        orig_dt = m.get("date")
        if orig_dt is None:
            continue

        dt_bucket = roundTo15Min(orig_dt).astimezone(ZoneInfo("America/New_York"))

        ticker = m.get("ticker")
        if not ticker:
            continue
        ticker = str(ticker)

        payload = {k: v for k, v in m.items() if k != "ticker"}
        payload["date"] = orig_dt

        bucket = grouped.setdefault(dt_bucket, {})
        ticker_list = bucket.setdefault(ticker, [])
        ticker_list.append(payload)

    for bucket in grouped.values():
        for ticker, lst in bucket.items():
            lst.sort(key=lambda d: d["date"])
            for d in lst:
                d.pop("date", None)

    grouped = dict(sorted(grouped.items(), key=lambda kv: kv[0]))

    return grouped

def createFormattedTimeseries(timeseries):
    ts_by_ticker = {}
    for ticker, rows in timeseries.items():
        d = {}
        for r in rows:
            dt = datetime.strptime(r["datetime"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=ZoneInfo("America/New_York"))
            d[dt] = r
        ts_by_ticker[ticker] = d
    
    return ts_by_ticker