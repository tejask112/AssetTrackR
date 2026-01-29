'use client'
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import styles from './PortfolioAnalytics.module.css'
import TimelineStats from "./TimelineStats/TimelineStats";

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

    if (!data || !userID) {return (<h1>Loading...</h1>)}

    return(
        <div className={styles.externalDiv}>
            <TimelineStats timeline={data.timeline}/>
        </div>
    );

}