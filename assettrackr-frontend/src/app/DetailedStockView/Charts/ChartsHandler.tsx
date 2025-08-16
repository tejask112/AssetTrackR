import { useEffect, useState } from "react";
import * as React from 'react';
import LineDispChart from './LineChart/LineDispChart'
import CandleStickChart from './CandleStickChart/CandleStickChart'
import OHLCChart from './OHLCDispChart/OHLCDispChart'
import styles from './ChartsHandler.module.css'

interface Props {
    data: TimeSeriesPoint[] | "Error";
}

interface TimeSeriesPoint {
    datetime: string; 
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

export default function ChartsHandler( { data }:Props) {

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
        if (!data || !Array.isArray(data)) return [];
        return toLineDataUTC(data);
    }, [data]);
    
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

    return (
        <div className={styles.chartDiv}>
            <div className={styles.chartTypeButtons}>
                <button className={`${styles.chartTypeButton} ${lineChart ? styles.active : ""}`} onClick={showLineChart}>Line</button>
                <button className={`${styles.chartTypeButton} ${candlestickChart ? styles.active : ""}`} onClick={showCandlestickChart}>Candlestick</button>
                <button className={`${styles.chartTypeButton} ${ohlcChart ? styles.active : ""}`} onClick={showOHLCChart}>OHLC</button>
            </div>
            <div>
                {lineChart && <LineDispChart data={lineData} height={550} />}
                {candlestickChart && Array.isArray(data) && ( <CandleStickChart data={data} height={550} />)}
                {ohlcChart && Array.isArray(data) && ( <OHLCChart data={data} height={550} /> )}
            </div>
            <div className={styles.timeSelectorDiv}>
                <h1 className={styles.heading}>Time Frame</h1>
                <div className={styles.segment}>
                <button className={styles.btn}>1 Hour</button>
                <button className={styles.btn}>4 Hours</button>
                <button className={styles.btn}>1 Day</button>
                <button className={styles.btn}>5 Days</button>
                <button className={styles.btn}>1 Month</button>
                <button className={styles.btn}>6 Months</button>
                <button className={styles.btn}>1 Year</button>
                </div>  

            </div>
            
        </div>
       
    )
}