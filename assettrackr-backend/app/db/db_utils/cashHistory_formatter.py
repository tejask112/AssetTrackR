
def historyFormatter(results, uid):
    return {
        uid: [{"date": row["date"], "value": row["deposit"]} for row in results]
    }

def deposit_logs_formatter(results, uid):
    return {
        uid: [{"date": row["date"], "value": row["amount"]} for row in results]
    }