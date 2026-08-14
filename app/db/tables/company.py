from db.tables.base import Base

from sqlalchemy import ForeignKey, String, Date, Text, CheckConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from decimal import Decimal

class CompanyProfile(Base): 
    __tablename__ = "company_profile"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_id"), primary_key=True)
    exchange: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    sector: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    full_time_employees: Mapped[int | None] = mapped_column(nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    ipo_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    ceo: Mapped[str | None] = mapped_column(String, nullable=True)
    cik: Mapped[str | None] = mapped_column(String, nullable=True)
    isin: Mapped[str | None] = mapped_column(String, nullable=True)
    cusip: Mapped[str | None] = mapped_column(String, nullable=True)

    stock_fk: Mapped["Stocks"] = relationship(back_populates="company_profile")

    __table_args__ = (
        CheckConstraint("full_time_employees >= 0", name="check_employees_nonnegative"),
        CheckConstraint("cusip IS NULL OR length(CUSIP) = 9", name="check_cusip length"),
        CheckConstraint("isin IS NULL OR length(isin) = 12", name="check_isin_length")
    )


class CompanyMetrics(Base):
    __tablename__ = "company_metrics"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_id"), primary_key=True, nullable=False)

    # Upcoming Earnings
    upcoming_earnings_date: Mapped[date | None] = mapped_column(Date)
    upcoming_earnings_hour_type: Mapped[str | None] = mapped_column(String)

    # Valuation
    market_capitalization: Mapped[Decimal | None] = mapped_column(Numeric)
    enterprise_value: Mapped[Decimal | None] = mapped_column(Numeric)
    enterprise_value_to_ebitda_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    enterprise_value_to_revenue_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    enterprise_value_to_free_cash_flow_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    enterprise_value_to_free_cash_flow_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    pe_ratio_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    pe_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    forward_pe_ratio: Mapped[Decimal | None] = mapped_column(Numeric)
    basic_pe_ratio_excluding_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    pe_ratio_excluding_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    pe_ratio_excluding_extraordinary_items_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    pe_ratio_including_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    normalized_pe_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    peg_ratio_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    forward_peg_ratio: Mapped[Decimal | None] = mapped_column(Numeric)
    ps_ratio_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    ps_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    pb_ratio: Mapped[Decimal | None] = mapped_column(Numeric)
    pb_ratio_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    pb_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_tangible_book_value_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_tangible_book_value_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_cash_flow_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_cash_flow_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_free_cash_flow_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    price_to_free_cash_flow_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)

    # Income Statement / Per Share
    revenue_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    basic_eps_excluding_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    basic_eps_excluding_extraordinary_items_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_excluding_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_excluding_extraordinary_items_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_including_extraordinary_items_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_including_extraordinary_items_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    normalized_eps_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    ebitda_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    ebitda_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)

    # Cash Flow / Cash Per Share
    cash_flow_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    cash_flow_per_share_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    cash_flow_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    cash_per_share_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    cash_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)

    # Balance Sheet / Liquidity / Leverage
    book_value_per_share_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    book_value_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    tangible_book_value_per_share_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    tangible_book_value_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    current_ratio_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    current_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    quick_ratio_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    quick_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    long_term_debt_to_equity_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    long_term_debt_to_equity_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    total_debt_to_total_equity_quarterly: Mapped[Decimal | None] = mapped_column(Numeric)
    total_debt_to_total_equity_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    net_interest_coverage_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    net_interest_coverage_annual: Mapped[Decimal | None] = mapped_column(Numeric)

    # Profitability
    gross_margin_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    gross_margin_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    gross_margin_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    operating_margin_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    operating_margin_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    operating_margin_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    pretax_margin_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    pretax_margin_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    pretax_margin_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    net_profit_margin_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    net_profit_margin_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    net_profit_margin_5y: Mapped[Decimal | None] = mapped_column(Numeric)

    # Efficiency / Returns
    return_on_assets_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_assets_rfy: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_assets_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_equity_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_equity_rfy: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_equity_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_investment_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_investment_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    return_on_investment_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    asset_turnover_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    asset_turnover_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    inventory_turnover_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    inventory_turnover_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    receivables_turnover_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    receivables_turnover_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_per_employee_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_per_employee_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    net_income_per_employee_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    net_income_per_employee_annual: Mapped[Decimal | None] = mapped_column(Numeric)

    # Growth
    revenue_growth_ttm_yoy: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_growth_quarterly_yoy: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_growth_3y: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_growth_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    revenue_per_share_growth_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_growth_ttm_yoy: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_growth_quarterly_yoy: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_growth_3y: Mapped[Decimal | None] = mapped_column(Numeric)
    eps_growth_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    ebitda_cagr_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    ebitda_interim_cagr_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    focf_cagr_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    capex_cagr_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    book_value_per_share_growth_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    tangible_book_value_cagr_5y: Mapped[Decimal | None] = mapped_column(Numeric)
    net_margin_growth_5y: Mapped[Decimal | None] = mapped_column(Numeric)

    # Trading Activity / Risk
    x10_day_average_trading_volume: Mapped[Decimal | None] = mapped_column(Numeric)
    x3_month_average_trading_volume: Mapped[Decimal | None] = mapped_column(Numeric)
    beta: Mapped[Decimal | None] = mapped_column(Numeric)
    x3_month_ad_return_std: Mapped[Decimal | None] = mapped_column(Numeric)
    x52_week_high: Mapped[Decimal | None] = mapped_column(Numeric)
    x52_week_high_date: Mapped[date | None] = mapped_column(Date)
    x52_week_low: Mapped[Decimal | None] = mapped_column(Numeric)
    x52_week_low_date: Mapped[date | None] = mapped_column(Date)

    # Price Performance
    x5_day_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    month_to_date_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    x13_week_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    x26_week_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    x52_week_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    year_to_date_price_return_daily: Mapped[Decimal | None] = mapped_column(Numeric)
    price_relative_to_sp500_4_week: Mapped[Decimal | None] = mapped_column(Numeric)
    price_relative_to_sp500_13_week: Mapped[Decimal | None] = mapped_column(Numeric)
    price_relative_to_sp500_26_week: Mapped[Decimal | None] = mapped_column(Numeric)
    price_relative_to_sp500_52_week: Mapped[Decimal | None] = mapped_column(Numeric)
    price_relative_to_sp500_ytd: Mapped[Decimal | None] = mapped_column(Numeric)

    # Dividends
    dividend_indicated_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    dividend_per_share_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    dividend_per_share_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    dividend_yield_indicated_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    current_dividend_yield_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    payout_ratio_ttm: Mapped[Decimal | None] = mapped_column(Numeric)
    payout_ratio_annual: Mapped[Decimal | None] = mapped_column(Numeric)
    dividend_growth_rate_5y: Mapped[Decimal | None] = mapped_column(Numeric)

    stock_fk: Mapped["Stocks"] = relationship(back_populates="company_metrics")