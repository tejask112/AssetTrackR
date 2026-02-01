import { getCompanyProfile, getBasicFinancials, getStockRecommendations, getMarketNews } from './apiCallers'
import { createClient } from "@supabase/supabase-js";

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
		const { error: data_error } = await supabase .from("company_profile").upsert(aggregatedData);
		if (data_error) {
			console.error("Supabase Error")
			console.error("Message:", data_error.message);
			console.error("Details:", data_error.details);
		}

		// collect market news
		const marketNewsUrl = new URL(`https://finnhub.io/api/v1/news?category=general`);
		const marketNews = await getMarketNews(marketNewsUrl, env.FINNHUB_API_KEY)
		const { error: news_error_del } = await supabase .from("market_news").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // delete all current rows from table
		const { error: news_error_ins } = await supabase .from("market_news").insert(marketNews); // insert all new news items into table

		if (news_error_del) {
			console.error("Supabase Error")
			console.error("Message:", news_error_del.message);
			console.error("Details:", news_error_del.details);
		}

		if (news_error_ins) {
			console.error("Supabase Error")
			console.error("Message:", news_error_ins.message);
			console.error("Details:", news_error_ins.details);
		}

		return;
	},
} satisfies ExportedHandler<Env>;

// collect company data
async function getCompanyData(ticker: string, FMP_API_KEY: string, FINNHUB_API_KEY: string,) {
	const companyProfileUrl = new URL(`https://financialmodelingprep.com/stable/profile?symbol=${ticker}`)
	const basicFinancialsUrl = new URL(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all`)
	const stockRecommendationUrl = new URL(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}`)

	const companyProfilePromise = getCompanyProfile(companyProfileUrl, FMP_API_KEY, ticker);
	const basicFinancialPromise = getBasicFinancials(basicFinancialsUrl, FINNHUB_API_KEY, ticker);
	const stockRecommendationPromise = getStockRecommendations(stockRecommendationUrl, FINNHUB_API_KEY, ticker);

	const [companyProfileData, basicFinancialData, stockRecommendationData] = await Promise.all([  //wait for all 3 to finish
        companyProfilePromise,
        basicFinancialPromise,
        stockRecommendationPromise
    ]);

	const name = { "ticker": ticker };
	const output = { 
        ...name, 
        ...(companyProfileData || {}), 
        ...(basicFinancialData || {}), 
        ...(stockRecommendationData || {}) 
    };

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

	return hour === 9;

}