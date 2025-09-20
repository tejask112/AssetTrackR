'use client'
import styles from './page.module.css'
import TradesTable from './TradesTable/TradesTable'
import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/context/UserContext'

interface History {
    action: string;
    date: string;
    execution_price: number;
    execution_total_price: number;
    quantity: number;
    status: string;
    status_tooltip: string;
    ticker: string;
    trade_id: string;
    trading_type: string;    
}

export default function TradeHistory() {

    const { userID } = useUser();

    const [allTradeHistory, setAllTradeHistory] = useState<History[] | null>(null);
    const finalisedTradeHistory = useMemo(() => allTradeHistory?.filter(h => h.status !== "QUEUED") ?? null,[allTradeHistory]);    
    const queuedTradeHistory = useMemo(() => allTradeHistory?.filter(h => h.status === "QUEUED") ?? null,[allTradeHistory]);

    const buyCount = allTradeHistory?.filter(t => t.action === "BUY").length ?? 0;
    const sellCount = allTradeHistory?.filter(t => t.action === "SELL").length ?? 0;

    const totalTrades = allTradeHistory?.length ?? 0;
    const buySellRatioCount = sellCount > 0 ? (buyCount / sellCount).toFixed(4) : null;
    const totalVolume = allTradeHistory?.reduce((sum, trade) => sum + trade.execution_total_price, 0) ?? 0;
    const pendingTrades = queuedTradeHistory?.length ?? 0;
    

    useEffect(() => {
        // wait until there is a uid
        if (!userID) return; 

        const uid = userID;
        async function getTradeHistory() {
            const res = await fetch(`/api/trade_history?query=${encodeURIComponent(uid)}`);
            const json: History[] = await res.json();
            setAllTradeHistory(json);
        }

        getTradeHistory();
    }, [userID]);

    return(
    
        <div className={styles.entireDiv}>

            <h1 className={styles.title}>View Trade History</h1>

            {allTradeHistory && allTradeHistory.length === 0 ? (
                <h1>No trades yet! Start your investment journey by heading to the Explore Stocks page and placing your first trade.</h1> 
            ) : (
                <>
                    <div className={styles.statsContainer}>
                        <div className={styles.statCard}>
                            <h3>Total Trades</h3>
                            <p className={styles.value}>{totalTrades}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Buy/Sell Ratio</h3>
                            <p className={styles.value}>{buySellRatioCount}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Total Volume</h3>
                            <p className={styles.value}>
                                {new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(totalVolume)} USD
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Pending Orders</h3>
                            <p className={styles.value}>{pendingTrades}</p>
                        </div>
                    </div>

                    {queuedTradeHistory && queuedTradeHistory.length > 0 && (
                        <div className={styles.pendingSection}>
                            <h2 className={styles.sectionTitle}>Pending Trades</h2>
                            <TradesTable data={queuedTradeHistory} />
                        </div>
                    )}

                    {finalisedTradeHistory && finalisedTradeHistory.length > 0 && (
                        <div>
                            <h2 className={styles.sectionTitle}>Confirmed Trades</h2>
                            <TradesTable data={finalisedTradeHistory} />
                        </div>
                    )}
                </>
            )}
            
            
        </div>
    )

}