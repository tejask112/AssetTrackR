import { useEffect, useState } from "react";
import * as React from 'react';
import LineDispChart from './LineChart/LineDispChart'
import CandleStickChart from './CandleStickChart/CandleStickChart'
import OHLCChart from './OHLCDispChart/OHLCDispChart'
import styles from './ChartsHandler.module.css'

type TimeFrame = '1Hour' | '4Hour' | '1Day' | '5Day' | '1Month' | '6Month' | '1Year';

interface Props {
    data: TimeSeriesPoint[] | "Error";
    timeFrame: TimeFrame;
}

interface TimeSeriesPoint {
    datetime: string; 
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}



export default function ChartsHandler( { data, timeFrame }:Props) {

    const toUnixSecondsUTC = (s: string) => {
        const [d, t] = s.split(' ');
        const [Y, M, D] = d.split('-').map(Number);
        const [h, m, sec] = t.split(':').map(Number);
        return Math.floor(Date.UTC(Y, M - 1, D, h, m, sec) / 1000);
    };

    const toLineDataUTC = (rows: TimeSeriesPoint[]) =>
    rows.map(p => ({ time: toUnixSecondsUTC(p.datetime), value: parseFloat(p.close) })).sort((a, b) => a.time - b.time);

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
                {lineChart && <LineDispChart data={lineData} timeFrame={timeFrame} height={600} />}
                {candlestickChart && Array.isArray(data) && (  <CandleStickChart data={data} timeFrame={timeFrame} height={600} /> )}
                {ohlcChart && Array.isArray(data) && ( <OHLCChart data={data} timeFrame={timeFrame} height={600} /> )}
            </div>
            
        </div>
       
    )
}