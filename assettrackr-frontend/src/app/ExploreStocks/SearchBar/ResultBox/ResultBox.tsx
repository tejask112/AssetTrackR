"use client"

import { useEffect, useState } from "react";
import styles from './ResultBox.module.css'
import { useRouter } from "next/navigation";

interface ResultBoxProps {
    lookupValue: string;
}

interface Result {
    symbol: string;
    name: string;
}

export default function ResultBox( { lookupValue }:ResultBoxProps) {

    const [result, setResult] = useState<Result[] | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchResponse() {
            const response = await fetch('/api/symbol_lookup?query='+encodeURIComponent(lookupValue.trim()));
            const data: Result[] = await response.json();
            setResult(data);
        }
        if (lookupValue.trim().length == 0) {
            setResult(null);
        } else {
            fetchResponse();
        }
    }, [lookupValue])

    const searchStocks = (symbol: string) => {
        console.log('the user clicked on ' + symbol)
        router.push(`/DetailedStockView/${encodeURIComponent(symbol)}`);
    }

    return (
        <div className={styles.resultsContainer}>
            {result === null ? null : result.length > 0 ? (
                result.map((r) => (
                    <button key={r.symbol} className={styles.resultButton} onClick={() => searchStocks(r.symbol)}> <strong>{r.symbol}</strong> {r.name} </button>
                ))
            ) : (
                <h1 className={styles.resultButton} >No results</h1>
            )}
        </div>
    );

}