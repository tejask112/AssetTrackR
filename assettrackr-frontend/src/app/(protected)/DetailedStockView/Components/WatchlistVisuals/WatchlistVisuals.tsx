import { useState } from 'react';
import styles from './Watchlist.module.css'
import NotificationBox from '@/app/(protected)/ReusableComponents/NotificationBox/NotificationBox';

interface Props {
    ticker: string,
    companyName: string,
    uid: string,
    currentStatus: boolean,
}

interface NotificationBox {
    msg: string,
    success: boolean
}

export default function WatchlistVisuals({ ticker, companyName, uid, currentStatus }: Props) {

    const [localStatus, setLocalStatus] = useState<Boolean>(currentStatus);
    const [notif, setNotif] = useState<NotificationBox | null>(null);

    const addToWatchlist = async () => {
        try {
            const res = await fetch(
                `/api/watchlist-add?uid=${uid}&ticker=${ticker}&companyName=` + encodeURIComponent(companyName),
                { method: "POST" }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error(`API Error: ${data.error}`);
                setNotif({ msg: data.error || "Something went wrong, please try again later", success: false });
            } else {
                setNotif({ msg: `${ticker.toUpperCase()} added to watchlist`, success: true });
                setLocalStatus(true);
            }
        } catch (error)  {
            console.error(error);
        }
        setTimeout(() => setNotif(null), 5000);
    }

    const removeFromWatchlist = async () => {
        try {
            const res = await fetch(
                `/api/watchlist-remove?uid=${uid}&ticker=${ticker}`,
                { method: "POST" }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error(`API Error: ${data.error}`);
                setNotif({ msg: data.error || "Something went wrong, please try again later", success: false });
            } else {
                setNotif({ msg: `${ticker.toUpperCase()} removed from watchlist`, success: true });
                setLocalStatus(false);
            }
        } catch (error)  {
            console.error(error);
        }
        setTimeout(() => setNotif(null), 5000);
    }

    return (
        <div>
            {localStatus ? (
                <button className={styles.removeFromWatchlist} onClick={removeFromWatchlist}>Remove {ticker} from Watchlist</button>
            ) : (
                <button className={styles.addToWatchlist} onClick={addToWatchlist}>Add {ticker} to Watchlist</button>
            )}


            {notif && (
                <NotificationBox message={notif.msg} success={notif.success} />
            )}

        </div>
    )
}