import styles from './Home.module.css'

export default function Home() {

    return (
        <div className={styles.externalDiv}>
            
            {/* Asset Stats div */}
            <div className={styles.statsBox}>
                <h1>Assets Value</h1>
                <h1>£145,23.05</h1>
                <h1>Rate of Return</h1>
            </div>
            
            {/* Chart Div */}
            <div className={styles.chartBox}>

            </div>
           
        </div>
    )
}