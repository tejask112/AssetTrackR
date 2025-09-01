'use client'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TradesTable.module.css'
import { useEffect, useState } from 'react';

import { Row } from 'primereact/row';

interface Trade {
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

interface TradeProps {
    data: Trade[]
}

export default function TradesTable({ data }: TradeProps) {

    // ---------------------- formatting the prices ----------------------
    const formatIndividualPriceToUSD = () => (row: any) => usdBody(row['execution_price']);
    const formatTotalPriceToUSD = () => (row: any) => usdBody(row['execution_total_price']);
    const usdBody = (v: unknown) => {
        const n = typeof v === 'number' ? v : Number(v);
        if (n == 0) {
            return '-';
        } else {
            return Number.isFinite(n) ? USD_format.format(n) : '-';
        }
    };
    const USD_format = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // ---------------------- formatting the Date ----------------------
    const normaliseDate = (s: String) => s.replace(/(\.\d{3})\d+/, "$1")

    const NY_timezone = "America/New_York"
    const local_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const [new_local_timeZone, set_new_local_timeZone] = useState<string>("");
        useEffect(() => {
        try {
            const arr_formated_local_timezone = local_timezone.split("/")
            const city = arr_formated_local_timezone[1].replace("_", " ")
            set_new_local_timeZone(`${city}, ${arr_formated_local_timezone[0]}`)
        } catch {
            set_new_local_timeZone(local_timezone);
        }
    }, [local_timezone]);
    

    const makeFormat = (timeZone: string) => new Intl.DateTimeFormat("en-GB", {
        timeZone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        fractionalSecondDigits: 3,
    });

    const formatDate = (date: string, fmt: Intl.DateTimeFormat) => {
        const d = new Date(normaliseDate(date));
        return Number.isNaN(d.getTime()) ? "—" : fmt.format(d);
    };

    const dateBody = (format: Intl.DateTimeFormat) => (row: { date: string }) => formatDate(row.date, format);
    

    return (
        <div className={styles.tradeTable}>
            <DataTable value={data} resizableColumns tableStyle={{ minWidth: '50rem'}}>
                <Column field="trade_id" header="ID"></Column>
                <Column field="date" body={dateBody(makeFormat(NY_timezone))} header={<>Order Date <br/> <span>(New York, America Time)</span></>} headerClassName={styles.orderDateText} bodyClassName={styles.orderDateText} sortable style={{ width: '25%' }}></Column>
                <Column field="date" body={dateBody(makeFormat(local_timezone))} header={<>Order Date <br/> <span>({new_local_timeZone} Local Time)</span></>} headerClassName={styles.orderDateText} bodyClassName={styles.orderDateText} sortable style={{ width: '25%' }}></Column>
                <Column field="ticker" header="Stock"></Column>
                <Column field="status" header="Status"></Column>
                <Column field="action" header="Action"></Column>
                <Column field="quantity" header="Quantity"></Column>
                <Column field="execution_price" body={formatIndividualPriceToUSD()} header="Execution Price">USD</Column>
                <Column field="execution_total_price" body={formatTotalPriceToUSD()} header="Execution Total Price">USD</Column>
                <Column field="trading_type" header="Trade Type"></Column>
            </DataTable>
        </div>
    )
}