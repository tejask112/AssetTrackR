import styles from './MarketMoverVisual.module.css'

interface MoverData {
    change: number;
    change_pct: number;
    old_price: number;
    current_price: number;
    ticker: string;
}

interface Props {
    gainers: MoverData[];
    losers: MoverData[];
}

export default function MarketMoverVisual({ gainers, losers }: Props) {
    const sortedGainers = [...gainers].sort((a, b) => b.change_pct - a.change_pct);
    const sortedLosers = [...losers].sort((a, b) => a.change_pct - b.change_pct);

    return (
        <div className={styles.entireDiv}>
            <h1 className={styles.title}>Market Overview</h1>
            
            <div className={styles.section}>
                <h1 className={styles.header}>Strongest Performers (24H)</h1>
                <div className={styles.list}>
                    {sortedGainers.map((stock) => (
                        <div key={stock.ticker} className={styles.row}>
                            <span className={styles.ticker}>{stock.ticker}</span>
    
                            <div className={styles.priceFlow}>
                                <span className={styles.oldPrice}>{stock.old_price.toFixed(2)}</span>
                                <span className={styles.arrow}>&rarr;</span>
                                <span className={styles.currentPrice}>{stock.current_price.toFixed(2)} USD</span>
                            </div>

                            <span className={stock.change >= 0 ? styles.gain : styles.loss}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_pct.toFixed(2)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h1 className={styles.header}>Weakest Performers (24H)</h1>
                <div className={styles.list}>
                    {sortedLosers.map((stock) => (
                        <div key={stock.ticker} className={styles.row}>
                            <span className={styles.ticker}>{stock.ticker}</span>
    
                            <div className={styles.priceFlow}>
                                <span className={styles.oldPrice}>{stock.old_price.toFixed(2)}</span>
                                <span className={styles.arrow}>&rarr;</span>
                                <span className={styles.currentPrice}>{stock.current_price.toFixed(2)} USD</span>
                            </div>

                            <span className={stock.change >= 0 ? styles.gain : styles.loss}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_pct.toFixed(2)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}