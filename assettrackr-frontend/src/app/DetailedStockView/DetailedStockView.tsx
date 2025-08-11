"use client";
import { useEffect, useState } from "react";
import * as React from 'react';
import Image from "next/image";
import styles from './DetailedStockView.module.css';
import RecommendationChart from './RecommendationChart/RecommendationChart';
import FundamentalDataModal from './FundamentalDataModal/FundamentalDataModal';
import LineDispChart from './Charts/LineChart/LineDispChart'
import Modal from '@mui/material/Modal';

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

export interface ProfileDataResponse {
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
    priceTimeShort: string;
    priceTimeLong: string;
    rangeLow: number;
    rangeHigh: number;

    // Volume / liquidity
    volume: number;
    averageVolume: number;
    x10DayAverageTradingVolume: number;
    x3MonthAverageTradingVolume: number;

    // Asset turnover
    assetTurnoverAnnual: number;
    assetTurnoverTTM: number;

    // Price returns / momentum
    x5DayPriceReturnDaily: number;
    monthToDatePriceReturnDaily: number;
    x13WeekPriceReturnDaily: number;
    x26WeekPriceReturnDaily: number;
    x52WeekPriceReturnDaily: number;

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
    recommendation: string;
    recommendationTools: Recommendation[];
    timeseries: TimeSeriesPoint[] | "Error";
}

export default function DetailedStockView({ symbol }: Props) {

    const [results, setResults] = useState<ProfileDataResponse | null>(null);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose= () => setOpen(false);

    const toUnixSecondsUTC = (s: string) => {
        const [d, t] = s.split(' ');
        const [Y, M, D] = d.split('-').map(Number);
        const [h, m, sec] = t.split(':').map(Number);
        return Math.floor(Date.UTC(Y, M - 1, D, h, m, sec) / 1000);
    };

    const toLineDataUTC = (rows: TimeSeriesPoint[]) =>
    rows
        .map(p => ({ time: toUnixSecondsUTC(p.datetime), value: parseFloat(p.close) }))
        .sort((a, b) => a.time - b.time);

    const lineData = React.useMemo(() => {
        if (!results || !Array.isArray(results.timeseries)) return [];
        return toLineDataUTC(results.timeseries);
    }, [results]);

    const [lineChart, setLineChart] = useState<boolean>(true);
    const [candlestickChart, setCandlestickChart] = useState<boolean>(false);
    const [ohlcChart, setOhlcChart] = useState<boolean>(false);

    const showLineChart = () => {
        setLineChart(true);
        setCandlestickChart(false);
        setOhlcChart(false);
    }

    const showCandlestickChart = () => {
        setLineChart(false);
        setCandlestickChart(true);
        setOhlcChart(false);
    }

    const showOHLCChart = () => {
        setLineChart(false);
        setCandlestickChart(false);
        setOhlcChart(true);
    }

    useEffect(() => {
        async function fetchDetailedStockData() {
            const res = await fetch("/api/profile_data?query=" + encodeURIComponent(symbol));
            const json: ProfileDataResponse = await res.json();
            setResults(json);
        }
        fetchDetailedStockData();
    }, [])

    if (!results) { return (<div className={styles.entireDiv}> <h1>Loading...</h1> </div>) }

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
                    <h1 className={styles.price}>{Number(results.price).toFixed(2)}</h1>
                    <div className={styles.priceMetaData}>
                        <h1 className={styles.hourText}>{results.priceTimeShort}</h1>
                        <h1>USD</h1>
                    </div>
                    <h1 className={styles.priceHourlyChangeStats}>-19.36 (-8.27%)</h1>
                </div>

                <div className={styles.buttonsDiv}>
                    <button className={styles.tradeButton}>Trade {symbol}</button>
                    <button className={styles.fundamentalDataButton} onClick={handleOpen}>View Fundamental Data</button>
                    <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">

                        <FundamentalDataModal results={results}/>
                    </Modal>
                </div>

                <div className={styles.briefCompanyInfoCard}>
                    <div className={styles.metricsThreeCol}>
                        <div className={styles.col}>
                        <div className={styles.metric}>
                            <div className={styles.label}>Exchange</div>
                            <div className={styles.value}>{results.exchange}</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>Volume</div>
                            <div className={styles.value}>{results.volume.toLocaleString()}</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>Market Cap</div>
                            <div className={styles.value}>${results.marketCapitalisation.toLocaleString()}</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>Annual P/E</div>
                            <div className={styles.value}>{results.peAnnual?.toFixed(2)}</div>
                        </div>
                        </div>

                        <div className={styles.col}>
                        <div className={styles.metric}>
                            <div className={styles.label}>5 Day Return</div>
                            <div
                            className={styles.value}
                            style={results.x5DayPriceReturnDaily < 0 ? { color: "red" } : { color: "green" }}
                            >
                            {results.x5DayPriceReturnDaily.toFixed(2)}%
                            </div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>1 Month Return</div>
                            <div
                            className={styles.value}
                            style={results.monthToDatePriceReturnDaily < 0 ? { color: "red" } : { color: "green" }}
                            >
                            {results.monthToDatePriceReturnDaily.toFixed(2)}%
                            </div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>6 Month Return</div>
                            <div
                            className={styles.value}
                            style={results.x26WeekPriceReturnDaily < 0 ? { color: "red" } : { color: "green" }}
                            >
                            {results.x26WeekPriceReturnDaily.toFixed(2)}%
                            </div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>1 Year Return</div>
                            <div
                            className={styles.value}
                            style={results.x52WeekPriceReturnDaily < 0 ? { color: "red" } : { color: "green" }}
                            >
                            {results.x52WeekPriceReturnDaily.toFixed(2)}%
                            </div>
                        </div>
                        </div>

                        <div className={styles.col}>
                        <div className={styles.metric}>
                            <div className={styles.label}>1 Year High</div>
                            <div className={styles.value}>${results.rangeHigh}</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>Ask Price</div>
                            <div className={styles.value}>${Number(results.price).toFixed(2)}</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.label}>1 Year Low</div>
                            <div className={styles.value}>${results.rangeLow}</div>
                        </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className={styles.recommendationSection}>
                        <h1 className={styles.recommendationTitle}>Our Recommendation: </h1> 
                        <h1 className={styles.recommendationResult}> {results.recommendation}</h1>
                        <div className={styles.tooltip}>
                            <button>Warning!</button>
                            <div className={styles.tooltiptext}>⚠️ This tool is for informational purposes only and does not constitute
                                financial advice. Investing carries risk and you could lose money. Always
                                do your own research or consult a professional before making any trades.</div>
                        </div>
                    </div>
                    <RecommendationChart data={results.recommendationTools} />
                </div>
            </div>

            <div className={styles.graphicalDataDiv}>
                <h1 className={styles.timezoneHeading}>Time Zone: {results.exchangeTimezone.replace(/_/g, " ")}</h1>
                
                <div className={styles.div1}>
                    <div className={styles.chartTypeButtons}>
                        <button className={`${styles.chartTypeButton} ${lineChart ? styles.active : ""}`} onClick={showLineChart}>Line</button>
                        <button className={`${styles.chartTypeButton} ${candlestickChart ? styles.active : ""}`} onClick={showCandlestickChart}>Candlestick</button>
                        <button className={`${styles.chartTypeButton} ${ohlcChart ? styles.active : ""}`} onClick={showOHLCChart}>OHLC</button>
                    </div>
                    <div>
                        {lineChart && <LineDispChart data={lineData} height={550} />}

                        
                    </div>
                    
                </div>
            </div>
        </div>
    )

}