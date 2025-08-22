
import { Box } from '@mui/material';
import styles from './TradeModal.module.css'
import React, { useState } from 'react';

interface Props {
    symbol: string;
    price: number;
}

interface FormData{
    action: string;
    quantity: number;
}

export default function ( {symbol, price}:Props) {

    // ------------------------ Actions Dropdown list ------------------------
    const actions = [
        { label: 'Buy', value: 'BUY' },
        { label: 'Sell', value: 'SELL' }
    ]
    type Action = (typeof actions)[number]["value"];
    
    const [selectedAction, setSelectedAction] = useState<Action>("BUY");

    // ------------------------ Quantity ------------------------
    const [quantity, setQuantity] = useState<number>(0);

     // ------------------------ Form ------------------------
    const [form, setForm] = useState<FormData>({
        action: "",
        quantity: 0,
    })

    const [preview, setPreview] = useState<Boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm({ ...form, [name]: value})
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity<=0) {
            window.alert("Quantity must be a valid number greater than 0")
        } else {
            console.log("Submitted:", form)
            setPreview(true);
        }
        
    }

    const clearForm = () => {
        setSelectedAction('Buy');
        setQuantity(0);
    }

    return (
        <div>
            <Box className={styles.modal}>
                <div className={styles.entireDiv}>
                    <div className={styles.titleDiv}>
                        <h1 className={styles.title}>Trade {symbol}</h1>
                        <h1 className={styles.price}>{Number(price).toFixed(2)} USD</h1>
                    </div>
                    <div className={styles.userDiv}>
                        <form onSubmit={handleSubmit}>
                            {/* Drop Down List to select an action (eg buy, sell) */}
                            <label className={styles.dropDownActionLabel}>
                                Action:
                                <select className={styles.dropDownActionList} name="selectedAction" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                                    {actions.map((a) => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </label>

                            {/* Input to choose quantity (how many stocks to buy) */}
                            <div>
                            <label className={styles.quantityLabel}>
                                Quantity: <input type='number' name='quantity' className={styles.quantityInput} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} ></input>
                            </label>
                            <button>Select Max</button>
                            </div>
                            
                            <div className={styles.formButtons}>
                                <button type="button" onClick={clearForm} className={styles.formClear}>Clear</button>
                                <button type="submit" className={styles.formPreview}>Preview Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Box>
        </div>
        
    )
}