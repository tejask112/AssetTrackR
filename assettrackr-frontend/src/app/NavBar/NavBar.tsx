'use client'
import styles from './NavBar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathName = usePathname();
  console.log({ pathName });

  return (
    <div className={styles.topBar}>
        <h1 className={styles.logo}>AssetTrackR</h1>
        <div className={styles.buttonDiv}>
          
          <Link href="/"> 
            <button 
              className={`${styles.button} ${pathName === '/' ? styles.buttonActivated : ''}`}>Home</button> 
          </Link>

          <Link href="/PortfolioAnalytics"> 
            <button className={`${styles.button} ${pathName === '/PortfolioAnalytics' ? styles.buttonActivated : ''}`}>Portfolio Analytics</button> 
          </Link>

          <Link href="/TradeHistory">
            <button className={`${styles.button} ${pathName === '/TradeHistory' ? styles.buttonActivated : ''}`}>Trade History</button>
          </Link>

          <Link href="/ExploreStocks">
            <button className={`${styles.button} ${pathName === '/ExploreStocks' ? styles.buttonActivated : ''}`}>Explore Stocks</button>
          </Link>

        </div>
    </div>
  );
}