import NewsCard from './News/News';
import styles from './MarketNews.module.css';

interface MarketNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: string;
    image: string;
    source: string;
    summary: string;
    url: string;
}

interface Props {
    data: MarketNewsItem[];
}

export default function MarketNewsVisual({ data }: Props) {

    return (
        <div>
            <h1 className={styles.title}>Recent Market News</h1>

            <div>
                {data.map((item) => (
                    <NewsCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    )

}