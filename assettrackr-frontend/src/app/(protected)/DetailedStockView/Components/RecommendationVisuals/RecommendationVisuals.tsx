import RecommendationChart from "../../RecommendationChart/RecommendationChart";
import styles from './RecommendationVisuals.module.css'

interface Recommendation {
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
}

interface Prop {
    recommendationHistory: Recommendation[] | null,
    currentRecommendation: string | null,
}

export default function RecommendationVisual({ recommendationHistory, currentRecommendation }: Prop) {

    if (currentRecommendation == null || recommendationHistory == null) {
        return (
            <h1>Recommendation System is unavailable at the moment.</h1>
        )
    }

    return (
        <div>
            <div className={styles.recommendationSection}>
                <h1 className={styles.recommendationTitle}>Our Recommendation: </h1> 
                <h1 className={styles.recommendationResult}>{currentRecommendation.toUpperCase()}</h1>
                <div className={styles.tooltip}>
                    <button>Warning!</button>
                    <div className={styles.tooltiptext}>
                        ⚠️ This tool is for informational purposes only and does not constitute
                        financial advice. Investing carries risk and you could lose money. Always
                        do your own research or consult a professional before making any trades.
                    </div>
                </div>
            </div>
            <RecommendationChart data={recommendationHistory} />
        </div>
        
    )
}