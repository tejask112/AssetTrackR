'use client'
import styles from './NavBar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../(auth)/firebaseClient';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const pathName = usePathname();
  console.log({ pathName });

  const router = useRouter();

  async function handleLogout() {
    await Promise.all([
      fetch('/api/logout', { method: 'POST' }),
      signOut(auth),
    ]);
    router.replace('/Login')
  }

  return (
    <div className={styles.topBar}>
        <h1 className={styles.logo}>AssetTrackR</h1>
        <div className={styles.bottomRow}>
          <div className={styles.buttonDiv}>
            <Link href="/Home"> 
              <button className={`${styles.button} ${pathName === '/Home' ? styles.buttonActivated : ''}`}>Home</button> 
            </Link>

            <Link href="/PortfolioAnalytics"> 
              <button className={`${styles.button} ${pathName === '/PortfolioAnalytics' ? styles.buttonActivated : ''}`}>Portfolio Analytics</button> 
            </Link>

            <Link href="/TradeHistory">
              <button className={`${styles.button} ${pathName === '/TradeHistory' ? styles.buttonActivated : ''}`}>Trade History</button>
            </Link>

            <Link href="/ExploreStocks">
              <button className={`${styles.button} ${pathName === '/ExploreStocks' || pathName.startsWith('/DetailedStockView') ? styles.buttonActivated : ''}`}>Explore Stocks</button>
            </Link>
          </div>
          <div className={styles.userData}>
            <h1 className={styles.user}>username@gmail.com</h1>
            <button onClick={handleLogout} className={styles.logOut}>Log Out</button>
          </div>
        </div>
        
    </div>
  );
}