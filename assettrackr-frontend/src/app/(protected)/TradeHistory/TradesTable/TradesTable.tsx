'use client'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import styles from './TradesTable.module.css'

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

export default function TradesTable() {

    const [tradeHistory, setTradeHistory] = useState<History[] | null>(null);
    const [uid, setUid] = useState<string>("ROndgcEwVDh8G4tC6HV30Tjs6A63");

    // get the uid

    useEffect(() => {
        async function getTradeHistory() {
            const res = await fetch('/api/trade_history?query=' + encodeURIComponent(uid))
            const json: History[] = await res.json();
            setTradeHistory(json)
        }
        getTradeHistory()
    }, [])

    if (!tradeHistory) return null;

    

    return (
        <div className={styles.tradeTable}>
            {/* Need to add CSV, XLS and PDF Export */}

            <DataTable value={tradeHistory} showGridlines resizableColumns tableStyle={{ minWidth: '50rem'}}>
                <Column field="trade_id" header="ID"></Column>
                <Column field="date" header="Date" sortable style={{ width: '25%' }}></Column>
                <Column field="ticker" header="Stock"></Column>
                <Column field="status" header="Status"></Column>
                <Column field="action" header="Action"></Column>
                <Column field="quantity" header="Quantity"></Column>
                <Column field="execution_price" header="Execution Price"></Column>
                <Column field="execution_total_price" header="Execution Total Price"></Column>
                <Column field="trading_type" header="Trading Type"></Column>
            </DataTable>
        </div>
    )
}