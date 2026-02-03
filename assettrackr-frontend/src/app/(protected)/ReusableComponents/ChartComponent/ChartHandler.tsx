import * as React from 'react';
import LineDispChart, { type LinePoint } from '../ChartComponent/DisplayChart/DisplayChart';
import styles from './ChartsHandler.module.css';

interface TimelinePoint {
  date: string;
  price: number;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

interface Props {
  data: TimelinePoint[] | null;
  timeframe?: Timeframe;
  height: number;
}

export default function ChartsHandler({ data, timeframe = '1M', height }: Props) {
  const lineData: LinePoint[] = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const now = new Date();
    const cutoffDate = new Date();

    // Calculate cutoff date based on timeframe
    switch (timeframe) {
      case '1D':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '5D':
        cutoffDate.setDate(now.getDate() - 5);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'Since Start':
      default:
        cutoffDate.setFullYear(1970); // Show all data
        break;
    }

    const cutoffSec = Math.floor(cutoffDate.getTime() / 1000);
    const seenSec = new Set<number>();

    return data
      .map((p) => {
        const ms = Date.parse(p.date); // ISO with microseconds parses fine
        if (!Number.isFinite(ms)) return null;

        const sec = Math.floor(ms / 1000); // lightweight-charts line series wants seconds
        return { timeSec: sec, value: p.price };
      })
      .filter((p): p is { timeSec: number; value: number } => p !== null)
      .filter((p) => p.timeSec >= cutoffSec)
      .filter((p) => {
        if (seenSec.has(p.timeSec)) return false;
        seenSec.add(p.timeSec);
        return true;
      })
      .sort((a, b) => a.timeSec - b.timeSec)
      .map((p) => ({
        time: p.timeSec, 
        value: p.value,
      })) as LinePoint[];
  }, [data, timeframe]);



  if (!lineData.length) {
    return <div className={styles.chartDiv}>No data to display</div>;
  }

  return (
    <div className={styles.chartDiv}>
      <LineDispChart data={lineData} height={height} />
    </div>
  );
}
