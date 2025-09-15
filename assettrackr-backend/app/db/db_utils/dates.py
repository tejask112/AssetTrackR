from datetime import datetime, timedelta

def roundTo15Min(date):
    remainder = date.minute % 15
    minutesToAdd = (15 - remainder) % 15
    if minutesToAdd > 0:
        return date.replace(second=0, microsecond=0) + timedelta(minutes=minutesToAdd)
    else:
        return date