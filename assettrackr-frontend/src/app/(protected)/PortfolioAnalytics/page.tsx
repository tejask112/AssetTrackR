'use client'
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import styles from './PortfolioAnalytics.module.css'
import ChartsHandler from "../ReusableComponents/Chart/ChartHandler";

interface TimelineItem{
    datetime: string; 
    value: string; 
}

interface Timeline{
    timeline: TimelineItem[];
}

interface Data{
    timeline: Timeline;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

export default function PortfolioAnalytics() {

    const { userID, userEmail, setAuth, clear } = useUser();
    
    const [data, setData] = useState<Timeline | null>(null);

    useEffect(() => {
        if (!userID) return; 
        async function fetchAnalyticsData() {
            const res = await fetch(`api/analytics/data?uid=${userID}`);
            const json: Timeline = await res.json();
            setData(json);
        }
        fetchAnalyticsData();
    }, [userID])

    const [timeframe, setTimeframe] = useState<Timeframe>('1M');

    if (!data || !userID) {return (<h1>Loading...</h1>)}

    return(
        <div className={styles.externalDiv}>
            <div className={styles.chartDiv}>
                <div>
                    <button>1D</button>
                    <button>5D</button>
                    <button>1M</button>
                    <button>3M</button>
                    <button>6M</button>
                    <button>1Y</button>
                    <button>Since Start</button>
                </div>
                <ChartsHandler data={data.timeline} timeframe={timeframe}/>
            </div>
        </div>
    );

}