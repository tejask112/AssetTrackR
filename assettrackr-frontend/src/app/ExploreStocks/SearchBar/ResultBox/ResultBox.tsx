import { useEffect, useState } from "react";
import styles from './ResultBox.module.css'

interface ResultBoxProps {
    lookupValue: string;
}

interface Result {
    symbol: string;
    name: string;
}

export default function ResultBox( { lookupValue }:ResultBoxProps) {

    const [result, setResult] = useState<Result[] | null>(null);

    useEffect(() => {
        async function fetchResponse() {
            const response = await fetch('/api/symbol_lookup?query='+encodeURIComponent(lookupValue.trim()));
            const data: Result[] = await response.json();
            setResult(data);
        }
        if (lookupValue.trim().length == 0) {
            setResult([]);
        } else {
            fetchResponse();
        }
    }, [lookupValue])

    const searchStocks = (symbol: string) => {
        console.log('the user clicked on ' + symbol)
    }

    return (
        <div className={styles.resultsContainer}>
            {result?.map((r) => (
                <button key={r.symbol} className={styles.resultButton} onClick={() => searchStocks(r.symbol)}><strong>{r.symbol}</strong> {r.name}</button>
            ))}
        </div>
    )

}