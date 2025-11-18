import { Box } from '@mui/material';
import styles from './DepositModal.module.css'
import { useState } from 'react';

interface Props {
    existingCash: number;
}

export default function DepositModal({ existingCash }:Props) {

    const [deposit, setDeposit] = useState<number>(10000);

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
                <h1>{deposit > 9999999.99 ? 'Deposit cannot exceed 9,999,999.99 USD' : formatUSD((existingCash+deposit).toFixed(2)) + ' USD'} </h1>
                <button className={styles.confirmButton}>Confirm</button>
            </div>
            <div className={styles.historyDiv}>

            </div>
            
        </Box> 
    )

}