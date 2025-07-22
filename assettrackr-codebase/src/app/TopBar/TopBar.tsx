import styles from './TopBar.module.css'

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function TopBar() {

  return (
    <div className={styles.topBar}>
        <h1 className={styles.logo}>AssetTrackR</h1>
        <div className={styles.buttonDiv}>
          <button className={styles.button}>Home</button>
          <button className={styles.button}>Portfolio Analytics</button>
          <button className={styles.button}>Trade History</button>
          <button className={styles.button}>Search Stocks</button>
        </div>
    </div>
  );
}