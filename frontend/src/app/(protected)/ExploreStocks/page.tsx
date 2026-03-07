'use client';
import styles from './page.module.css';
import { useState, useEffect } from "react";
import { getFirebaseJWT } from '@/authenticator/authenticator';
import { useUser } from '@/context/UserContext';
import LoadingBar from '../ReusableComponents/LoadingBar/LoadingBar';
import StockCard from './StockCard/StockCard';
import { supabase } from '../../../supabase/supabaseClient';
import NotificationBox from '../ReusableComponents/NotificationBox/NotificationBox';


interface StockData {
    "company_name": string,
    "current_recommendation": string,
    "exchange": string,
    "latest_price": string,
    "month_to_date_price_return_daily": number,
    "prices": number[],
    "range_high": number,
    "range_low": number,
    "ticker": string,
    "x7d_change": number,
}

type MarketDataRow = {
  ticker: string
  date: string
  price: number
}

type InsertPayload<T> = {
  eventType: 'INSERT'
  schema: string
  table: string
  commit_timestamp: string
  new: T
  old: null
}

export default function SearchStocks() {

    const { userID, userEmail, setAuth, clear } = useUser();

    const [apiResponse, setApiResponse] = useState<StockData[] | null>(null);
    const [apiError, setApiError] = useState<boolean>(false);

    useEffect(() => {
        if (!userID) return;
        async function fetchExploreStocks() {
            try{
                const jwt = await getFirebaseJWT();

                // bad practice: don't send jwt in query string, send as part of header!!
                // need to fix
                const res = await fetch(`/api/explore-stocks?uid=${userID}&jwt=${encodeURIComponent(jwt)}`);
                const json: StockData[] = await res.json();

                if (!res.ok) {
                    setApiError(true);
                    return;
                }

                setApiResponse(json);
            } catch (error) {
                console.error(error);
                setApiError(true);
            }
        }
        fetchExploreStocks();
    }, [userID]);

    // supabase realtime connection
    useEffect(() => {
        const channel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {event: 'INSERT',
                 schema: 'public',
                 table: 'market_data'},
                (payload) => {
                    const newData = payload as unknown as InsertPayload<MarketDataRow>;
                    const marketData = newData.new;

                    const ticker = marketData.ticker;
                    const price = Number(marketData.price);

                    setApiResponse((prev) => {
                        console.log(`${ticker} - NEW ${price}`)
                        if (!prev) return prev;

                        return prev.map((stock) => {
                            if (stock.ticker !== ticker) return stock;
                            return {
                                ...stock,
                                prices: [...stock.prices, price],
                                latest_price: price.toString(), 
                            }
                        })
                    })
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Supabase Realtime Connection Established')
                }
            })

            return () => {
                supabase.removeChannel(channel)
            }
    }, [])

    if (!apiResponse) { 
        if (apiError) {
            return (
                <NotificationBox
                    success={false}
                    message={"Server Error. Please try again later"} 
                />
            )
        } else {
            return (
                <LoadingBar />
            ) 
        }
    }

    return(
        <div className={styles.entireDiv}>
            <h1 className={styles.title}>Explore Stocks</h1>

            {apiResponse.map((stockData) => (
                <StockCard key={stockData.ticker} data={stockData}/>
            ))}
        </div>
    )

}