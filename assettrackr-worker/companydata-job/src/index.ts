import { getCompanyProfile, getBasicFinancials, getStockRecommendations, getMarketNews } from './apiCallers'
import { createClient } from "@supabase/supabase-js";


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

interface Env {
	FINNHUB_API_KEY: string;
	FMP_API_KEY: string;
	SUPABASE_URL: string;
  	SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';

		// ***** -> minute, hour, day of month, month, day of week
		url.searchParams.append('cron', '* * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	
	async scheduled(event, env: Env, ctx): Promise<void> {
		if (!isNineAmNY()) return;

		const tickers = ["NVDA", "GOOG", "AAPL", "TSLA", "AMZN", "MSFT", "META", "ORCL", "UBER", "NFLX", "SHOP", "TSM", "AMD", "AVGO", "MU"];
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
		
		// collect company data
		console.log("Starting parallel data collection...");
		const promises = tickers.map(async (ticker) => {
			console.log(`Collecting Data for ${ticker}`);
			
			const data = await getCompanyData(ticker, env.FMP_API_KEY, env.FINNHUB_API_KEY);
			
			if (data !== undefined && data !== null) {
				return data;
			} else {
				console.log(`Skipping ${ticker} - incomplete data.`);
				return null;
			}
		});
		const rawResults = await Promise.all(promises);
		const aggregatedData = rawResults.filter(item => item !== null);
		console.log("Collected all company data");

		// bulk upsert data into supabase database
		console.log("Bulk Upserting into Supabase");
		const { error } = await supabase .from("company_profile").upsert(aggregatedData);
		if (error) {
			console.error("Supabase Error")
			console.error("Message:", error.message);
			console.error("Details:", error.details);
		}

		// collect market news
		// const marketNews = getMarketNews(env.FINNHUB_API_KEY)

	},
} satisfies ExportedHandler<Env>;

// collect company data
async function getCompanyData(ticker: string, FMP_API_KEY: string, FINNHUB_API_KEY: string,) {
	const companyProfileUrl = new URL(`https://financialmodelingprep.com/stable/profile?symbol=${ticker}`)
	const basicFinancialsUrl = new URL(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all`)
	const stockRecommendationUrl = new URL(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}`)

	const companyProfileData = await getCompanyProfile(companyProfileUrl, FMP_API_KEY, ticker);
	const basicFinancialData = await getBasicFinancials(basicFinancialsUrl, FINNHUB_API_KEY, ticker);
	const stockRecommendationData = await getStockRecommendations(stockRecommendationUrl, FINNHUB_API_KEY, ticker);

	const name = { "ticker": ticker };
	const output = { ...name, ...companyProfileData, ...basicFinancialData, ...stockRecommendationData};
	return output;
}

// checks if current time in NY is 9:00am (for daylight saving drift)
function isNineAmNY() {

	const formatterToNyTimeObj = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		weekday: "short",
	});

	const currentDate = new Date();
	const parts = formatterToNyTimeObj.formatToParts(currentDate);

	const hour = Number(parts.find(p => p.type === "hour")?.value);
	const minute = Number(parts.find(p => p.type === "minute")?.value);

	return hour === 9 && minute === 0;

}