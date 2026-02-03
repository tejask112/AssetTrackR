import styles from './SummaryVisuals.module.css';


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

interface Props {
    data: CompanyData,
    price: number
}

export default function SummaryVisuals({ data, price }: Props) {
    return (
        <div className={styles.summaryCard}>
            <div className={styles.metricsThreeCol}>
                <div className={styles.col}>
                    <div className={styles.metric}>
                        <div className={styles.label}>Exchange</div>
                        <div className={styles.value}>{data.exchange}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>Volume</div>
                        <div className={styles.value}>{data.volume?.toLocaleString() ?? ' - '}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>Market Cap</div>
                        <div className={styles.value}>${data.market_capitalization?.toLocaleString() ?? ' -'}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>Annual P/E</div>
                        <div className={styles.value}>{data.pe_annual?.toFixed(2) ?? ' - '}</div>
                    </div>
                </div>

                <div className={styles.col}>
                    <div className={styles.metric}>
                        <div className={styles.label}>5 Day Return</div>
                        <div
                            className={styles.value}
                            style={{ color: (data.x5_day_price_return_daily ?? 0) === 0 ? "gray" : data.x5_day_price_return_daily! > 0 ? "green" : "red" }}
                        >
                        {data.x5_day_price_return_daily?.toFixed(2) ?? ' - '}%
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>1 Month Return</div>
                        <div
                            className={styles.value}
                            style={{ color: (data.month_to_date_price_return_daily ?? 0) === 0 ? "gray" : data.month_to_date_price_return_daily! > 0 ? "green" : "red" }}
                        >
                            {data.month_to_date_price_return_daily?.toFixed(2) ?? ' - '}%
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>6 Month Return</div>
                        <div
                            className={styles.value}
                            style={{ color: (data.x26_week_price_return_daily ?? 0) === 0 ? "gray" : data.x26_week_price_return_daily! > 0 ? "green" : "red" }}
                        >
                            {data.x26_week_price_return_daily?.toFixed(2) ?? ' - '}%
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>1 Year Return</div>
                        <div
                            className={styles.value}
                            style={{ color: (data.x52_week_price_return_daily ?? 0) === 0 ? "gray" : data.x52_week_price_return_daily! > 0 ? "green" : "red" }}
                        >
                            {data.x52_week_price_return_daily?.toFixed(2) ?? ' - '}%
                        </div>
                    </div>
                    </div>

                    <div className={styles.col}>
                    <div className={styles.metric}>
                        <div className={styles.label}>1 Year High</div>
                        <div className={styles.value}>${data.range_high ?? ' - '}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>Ask Price</div>
                        <div className={styles.value}>${Number(price).toFixed(2) ?? ' - '}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.label}>1 Year Low</div>
                        <div className={styles.value}>${data.range_low ?? ' - '}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}