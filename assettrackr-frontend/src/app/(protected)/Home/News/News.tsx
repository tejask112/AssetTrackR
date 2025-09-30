import React from "react";
import styles from "./News.module.css";

export type NewsItem = {
  id: number;
  headline: string;
  summary: string;
  image: string;
  url: string;
  source: string;
  category: string;
  datetime: number;
};

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer">
      <article className={styles.card}>
        <div className={styles.imageContainer}>
          <img src={item.image} alt={item.headline} className={styles.image} />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.headline}>{item.headline}</h2>
            <span className={styles.category}>{item.category}</span>
          </div>
          <p className={styles.summary}>{item.summary}</p>
          <div className={styles.footer}>
            <span className={styles.source}>{item.source}</span>
            <span className={styles.date}>{formatDate(item.datetime)}</span>
          </div>
        </div>
      </article>
    </a>
    
  );
}