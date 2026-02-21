// Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
import { createClient } from "@supabase/supabase-js";

interface FinnhubRespData {
	c: number;
	d: number;
	dp: number;
	h: number;
	l: number;
	o: number;
	pc: number;
	t: number
}

interface PriceData {
	ticker: string;
	price: number
}

interface Env {
	FINNHUB_API_KEY: string;
	SUPABASE_URL: string;
  	SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '* * * * *');
		// ***** -> minute, hour, day of month, month, day of week
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(controller: ScheduledController, env: Env): Promise<void> {
		const now = new Date();
		if (!checkMarketOpen(now)) return;
		
		const tickers = ["NVDA", "GOOG", "AAPL", "TSLA", "AMZN", "MSFT", "META", "ORCL", "UBER", "NFLX", "SHOP", "TSM", "AMD", "AVGO", "MU"];
		
		// collect the latest prices
		const FINNHUB_API_KEY = env.FINNHUB_API_KEY;
		const url = new URL("https://finnhub.io/api/v1/quote");

		const aggregatedData: PriceData[] = [];
		
		for (const ticker of tickers) {
			url.searchParams.set("symbol", ticker);
			const resp = await fetch(url.toString(), {
				headers: { "X-Finnhub-Token": FINNHUB_API_KEY }
			});

			if (!resp) {
				console.log(`${ticker} - error`);
			} else {
				const data: FinnhubRespData = await resp.json();
				aggregatedData.push({
					ticker: ticker,
					price: data.c,
				})
			}
		}

		console.log(aggregatedData);

		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

		// push prices to Supabase `market_data` table
		const {error: market_data_err } = await supabase .from("market_data").insert(aggregatedData);
		if (market_data_err) {
			console.error("Supabase Error (Inserting Market Data)")
			console.error("Message:", market_data_err.message);
			console.error("Details:", market_data_err.details);
		}

		// run all queued trades using latest prices if: 9:00am <= time <= 9:01am
		if (!checkFirstMinOfMarket(now)) return;
		const {error: queued_trades_err } = await supabase.rpc("run_queued_trades");
		if (queued_trades_err) {
			console.error("Supabase Error (Running Queued Trades)")
			console.error("Message:", queued_trades_err.message);
			console.error("Details:", queued_trades_err.details);
		}

	},
} satisfies ExportedHandler<Env>;

// check if market is open
function checkMarketOpen( now: Date ) {
	const formatterToNyTimeObj = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		weekday: "short",
	});
	
	const parts = formatterToNyTimeObj.formatToParts(now);

	const weekday = parts.find(p => p.type === "weekday")?.value;
	const allWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	if (!allWeekdays.includes(weekday!)) return false;

	const hour = Number(parts.find(p => p.type === "hour")?.value);
	const minute = Number(parts.find(p => p.type === "minute")?.value);

	const combinedMinutes = hour * 60 + minute;

	// 9*60 + 30 --> 9:30am
	// 16:60 --> 4pm
	return combinedMinutes >= 9 * 60 + 30 && combinedMinutes < 16 * 60;
}

// check if time: 9:30am <= time < 9:31am
function checkFirstMinOfMarket( now: Date ) {
	const formatterToNyTimeObj = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		weekday: "short",
	});
	
	const parts = formatterToNyTimeObj.formatToParts(now);

	const hour = Number(parts.find(p => p.type === "hour")?.value);
	const minute = Number(parts.find(p => p.type === "minute")?.value);

	return hour === 9 && minute === 30;
}	