import { useEffect, useState } from 'react';
import styles from './UserDataVisual.module.css'
import Modal from '@mui/material/Modal';
import DepositModal from '../../DepositModal/DepositModal';

interface Props {
    portfolioBalance: number
    cashBalance: number;
    uid: string;
    timeline: Price[];
}

interface Price {
    date: string;
    price: number;
}

export default function UserDataVisual({ portfolioBalance, cashBalance, uid, timeline }: Props) {

    const [openDepositModal, setOpenDepositModal] = useState<boolean>(false);
    const handleOpenDepositModal = () => setOpenDepositModal(true);
    const handleCloseDepositModal = () => setOpenDepositModal(false);

    const [totalAccountBalance, setTotalAccountBalance] = useState<number>(0);

    const [changeTradingDay, setChangeTradingDay] = useState<number>(0);
    const [changeTradingDayPct, setChangeTradingDayPct] = useState<number>(0);

    const [changeSinceStart, setChangeSinceStart] = useState<number>(0);
    const [changeSinceStartPct, setChangeSinceStartPct] = useState<number>(0);

    useEffect(() => {

        const { changeTD, changePctTD } = calculateChangeTradingDay(portfolioBalance, timeline);
        setChangeTradingDay(changeTD);
        setChangeTradingDayPct(changePctTD);

        const { changeSS, changePctSS } = calculateChangeSinceStart(portfolioBalance, cashBalance);
        setChangeSinceStart(changeSS);
        setChangeSinceStartPct(changePctSS);

        const totalBalance = portfolioBalance + cashBalance;
        setTotalAccountBalance(totalBalance);

    }, [portfolioBalance, cashBalance, timeline])

    function calculateChangeTradingDay( portfolioBalance: number, timeline: Price[] ) {
        const todayOpeningPrice = timeline.find(entry => {
            const date_timestamp = new Date(entry.date);
            const hours = date_timestamp.getUTCHours(); 
            const minutes = date_timestamp.getUTCMinutes();

            return hours === 9 && minutes >= 0 && minutes < 15;
        })?.price;
        
        let change = 0;
        let changePct = 0;

        if (todayOpeningPrice) {
            change = portfolioBalance - todayOpeningPrice;
            changePct = (change / todayOpeningPrice) * 100;
        }

        return {
            changeTD: change,
            changePctTD: changePct,
        };
    }

    function calculateChangeSinceStart( portfolioBalance: number, cashBalance: number ) {
        const startValue = 100000;

        const change = (portfolioBalance + cashBalance) - startValue;
        const changePct = (change / startValue) * 100;

        return { 
            changeSS: change, 
            changePctSS: changePct 
        };
    }

    return (
        <div className={styles.dataDiv}>
            <div className={styles.overviewDiv}>
                <div className={styles.accountValueSection}>

                    <div className={styles.titleText}>Total Asset&apos;s value</div>
                    <div className={styles.accountValueAmount}>
                        {portfolioBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>

                </div>

                <div className={styles.overviewChange}>

                    <div className={styles.changeItem}>
                        <div className={styles.titleText}>Today&apos;s change</div>
                        <div className={styles.changeValue} 
                             style={{color:typeof changeTradingDay === 'number'? changeTradingDay > 0 ? '#059669' : changeTradingDay < 0 ? '#dc2626' : undefined: undefined }}
                        >
                            {changeTradingDay != null && changeTradingDay > 0 ? "+" : ""}
                            {changeTradingDay ? changeTradingDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'} {changeTradingDayPct != null ? `(${changeTradingDayPct.toFixed(2)}%)` : ''}
                        </div>
                    </div>

                    <div className={styles.changeItem} style={{color:typeof changeSinceStart === 'number'? changeSinceStart > 0 ? '#059669' : changeSinceStart < 0 ? '#dc2626' : undefined: undefined }}>
                        <div className={styles.titleText}>Since Start</div>
                        <div className={styles.changeValue}>
                            {changeSinceStart != null && changeSinceStart > 0 ? "+" : ""}
                            {changeSinceStart ? changeSinceStart.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'} {changeSinceStartPct != null ? `(${changeSinceStartPct.toFixed(2)}%)` : ''}
                        </div>
                    </div>

                </div>

                <div className={styles.cashSection}>

                    <div className={styles.cashDiv}>
                        <div className={styles.titleText}>Cash Balance</div>
                        <div className={styles.cashAmount}>{cashBalance != null ? cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} USD</div>
                    </div>

                    <div className={styles.cashAddFundsDiv}>
                        <button className={styles.cashAddFundsButton} onClick={handleOpenDepositModal}>Deposit</button>
                        <Modal open={openDepositModal} onClose={handleCloseDepositModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                            <DepositModal existingCash={cashBalance} uid={uid}/>
                        </Modal> 
                    </div>

                </div>

                <div>
                    <div className={styles.cashDiv}>
                        <div className={styles.titleText}>Total Account Balance</div>
                        <div className={styles.cashAmount}>{totalAccountBalance != null ? totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} USD</div>
                    </div>
                </div>

            </div>
        </div>
    )

}