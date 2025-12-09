import { Box } from '@mui/material';
import styles from './DepositModal.module.css'
import { useEffect, useState } from 'react';
import { auth } from '../../../(auth)/firebaseClient'
import LoadingBar from '@/app/(auth)/LoadingBar/LoadingBar';
import DepositHistoryInstance from './DepositHistoryInstance/DepositHistoryInstance';

interface Props {
    existingCash: number;
    uid: string;
}

interface DepositInstance {
    date: String;
    value: number;
}

type History = DepositInstance[];

export default function DepositModal({ existingCash, uid }:Props) {

    const [deposit, setDeposit] = useState<number>(10000);
    const [newBalance, setNewBalance] = useState<number>(existingCash);
    const [error, setError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const sleep = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const [history, setHistory] = useState<History|null>();
 
    const formatUSD = (v: unknown) => {
        if (v === '' || v == null) return '-'
        const removeCommas = String(v).replace(/,/g, '').trim();
        const numb = Number(removeCommas)
        if (!Number.isFinite(numb)) return '-'
        return numb.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    useEffect(() => {
        async function getHistory() {
            const res = await fetch(`/api/deposit_history?uid=${encodeURIComponent(uid)}`);
            const json = await res.json();
            setHistory(json[uid]);
        }
        getHistory();
    }, [])

    async function depositFunds() {
        setLoading(true);
        setError(false);
        setSuccess(false);
        await sleep(1000);
        const user = auth.currentUser;
        if (!user) {
            window.alert("Error - User has not been authenticated");
            return;
        } 
        const jwt = await user.getIdToken();

        const payload = {
            uid: user.uid,
            value: deposit,
            token: jwt,
        };
        
        const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success != 'ok') {
            setError(true);
            setSuccess(false);
            setLoading(false);
            setErrorMsg(data.error)
            return;
        }
        setNewBalance(Number(data.remaining_balance));
        setSuccess(true);
        setLoading(false);
    }

    if (!history) return(<h1>"Loading"</h1>)

    return(
        <Box className={styles.modal}>
            <div className={styles.depositDiv}>
                <h1 className={styles.title}>Deposit funds into your account</h1>
                <label className={styles.quantityLabel}>
                    <input type='number' name='deposit' className={styles.quantityInput} 
                    value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} 
                    max="9999999.99" min="0" step="0.01" inputMode="decimal"></input> USD
                </label>
                <h1 className={styles.balanceAfterTransactionText}>Balance after transaction:</h1>
                <h1>{deposit > 9999999.99 ? 'Deposit cannot exceed 9,999,999.99 USD' : formatUSD((newBalance+deposit).toFixed(2)) + ' USD'} </h1>
                <button className={styles.confirmButton} onClick={depositFunds} disabled={deposit===0 || deposit>9999999.99}>Confirm</button>
                <div className={styles.loadingBarDiv}>
                    {loading && ( <LoadingBar/> )}
                </div>
                {error && (
                    <div>
                        <hr className={styles.divider} />
                        <h1 className={styles.errorMessage}>Unfortunately, something went wrong.</h1>
                        <h1 className={styles.errorMessage}>Please try again later.</h1>
                    </div>
                )}
                {success && newBalance !== null && (
                    <div>
                        <hr className={styles.divider} />
                        <h1 className={styles.successMessage}>Deposit completed. Thank you!</h1>
                        <h1>New balance: {formatUSD(newBalance.toFixed(2))} USD</h1>
                    </div>
                )}
            </div>
            <div className={styles.historyDiv}>
                <h1 className={styles.historyTitle}>History</h1>
                <div className={styles.historyTableHeadings}> 
                    <h1 className={styles.dateTitle}>Date</h1>
                    <h1 className={styles.amountTitle}>Amount</h1>
                </div>
                <div className={styles.historyContainer}>
                    {history.map((deposit, index) => (
                        <div key={index}>
                            <DepositHistoryInstance date={deposit.date} value={deposit.value}/>
                        </div>
                    ))}
                </div>
            </div>
        </Box> 
    )

}