import styles from './TradeVisuals.module.css'
import Modal from '@mui/material/Modal';
import * as React from 'react';

import TradeModal from './TradeModal/TradeModal'
import FundamentalDataModal from './FundamentalDataModal/FundamentalDataModal'

export interface CompanyData {
  asset_turnover_annual: number | null
  asset_turnover_ttm: number | null
  average_volume: number | null

  company_name: string
  current_recommendation: string | null
  description: string | null

  dividend_growth_rate_5y: number | null
  dividend_per_share_annual: number

  enterprise_value: number | null
  exchange: string | null
  forward_pe: number | null

  gross_margin_5y: number | null
  gross_margin_annual: number | null

  industry: string | null
  location: string | null

  market_capitalization: number | null
  month_to_date_price_return_daily: number | null

  net_profit_margin_5y: number | null
  operating_margin_5y: number | null
  operating_margin_annual: number | null

  payout_ratio_annual: number | null
  pe_annual: number | null

  pretax_margin_5y: number | null
  pretax_margin_annual: number | null

  range_high: number | null
  range_low: number | null

  recommendation_history: Recommendation[]  | null

  roa_5y: number | null
  roa_rfy: number | null

  roe_5y: number | null
  roe_rfy: number | null

  roi_5y: number | null

  ticker: string
  volume: number | null
  website: string | null

  x13_week_price_return_daily: number | null
  x26_week_price_return_daily: number | null
  x3_month_average_trading_volume: number | null
  x52_week_price_return_daily: number | null
  x5_day_price_return_daily: number | null
}

interface Recommendation {
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
}

interface Props {
    ticker: string,
    price: number,
    date: string,
    fundamentalData: CompanyData 
}

export default function TradeVisuals({ ticker, price, date, fundamentalData }: Props) {

    const [openFundamentalData, setOpenFundamentalData] = React.useState(false);
    const handleOpenFundamentalData = () => setOpenFundamentalData(true);
    const handleCloseFundamentalData = () => setOpenFundamentalData(false);

    const [openTradeModal, setOpenTradeModal] = React.useState(false);
    const handleOpenTradeModal = () => setOpenTradeModal(true);
    const handleCloseTradeModal = () => setOpenTradeModal(false);

    return (
        <div className={styles.buttonsDiv}>

            <button className={styles.tradeButton} onClick={handleOpenTradeModal}>Trade {ticker}</button>
            <Modal open={openTradeModal} onClose={handleCloseTradeModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <TradeModal symbol={ticker} price={price}/>
            </Modal>

            <button className={styles.fundamentalDataButton} onClick={handleOpenFundamentalData}>View Fundamental Data</button>
            <Modal open={openFundamentalData} onClose={handleCloseFundamentalData} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <FundamentalDataModal results={fundamentalData} price={price} date={date}/>
            </Modal>

        </div>
    )
}