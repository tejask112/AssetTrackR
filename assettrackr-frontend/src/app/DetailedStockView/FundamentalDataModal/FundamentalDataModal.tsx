'use client';
import Box from '@mui/material/Box'
import styles from './FundamentalDataModal.module.css';

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

interface FundamentalDataModalProp {
    results: ProfileDataResponse;
}

export default function FundamentalDataModal( {results}:FundamentalDataModalProp ) {
    return (
        <Box className={styles.fundamentalDataModal}>
            <div>
                <h1>Company {results.companyName}</h1>
                <h1>Location {results.location}</h1>
                <h1>Industry {results.industry}</h1>
                <h1>Company Description {results.companyDescription}</h1>
                <h1>Exchange {results.exchange}</h1>
                <h1>Website <a href={results.website}>{results.website}</a></h1>

                <h1>Volume {results.volume}</h1>
                <h1>Average Volume {results.averageVolume}</h1>
                <h1>Average Trading Volume (10 Day) {results.x10DayAverageTradingVolume}</h1>
                <h1>Average Trading Volume (3 Month) {results.x3MonthAverageTradingVolume}</h1>

                <h1>Asset Turnover (Annual) {results.assetTurnoverAnnual}</h1>
                <h1>Asset Turnover (TTM) {results.assetTurnoverTTM}</h1>

                <h1>5 Day Price Return (Daily) {results.x5DayPriceReturnDaily}</h1>
                <h1>Month-to-Date Price Return (Daily) {results.monthToDatePriceReturnDaily}</h1>
                <h1>13 Week Price Return (Daily) {results.x13WeekPriceReturnDaily}</h1>
                <h1>26 Week Price Return (Daily) {results.x26WeekPriceReturnDaily}</h1>
                <h1>52 Week Price Return (Daily) {results.x52WeekPriceReturnDaily}</h1>

                <h1>Market Capitalisation {results.marketCapitalisation}</h1>
                <h1>Enterprise Value {results.enterpriseValue}</h1>
                <h1>Forward P/E {results.forwardPE}</h1>
                <h1>Annual P/E {results.peAnnual}</h1>

                <h1>Gross Margin (5Y) {results.grossMargin5Y}</h1>
                <h1>Gross Margin (Annual) {results.grossMarginAnnual}</h1>
                <h1>Operating Margin (5Y) {results.operatingMargin5Y}</h1>
                <h1>Operating Margin (Annual) {results.operatingMarginAnnual}</h1>
                <h1>Net Profit Margin (5Y) {results.netProfitMargin5Y}</h1>
                <h1>Pretax Margin (5Y) {results.pretaxMargin5Y}</h1>
                <h1>Pretax Margin (Annual) {results.pretaxMarginAnnual}</h1>
                <h1>ROE (5Y) {results.roe5Y}</h1>
                <h1>ROE (RFY) {results.roeRfy}</h1>
                <h1>ROI (5Y) {results.roi5Y}</h1>
                <h1>ROI (Annual) {results.roiAnnual}</h1>
                <h1>ROA (5Y) {results.roa5Y}</h1>
                <h1>ROA (RFY) {results.roaRfy}</h1>

                <h1>Dividend Per Share (Annual) {results.dividendPerShareAnnual}</h1>
                <h1>Dividend Growth Rate (5Y) {results.dividendGrowthRate5Y}</h1>
                <h1>Payout Ratio (Annual) {results.payoutRatioAnnual}</h1>
            </div>
        </Box>
    ) 
}