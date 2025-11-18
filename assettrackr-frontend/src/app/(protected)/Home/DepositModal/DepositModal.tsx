import { Box } from '@mui/material';
import styles from './DepositModal.module.css'
import { useState } from 'react';

export default function DepositModal() {

    const [deposit, setDeposit] = useState<number>(10000);

    return(
        <Box className={styles.modal}>
            <h1 className={styles.title}>Deposit funds into your account</h1>
            <label className={styles.quantityLabel}>
                <input type='number' name='quantity' className={styles.quantityInput} 
                value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} 
                max="9999999.99" min="0" step="0.01" inputMode="decimal"></input> USD
            </label>
            <button>Confirm</button>
        </Box>
    )

}