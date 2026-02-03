"use client";
import { useEffect, useState } from "react";

import * as React from 'react';
import styles from './DetailedStockView.module.css';

import LoadingBar from "./LoadingBar/LoadingBar";
import { useUser } from '@/context/UserContext';

import CompanyVisuals from "./Components/CompanyVisuals/CompanyVisuals";
import PriceVisual from "./Components/PriceVisuals/PriceVisuals";
import TradeVisuals from "./Components/TradeVisuals/TradeVisuals";
import SummaryVisuals from "./Components/SummaryVisuals/SummaryVisuals";
import RecommendationVisual from "./Components/RecommendationVisuals/RecommendationVisuals";
import TimeVisual from "./Components/TimeVisual/TimeVisual";
import ChartsHandler from "../ReusableComponents/ChartComponent/ChartHandler";


interface Props {
    symbol: string;
}

interface ApiResponse {
    "company_data": CompanyData,
    "current_price": number,
    "current_price_date": string,
    "historical_prices": Price[],
}

export interface CompanyData {
  asset_turnover_annual: number | null
  asset_turnover_ttm: number | null
  average_volume: number | null

  company_name: string
  current_recommendation: string | null
  description: string | null

  dividend_growth_rate_5y: number | null
  dividend_per_share_annual: number

  enterprise_value: number | null
  exchange: string | null
  forward_pe: number | null

  gross_margin_5y: number | null
  gross_margin_annual: number | null

  industry: string | null
  location: string | null

  market_capitalization: number | null
  month_to_date_price_return_daily: number | null

  net_profit_margin_5y: number | null
  operating_margin_5y: number | null
  operating_margin_annual: number | null

  payout_ratio_annual: number | null
  pe_annual: number | null

  pretax_margin_5y: number | null
  pretax_margin_annual: number | null

  range_high: number | null
  range_low: number | null

  recommendation_history: Recommendation[]  | null

  roa_5y: number | null
  roa_rfy: number | null

  roe_5y: number | null
  roe_rfy: number | null

  roi_5y: number | null

  ticker: string
  volume: number | null
  website: string | null

  x13_week_price_return_daily: number | null
  x26_week_price_return_daily: number | null
  x3_month_average_trading_volume: number | null
  x52_week_price_return_daily: number | null
  x5_day_price_return_daily: number | null
}

interface Recommendation {
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
}

interface Price {
    "date": string,
    "price": number
}

type TimeFrame = '1Hour' | '4Hour' | '1Day' | '5Day' | '1Month' | '6Month' | '1Year';

export default function DetailedStockView({ symbol }: Props) {
 
    const { userID, userEmail, setAuth, clear } = useUser();

    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    useEffect(() => {
        if (!userID) return; 
        async function fetchCompanyData() {
            const res = await fetch(`/api/company-data?ticker=`+encodeURIComponent(symbol));
            const json: ApiResponse = await res.json();
            setApiResponse(json);
        }
        fetchCompanyData();
    }, [userID])

    
    // ---------------------- watchlist ---------------------------
    // const [localInWatchlist, setLocalInWatchlist] = useState<Boolean>(false);
    // useEffect(() => {
    //     setLocalInWatchlist(!!results?.inWatchlist);
    // }, [results])

    // const addToWatchlist = async () => {
    //     try {
    //         const user = auth.currentUser;

    //         const uid = user?.uid;
    //         const companyName = results?.companyName;
    //         const ticker = symbol;

    //         if (!companyName) throw new Error("No Company Name");
            
    //         const res = await fetch(
    //             `/api/watchlist_add?uid=${uid}&ticker=${ticker}&companyName=` + encodeURIComponent(companyName),
    //             { method: "POST" }
    //         );

    //         if (!res.ok) {
    //             console.log(`Error: ${res}`)
    //         } else {
    //             setLocalInWatchlist(true);
    //         }
    //     } catch {
    //         console.log(`Error`)
    //     }
    // }

    // const removeFromWatchlist = async () => {
    //     try {
    //         const user = auth.currentUser;

    //         const uid = user?.uid;
    //         const companyName = results?.companyName;
    //         const ticker = symbol;

    //         if (!companyName) throw new Error("No Company Name");
            
    //         const res = await fetch(
    //             `/api/watchlist_remove?uid=${uid}&ticker=${ticker}`,
    //             { method: "POST" }
    //         );

    //         if (!res.ok) {
    //             console.log(`Error: ${res}`)
    //         } else {
    //             setLocalInWatchlist(false);
    //         }
    //     } catch {
    //         console.log(`Error`)
    //     }
    // }

    if (!apiResponse) { 
        return (
            <LoadingBar/>
        ) 
    }

    return (
        <div className={styles.entireDiv}>
            <div className={styles.container}>
                <div className={styles.leftDiv}>

                    <CompanyVisuals 
                        ticker={apiResponse.company_data.ticker}
                        companyName={apiResponse.company_data.company_name}
                    />
                    
                    <PriceVisual
                        price={apiResponse.current_price}
                        date={apiResponse.current_price_date}
                        percentageChange={0}
                    />
                    
                    <TradeVisuals
                        ticker={apiResponse.company_data.ticker}
                        price={apiResponse.current_price}
                        date={apiResponse.current_price_date}
                        fundamentalData={apiResponse.company_data}
                    />
                    
                    <SummaryVisuals 
                        data={apiResponse.company_data}
                        price={apiResponse.current_price}
                    />
                    
                    <RecommendationVisual
                        recommendationHistory={apiResponse.company_data.recommendation_history}
                        currentRecommendation={apiResponse.company_data.current_recommendation}
                    />

                </div>

                <div className={styles.rightDiv}>
                    <TimeVisual location="America/New_York" />

                    <ChartsHandler data={apiResponse.historical_prices}  />
                </div>

                {/* <div className={styles.graphicalDataDiv}>
                    
                    <ChartsHandler data={results.timeseries} timeFrame={timeFrame}/>
                    <div className={styles.timeSelectorDiv}>
                        <h1 className={styles.heading}>Time Frame</h1>
                        <div className={styles.segment}>
                            <button className={styles.btn} aria-pressed={timeFrame == '1Hour'? "true" : "false"} onClick={set1Hour}>1 Hour</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '4Hour'? "true" : "false"} onClick={set4Hour}>4 Hours</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '1Day'? "true" : "false"} onClick={set1Day}>1 Day</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '5Day'? "true" : "false"} onClick={set5Day}>5 Days</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '1Month'? "true" : "false"} onClick={set1Month}>1 Month</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '6Month'? "true" : "false"} onClick={set6Month}>6 Months</button>
                            <button className={styles.btn} aria-pressed={timeFrame == '1Year'? "true" : "false"} onClick={set1Year}>1 Year</button>
                        </div>  
                    </div>
                </div> */}
            </div>
        </div>
    )

}