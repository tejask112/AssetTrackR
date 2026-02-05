import TreeMap from "./TreeMap/TreeMap";
import styles from './PortfolioVisual.module.css'

interface PortfolioItem {
    current_price: number;
    quantity: number;
    ticker: string;
    change_5d_pct?: number;
}

interface Props {
    data: PortfolioItem[];
}

export default function PortfolioVisual({ data }: Props) {

    return (
        <div className={styles.entireDiv}>
            <h1 className={styles.title}>Portfolio Breakdown</h1>
            <TreeMap data={data} />
        </div>
    )
}