from ..db.db_services.user_accounts.user_account_queries import get_watchlist
from ..db.db_services.market_data.market_data_queries import get_selected_seven_days_prices

from ..utils.response_formatters import format_watchlist_data

def get_watchlist_data(uid):
    watchlist_json = get_watchlist(uid)

    watchlist_list = watchlist_json.get("watchlist").keys()
    data = get_selected_seven_days_prices(watchlist_list)

    res = format_watchlist_data(data, watchlist_json)

    return res