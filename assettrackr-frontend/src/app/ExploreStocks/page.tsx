'use client';
import styles from './page.module.css';
import { useState, useEffect, SetStateAction } from "react";
import TodaysTopMovers from './TodaysTopMovers/TodaysTopMovers';

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
        <div className={styles.entireDiv}>
            
            <div className={styles.searchStockDiv}>
                <h1 className={styles.searchText}>Search for a stock</h1>
                <div>
                    <input className={styles.searchBox} type="text" placeholder="Enter Symbol/Company Name" value={symbolName} onChange={handleSymbolChange}></input>
                    {/* <h1>{data==null ? `` : `${data.symbol}: £${data.price} - ${data.area}`}</h1> */}
                </div>
            </div>

            <div className={styles.marketCards}>
                <TodaysTopMovers/>
            </div>

            
            
        </div>
    )

}