import Image from 'next/image';
import StockLineChart from '../../../../ReusableComponents/StockLineChart/StockLineChart';
import styles from './WatchlistCard.module.css'
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase/supabaseClient';


interface Props {
    data: WatchlistItem;
}

interface WatchlistItem {
    company_name: string;
    latest_price: number;
    prices: number[];
    ticker: string;
    x7d_change: number;
    x7d_change_pct: number;
}

export default function Watchlist({ data }:Props ) {

    const router = useRouter();

    const tickerFilename = `${data.ticker.toLowerCase()}.png`;
    const { data: logoUrl } = supabase.storage
        .from('company_images')
        .getPublicUrl(tickerFilename, {
            transform: { width: 300, height: 300, quality: 100 }
        });

    return (
        <button className={styles.entireDiv} onClick={() => router.push(`DetailedStockView/${data.ticker}`)}>
            
            <div className={styles.dataDiv}>
                <div className={styles.companyDataDiv}>
                    <Image src={logoUrl.publicUrl} alt={data.ticker} className={styles.companyLogo} width={55} height={55}/>
                    <div className={styles.companyNamesDiv}>
                        <h1 className={styles.ticker}>{data.ticker}</h1>
                        <h1 className={styles.companyName}>{data.company_name}</h1>
                    </div>
                </div>

                <h1 className={styles.price}>{data.latest_price} USD</h1>

                {data.x7d_change ?
                    <h1 className={data.x7d_change > 0 ? styles.pvechange : styles.nvechange}>
                        {data.x7d_change.toFixed(2)} ({data.x7d_change_pct.toFixed(2)}%) 7D
                    </h1> 
                    : 
                    <h1 className={styles.change}> - 7D</h1>
                }
            </div>

            <div className={styles.timeseriesDiv}>
                <StockLineChart prices={data.prices} chartColor={Number(data.x7d_change) >= 0 ? 'green' : 'red'}/>
            </div>
                                            
        </button>
    )
}