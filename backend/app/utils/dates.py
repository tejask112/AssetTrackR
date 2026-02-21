from datetime import datetime, timedelta, timezone

def calculateOneWeekAgoDate():
    current_date = datetime.now(timezone.utc)
    start_date_obj = current_date - timedelta(days=7)
    start_date = start_date_obj.strftime("%Y-%m-%d")
    return start_date

def calculateTwoWeekAgoDate():
    current_date = datetime.now(timezone.utc)
    start_date_obj = current_date - timedelta(days=14)
    start_date = start_date_obj.strftime("%Y-%m-%d")
    return start_date

def calculateEndDate():
    current_date = datetime.now(timezone.utc)
    end_date_obj = current_date - timedelta(hours=1, minutes=45)
    end_date = end_date_obj.strftime("%Y-%m-%dT%H:%M:%SZ")
    return end_date

def calculate5YagoDate():
    current_date = datetime.now(timezone.utc)
    fiveYearsAgo_date_obj = current_date - timedelta(days=(365*5))
    fiveYearsAgo_date = fiveYearsAgo_date_obj.strftime("%Y-%m-%d" + " " + "%H:%M:%S")
    return fiveYearsAgo_date

