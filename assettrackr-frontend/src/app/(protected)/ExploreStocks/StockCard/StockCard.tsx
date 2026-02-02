'use client'

import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase/supabaseClient';
import Image from 'next/image';
import styles from './StockCard.module.css';
import StockLineChart from '../../ReusableComponents/StockLineChart/StockLineChart';
import { useEffect, useState } from 'react';

interface StockData {
    "company_name": string,
    "current_recommendation": string,
    "exchange": string,
    "latest_price": string,
    "month_to_date_price_return_daily": number,
    "prices": number[],
    "range_high": number,
    "range_low": number,
    "ticker": string,
    "x7d_change": number,
}

interface StockDataProp {
    data: StockData
}

export default function StockCard({ data }: StockDataProp) {
    const router = useRouter();

    const tickerFilename = `${data.ticker.toLowerCase()}.png`;
    const { data: logoUrl } = supabase.storage
        .from('company_images')
        .getPublicUrl(tickerFilename, {
            transform: { width: 300, height: 300, quality: 100 }
        });

    
    
    const currentPrice = Number(data.latest_price)
    const rangeHigh = Math.max(Number(data.range_high), ...data.prices)
    const rangeLow  = Math.min(Number(data.range_low),  ...data.prices)

    const recommendationMap = new Map<string, string>();
    recommendationMap.set("strongBuy", "STRONG BUY");
    recommendationMap.set("buy", "BUY");
    recommendationMap.set("hold", "HOLD");
    recommendationMap.set("sell", "SELL");
    recommendationMap.set("strongSell", "STRONG SELL");

    return (
        <button className={styles.entireDiv} onClick={() => router.push(`DetailedStockView/${data.ticker}`)}>
            <div className={styles.dataDiv}>
                <div className={styles.companyDataDiv}>
                    <Image src={logoUrl.publicUrl} alt={data.ticker} className={styles.companyLogo} width={55} height={55}/>
                    <div className={styles.companyNamesDiv}>
                        <h1 className={styles.ticker}>{data.ticker}</h1>
                        <h1 className={styles.companyName}>{data.company_name}</h1>
                    </div>
                </div>
                <h1 className={styles.price}>{currentPrice} USD</h1>
                {data.x7d_change ?
                    <h1 className={data.x7d_change > 0 ? styles.pvechange : styles.nvechange}>
                        {(Number(data.latest_price) - (Number(data.latest_price) / (1 + Number(data.x7d_change) / 100))).toFixed(2)} ({Number(data.x7d_change).toFixed(2)}%) 7D
                    </h1> 
                    : 
                    <h1 className={styles.change}> - 7D</h1>
                }
                {data.month_to_date_price_return_daily ? 
                    (<h1 className={styles.change}>{(Number(data.latest_price)-(Number(data.latest_price) / (1 + Number(data.month_to_date_price_return_daily) / 100))).toFixed(2)} ({Number(data.month_to_date_price_return_daily).toFixed(2)}%) MTD</h1>) : 
                    (<h1 className={styles.change}> - MTD</h1>)
                }
            </div>

            <div className={styles.timeseriesDiv}>
                <StockLineChart prices={data.prices} chartColor={Number(data.x7d_change) >= 0 ? 'green' : 'red'}/>
            </div>



            <div className={styles.metadataDiv}>
                <div className={styles.exchangeDiv}>
                    <h1 className={styles.metadataTitle}>Exchange</h1>
                    <h1 className={styles.exchangeText}>{data.exchange}</h1>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statLine}>
                        <h1 className={styles.metadataTitle}>1 Year High</h1>
                        <h1>{rangeHigh}</h1>
                    </div>
                    <div className={styles.statLine}>
                        <h1 className={styles.metadataTitle}>Current</h1>
                        <h1>{currentPrice}</h1>
                    </div>
                    <div className={styles.statLine}>
                        <h1 className={styles.metadataTitle}>1 Year Low</h1>
                        <h1>{rangeLow}</h1>
                    </div>
                </div>

                <div className={styles.recommendationDiv}>
                    <h1 className={styles.metadataTitle}>Our Recommendation</h1>
                    <h1 className={styles.exchangeText}>{recommendationMap.get(data.current_recommendation)}</h1>
                </div>
            </div>
        </button>
    )
    
}