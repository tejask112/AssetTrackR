from datetime import datetime, timezone
from zoneinfo import ZoneInfo 
from typing import Any, Iterable, Mapping

from ..db_utils.dates import roundTo15Min

def formatTrades(trades):
    grouped: dict[datetime, dict[str, dict[str, Any]]] = {}
    for row in trades:
        m = getattr(row, "_mapping", row)

        dt = m.get("date")
        if dt is None:
            continue
        dt = roundTo15Min(dt).astimezone(ZoneInfo("America/New_York"))

        ticker = m.get("ticker")
        if not ticker:
            continue
        ticker = str(ticker)

        payload = {k: v for k, v in m.items() if k not in ("date", "ticker")}

        bucket = grouped.setdefault(dt, {})
        bucket[ticker] = payload
    return grouped
