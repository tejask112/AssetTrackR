import { useState } from "react";
import styles from './TimelineStats.module.css'
import ChartsHandler from "../../ReusableComponents/Chart/ChartHandler"; 

interface TimelineItem{
    datetime: string; 
    value: string; 
}

interface Props {
    timeline: TimelineItem[];
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

export default function TimelineStats({timeline}:Props) {

    const [timeframe, setTimeframe] = useState<Timeframe>('1M');

    if (!timeline) return (<></>)

    return(
        <div className={styles.chartDiv}>
            <ChartsHandler data={timeline} timeframe={timeframe}/>
            <div className={styles.divw}>
                <button className={timeframe=='1D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1D')}>1D</button>
                <button className={timeframe=='5D' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('5D')}>5D</button>
                <button className={timeframe=='1M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1M')}>1M</button>
                <button className={timeframe=='3M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('3M')}>3M</button>
                <button className={timeframe=='6M' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('6M')}>6M</button>
                <button className={timeframe=='1Y' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('1Y')}>1Y</button>
                <button className={timeframe=='Since Start' ? styles.timeframeButtonChosen : styles.timeframeButton} onClick={() => setTimeframe('Since Start')}>Show All</button>
            </div>
        </div>
    )
}