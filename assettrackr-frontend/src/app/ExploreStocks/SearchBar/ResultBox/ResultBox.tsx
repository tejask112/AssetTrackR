import { useEffect, useState } from "react";

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
            const data = await response.json();
            setResult(data);
        }
        fetchResponse()
    }, [lookupValue])

    return (
        <datalist>
            {result?.map((r) => (
                <option key={r.symbol}>{r.symbol} | {r.name}</option>
            ))}
        </datalist>
    )

}