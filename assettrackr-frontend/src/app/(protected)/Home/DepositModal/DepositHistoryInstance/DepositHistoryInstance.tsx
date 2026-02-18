import styles from './DepositHistoryInstance.module.css'

function formatToReadableDate(isoString: string): string {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
        return "Invalid Date"; 
    }

    const pad = (num: number): string => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); 
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

interface Props {
    date: string; 
    value: number;
}

export default function DepositHistoryInstance({ date, value }: Props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.dateText}>{formatToReadableDate(date)}</h1>
            <h1 className={styles.valueText}>{value.toFixed(2)} USD</h1> 
        </div>
    )
}