import styles from './TimeVisual.module.css'
import {useEffect, useState} from 'react';

interface Props {
    location: string;
}

export default function TimeVisual({ location }: Props) {

    const [timeNow, setTimeNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeNow(new Date());
        }, 1000);
        
        return () => clearInterval(timer);
    }, []); 

    const locationTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: location,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(timeNow);

    const localTime = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(timeNow);

    return (
        <div className={styles.timeVisualDiv}>
            <h1 className={styles.timezoneHeading}>Time Zone: {location.replace(/_/g, " ")}</h1>
            <h1 className={styles.times}>{location.replace(/_/g, " ")} Time: {locationTime}</h1>
            <h1 className={styles.times}>Local Time: {localTime}</h1>
        </div>
    )
}