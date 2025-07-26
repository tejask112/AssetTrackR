'use client';
import styles from './page.module.css';
import { useState, useEffect, SetStateAction } from "react";
import LoadingBar from './LoadingBar/LoadingBar';
import StockRow from './StockRow/StockRow';

interface Stock {
    current_price: number;
    closing_price_7D: number[];
    change: number;
    exchange: string;
    logo: string;
    name: string;
    percentage_change: number;
    symbol: string;
}

export default function SearchStocks() {

    const [companies, setCompanies] = useState<Stock[] | null>(null);
    
    useEffect(() => {
        async function fetchMovers() {
            const res = await fetch('/api/biggest_stock_gainers');
            const json: Stock[] = await res.json();
            setCompanies(json);
        }
        fetchMovers();
    }, []);

    
    if (!companies) {
        return <LoadingBar />
    }

    return(
        <div className={styles.entireDiv}>
            
            <div className={styles.searchStockDiv}>
                <h1 className={styles.searchText}>Search for a stock</h1>
                <div>
                    <input className={styles.searchBox} type="text" placeholder="Enter Symbol/Company Name"></input>
                </div>
            </div>

            
            <div className={styles.marketCards}>
                <StockRow title="Today's Top Gainers " stocks={companies}/>
            </div>
            
            


        </div>
    )

}