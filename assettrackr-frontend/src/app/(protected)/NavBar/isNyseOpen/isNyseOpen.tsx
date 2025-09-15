
export function isNyseOpen(now: Date = new Date()): boolean {
    const tz = "America/New_York";

    const weekdayShort = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
    }).format(now);
    const isWeekday =
        weekdayShort === "Mon" ||
        weekdayShort === "Tue" ||
        weekdayShort === "Wed" ||
        weekdayShort === "Thu" ||
        weekdayShort === "Fri";

    if (!isWeekday) return false;

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(now);

    const hh = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10);
    const mm = parseInt(parts.find(p => p.type === "minute")?.value ?? "0", 10);
    const minutesSinceMidnight = hh * 60 + mm;


    return minutesSinceMidnight >= 9 * 60 + 30 && minutesSinceMidnight < 16 * 60;
}
