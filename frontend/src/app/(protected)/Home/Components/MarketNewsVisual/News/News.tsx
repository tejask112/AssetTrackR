import React from "react";
import styles from "./News.module.css";
import Image from 'next/image';

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

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsCard({ item }: { item: MarketNewsItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer">
      <article className={styles.card}>
        <div className={styles.imageContainer}>
          <Image src={item.image} alt={item.headline} fill className={styles.image} />
        </div>
        <div className={styles.content}>
          <h2 className={styles.headline}>{item.headline}</h2>
          
          <p className={styles.summary}>{item.summary}</p>
          <div className={styles.footer}>
            <span className={styles.category}>{item.category}</span>
            <span className={styles.source}>{item.source}</span>
            <span className={styles.date}>{formatDate(item.datetime)}</span>
          </div>
        </div>
      </article>
    </a>
    
  );
}