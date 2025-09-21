'use client'
import { useEffect, useMemo, useState } from 'react';
import styles from './Home.module.css'

interface Portfolio {
    [ticker: string]: string;
}

interface TimelineItem {
    datetime: string; 
    value: string; 
}

interface HomePageData {
    assetValue: string;
    cash: string;
    portfolio: Portfolio[];
    timeline: TimelineItem[];
}


export default function Home() {

    const [uid, setUid] = useState<string>("X5s2HImyTfNITElXIdhIRu0K70F3")

    const [homeData, setHomeData] = useState<HomePageData | null>(null);
    useEffect(() => {
        async function fetchHomePageData() {
            const res = await fetch("api/home_data?query=" + encodeURIComponent(uid));
            const json: HomePageData = await res.json();
            setHomeData(json);
        }
        fetchHomePageData();
    }, [])

    // --------- calculate today's change (timezone aware) ---------
    const [todaysChange, setTodaysChange] = useState<number | null>(null);
    const [todaysChangePercentage, setTodaysChangePercentage] = useState<number | null>(null);

    const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
    const fmtYMD = useMemo(() =>
        new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }),
        [timeZone]
    );
    const todayYMD = useMemo(() => fmtYMD.format(new Date()), [fmtYMD]);
    
    useEffect(() => {
        if (!homeData || !homeData.timeline?.length) return;

        const todayPoints = homeData.timeline.map(p => ({...p, ymd: fmtYMD.format(new Date(p.datetime)),}))
        .filter(p => p.ymd === todayYMD)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

        if (todayPoints.length === 0) {
            setTodaysChange(0);
            setTodaysChangePercentage(0);
            return;
        }

        const open = Number(todayPoints[0]!.value);
        const last = Number(homeData.assetValue);

        if (!Number.isFinite(open) || !Number.isFinite(last)) {
            setTodaysChange(null);
            setTodaysChangePercentage(null);
            return;
        }

        const delta = last - open;
        setTodaysChange(delta);
        setTodaysChangePercentage(open !== 0 ? (delta / open) * 100 : null);
    }, [homeData, fmtYMD, todayYMD]);

    if (!homeData) {return (<h1>Loading...</h1>)}

    return (
        <div className={styles.externalDiv}>
            
            {/* Asset Stats div */}
            <div className={styles.statsBox}>
                <h1>Assets Value</h1>
                <h1>{Number(homeData.assetValue).toFixed(2)} USD</h1>
                <h1>{todaysChange ?? '—'} USD</h1>
                <h1>{todaysChangePercentage == null ? '—' : todaysChangePercentage.toFixed(2) + '%'}</h1>
                <h1>Cash: {Number(homeData.cash).toFixed(2)}</h1>
            </div>
            
            
           
        </div>
    )
}