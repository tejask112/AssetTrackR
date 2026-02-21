import styles from './ReturnsVisual.module.css'

interface Returns {
    x1d_return: number | null;
    x1d_return_pct: number | null;
    x5d_return: number | null;
    x5d_return_pct: number | null;
    x1m_return: number | null;
    x1m_return_pct: number | null;
    x3m_return: number | null;
    x3m_return_pct: number | null;
    x6m_return: number | null;
    x6m_return_pct: number | null;
}

interface Props {
    returns: Returns;
}

export default function ReturnsVisual({ returns }: Props) {

    return (
        <div className={styles.entireDiv}>

            <div>
                <h1 className={styles.title}>1D</h1>
                <h1 className={styles.value}>{returns.x1d_return?.toFixed(2) ?? '-'}</h1>
                <h1 className={styles.value}>
                    {returns.x1d_return_pct != null ? `${returns.x1d_return_pct.toFixed(2)}%` : '-'}
                </h1>
            </div>

            <div>
                <h1 className={styles.title}>5D</h1>
                <h1 className={styles.value}>{returns.x5d_return?.toFixed(2) ?? '-'}</h1>
                <h1 className={styles.value}>
                    {returns.x5d_return_pct != null ? `${returns.x5d_return_pct.toFixed(2)}%` : '-'}
                </h1>
            </div>

            <div>
                <h1 className={styles.title}>1M</h1>
                <h1 className={styles.value}>{returns.x1m_return?.toFixed(2) ?? '-'}</h1>
                <h1 className={styles.value}>
                    {returns.x1m_return_pct != null ? `${returns.x1m_return_pct.toFixed(2)}%` : '-'}
                </h1>
            </div>

            <div>
                <h1 className={styles.title}>3M</h1>
                <h1 className={styles.value}>{returns.x3m_return?.toFixed(2) ?? '-'}</h1>
                <h1 className={styles.value}>
                    {returns.x3m_return_pct != null ? `${returns.x3m_return_pct.toFixed(2)}%` : '-'}
                </h1>
            </div>

            <div>
                <h1 className={styles.title}>6M</h1>
                <h1 className={styles.value}>{returns.x6m_return?.toFixed(2) ?? '-'}</h1>
                <h1 className={styles.value}>
                    {returns.x6m_return_pct != null ? `${returns.x6m_return_pct.toFixed(2)}%` : '-'}
                </h1>
            </div>

        </div>
    )

}