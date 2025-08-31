
import { Box } from '@mui/material';
import styles from './TradeModal.module.css'
import React, { useState } from 'react';
import { auth } from '../../../(auth)/firebaseClient'

interface Props {
    symbol: string;
    price: number;
}

interface FormData{
    action: string;
    quantity: number;
    price: number;
    totalPrice: number;
    symbol: string,
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
        price: 0,
        totalPrice: 0,
        symbol: "",
    })

    const [preview, setPreview] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity<=0) {
            window.alert("Quantity must be a valid number greater than 0")
        } else {
            setForm({
                action: selectedAction.toString(),
                quantity: quantity,
                price: price,
                totalPrice: price*quantity,
                symbol: symbol,
            })
            setPreview(true);
        }
        
    }

    const clearForm = () => {
        setSelectedAction('Buy');
        setQuantity(0);
        setPreview(false);
    }

    const cancelPreview = () => {
        setPreview(false);
    }

    const [submitted, setSubmitted] = useState<boolean>(false);

    async function submitOrder() {
        const user = auth.currentUser;
        if (!user) {
            window.alert("User not authenticated");
            return;
        } 
        const jwt = await user.getIdToken();

        const payload = {
            uid: user.uid,
            jwt: jwt,
            ticker: form.symbol,
            action: form.action,
            quantity: form.quantity
        };

        try {
            const res = await fetch('/api/submit_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                window.alert("Your order was unable to be placed. Please try again later")
                return;
            }
            setSubmitted(true);
        } catch (error) {
            window.alert(`Your order was not successful. \nReason: ${error}`)
        }
    }

    

    return (
        <div>
            <Box className={styles.modal}>
                {!submitted && (
                    <>
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
                                        <button type="button" disabled={preview} onClick={clearForm} className={styles.formClear}>Clear</button>
                                        <button type="submit" disabled={preview} className={styles.formPreview}>Preview Order</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {preview && (
                            <div className={styles.previewSection}>
                                <div className={styles.previewDivider} />

                                <div className={styles.previewDiv}>
                                    <h2 className={styles.previewHeader}>Order Preview</h2>
                                    <p><span className={styles.k}>Action</span><span className={styles.v}>{form.action}</span></p>
                                    <p><span className={styles.k}>Quantity</span><span className={styles.v}>{form.quantity}</span></p>
                                    <p><span className={styles.k}>Symbol</span><span className={styles.v}>{form.symbol}</span></p>
                                    <p><span className={styles.k}>Estimated Price</span><span className={styles.v}>{Number(form.price).toFixed(2)} USD</span></p>
                                    <p><span className={styles.k}>Estimated Total Price</span><span className={styles.v}>{Number(form.totalPrice).toFixed(2)} USD</span></p>
                                </div>

                                <div className={styles.previewActions}>
                                    <button className={styles.previewCancel} onClick={cancelPreview} disabled={submitted}>Cancel</button>
                                    <button className={styles.previewSubmit} onClick={submitOrder} disabled={submitted}>Submit Order</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                

                {submitted && (
                    <div>
                        <h1 className={styles.confirmedText}>Received</h1>
                        <h1 className={styles.confirmedExtraText}>Your order to {form.action.toLowerCase()} {form.symbol} has been received by our system and it will be executed shortly.</h1>
                        <h1 className={styles.confirmedExtraText}>You may view your trades in the Trade History tab.</h1><br/>
                        <h1 className={styles.confirmedExtraText}>You may click out of this window now.</h1>
                    </div>
                )}
            </Box>
        </div>
        
    )
}