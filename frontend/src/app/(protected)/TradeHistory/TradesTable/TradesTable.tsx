'use client'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TradesTable.module.css'
import { useEffect, useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { useRef } from 'react';

import { Row } from 'primereact/row';
import NotificationBox from '../../ReusableComponents/NotificationBox/NotificationBox';
import { getFirebaseJWT } from '@/authenticator/authenticator';

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
    uid: string;
}

interface TradeProps {
    data: Trade[],
    rows: number
}

export default function TradesTable({ data, rows }: TradeProps) {

    const showActionsColumn = data.some((row: Trade) => row.status === 'QUEUED');

    // ---------------------- formatting the prices ----------------------
    const formatIndividualPriceToUSD = () => (row: Trade) => usdBody(row['execution_price']);
    const formatTotalPriceToUSD = () => (row: Trade) => usdBody(row['execution_total_price']);
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
    const normaliseDate = (s: string) => s.replace(/(\.\d{3})\d+/, "$1")

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

    // ---------------------- format quantity by removing extra zero's ----------------------
    const trimZeros = (value: number | string): string => {
        if (value === null || value === undefined) return "";
        const num = Number(value);
        if (isNaN(num)) return String(value);
        return num.toString().replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/, "");
    };
    
    // ---------------------- tooltip for status ----------------------
    const tooltipRef = useRef<Tooltip>(null);
    const statusBodyTemplate = (rowData: Trade) => {
        return (
            <span className="status-cell" data-pr-tooltip={rowData.status_tooltip} data-pr-position="top">
                {rowData.status}
            </span>
        );
    };

    // cancel trade
    const actionBodyTemplate = (rowData: Trade) => {
        return (
            <button className={styles.cancelButton} onClick={() => cancelTrade(rowData)}>Cancel</button>
        );
    };

    const [notification, setNotification] = useState<{message: string, success: boolean} | null>(null);
    const cancelTrade = async (rowData: Trade) => {
        try {
            if (rowData.status !== 'QUEUED') return;

            const uid = rowData.uid;
            const tradeID = rowData.trade_id;

            const jwt = await getFirebaseJWT();

            const res = await fetch("/api/cancel-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: uid,
                    tradeid: tradeID,
                    jwt: jwt
                }),
            });

            const data = await res.json();

            if (!res.ok) { 
                console.log(data.error);
                setNotification({
                    message: `Error: ${data.error}`,
                    success: false
                });
            } else {
                setNotification({
                    message: `id:${rowData.trade_id} cancelled`,
                    success: true
                });
            }
        } catch (err) {
            setNotification({ message: "An error occurred", success: false })
        }
    }

    return (
        <div className={styles.tradeTable}>
            <Tooltip ref={tooltipRef} target=".status-cell" className={styles.statusTooltip}/>
            <DataTable 
                value={data} 
                paginator 
                rows={rows} 
                rowsPerPageOptions={[10, 25, 50, 100]} 
                resizableColumns 
                tableStyle={{ minWidth: '50rem'}} 
                paginatorDropdownAppendTo="self" 
            
            >
                
                <Column field="trade_id" header="ID"></Column>
                <Column field="date" body={dateBody(makeFormat(NY_timezone))} header={<>Order Date <br/> <span>(New York, America Time)</span></>} headerClassName={styles.orderDateText} bodyClassName={styles.orderDateText} sortable style={{ width: '25%' }}></Column>
                <Column field="date" body={dateBody(makeFormat(local_timezone))} header={<>Order Date <br/> <span>({new_local_timeZone} Local Time)</span></>} headerClassName={styles.orderDateText} bodyClassName={styles.orderDateText} sortable style={{ width: '25%' }}></Column>
                <Column field="ticker" header="Stock"></Column>
                <Column field="status" body={statusBodyTemplate} header="Status"></Column>
                <Column field="action" header="Action"></Column>
                <Column field="quantity" body={(row) => trimZeros(row.quantity)} header="Quantity"></Column>
                <Column field="execution_price" body={formatIndividualPriceToUSD()} header="Execution Price">USD</Column>
                <Column field="execution_total_price" body={formatTotalPriceToUSD()} header="Execution Total Price">USD</Column>
                
                
                {showActionsColumn && (
                    <Column 
                        header="Actions" 
                        body={actionBodyTemplate} 
                        exportable={false} 
                        style={{ minWidth: '4rem' }}
                    />
                )}
                
                {!showActionsColumn && (
                    <Column field="trading_type" header="Trade Type"></Column>
                )}
                
            </DataTable>

            {notification && (
                <NotificationBox 
                    message={notification.message} 
                    success={notification.success}
                />
            )}
        </div>
    )
}