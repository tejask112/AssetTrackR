'use client'
import styles from './page.module.css'
import TradesTable from './TradesTable/TradesTable'
import { useEffect, useMemo, useState } from 'react';

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

    const [allTradeHistory, setAllTradeHistory] = useState<History[] | null>(null);
    const finalisedTradeHistory = useMemo(() => allTradeHistory?.filter(h => h.status !== "QUEUED") ?? null,[allTradeHistory]);    
    const queuedTradeHistory = useMemo(() => allTradeHistory?.filter(h => h.status === "QUEUED") ?? null,[allTradeHistory]);
    const [uid, setUid] = useState<string>("GIxkGXxmQHTxM2ZZ6B0sbYP0ykA3");

    // get the uid

    useEffect(() => {
        async function getTradeHistory() {
            const res = await fetch('/api/trade_history?query=' + encodeURIComponent(uid))
            const json: History[] = await res.json();
            setAllTradeHistory(json)
        }
        getTradeHistory()
    }, [])

    if (!allTradeHistory) return null;

    return(
    
        <div className={styles.entireDiv}>
            {/* Need to add CSV, XLS and PDF Export */}

            <h1 className={styles.title}>View Trade History</h1>

            <h1>Pending Trades</h1>
            <TradesTable data={queuedTradeHistory ?? []}/>

            <h1>Confirmed Trades</h1>
            <TradesTable data={finalisedTradeHistory ?? []}/>
        </div>
    )

}