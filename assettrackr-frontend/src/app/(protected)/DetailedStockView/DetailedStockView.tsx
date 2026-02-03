"use client";
import { useEffect, useState } from "react";

import * as React from 'react';
import styles from './DetailedStockView.module.css';
import { useUser } from '@/context/UserContext';
import { supabase } from '../../../supabase/supabaseClient'

import CompanyVisuals from "./Components/CompanyVisuals/CompanyVisuals";
import PriceVisual from "./Components/PriceVisuals/PriceVisuals";
import TradeVisuals from "./Components/TradeVisuals/TradeVisuals";
import SummaryVisuals from "./Components/SummaryVisuals/SummaryVisuals";
import RecommendationVisual from "./Components/RecommendationVisuals/RecommendationVisuals";
import TimeVisual from "./Components/TimeVisual/TimeVisual";
import ChartsHandler from "../ReusableComponents/ChartComponent/ChartHandler";
import WatchlistVisuals from "./Components/WatchlistVisuals/WatchlistVisuals";
import LoadingBar from "./LoadingBar/LoadingBar";
import NotificationBox from "../ReusableComponents/NotificationBox/NotificationBox";


interface Props {
    symbol: string;
}

interface ApiResponse {
    "company_data": CompanyData,
    "current_price": number,
    "current_price_date": string,
    "historical_prices": Price[],
    "in_watchlist": boolean,
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

type MarketDataRow = {
  ticker: string
  date: string
  price: number
}

type InsertPayload<T> = {
  eventType: 'INSERT'
  schema: string
  table: string
  commit_timestamp: string
  new: T
  old: null
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

export default function DetailedStockView({ symbol }: Props) {
 
    const { userID, userEmail, setAuth, clear } = useUser();
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    

    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [supabaseConnectedMessage, setSupabaseConnectedMessage] = useState<boolean>(false);

    const [currentPrice, setCurrentPrice] = useState<number>(-1);
    const [currentPriceDate, setCurrentPriceDate] = useState<string>("");
    const [historicalPrices, setHistoricalPrices] = useState<Price[]>([]);

    useEffect(() => {
        if (!userID) return; 
        async function fetchCompanyData() {
            const res = await fetch(`/api/company-data?uid=${userID}&ticker=`+encodeURIComponent(symbol));
            const json: ApiResponse = await res.json();
            setApiResponse(json);
            setCurrentPrice(json.current_price);
            setCurrentPriceDate(json.current_price_date)
            setHistoricalPrices(json.historical_prices);
        }
        fetchCompanyData();
    }, [userID])

    // supabase realtime connection
    useEffect(() => {
        if (apiResponse === null) return;
        const channel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {event: 'INSERT',
                 schema: 'public',
                 table: 'market_data',
                 filter: `ticker=eq.${apiResponse.company_data.ticker}`},
                (payload) => {
                    const newData = payload as unknown as InsertPayload<MarketDataRow>;
                    const marketData = newData.new;

                    const newPrice = Number(marketData.price);
                    const newDate = marketData.date;

                    console.log(`NEW PRICE: ${newPrice} - ${newData}`);

                    setCurrentPrice(newPrice);
                    setCurrentPriceDate(newDate);
                    setHistoricalPrices((prevPrices) => [
                        ...prevPrices, 
                        { date: newDate, price: newPrice }
                    ]);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Connected to supabase`);
                    setSupabaseConnectedMessage(true);
                    setTimeout(() => setSupabaseConnectedMessage(false), 5000);
                }
            })

            return () => {
                supabase.removeChannel(channel)
            }
    }, [apiResponse])
    
    if (!apiResponse || !userID) { 
        return (
            <LoadingBar/>
        ) 
    }

    return (
        <div className={styles.entireDiv}>

            {supabaseConnectedMessage && (
                <NotificationBox 
                    success={true}
                    message={"CONNECTED"}
                />
            )}

            <div className={styles.container}>
                <div className={styles.leftDiv}>

                    <CompanyVisuals 
                        ticker={apiResponse.company_data.ticker}
                        companyName={apiResponse.company_data.company_name}
                    />
                    
                    <PriceVisual
                        price={currentPrice}
                        date={currentPriceDate}
                        percentageChange={0}
                    />
                    
                    <TradeVisuals
                        ticker={apiResponse.company_data.ticker}
                        price={currentPrice}
                        date={currentPriceDate}
                        fundamentalData={apiResponse.company_data}
                    />
                    
                    <SummaryVisuals 
                        data={apiResponse.company_data}
                        price={currentPrice}
                    />
                    
                    <RecommendationVisual
                        recommendationHistory={apiResponse.company_data.recommendation_history}
                        currentRecommendation={apiResponse.company_data.current_recommendation}
                    />

                </div>

                <div className={styles.rightDiv}>

                    <div className={styles.flex}>
                        <WatchlistVisuals 
                            ticker={apiResponse.company_data.ticker}
                            companyName={apiResponse.company_data.company_name}
                            uid={userID}
                            currentStatus={apiResponse.in_watchlist}
                        />
                        <TimeVisual 
                            location="America/New_York" 
                        />
                    </div>

                    <div className={styles.chartDiv}>
                        <div className={styles.divw}>
                            <button className={timeframe=='1D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1D')}>1D</button>
                            <button className={timeframe=='5D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('5D')}>5D</button>
                            <button className={timeframe=='1M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1M')}>1M</button>
                            <button className={timeframe=='3M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('3M')}>3M</button>
                            <button className={timeframe=='6M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('6M')}>6M</button>
                            <button className={timeframe=='1Y' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1Y')}>1Y</button>
                            <button className={timeframe=='Since Start' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('Since Start')}>Show All</button>
                        </div>
                        <ChartsHandler 
                            data={historicalPrices} 
                            height={650} 
                            timeframe={timeframe}
                        />
                    </div>

                </div>
            </div>
        </div>
    )

}