
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
    const [queued, setQueued] = useState<boolean>(false);
    const [queuedMessage, setQueuedMessage] = useState<string>("");
    const [failed, setFailed] = useState<boolean>(false);
    const [failedMessage, setFailedMessage] = useState<string>("");

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

        const res = await fetch('/api/submit_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            setFailed(true)
            setFailedMessage(data.error ?? 'Unknown Error')
        } else {
            if (data && "message" in data){
                setQueued(true);
                setQueuedMessage(data.message ?? 'time unavailable')
            }
            setSubmitted(true);
        }
           
    }

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

    return (
        <div>
            <Box className={styles.modal}>
                {!submitted && !failed && (
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
                                        Quantity: <input type='number' name='quantity' className={styles.quantityInput} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} max="99999999999999999999.99999999" min="0"></input>
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
                                    <p><span className={styles.k}>Quantity</span><span className={styles.v}>{form.quantity.toLocaleString()}</span></p>
                                    <p><span className={styles.k}>Symbol</span><span className={styles.v}>{form.symbol}</span></p>
                                    <p><span className={styles.k}>Estimated Price</span><span className={styles.v}>{formatUSD(form.price)} USD</span></p>
                                    <p><span className={styles.k}>Estimated Total Price</span><span className={styles.v}>{formatUSD(form.totalPrice)} USD</span></p>
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
                        <h1 className={styles.submittedText}>Received</h1>
                        <h1 className={styles.submittedExtraText}>
                            {queued 
                                ? `Your order to ${form.action.toLowerCase()} ${form.symbol} has been received and queued by our system. It will execute when markets open in ${queuedMessage}.`
                                : "Your order to {form.action.toLowerCase()} {form.symbol} has been received by our system and it will be executed shortly."
                            }
                        </h1>
                        <h1 className={styles.submittedExtraText}>You may view this trade in the Trade History tab.</h1><br/>
                        <h1 className={styles.submittedExtraText}>You may click out of this window now.</h1>
                    </div>
                )}

                {failed && (
                    <div>
                        <h1 className={styles.submittedText}>Failed</h1>
                        <h1 className={styles.submittedExtraText}>Your order to {form.action.toLowerCase()} {form.symbol} has not been successful.</h1>
                        <h1 className={styles.submittedExtraText}>Error: {failedMessage}</h1>
                        <h1 className={styles.submittedExtraText}>You may view this trade in the Trade History tab.</h1><br/>
                        <h1 className={styles.submittedExtraText}>You may click out of this window now.</h1>
                    </div>
                )}
            </Box>
        </div>
        
    )
}