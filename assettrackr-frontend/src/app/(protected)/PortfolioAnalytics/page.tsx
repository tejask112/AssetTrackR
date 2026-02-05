'use client'
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";

import styles from './PortfolioAnalytics.module.css'
import NotificationBox from "../ReusableComponents/NotificationBox/NotificationBox";
import LoadingBar from "../ReusableComponents/LoadingBar/LoadingBar";
import ChartsHandler from "../ReusableComponents/ChartComponent/ChartHandler";
import AISummaryVisual from "./Components/AISummaryVisual/AISummaryVisual";
import AccountStatsVisual from "./Components/AccountStatsVisual/AccountStatsVisual";
import ReturnsVisual from "./Components/ReturnsVisual/ReturnsVisual";
import PortfolioVisual from "./Components/PortfolioVisual/PortfolioVisual";

interface Price {
    date: string;
    price: number;
}

interface PortfolioItem {
    current_price: number;
    quantity: number;
    ticker: string;
    change_5d_pct: number;
}

interface Returns {
    x1d_return: number | null;
    x1d_return_pct: number | null;
    x5d_return: number | null;
    x5d_return_pct: number | null;
    x1m_return: number | null;
    x1m_return_pct: number | null;
    x3m_return: number | null;
    x3m_return_pct: number | null;
    x6m_return: number | null;
    x6m_return_pct: number | null;
}

interface ApiResponse {
    cash_balance: number;
    portfolio: PortfolioItem[];
    returns: Returns;
    timeline: Price[]
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

export default function PortfolioAnalytics() {

    const { userID, userEmail, setAuth, clear } = useUser();
    
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [apiError, setApiError] = useState<boolean>(false);
    
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    const [portfolioBalance, setPortfolioBalance] = useState<number>(0);

    useEffect(() => {
        if (!userID) return; 
        async function fetchAnalyticsData() {
            const res = await fetch(`api/portfolio-analytics?uid=${userID}&jwt=abc`);
            const json: ApiResponse = await res.json();

            if (!res.ok) {
                setApiError(true);
                return;
            }

            setApiResponse(json);

            let total = 0;
            json.portfolio.forEach((item) => {
                total += item.current_price * item.quantity;
            });
            setPortfolioBalance(total);

        }
        fetchAnalyticsData();
    }, [userID])

    if (!apiResponse || !userID) { 
        if (apiError) {
            return (
                <NotificationBox
                    success={false}
                    message={"Server Error. Please try again later"} 
                />
            )
        } else {
            return (
                <LoadingBar />
            ) 
        }
    }

    return(
        <div className={styles.entireDiv}>
            <ChartsHandler data={apiResponse.timeline} timeframe={timeframe} height={550}/>
            <div className={styles.divw}>
                <button className={timeframe=='1D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1D')}>1D</button>
                <button className={timeframe=='5D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('5D')}>5D</button>
                <button className={timeframe=='1M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1M')}>1M</button>
                <button className={timeframe=='3M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('3M')}>3M</button>
                <button className={timeframe=='6M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('6M')}>6M</button>
                <button className={timeframe=='1Y' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1Y')}>1Y</button>
                <button className={timeframe=='Since Start' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('Since Start')}>Show All</button>
            </div>

            <div className={styles.bottomDiv}>

                <AISummaryVisual/>

                <div className={styles.dataDiv}>
                    <AccountStatsVisual 
                        cashBalance={apiResponse.cash_balance}
                        portfolioBalance={portfolioBalance}
                    />

                    <ReturnsVisual 
                        returns={apiResponse.returns}
                    />

                    <PortfolioVisual 
                        data={apiResponse.portfolio}
                    />
                    
                </div>

            </div>


        </div>
    );

}