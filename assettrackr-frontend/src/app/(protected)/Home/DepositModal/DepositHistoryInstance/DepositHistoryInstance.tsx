
import styles from './DepositHistoryInstance.module.css'

interface Props {
    date: String;
    value: number;
}

export default function DepositHistoryInstance( {date, value}: Props ) {

    return (
        <div className={styles.container}>
            <h1 className={styles.dateText}>{date.toString()}</h1>
            <h1 className={styles.valueText}>{value} USD</h1> {/* need to truncate to 2dp */}
        </div>
    )

}