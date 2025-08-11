'use client';
import Box from '@mui/material/Box';
import styles from './FundamentalDataModal.module.css';

export interface Recommendation {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}
export interface TimeSeriesPoint {
  datetime: string; open: string; high: string; low: string; close: string; volume: string;
}
export interface ProfileDataResponse {
  companyName: string; companyDescription: string; exchange: string; exchangeTimezone: string;
  website: string; industry: string; location: string; companyLogo: string; price: number;
  rangeLow: number; rangeHigh: number;
  volume: number; averageVolume: number; x10DayAverageTradingVolume: number; x3MonthAverageTradingVolume: number;
  assetTurnoverAnnual: number; assetTurnoverTTM: number;
  x5DayPriceReturnDaily: number; monthToDatePriceReturnDaily: number; x13WeekPriceReturnDaily: number;
  x26WeekPriceReturnDaily: number; x52WeekPriceReturnDaily: number;
  marketCapitalisation: number; enterpriseValue: number; forwardPE: number; peAnnual: number;
  grossMargin5Y: number; grossMarginAnnual: number; operatingMargin5Y: number; operatingMarginAnnual: number;
  netProfitMargin5Y: number; pretaxMargin5Y: number; pretaxMarginAnnual: number;
  roe5Y: number; roeRfy: number; roi5Y: number; roiAnnual: number; roa5Y: number; roaRfy: number;
  dividendPerShareAnnual: number; dividendGrowthRate5Y: number; payoutRatioAnnual: number;
  recommendation: string; recommendationTools: Recommendation[]; timeseries: TimeSeriesPoint[] | 'Error';
}

interface FundamentalDataModalProp {
  results: ProfileDataResponse;
}

export default function FundamentalDataModal({ results }: FundamentalDataModalProp) {
  const MISSING = ' - ';
  const isValid = (n?: number): n is number => typeof n === 'number' && n !== -1 && Number.isFinite(n);

  const pct = (n?: number) => (isValid(n) ? `${n.toFixed(2)}%` : MISSING);
  const num = (n?: number) => (isValid(n) ? n.toLocaleString() : MISSING);
  const currency = (n?: number) => (isValid(n) ? `$${n.toLocaleString()}` : MISSING);
  const posNegClass = (n?: number) => (isValid(n) ? (n < 0 ? styles.neg : styles.pos) : '');

  return (
    <Box className={styles.modal}>
      
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{results.companyName}</div>
          <div className={styles.subTitle}>{results.industry} · {results.exchange} · {results.location}</div>
        </div>
        <a className={styles.link} href={results.website} target="_blank" rel="noreferrer">{results.website} ↗</a>
      </div>

      <p className={styles.desc}>{results.companyDescription}</p>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Volume & Liquidity</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Volume</span><span className={styles.v}>{num(results.volume)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Avg Volume</span><span className={styles.v}>{num(results.averageVolume)}</span></div>
          <div className={styles.cell}><span className={styles.k}>10D Avg</span><span className={styles.v}>{num(results.x10DayAverageTradingVolume)}</span></div>
          <div className={styles.cell}><span className={styles.k}>3M Avg</span><span className={styles.v}>{num(results.x3MonthAverageTradingVolume)}</span></div>
          <div className={styles.cell}><span className={styles.k}>1Y High</span><span className={styles.v}>{currency(results.rangeHigh)}</span></div>
          <div className={styles.cell}><span className={styles.k}>1Y Low</span><span className={styles.v}>{currency(results.rangeLow)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Last Price</span><span className={styles.v}>{currency(results.price)}</span></div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Returns / Momentum</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>5D</span><span className={`${styles.v} ${posNegClass(results.x5DayPriceReturnDaily)}`}>{pct(results.x5DayPriceReturnDaily)}</span></div>
          <div className={styles.cell}><span className={styles.k}>MTD</span><span className={`${styles.v} ${posNegClass(results.monthToDatePriceReturnDaily)}`}>{pct(results.monthToDatePriceReturnDaily)}</span></div>
          <div className={styles.cell}><span className={styles.k}>13W</span><span className={`${styles.v} ${posNegClass(results.x13WeekPriceReturnDaily)}`}>{pct(results.x13WeekPriceReturnDaily)}</span></div>
          <div className={styles.cell}><span className={styles.k}>26W</span><span className={`${styles.v} ${posNegClass(results.x26WeekPriceReturnDaily)}`}>{pct(results.x26WeekPriceReturnDaily)}</span></div>
          <div className={styles.cell}><span className={styles.k}>52W</span><span className={`${styles.v} ${posNegClass(results.x52WeekPriceReturnDaily)}`}>{pct(results.x52WeekPriceReturnDaily)}</span></div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Valuation</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Market Cap</span><span className={styles.v}>{currency(results.marketCapitalisation)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Enterprise Value</span><span className={styles.v}>{currency(results.enterpriseValue)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Forward P/E</span><span className={styles.v}>{num(results.forwardPE)}</span></div>
          <div className={styles.cell}><span className={styles.k}>P/E (Annual)</span><span className={styles.v}>{num(results.peAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Asset Turnover (Annual)</span><span className={styles.v}>{num(results.assetTurnoverAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Asset Turnover (TTM)</span><span className={styles.v}>{num(results.assetTurnoverTTM)}</span></div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Profitability & Margins</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Gross Margin (5Y)</span><span className={styles.v}>{pct(results.grossMargin5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Gross Margin (Annual)</span><span className={styles.v}>{pct(results.grossMarginAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Operating Margin (5Y)</span><span className={styles.v}>{pct(results.operatingMargin5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Operating Margin (Annual)</span><span className={styles.v}>{pct(results.operatingMarginAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Net Profit Margin (5Y)</span><span className={styles.v}>{pct(results.netProfitMargin5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Pretax Margin (5Y)</span><span className={styles.v}>{pct(results.pretaxMargin5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Pretax Margin (Annual)</span><span className={styles.v}>{pct(results.pretaxMarginAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROE (5Y)</span><span className={styles.v}>{pct(results.roe5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROE (RFY)</span><span className={styles.v}>{pct(results.roeRfy)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROI (5Y)</span><span className={styles.v}>{pct(results.roi5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROI (Annual)</span><span className={styles.v}>{pct(results.roiAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROA (5Y)</span><span className={styles.v}>{pct(results.roa5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROA (RFY)</span><span className={styles.v}>{pct(results.roaRfy)}</span></div>
        </div>
      </div>

      <div className={styles.section} style={{ paddingBottom: 0 }}>
        <div className={styles.sectionLabel}>Dividend</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Dividend/Share</span><span className={styles.v}>{currency(results.dividendPerShareAnnual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Dividend Growth (5Y)</span><span className={styles.v}>{pct(results.dividendGrowthRate5Y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Payout Ratio</span><span className={styles.v}>{pct(results.payoutRatioAnnual)}</span></div>
        </div>
      </div>
    </Box>
  );
}
