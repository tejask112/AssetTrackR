import WatchlistCard from './Watchlist/WatchlistCard';
import styles from './WatchlistVisual.module.css'


interface Props {
    watchlistData: Watchlist[];
}

interface Watchlist {
    company_name: string;
    latest_price: number;
    prices: number[];
    ticker: string;
    x7d_change: number;
    x7d_change_pct: number;
}

export default function WatchlistVisual({ watchlistData }: Props) {

    return (
        <div>
            <h1 className={styles.title}>My Watchlist</h1>
            <div>
                {watchlistData.length > 0 ? (
                    watchlistData.map((item) => (
                        <WatchlistCard 
                            key={item.ticker} 
                            data={item}
                        />
                    ))
                ) : (
                    <h1>Watchlist is empty</h1>
                )}
            </div>
        </div>
       

    )
}