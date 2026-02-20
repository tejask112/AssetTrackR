import styles from './AccountStatsVisual.module.css';
import { useEffect, useState } from 'react';

interface Props {
    cashBalance: number;
    portfolioBalance: number;
}

export default function AccountStatsVisual({ cashBalance, portfolioBalance }: Props) {

    const [totalAccountBalance, setTotalAccountBalance] = useState<number>(0);
    
    useEffect(() => {
        const totalBalance = portfolioBalance + cashBalance;
        setTotalAccountBalance(totalBalance);
    }, [portfolioBalance, cashBalance])

    return(
        <div className={styles.entireDiv}>
            
            <div>
                <div className={styles.titleText}>Total Asset&apos;s value</div>
                <div className={styles.cashAmount}>{portfolioBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
            </div>

            <div>
                <div className={styles.titleText}>Total Account Balance</div>
                <div className={styles.cashAmount}>{totalAccountBalance != null ? totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} USD</div>
            </div>
            
            <div>
                <div className={styles.titleText}>Cash Balance</div>
                <div className={styles.cashAmount}>{cashBalance != null ? cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} USD</div>
            </div>
            
        </div>
    )
}