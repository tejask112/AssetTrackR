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
            {/* Need to add CSV, XLS and PDF Export */}

            <h1 className={styles.title}>View Trade History</h1>

            <h1>Pending Trades</h1>
            <TradesTable data={queuedTradeHistory ?? []}/>

            <h1>Confirmed Trades</h1>
            <TradesTable data={finalisedTradeHistory ?? []}/>
        </div>
    )

}