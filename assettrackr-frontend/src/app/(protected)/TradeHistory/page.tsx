import styles from './page.module.css'
import TradesTable from './TradesTable/TradesTable'

export default function TradeHistory() {



    return(
        <div className={styles.entireDiv}>
            <h1 className={styles.title}>View Trade History</h1>
            <TradesTable/>
        </div>
    )

}