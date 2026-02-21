from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo 


# check if market is open NY 9:30am - 4pm
def check_market_open():
    ny_now = datetime.now(tz=ZoneInfo("America/New_York"))
    ny_today = ny_now.date()

    market_open = datetime.combine(ny_today, time(9, 30), tzinfo=ZoneInfo("America/New_York"))
    market_close = datetime.combine(ny_today, time(16, 0), tzinfo=ZoneInfo("America/New_York"))

    if (ny_today.weekday() < 5 and (market_open <= ny_now < market_close)):
        return True
    else:
        return False
    
# check when market next opens
def check_when_market_opens():
    if (check_market_open()):
        return None
    
    ny_now = datetime.now(tz=ZoneInfo("America/New_York"))
    day = ny_now.date()

    market_open = datetime.combine(day, time(9, 30), tzinfo=ZoneInfo("America/New_York"))
    market_close = datetime.combine(day, time(16, 0), tzinfo=ZoneInfo("America/New_York"))

    if ny_now.weekday() < 5 and ny_now < market_open:
        return market_open - ny_now
    
    if ny_now.weekday() < 5 and ny_now >= market_close:
        day += timedelta(days=1)

    while datetime.combine(day, time(0, 0), tzinfo=ZoneInfo("America/New_York")).weekday() >= 5:
        day += timedelta(days=1)

    next_weekday_open = datetime.combine(day, time(9, 30), tzinfo=ZoneInfo("America/New_York"))
    count = next_weekday_open - ny_now

    total = int(count.total_seconds())
    if total < 0:
        total = 0
    days, rem = divmod(total, 86400)
    hours, rem = divmod(rem, 3600)
    minutes, seconds = divmod(rem, 60)

    return f"{days}d {hours}h {minutes}m {seconds}s"

# increments the parameter date by 15min, rolling over to next open market date
def incrementNext15minMarket(date):
    newDate = date + timedelta(minutes=15)
    if newDate.hour >= 16:
        newDate = date + timedelta(days=1)
        while newDate.weekday() >= 5:
            newDate += timedelta(days=1)
        newDate = newDate.replace(hour=9, minute=30, second=0, microsecond=0)
    return newDate