import styles from './CompanyVisuals.module.css'
import { supabase } from '../../../../../supabase/supabaseClient';
import Image from "next/image";

interface Props {
    ticker: string,
    companyName: string
}

export default function CompanyVisuals({ ticker, companyName }: Props) {

    const tickerFilename = `${ticker.toLowerCase()}.png`;
        const { data: logoUrl } = supabase.storage
            .from('company_images')
            .getPublicUrl(tickerFilename, {
                transform: { width: 300, height: 300, quality: 100 }
            });

    return (
        <div className={styles.companyVisuals}>
            <div className={styles.imageDiv}>
                <Image src={logoUrl.publicUrl} alt={ticker} className={styles.stockLogo} width={72} height={72} />
            </div>
            <div className={styles.companyNameDiv}>
                <h1 className={styles.symbolName}>{ticker}</h1>
                <h1 className={styles.companyName}>{companyName}</h1>
            </div>
        </div>
    )
}