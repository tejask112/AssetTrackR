from datetime import datetime, timezone
from zoneinfo import ZoneInfo 

from ..db_utils.dates import roundTo15Min

def formatTrades(trades):
    groupedTrades: dict[datetime, list[dict]] = {}
    for row in trades:
        trade = getattr(row, "_mapping", row)

        date = roundTo15Min(trade.get('date')).astimezone(ZoneInfo("America/New_York"))
        if date is None:
            continue

        newTrade = dict(trade)
        newTrade.pop("date", None)

        groupedTrades.setdefault(date, []).append(newTrade)
    return groupedTrades
