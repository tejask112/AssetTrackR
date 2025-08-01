'use client';
import styles from './page.module.css';
import { useState, useEffect, SetStateAction } from "react";
import LoadingBar from './LoadingBar/LoadingBar';
import StockRow from './StockRow/StockRow';
import SearchBar from './SearchBar/SearchBar';

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

    const [todaysTopGainers, setTodaysTopGainers] = useState<Stock[] | null>(null);
    const [todaysTopLosers, setTodaysTopLosers] = useState<Stock[] | null>(null);
    const [mostActive, setMostActive] = useState<Stock[] | null>(null);
    
    useEffect(() => {
        async function fetchTopMovers() {
            const res = await fetch('/api/biggest_stock_gainers');
            const json: Stock[] = await res.json();
            setTodaysTopGainers(json);
        }
        fetchTopMovers();

        async function fetchLowestMovers() {
            const res = await fetch('api/biggest_stock_losers');
            const json: Stock[] = await res.json();
            setTodaysTopLosers(json);
        }
        fetchLowestMovers();

        async function fetchMostActive() {
            const res = await fetch('api/most_actively_traded');
            const json: Stock[] = await res.json();
            setMostActive(json);
        }
        fetchMostActive();
    }, []);

    if (!todaysTopGainers) { return (
        <div className={styles.entireDiv}>
            <LoadingBar />
            <SearchBar/>
        </div>) }
    if (!todaysTopLosers) { return (
        <div className={styles.entireDiv}>
            <LoadingBar />
            <SearchBar/>
        </div>) }
    if (!mostActive) { return (
        <div className={styles.entireDiv}>
            <LoadingBar />
            <SearchBar/>
        </div>) }

    return(
        <div className={styles.entireDiv}>

            <SearchBar/>

            <div className={styles.marketCards}>
                <StockRow title="Most Actively Traded" stocks={mostActive}/>
            </div>
            
            <div className={styles.marketCards}>
                <StockRow title="Today's Top Gainers" stocks={todaysTopGainers}/>
            </div>

            <div className={styles.marketCards}>
                <StockRow title="Today's Top Losers" stocks={todaysTopLosers}/>
            </div>
        </div>
    )

}