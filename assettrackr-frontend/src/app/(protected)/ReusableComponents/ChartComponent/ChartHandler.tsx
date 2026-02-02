import * as React from 'react';
import LineDispChart, { type LinePoint } from '../ChartComponent/DisplayChart/DisplayChart';
import styles from './ChartsHandler.module.css';

interface TimelinePoint {
  datetime: string;
  value: string;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

interface Props {
  data: TimelinePoint[] | 'Error';
  timeframe?: Timeframe;
}

export default function ChartsHandler({ data, timeframe = '1M' }: Props) {
  const lineData: LinePoint[] = React.useMemo(() => {
    if (!data || data === 'Error' || !Array.isArray(data)) return [];

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

    return data
      .map((p) => ({
        time: p.datetime,
        value: parseFloat(p.value),
      }))
      .filter((p) => new Date(p.time as string).getTime() >= cutoffDate.getTime())
      .sort(
        (a, b) =>
          new Date(a.time as string).getTime() -
          new Date(b.time as string).getTime()
      );
  }, [data, timeframe]);

  if (!lineData.length) {
    return <div className={styles.chartDiv}>No data to display</div>;
  }

  return (
    <div className={styles.chartDiv}>
      <LineDispChart data={lineData} height={505} />
    </div>
  );
}
