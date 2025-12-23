import requests, os
from datetime import timezone
from decimal import Decimal, ROUND_HALF_UP

from ..db.db_services.timeline.database_timeline import update_ts, get_user_entire_timeline


def get_timeline(g, uid):
    update_ts(g, uid)
    user_timeline = get_user_entire_timeline(g, uid) # example: [{'date': datetime obj, 'value': Decimal obj}, ...]
    timeline = []
    for record in user_timeline:
        timeline.append({ 
            "datetime": record.get('date').astimezone(timezone.utc).isoformat(), 
            "value": str(round(record.get('value'), 2))
        })

    return timeline