import React from 'react';
import styles from './NotificationBox.module.css';

interface Prop {
  success: boolean;
  message: string;
}

export default function NotificationBox({ success, message }: Prop) {
    const statusClass = success ? styles.success : styles.error;

    return (
        <div className={styles['notification-container']}>
            <div className={`${styles['notification-item']} ${statusClass}`}>
                <div className={styles['notification-content']}>          
                    <div className={styles['notification-text']}>
                        {message}
                    </div>
                </div>
            </div>
        </div>
    );
}