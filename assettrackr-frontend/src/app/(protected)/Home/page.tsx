'use client'
import { useEffect, useMemo, useState } from 'react';
import styles from './Home.module.css'
import TreeMap from './TreeMap/TreeMap'
import NewsCard from './News/News'

interface Portfolio {
    [ticker: string]: string;
}

interface TimelineItem {
    datetime: string; 
    value: string; 
}

interface NewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

interface HomePageData {
    assetValue: string;
    cash: string;
    portfolio: Portfolio[];
    timeline: TimelineItem[];
    news: NewsItem[];
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

    // --------- calculate start change ---------
    const [startChange, setStartChange] = useState<number | null>(null);
    const [startChangePercentage, setStartChangePercentage] = useState<number | null>(null);

    useEffect(() => {
        if (!homeData) return;

        setStartChange(Number(homeData.assetValue) + Number(homeData.cash) - 100000);
        setStartChangePercentage(((Number(homeData.assetValue) + Number(homeData.cash) - 100000) / 100000) * 100);

    }, [homeData])

    const formatForCommas = (amount: number): string =>
        new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

    // const items = homeData.news.filter(n => n.category?.toLowerCase() === "top news").sort((a, b) => b.datetime - a.datetime);             

    if (!homeData) {return (<h1>Loading...</h1>)}

    return (
        <div className={styles.externalDiv}>
            
            <div className={styles.portfolioDiv}>
                <div className={styles.dataDiv}>
                    <div className={styles.overviewDiv}>
                        <div className={styles.accountValueSection}>
                            <div className={styles.titleText}>Account's value</div>
                            <div className={styles.accountValueAmount}>{formatForCommas(Number(homeData.assetValue))} USD</div>
                        </div>
                        <div className={styles.overviewChange}>
                            <div className={styles.changeItem}>
                                <div className={styles.titleText}>Today's change</div>
                                <div className={styles.changeValue} style={{color:typeof todaysChange === 'number'? todaysChange > 0 ? '#059669' : todaysChange < 0 ? '#dc2626' : undefined: undefined }}>
                                    {todaysChange != null && todaysChange > 0 ? "+" : ""}{todaysChange ? formatForCommas(todaysChange) : '—'} {todaysChangePercentage != null ? `(${todaysChangePercentage.toFixed(2)}%)` : ''}
                                </div>
                            </div>
                            <div className={styles.changeItem} style={{color:typeof todaysChange === 'number'? todaysChange > 0 ? '#059669' : todaysChange < 0 ? '#dc2626' : undefined: undefined }}>
                                <div className={styles.titleText}>Since Start</div>
                                <div className={styles.changeValue}>
                                    {startChange != null && startChange > 0 ? "+" : ""}{startChange ? formatForCommas(startChange) : '—'} {startChangePercentage != null ? `(${formatForCommas(startChangePercentage)}%)` : ''}
                                </div>
                            </div>
                        </div>
                        <div className={styles.cashSection}>
                            <div className={styles.titleText}>Cash Balance</div>
                            <div className={styles.cashAmount}>{homeData.cash != null ? formatForCommas(Number(homeData.cash)) : '-'} USD</div>
                        </div>
                    </div>

                    <div >
                        <div className={styles.portfolioTitle}>Portfolio Distribution</div>
                        <TreeMap portfolio={homeData.portfolio} showDistributedColors colors={['#4f6d7a','#8DCAE3','#84a59d', '#428C77']}/>
                    </div>
                </div>

                <div className={styles.chartDiv}>
                    <h1>chart</h1>
                </div>
            </div>

            <div className={styles.additionalInfoDiv}>
                
                <div className={styles.watchlistDiv}>
                    <h1>watchlist</h1>
                </div>

                <div className={styles.newsDiv}>
                    <h1 className={styles.newsTitle}>Recent Market News</h1>

                    <div className={styles.newsItemContainer}> 
                        <div className={styles.newsGrid}>
                        {homeData.news.map((item) => (
                            <NewsCard key={item.id} item={item} />
                        ))}
                        </div>
                    </div>

                </div>

            </div>


            
            
            
           
        </div>
    )
}