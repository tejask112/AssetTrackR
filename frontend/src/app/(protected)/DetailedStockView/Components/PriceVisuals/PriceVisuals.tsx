import styles from './PriceVisuals.module.css'
import { useEffect, useRef, useState } from 'react'

interface Props {
    price: number,
    date: string,
    percentageChange: number
}

export default function PriceVisual({ price, date, percentageChange}: Props) {

    const iso = date
        .replace(/(\.\d{3})\d+/, '$1') // keep only 3 decimals so modern browsers can handle this iso date
        .replace('+00:00', 'Z');       // normalize UTC

    const dateDate = new Date(iso);

    const nyTime = dateDate.toLocaleTimeString('en-GB', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const [flashClass, setFlashClass] = useState<string>('')
    const prevPriceRef = useRef<number | null>(null)

    useEffect(() => {
        const prev = prevPriceRef.current
        prevPriceRef.current = price

        if (prev === null) return

        const diff = price - prev
        if (diff === 0) return

        setFlashClass('')
        void document.body.offsetHeight

        setFlashClass(diff > 0 ? styles.flashUp : styles.flashDown)

        const t = window.setTimeout(() => setFlashClass(''), 2000)
        return () => window.clearTimeout(t)
    }, [price])

    return (
        <div className={styles.visuals}>
            <h1 className={`${styles.price} ${flashClass}`}>{Number(price).toFixed(2)}</h1>
            <div className={styles.metadataDiv}>
                <div className={styles.metadata}> 
                    <h1 className={styles.hourText}>{nyTime}</h1>
                    <h1 className={styles.usdText}>USD</h1>
                </div>
            </div>
            {/* <h1 className={styles.hourlyChangeStats} style={{color:percentageChange == null? undefined : percentageChange > 0? "green": percentageChange < 0  ? "red": undefined}}>
                {percentageChange!=null && percentageChange>0 ? "+"+percentageChange : percentageChange}%
            </h1> */}
        </div>
    )
}