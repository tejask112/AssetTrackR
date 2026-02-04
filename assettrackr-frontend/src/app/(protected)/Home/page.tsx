'use client'
import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/context/UserContext';

import styles from './Home.module.css'
import ChartsHandler from '../ReusableComponents/ChartComponent/ChartHandler';
import UserDataVisual from './Components/UserDataVisual/UserDataVisual';
import LoadingBar from '../ReusableComponents/LoadingBar/LoadingBar';
import WatchlistVisual from './Components/WatchlistVisual/WatchlistVisual';
import MarketNewsVisual from './Components/MarketNewsVisual/MarketNews';

interface HomePageData {
    cash_balance: number;
    market_news: MarketNewsItem[];
    portfolio: PortfolioItem[];
    portfolio_balance: number;
    watchlist_data: Watchlist[];
    x2w_timeline: Price[];
}

interface MarketNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: string;
    image: string;
    source: string;
    summary: string;
    url: string;
}

interface PortfolioItem {
    quantity: number;
    ticker: string;
}

interface Watchlist {
    company_name: string;
    latest_price: number;
    prices: number[];
    ticker: string;
    x7d_change: number;
    x7d_change_pct: number;
}

interface Price {
    date: string;
    price: number;
}

export default function Home() {

    const { userID, userEmail, setAuth, clear } = useUser();

    const [apiResponse, setApiResponse] = useState<HomePageData | null>(null);
    useEffect(() => {
        if (!userID) return; 
        async function fetchHomePageData() {
            const res = await fetch(`api/home-data?uid=${userID}&jwt=abc`);
            const json: HomePageData = await res.json();
            setApiResponse(json);
        }
        fetchHomePageData();
    }, [userID])

        
    if (!apiResponse || !userID) {
        return (
            <LoadingBar/>
        )
    }

    return (
        <div className={styles.externalDiv}>
            
            <div className={styles.portfolioDiv}>
                
                <UserDataVisual 
                    portfolioBalance={apiResponse.portfolio_balance}
                    cashBalance={apiResponse.cash_balance}
                    uid={userID}
                    timeline={apiResponse.x2w_timeline}
                />

                <div className={styles.chartDiv}>
                    <ChartsHandler data={apiResponse.x2w_timeline} height={120}/>
                </div>

            </div>

            <div className={styles.additionalInfoDiv}>

                <div className={styles.watchlistDiv}>
                    <WatchlistVisual 
                        watchlistData={apiResponse.watchlist_data}
                    />
                </div>
                
                <div className={styles.newsDiv}>
                    <MarketNewsVisual 
                        data={apiResponse.market_news}
                    />
                </div>

            </div>
           
        </div>
    )
}