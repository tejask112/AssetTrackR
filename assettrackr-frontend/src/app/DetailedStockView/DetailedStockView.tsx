"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from './DetailedStockView.module.css';

interface Props {
    symbol: string;
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

interface TimeSeriesPoint {
    datetime: string; 
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

interface ProfileDataResponse {
    // Company metadata
    companyName: string;
    companyDescription: string;
    exchange: string;
    exchangeTimezone: string;
    website: string;
    industry: string;
    location: string;
    companyLogo: string;
    price: number;
    range: string;

    // Volume / liquidity
    volume: number;
    averageVolume: number;
    "10DayAverageTradingVolume": number;
    "3MonthAverageTradingVolume": number;

    // Asset turnover
    assetTurnoverAnnual: number;
    assetTurnoverTTM: number;

    // Price returns / momentum
    "5DayPriceReturnDaily": number;
    "10DayPriceReturnDaily": number;
    monthToDatePriceReturnDaily: number;
    "13WeekPriceReturnDaily": number;
    "26WeekPriceReturnDaily": number;
    "52WeekPriceReturnDaily": number;

    // Valuation & market cap
    marketCapitalisation: number;
    enterpriseValue: number;
    forwardPE: number;
    peAnnual: number;

    // Profitability & margins
    grossMargin5Y: number;
    grossMarginAnnual: number;
    operatingMargin5Y: number;
    operatingMarginAnnual: number;
    netProfitMargin5Y: number;
    pretaxMargin5Y: number;
    pretaxMarginAnnual: number;
    roe5Y: number;
    roeRfy: number;
    roi5Y: number;
    roiAnnual: number;
    roa5Y: number;
    roaRfy: number;

    // Dividend / payout
    dividendPerShareAnnual: number;
    dividendGrowthRate5Y: number;
    payoutRatioAnnual: number;

    // Other
    recommendationTools: Recommendation[];
    timeseries: TimeSeriesPoint[] | "Error";
}

export default function DetailedStockView({ symbol }: Props) {

    const [results, setResults] = useState<ProfileDataResponse | null>(null);

    useEffect(() => {
        async function fetchDetailedStockData() {
            const res = await fetch("/api/profile_data?query=" + encodeURIComponent(symbol));
            const json: ProfileDataResponse = await res.json();
            setResults(json);
        }
        fetchDetailedStockData();
    }, [])

    if (!results) { return (<h1>Loading</h1>) }

    return (
        <div className={styles.entireDiv}>
            <div className={styles.companyStatsDiv}>
                <div className={styles.companyVisuals}>
                    <div className={styles.imageDiv}>
                        <Image src={results.companyLogo} alt={symbol} className={styles.stockLogo} width={90} height={90} />
                    </div>
                    <div className={styles.companyNameDiv}>
                        <h1 className={styles.symbolName}>{symbol}</h1>
                        <h1 className={styles.companyName}>{results.companyName}</h1>
                    </div>
                </div>
                <div className={styles.priceVisuals}>
                    <h1 className={styles.price}>{results.price}</h1>
                    <div className={styles.priceMetaData}>
                        <h1 className={styles.hourText}>H</h1>
                        <h1>USD</h1>
                    </div>
                    <h1 className={styles.priceHourlyChangeStats}>-19.36 (-8.27%)</h1>
                </div>

                <button className={styles.tradeButton}>Trade {symbol}</button>
                <button className={styles.companyInfoButton}>View Company Info</button>

            </div>
            <div>

            </div>

        </div>
    )

}