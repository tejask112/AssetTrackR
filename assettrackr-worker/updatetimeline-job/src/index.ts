import { createClient } from '@supabase/supabase-js'

type Env = {
	SUPABASE_URL: string
	SUPABASE_SERVICE_ROLE_KEY: string
}

function supabaseSetupClient(env: Env) {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false,
		},
	})
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '* * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log(`RUNNING: scheduled event ${new Date}`);

		if (!checkTimelineHours()) return;

		const supabase = supabaseSetupClient(env);

		const { data, error} = await supabase.rpc('update_all_timelines');
		if (error) {
			console.error(`supabase error: ${error}`);
		}

	},
} satisfies ExportedHandler<Env>;

// check if market is open and if minute is 0, 15, 30, 45
function checkTimelineHours() {

	const formatterToNyTimeObj = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		weekday: "short",
	});
	
	const now = new Date();
	const parts = formatterToNyTimeObj.formatToParts(now);

	const weekday = parts.find(p => p.type === "weekday")?.value;
	const allWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	if (!allWeekdays.includes(weekday!)) return false;

	const hour = Number(parts.find(p => p.type === "hour")?.value);
	const minute = Number(parts.find(p => p.type === "minute")?.value);

	// 9*60 + 30 --> 9:30am
	// 16:60 --> 4pm
	const combinedMinutes = hour * 60 + minute;

	const marketOpen = (combinedMinutes >= 9 * 60 + 30 && combinedMinutes < 16 * 60);
	const quarterMinuteInterval = (minute == 0 || minute == 15 || minute == 30 || minute == 45);

	return marketOpen && quarterMinuteInterval;
}