'use client';
import { useState, useEffect, SetStateAction } from "react";

export default function SearchStocks() {

    const [data, setData] = useState<{ area: string; price: number; symbol: string} | null >(null);
    const [symbolName, setSymbolName] = useState("");

    // useEffect(() => {
    //     fetch('/api/market_data').then(res => {return res.json();}).then(json => setData(json));
    // }, []);

    function handleSymbolChange(event: { target: { value: SetStateAction<string>; }; }) {
        setSymbolName(event.target.value)
    }

    const searchStock = () => {
        fetch('/api/market_data?symbol=' + encodeURIComponent(symbolName))
        .then(res => {return res.json();})
        .then(json => setData(json));
    }

    return(
        <div>
            <h1>Search for a stock:</h1>
            <input type="text" placeholder="Type here" value={symbolName} onChange={handleSymbolChange}></input>
            <button onClick={searchStock}>Search</button>
            <h1>{data==null ? `` : `${data.symbol}: £${data.price} - ${data.area}`}</h1>
        </div>
    )

}