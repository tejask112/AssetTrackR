import Image from 'next/image';
import StockLineChart from './StockLineChart/StockLineChart';
import styles from './WatchlistCard.module.css'

interface WatchlistItem {
    oneD: string;
    fiveD: string;
    ticker: string;
    companyName: string;
    companyLogo: string;
    currentPrice: string;
    timeseries: number[];
}

interface WatchlistProp {
    item: WatchlistItem;
}

export default function Watchlist({ item }:WatchlistProp ) {

    return (
        <div className={styles.entireDiv}>
            <div className={styles.dataDiv}>
                <div className={styles.companyDataDiv}>
                    <Image src={item.companyLogo} alt={item.ticker} className={styles.companyLogo} width={55} height={55}/>
                    <div className={styles.companyNamesDiv}>
                        <h1 className={styles.ticker}>{item.ticker}</h1>
                        <h1 className={styles.companyName}>{item.companyName}</h1>
                    </div>
                </div>
                <h1 className={styles.price}>{item.currentPrice} USD</h1>
                <h1 className={styles.change}>{(Number(item.currentPrice)-(Number(item.currentPrice) / (1 + Number(item.oneD) / 100))).toFixed(2)} ({Number(item.oneD).toFixed(2)}%)  1D</h1> 
                <h1 className={styles.change}>{(Number(item.currentPrice)-(Number(item.currentPrice) / (1 + Number(item.fiveD) / 100))).toFixed(2)} ({Number(item.fiveD).toFixed(2)}%)  5D</h1>
            </div>
            <div className={styles.timeseriesDiv}>
                <StockLineChart prices={item.timeseries} chartColor={Number(item.fiveD) >= 0 ? 'green' : 'red'}/>
            </div>
                                            
        </div>
    )
}