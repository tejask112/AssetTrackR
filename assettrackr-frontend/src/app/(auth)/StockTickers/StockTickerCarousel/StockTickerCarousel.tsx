'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './StockTickerCarousel.module.css'

interface Props {
    ticker: string,
    companyName: string,
    price: number,
    change: number,
    data: Performance[],
    color: string,
}

interface Performance {
    index: number,
    close: number,
}

export default function StockTickerCarousel( { ticker, companyName, price, change, data, color }: Props ) {
    return(
        <div className={styles.entireDiv}>
            <div className={styles.namesDiv}>
                <h1 className={styles.ticker}>{ticker}</h1>
                <h1 className={styles.companyName}>{companyName}</h1>
            </div>

            <div className={styles.chartsDiv}>
                <ResponsiveContainer width="100%" height="75%">
                    <LineChart data={data}>
                        <XAxis dataKey="index" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className={styles.pricesDiv}>
                <h1 className={styles.price}>{price}</h1>
                <h1 className={styles.percentage}>{change}%</h1>
            </div>  

            <div className={styles.lineSeparator} role="separator" aria-orientation="vertical"/>          
        </div>
    )
}