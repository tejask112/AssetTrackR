'use client';
import styles from './TodaysTopMovers.module.css'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import StockLineChart from './StockLineChart/StockLineChart';

interface Stock {
    current_price: number;
    change: number;
    // closing_price_7D: number[];
    exchange: string;
    logo: string;
    name: string;
    percentage_change: number;
    symbol: string;
}

export default function TodaysTopMovers() {

    const [movers, setMovers] = useState<Stock | null>(null);
    const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchMovers() {
            const res = await fetch('/api/biggest_stock_gainers');
            const json: Stock = await res.json();
            setMovers(json);
        }
        fetchMovers();
    }, []);

    const handleImageError = (symbol: string) => {
        setFailedLogos(prev => new Set(prev).add(symbol));
    };
    
    if (!movers) {
        return <p>Loading top movers…</p>;
    }


    return(
        <div>
            {/* Todays top gainers*/}
            <div className={styles.stockDiv}>
                <h1 className={styles.title}>Today's Top Gainers</h1>

                <div className={styles.cardRow}>

                    {Object.entries(movers).map(([symbol, stock]) => {
                        return (
                            <div key={symbol} className={styles.stockCard}>
                                <div className={styles.stockData}>
                                    <div className={styles.stockCardQualtitative}>
                                        <div className={styles.companyInfo}>
                                            <div className={styles.imageDiv}>
                                                {failedLogos.has(stock.symbol) ? (
                                                    <h1 className={styles.replacementLogo}>{stock.symbol}</h1>
                                                ) : (
                                                    <Image src={stock.logo} className={styles.stockLogo} alt={stock.symbol} width={50} height={50} onError={() => handleImageError(stock.symbol)} />
                                                )}
                                            </div>
                                            <div className={styles.companyNames}>
                                                <h1 className={styles.tickerName}>{stock.symbol}</h1>
                                                <h1 className={styles.companyName}>{stock.name}</h1>
                                            </div>
                                            <div className={styles.companyStats}>
                                                <h1 className={styles.price}>£{stock.current_price.toFixed(2)}</h1>
                                                <h1 className={styles.change}>+{stock.change.toFixed(2)} {stock.percentage_change.toFixed(2)}% 24H</h1>
                                            </div>
                                        </div>    
                                    </div>

                                    <div className={styles.stockCardQuantitativeData}>
                                        <StockLineChart prices={stock.closing_price_7D}/>
                                    </div>

                                </div>
                                
                            </div>
                        )
                    })}
                    
                </div>
            
            </div>
           
        </div>
        
    );

}