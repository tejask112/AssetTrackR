'use client';

import styles from './LoadingBar.module.css';

export default function LoadingBar() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderBar} />
    </div>
  );
}
