import Login from "../Login/Login";
import styles from './Welcome.module.css'
import StockTickers from "../StockTickers/StockTickers";


export default function Welcome() {
    return(
        <div className={styles.entireDiv}>
            <div className={styles.leftDiv}>
                <StockTickers marketSector="Technology"/>
                <StockTickers marketSector="Financials"/>
                <StockTickers marketSector="Healthcare"/>
                <StockTickers marketSector="Consumer Staples"/>
                <StockTickers marketSector="Energy"/>
            </div>
            <div className={styles.rightDiv}> 
                <Login/>
            </div>
        </div>
    )
}