import styles from './PriceVisuals.module.css'

interface Props {
    price: number,
    date: string,
    percentageChange: number
}

export default function PriceVisual({ price, date, percentageChange}: Props) {

    const dateDate = new Date(date);
    const nyTime = dateDate.toLocaleTimeString('en-GB', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return (
        <div className={styles.visuals}>
            <h1 className={styles.price}>{Number(price).toFixed(2)}</h1>
            <div className={styles.metadataDiv}>
                <div className={styles.metadata}> 
                    <h1 className={styles.hourText}>{nyTime}</h1>
                    <h1>USD</h1>
                </div>
            </div>
            <h1 className={styles.hourlyChangeStats} style={{color:percentageChange == null? undefined : percentageChange > 0? "green": percentageChange < 0  ? "red": undefined}}>
                {percentageChange!=null && percentageChange>0 ? "+"+percentageChange : percentageChange}%
            </h1>
        </div>
    )
}