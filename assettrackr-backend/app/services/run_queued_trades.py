# will run all queued trades
from flask import g
from ..db.db_services.trades.database_trades import get_queued_trades, update_trade
from ..utils.common_tickers import getAllTickers
from .detailed_stock_view_service import retrieveLatestPriceList
from ..db.db_services.portfolio.database_portfolio import add_to_portfolio, remove_from_portfolio

def run_queued_trades():
    queued_trades = get_queued_trades(g.db) #trade id, uid, ticker, quantity, action 
    all_tickers = getAllTickers(queued_trades)

    all_tickers_latest_price = retrieveLatestPriceList(all_tickers)

    #for each trade id, update table     
    for trade in queued_trades:
        try:
            trade_id = trade["trade_id"]
            uid = trade["uid"]
            ticker = trade["ticker"]
            quantity = trade["quantity"]
            action = trade["action"]

            execution_price = all_tickers_latest_price.get(ticker)
            execution_total_price = execution_price * quantity

            try:
                if action=="BUY":
                    add_to_portfolio(g.db, uid, ticker, quantity, execution_price)
                elif action=="SELL":
                    remove_from_portfolio(g.db, uid, ticker, quantity, execution_price)
                
                status = "FILLED"
                status_tooltip = "Success"
                update_trade(g.db, trade_id, uid, status, status_tooltip, execution_price, execution_total_price)

            except Exception as exception:
                status = "REJECTED"
                status_tooltip = str(exception)
                update_trade(g.db, trade_id, uid, status, status_tooltip, 0, 0)
                failed.append({trade_id, uid, ticker, quantity, action})
        
        except Exception as exception:
            status = "REJECTED"
            status_tooltip = str(exception)
            update_trade(g.db, trade_id, uid, status, status_tooltip, 0, 0)
            failed.append({trade_id, uid, ticker, quantity, action})

    return True