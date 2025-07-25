'use client';
import styles from './TodaysTopMovers.module.css'
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Stock {
    symbol: string;
    current_price: number;
    change: number;
    percentage_change: number;
    list_of_close_prices: number[];
    logo: string;
}

interface MoversResponse {
    symbol: Stock[];
}

export default function TodaysTopMovers() {

    const [movers, setMovers] = useState<MoversResponse | null>(null);

    useEffect(() => {
        async function fetchMovers() {
            const res = await fetch('/api/todays_top_movers');
            const json: MoversResponse = await res.json();
            setMovers(json);
        }
        fetchMovers();
    }, []);
    
    if (!movers) {
        return <p>Loading top movers…</p>;
    }

    return(
        <div>
            {/* Todays top gainers*/}
            <div className={styles.stockDiv}>
                <h1 className={styles.title}>Todays Top Gainers</h1>

                <div className={styles.cardRow}>

                    {Object.entries(movers).map(([symbol, stock]) => {
                        return (
                            <div key={symbol} className={styles.stockCard}>
                                
                                <div className={styles.companyInfo}>
                                    <div className={styles.imageDiv}>
                                        <Image src={stock.logo} className={styles.image} alt='N/A' width={50} height={50}></Image>
                                    </div>
                                    <div className={styles.companyNames}>
                                        <h1 className={styles.tickerName}>{stock.symbol}</h1>
                                        <h1 className={styles.companyName}>Company Name</h1>
                                    </div>
                                </div>
                                <div className={styles.companyStats}>
                                    <h1 className={styles.price}>£{stock.current_price}</h1>
                                    <h1 className={styles.change}>+{stock.change} ({stock.percentage_change}%)</h1>
                                    
                                </div>
                            </div>
                        )
                    })}
                    

                </div>
            
            </div>
           
        </div>
        
    );

}