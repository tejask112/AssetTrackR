
def historyFormatter(results, uid):
    return {
        uid: [{"date": row["date"], "value": row["deposit"]} for row in results]
    }