// company profile
export interface StockProfile {
  symbol: string;
  price: number;
  marketCap: number;
  beta: number;
  lastDividend: number;
  range: string;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchangeFullName: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// basic financials
export interface BasicFinancials {
  symbol: string;
  metricType: "all" | string;
  metric: MetricSummary;
  series: MetricSeries;
}

export interface MetricSummary {
  [metricName: string]: number | null;
}

export interface MetricSeries {
  annual: { [metricName: string]: TimeSeriesPoint[]; };
}

export interface TimeSeriesPoint {
  period: string; // ISO date string (YYYY-MM-DD)
  v: number;
}

// stock recommendations
export interface StockRecommendation {
  symbol: string;
  period: string; // YYYY-MM-DD
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

// market news
export interface NewsItem {
  category: string | null;
  datetime: number | null; 
  headline: string | null;
  id: number | null;
  image: string | null;  
  related: string | null;
  source: string | null;
  summary: string | null; 
  url: string | null;
}

// functions:
export async function getCompanyProfile(companyProfileUrl: URL, FMP_API_KEY: string, ticker: string) {
    const output = {};
	try {
        companyProfileUrl.searchParams.append("apikey", FMP_API_KEY);
		const response = await fetch(companyProfileUrl.toString(), {
			method: 'GET',
			headers: {
				"Content-Type": "application/json"
			}
		})

		if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.log(`${ticker} - getCompanyData() - error: ${response.status}, body=${body}`);
            return null
        }

		const companyProfileResult: StockProfile[] = await response.json();

        if (!companyProfileResult || companyProfileResult.length === 0) {
            console.log(`${ticker} - No company profile data returned`);
            return null;
        }

		const data = companyProfileResult[0];

		Object.assign(output, {
            ...(data["description"] != null && { description: data["description"] }), // if null exclude
            ...(data["companyName"] != null && { company_name: data["companyName"] }),
            ...(data["exchange"] != null && { exchange: data["exchange"] }),
            ...(data["website"] != null && { website: data["website"] }),
            ...(data["industry"] != null && { industry: data["industry"] }),
            ...(data["city"] != null && data["country"] != null && { location: `${data["city"]}, ${data["country"]}`,}),
            range_low: data["range"].split("-")[0], // if null include
            range_high: data["range"].split("-")[1],
            volume: data["volume"],
            average_volume: data["averageVolume"],
        });

        // console.log(`company profile data: ${JSON.stringify(output, null, 2)}`);

		return output;
	} catch (error) {
		console.log(`${ticker} - getCompanyProfile() - error: ${error}`);
	}
}

export async function getBasicFinancials(basicFinancialsUrl: URL, FINNHUB_API_KEY: string, ticker: string) {
    const output = {};
    try {
        basicFinancialsUrl.searchParams.set("token", FINNHUB_API_KEY);
        const response = await fetch(basicFinancialsUrl.toString(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.log(`${ticker} - getBasicFinancials() - error: ${response.status}, body=${body}`);
            return null;
        }

        const basicFinancialsResult: BasicFinancials = await response.json();
        const data = basicFinancialsResult?.metric;

        if (!data) {
            console.log(`${ticker} - getBasicFinancials() - error: no data found`);
            return null;
        }

        Object.assign(output, {
            average_volume: data["10DayAverageTradingVolume"],
            ...(data["x3MonthAverageTradingVolume"] !== null && { x3_month_average_trading_volume: data["x3MonthAverageTradingVolume"] }),
            ...(data["assetTurnoverAnnual"] !== null && { asset_turnover_annual: data["assetTurnoverAnnual"] }),
            ...(data["assetTurnoverTTM"] !== null && { asset_turnover_ttm: data["assetTurnoverTTM"] }),
            x5_day_price_return_daily: data["5DayPriceReturnDaily"],
            ...(data["monthToDatePriceReturnDaily"] !== null && { month_to_date_price_return_daily: data["monthToDatePriceReturnDaily"] }),
            ...(data["x13WeekPriceReturnDaily"] !== null && { x13_week_price_return_daily: data["x13WeekPriceReturnDaily"] }),
            ...(data["x26WeekPriceReturnDaily"] !== null && { x26_week_price_return_daily: data["x26WeekPriceReturnDaily"] }),
            ...(data["x52WeekPriceReturnDaily"] !== null && { x52_week_price_return_daily: data["x52WeekPriceReturnDaily"] }),
            ...(data["marketCapitalization"] !== null && { market_capitalization: data["marketCapitalization"] }),
            ...(data["enterpriseValue"] !== null && { enterprise_value: data["enterpriseValue"] }),
            ...(data["forwardPE"] !== null && { forward_pe: data["forwardPE"] }),
            ...(data["peAnnual"] !== null && { pe_annual: data["peAnnual"] }),
            ...(data["grossMargin5Y"] !== null && { gross_margin_5y: data["grossMargin5Y"] }),
            ...(data["grossMarginAnnual"] !== null && { gross_margin_annual: data["grossMarginAnnual"] }),
            ...(data["operatingMargin5Y"] !== null && { operating_margin_5y: data["operatingMargin5Y"] }),
            ...(data["operatingMarginAnnual"] !== null && { operating_margin_annual: data["operatingMarginAnnual"] }),
            ...(data["netProfitMargin5Y"] !== null && { net_profit_margin_5y: data["netProfitMargin5Y"] }),
            ...(data["pretaxMargin5Y"] !== null && { pretax_margin_5y: data["pretaxMargin5Y"] }),
            ...(data["pretaxMarginAnnual"] !== null && { pretax_margin_annual: data["pretaxMarginAnnual"] }),
            ...(data["roe5Y"] !== null && { roe_5y: data["roe5Y"] }),
            ...(data["roeRfy"] !== null && { roe_rfy: data["roeRfy"] }),
            ...(data["roi5Y"] !== null && { roi_5y: data["roi5Y"] }),
            ...(data["roa5Y"] !== null && { roa_5y: data["roa5Y"] }),
            ...(data["roaRfy"] !== null && { roa_rfy: data["roaRfy"] }),
            ...(data["dividendPerShareAnnual"] !== null && { dividend_per_share_annual: data["dividendPerShareAnnual"] }),
            ...(data["dividendGrowthRate5Y"] !== null && { dividend_growth_rate_5y: data["dividendGrowthRate5Y"] }),
            ...(data["payoutRatioAnnual"] !== null && { payout_ratio_annual: data["payoutRatioAnnual"] }),
        });

        // console.log(`basic financials: ${JSON.stringify(output, null, 2)}`);

        return output;

    } catch (error) {
		console.log(`${ticker} - getBasicFinancials() - error: ${error}`);
	}
    
}

export async function getStockRecommendations(stockRecommendationUrl: URL, FINNHUB_API_KEY: string, ticker: string) {
    const output = {};
    try {
        stockRecommendationUrl.searchParams.set("token", FINNHUB_API_KEY);
        const response = await fetch(stockRecommendationUrl.toString(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        }) 

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.log(`${ticker} - getStockRecommendations() - error: ${response.status}, body=${body}`);
            return null;
        }

        const data: StockRecommendation[] = await response.json();

        if (!data || data.length === 0) return null;
        
        const latestMonthRecommendation = data?.[0];

        const ratingKeys = ["buy", "hold", "sell", "strongBuy", "strongSell"];
        let current_recommendation = null;
        let current_recommendation_count = 0;
        Object.entries(latestMonthRecommendation).forEach(([key, value]) => {
            if (ratingKeys.includes(key) && typeof value === 'number') {
                if (value > current_recommendation_count) {
                    current_recommendation = key;
                    current_recommendation_count = value;                
                }
            }   
        })

        Object.assign(output, data != null ? {
            "recommendation_history": data,
            "current_recommendation": current_recommendation, 
        } : {});

        // console.log(`stock recommendation: ${JSON.stringify(output, null, 2)}`);

        return output;

    } catch (error) {
		console.log(`${ticker} - getStockRecommendations() - error: ${error}`);
	}
    
}

export async function getMarketNews(marketNewsUrl:URL, FINNHUB_API_KEY: string) {
    try{
        marketNewsUrl.searchParams.set("token", FINNHUB_API_KEY);
        const response = await fetch(marketNewsUrl.toString(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.log(`getMarketNews() - error: ${response.status}, body=${body}`);
            return null;
        }

        const data: NewsItem[] = await response.json();
        const safeData = Array.isArray(data) ? data : [];
        const cleanedData = (safeData || [])
            .map(( {related, id, ...rest}) => rest)  //remove related and id field.
            .filter(item =>
                item.headline &&
                item.datetime &&
                item.source &&
                item.summary &&
                item.url &&
                item.image &&
                item.category
            );

        // console.log(`stock recommendation: ${JSON.stringify(cleanedData, null, 2)}`);        
        return cleanedData;
    } catch (error) {
		console.log(`getMarketNews() - error: ${error}`);
	}
}