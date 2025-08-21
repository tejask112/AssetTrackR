"use client";
import { useEffect, useState } from "react";
import * as React from 'react';
import Image from "next/image";
import styles from './DetailedStockView.module.css';
import RecommendationChart from './RecommendationChart/RecommendationChart';
import FundamentalDataModal from './FundamentalDataModal/FundamentalDataModal';
import Modal from '@mui/material/Modal';
import ChartsHandler from "./Charts/ChartsHandler";
import LoadingBar from "./LoadingBar/LoadingBar";

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

type TimeFrame = '1Hour' | '4Hour' | '1Day' | '5Day' | '1Month' | '6Month' | '1Year';

export default function DetailedStockView({ symbol }: Props) {

    const [results, setResults] = useState<ProfileDataResponse | null>(null);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose= () => setOpen(false);

    useEffect(() => {
        async function fetchDetailedStockData() {
            const res = await fetch("/api/profile_data?query=" + encodeURIComponent(symbol));
            const json: ProfileDataResponse = await res.json();
            setResults(json);
        }
        fetchDetailedStockData();
    }, [])

    // ---------------------- Handling the Time-Frame for the Charts ----------------------

    const [timeFrame, setTimeFrame] = useState<TimeFrame>('5Day');

    const set1Hour = () => setTimeFrame('1Hour');
    const set4Hour = () => setTimeFrame('4Hour');
    const set1Day = () => setTimeFrame('1Day');
    const set5Day = () => setTimeFrame('5Day');
    const set1Month = () => setTimeFrame('1Month');
    const set6Month = () => setTimeFrame('6Month');
    const set1Year = () => setTimeFrame('1Year');

    // ---------------------- Percentage change ----------------------

    const [percentageChange, setPercentageChange] = useState<number | null>(null)

    // one hour
    const [oneHourIndex, setOneHourIndex] = useState<number>(59);
    const [oneHourPercentage, setOneHourPercentage] = useState<number | null>(null);

    useEffect(() => {
        if (results != null && Array.isArray(results.timeseries)) {
            const closeStr = results.timeseries.at(oneHourIndex)?.close;
            const closeInt = closeStr == null ? null : Number(closeStr);
            if (closeInt != null) {
                const percentageDiff = Number((((results.price - closeInt) / closeInt) * 100).toFixed(4));
                console.log("User clicked on 1Hr - Percentage Change: " + percentageDiff)
                setOneHourPercentage(percentageDiff);
            }

        }
    }, [results, oneHourIndex])

    // four hours
    const [fourHoursIndex, setFourHoursIndex] = useState<number>(239);
    const [fourHourPercentage, setFourHoursPercentage] = useState<number | null>(null);

    useEffect(() => {
        if (results != null && Array.isArray(results.timeseries)) {
            const closeStr = results.timeseries.at(fourHoursIndex)?.close;
            const closeInt = closeStr == null ? null : Number(closeStr);
            if (closeInt != null) {
                const percentageDiff = Number((((results.price - closeInt) / closeInt) * 100).toFixed(4));
                console.log("User clicked on 4Hr - Percentage Change: " + percentageDiff)
                setFourHoursPercentage(percentageDiff);
            }

        }
    }, [results, fourHoursIndex])

    // 1 day
    const [oneDayIndex, setOneDayIndex] = useState<number>(389);
    const [oneDayPercentage, setOneDayPercentage] = useState<number | null>(null);

    useEffect(() => {
        if (results != null && Array.isArray(results.timeseries)) {
            const closeStr = results.timeseries.at(oneDayIndex)?.close;
            const closeInt = closeStr == null ? null : Number(closeStr);
            if (closeInt != null) {
                const percentageDiff = Number((((results.price - closeInt) / closeInt) * 100).toFixed(4));
                console.log("User clicked on 4Hr - Percentage Change: " + percentageDiff)
                setOneDayPercentage(percentageDiff);
            }

        }
    }, [results, fourHoursIndex])

    

    useEffect(() => {
        if (results != null) {
            switch (timeFrame) {
                case '1Hour':
                    setPercentageChange(oneHourPercentage);
                    break
                case '4Hour':
                    setPercentageChange(fourHourPercentage);
                    break;
                case '1Day':
                    setOneDayPercentage(oneDayPercentage);
                    break;
                case '5Day':
                    setPercentageChange(results.x5DayPriceReturnDaily);
                    break;
                case '1Month':
                    setPercentageChange(results.monthToDatePriceReturnDaily);
                    break;
                case '6Month':
                    setPercentageChange(results.x26WeekPriceReturnDaily);
                    break;
                case '1Year':
                    setPercentageChange(results.x52WeekPriceReturnDaily);
                    break;
                default:
                    setPercentageChange(results.x5DayPriceReturnDaily);
            }
        }
    }, [timeFrame, results])

 
    
 

    // wait for the api to return a response
    if (!results) { return (<LoadingBar></LoadingBar>) }

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
                    <h1 className={styles.priceHourlyChangeStats} style={{color:percentageChange == null? undefined : percentageChange > 0? "green": percentageChange < 0  ? "red": undefined}}>
                        {percentageChange!=null && percentageChange>0 ? "+"+percentageChange : percentageChange}%
                    </h1>
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
            </div>
        </div>
    )

}