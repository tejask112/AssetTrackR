
def deposit_logs_formatter(results, uid):
    return {
        uid: [{"date": row["date"], "value": row["amount"]} for row in results]
    }