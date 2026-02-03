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

export interface CompanyData {
  asset_turnover_annual: number | null;
  asset_turnover_ttm: number | null;
  average_volume: number | null;
  company_name: string;
  current_recommendation: string | null;
  description: string | null;
  dividend_growth_rate_5y: number | null;
  dividend_per_share_annual: number | null;
  enterprise_value: number | null;
  exchange: string | null;
  forward_pe: number | null;
  gross_margin_5y: number | null;
  gross_margin_annual: number | null;
  industry: string | null;
  location: string | null;
  market_capitalization: number | null;
  month_to_date_price_return_daily: number | null;
  net_profit_margin_5y: number | null;
  operating_margin_5y: number | null;
  operating_margin_annual: number | null;
  payout_ratio_annual: number | null;
  pe_annual: number | null;
  pretax_margin_5y: number | null;
  pretax_margin_annual: number | null;
  range_high: number | null;
  range_low: number | null;
  recommendation_history: Recommendation[] | null;
  roa_5y: number | null;
  roa_rfy: number | null;
  roe_5y: number | null;
  roe_rfy: number | null;
  roi_5y: number | null;
  ticker: string;
  volume: number | null;
  website: string | null;
  x13_week_price_return_daily: number | null;
  x26_week_price_return_daily: number | null;
  x3_month_average_trading_volume: number | null;
  x52_week_price_return_daily: number | null;
  x5_day_price_return_daily: number | null;
}

interface FundamentalDataProp {
  results: CompanyData;
  price: number;
  date: string;
}

export default function FundamentalDataModal({ results, price, date }: FundamentalDataProp) {
  const MISSING = ' - ';

  const isValid = (n?: number | null): n is number => 
    typeof n === 'number' && n !== -1 && Number.isFinite(n);

  const pct = (n?: number | null) => (isValid(n) ? `${n.toFixed(2)}%` : MISSING); // percentage
  const num = (n?: number | null) => (isValid(n) ? n.toLocaleString() : MISSING); // number
  const currency = (n?: number | null) => (isValid(n) ? `$${n.toLocaleString()}` : MISSING); // currency
  const posNegClass = (n?: number | null) => (isValid(n) ? (n < 0 ? styles.neg : styles.pos) : ''); // positive/negative styling

  const dateDate = new Date(date);
  const nyTime = dateDate.toLocaleTimeString('en-GB', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
  });

  return (
    <Box className={styles.modal}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{results.company_name}</div>
          <div className={styles.subTitle}>{results.industry} · {results.exchange} · {results.location}</div>
        </div>

        {results.website != null ? (
          <a className={styles.link} href={results.website}>{results.website}</a>
        ): (
          <span className={styles.link}>{MISSING}</span>
        )}

      </div>

      <p className={styles.desc}>{results.description || 'No description available.'}</p>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Volume & Liquidity</div>
        <div className={styles.grid}>
          <div className={styles.cell}>
            <span className={styles.k}>Volume</span>
            <span className={styles.v}>{num(results.volume)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Avg Volume</span>
            <span className={styles.v}>{num(results.average_volume)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>3M Avg</span>
            <span className={styles.v}>{num(results.x3_month_average_trading_volume)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>1Y High</span>
            <span className={styles.v}>{currency(results.range_high)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>1Y Low</span>
            <span className={styles.v}>{currency(results.range_low)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Last Price</span>
            <span className={styles.v}>
              {currency(price)} | {date ? nyTime : MISSING}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Returns</div>
        <div className={styles.grid}>
          <div className={styles.cell}>
            <span className={styles.k}>5D</span>
            <span className={`${styles.v} ${posNegClass(results.x5_day_price_return_daily)}`}>
              {pct(results.x5_day_price_return_daily)}
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>MTD</span>
            <span className={`${styles.v} ${posNegClass(results.month_to_date_price_return_daily)}`}>
              {pct(results.month_to_date_price_return_daily)}
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>13W</span>
            <span className={`${styles.v} ${posNegClass(results.x13_week_price_return_daily)}`}>
              {pct(results.x13_week_price_return_daily)}
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>26W</span>
            <span className={`${styles.v} ${posNegClass(results.x26_week_price_return_daily)}`}>
              {pct(results.x26_week_price_return_daily)}
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>52W</span>
            <span className={`${styles.v} ${posNegClass(results.x52_week_price_return_daily)}`}>
              {pct(results.x52_week_price_return_daily)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Valuation</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Market Cap</span><span className={styles.v}>{currency(results.market_capitalization)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Enterprise Value</span><span className={styles.v}>{currency(results.enterprise_value)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Forward P/E</span><span className={styles.v}>{num(results.forward_pe)}</span></div>
          <div className={styles.cell}><span className={styles.k}>P/E (Annual)</span><span className={styles.v}>{num(results.pe_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Asset Turnover (Annual)</span><span className={styles.v}>{num(results.asset_turnover_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Asset Turnover (TTM)</span><span className={styles.v}>{num(results.asset_turnover_ttm)}</span></div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Profitability & Margins</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Gross Margin (5Y)</span><span className={styles.v}>{pct(results.gross_margin_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Gross Margin (Annual)</span><span className={styles.v}>{pct(results.gross_margin_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Operating Margin (5Y)</span><span className={styles.v}>{pct(results.operating_margin_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Operating Margin (Annual)</span><span className={styles.v}>{pct(results.operating_margin_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Net Profit Margin (5Y)</span><span className={styles.v}>{pct(results.net_profit_margin_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Pretax Margin (5Y)</span><span className={styles.v}>{pct(results.pretax_margin_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Pretax Margin (Annual)</span><span className={styles.v}>{pct(results.pretax_margin_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROE (5Y)</span><span className={styles.v}>{pct(results.roe_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROE (RFY)</span><span className={styles.v}>{pct(results.roe_rfy)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROI (5Y)</span><span className={styles.v}>{pct(results.roi_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROA (5Y)</span><span className={styles.v}>{pct(results.roa_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>ROA (RFY)</span><span className={styles.v}>{pct(results.roa_rfy)}</span></div>
        </div>
      </div>

      <div className={styles.section} style={{ paddingBottom: 0 }}>
        <div className={styles.sectionLabel}>Dividend</div>
        <div className={styles.grid}>
          <div className={styles.cell}><span className={styles.k}>Dividend/Share</span><span className={styles.v}>{currency(results.dividend_per_share_annual)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Dividend Growth (5Y)</span><span className={styles.v}>{pct(results.dividend_growth_rate_5y)}</span></div>
          <div className={styles.cell}><span className={styles.k}>Payout Ratio</span><span className={styles.v}>{pct(results.payout_ratio_annual)}</span></div>
        </div>
      </div>
    </Box>
  );
}