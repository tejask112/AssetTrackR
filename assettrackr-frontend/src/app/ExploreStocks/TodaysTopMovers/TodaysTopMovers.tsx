'use client';
import styles from './TodaysTopMovers.module.css'
import { useRef, useEffect } from 'react';

export default function TodaysTopMovers() {

    

    return(
        <div>
            {/* Todays top gainers*/}
            <div className={styles.stockDiv}>
                <h1 className={styles.title}>Todays Top Gainers</h1>

                <div className={styles.cardRow}>
                    <div className={styles.stockCard}>
                        <div className={styles.companyInfo}>
                            <h1 className={styles.tickerName}>Ticker</h1>
                            <h1 className={styles.companyName}>Company Name</h1>
                        </div>
                        <div className={styles.companyStats}>
                            <h1 className={styles.price}>£100</h1>
                            <h1 className={styles.change}>+0.1662 (+226%)</h1>
                        </div>
                    </div>

                    <div className={styles.stockCard}>
                        <div className={styles.companyInfo}>
                            <h1 className={styles.tickerName}>Ticker</h1>
                            <h1 className={styles.companyName}>Company Name</h1>
                        </div>
                        <div className={styles.companyStats}>
                            <h1 className={styles.price}>£100</h1>
                            <h1 className={styles.change}>+0.1662 (+226%)</h1>
                        </div>
                    </div>

                    <div className={styles.stockCard}>
                        <div className={styles.companyInfo}>
                            <h1 className={styles.tickerName}>Ticker</h1>
                            <h1 className={styles.companyName}>Company Name</h1>
                        </div>
                        <div className={styles.companyStats}>
                            <h1 className={styles.price}>£100</h1>
                            <h1 className={styles.change}>+0.1662 (+226%)</h1>
                        </div>
                    </div>

                </div>
                

            </div>
           


        </div>
        
    );

}