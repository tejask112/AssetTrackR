'use client';
import styles from './page.module.css';
import { useState, useEffect } from "react";
import LoadingBar from '../ReusableComponents/LoadingBar/LoadingBar';
import StockCard from './StockCard/StockCard';

interface StockData {
    "company_name": string,
    "current_recommendation": string,
    "exchange": string,
    "latest_price": string,
    "month_to_date_price_return_daily": number,
    "prices": number[],
    "range_high": number,
    "range_low": number,
    "ticker": string,
    "x7d_change": number,
}

export default function SearchStocks() {

    const [apiResponse, setApiResponse] = useState<StockData[] | null>(null);
    
    useEffect(() => {
        async function fetchExploreStocks() {
            const res = await fetch('/api/explore-stocks?jwt=abc');
            const json: StockData[] = await res.json();
            setApiResponse(json);
        }
        fetchExploreStocks();
    }, []);

    if (!apiResponse) { 
        return (
            <LoadingBar />
        ) 
    }

    return(
        <div className={styles.entireDiv}>
            <h1 className={styles.title}>Explore Stocks</h1>

            {apiResponse.map((stockData) => (
                <StockCard key={stockData.ticker} data={stockData}/>
            ))}
        </div>
    )

}