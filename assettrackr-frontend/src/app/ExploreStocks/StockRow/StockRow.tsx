'use client';
import styles from './StockRow.module.css'
import Image from 'next/image';
import StockLineChart from './StockLineChart/StockLineChart';
import { useState } from 'react';

interface Stock {
  current_price: number;
  closing_price_7D: number[];
  change: number;
  exchange: string;
  logo: string;
  name: string;
  percentage_change: number;
  symbol: string;
}

interface StockCardProps {
    stocks: Stock[];
    title: string;
}

export default function StockRow( { stocks, title } : StockCardProps) {

    const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

    const handleImageError = (symbol: string) => {
        setFailedLogos(prev => new Set(prev).add(symbol));
    };

    return(
        <div>
            {/* Todays top gainers*/}
            <div className={styles.stockDiv}>
                <h1 className={styles.title}>{title}</h1>

                <div className={styles.scrollWrapper}>
                    <div className={styles.cardRow}>

                        {stocks.map((stock) => {
                            const priceChangeColor = stock.percentage_change > 0 ? '#16a34a' : '#dc2626';
                            const stockLineChartColor = stock.percentage_change > 0 ? 'green' : 'red';

                            return (
                                <div key={stock.symbol} className={styles.stockCard}>

                                    {/* STOCK INFO: Symbol, Company Name, Price, +- % */}
                                    <div className={styles.stockData}>
                                        <div className={styles.stockCardQualtitative}>
                                            <div className={styles.companyInfo}>
                                                <div className={styles.imageDiv}>
                                                    {failedLogos.has(stock.symbol) ? (
                                                        <h1 className={styles.replacementLogo}>{stock.symbol}</h1>
                                                    ) : (
                                                        <Image src={stock.logo} className={styles.stockLogo} alt={stock.symbol} width={50} height={50} onError={() => handleImageError(stock.symbol)} />
                                                    )}
                                                </div>
                                                <div className={styles.companyNames}>
                                                    <h1 className={styles.tickerName}>{stock.symbol}</h1>
                                                    <h1 className={styles.companyName}>{stock.name}</h1>
                                                </div>
                                                <div className={styles.companyStats}>
                                                    <h1 className={styles.price}>${stock.current_price.toFixed(2)}</h1>
                                                    <h1 className={styles.change} style={{ color: priceChangeColor }}>{stock.change.toFixed(2)} {stock.percentage_change.toFixed(2)}% 24H</h1>
                                                </div>
                                            </div>    
                                        </div>
                                        
                                        {/* STOCK PERFORMANCE CHART: 7 days of closing prices */}
                                        <div className={styles.stockCardQuantitativeData}>
                                            <StockLineChart prices={stock.closing_price_7D} chartColor={stockLineChartColor}/>
                                        </div>
                                    </div>
                                </div>
                            )})}
                    </div>
                </div>
            </div>
        </div>
        
    );

}