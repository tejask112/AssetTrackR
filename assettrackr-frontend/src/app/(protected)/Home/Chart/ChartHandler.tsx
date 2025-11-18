import * as React from 'react';
import LineDispChart, { type LinePoint } from './DisplayChart/DisplayChart';
import styles from './ChartsHandler.module.css';

interface TimelinePoint {
  datetime: string;
  value: string;
}

interface Props {
  data: TimelinePoint[] | 'Error';
}

export default function ChartsHandler({ data }: Props) {
  const lineData: LinePoint[] = React.useMemo(() => {
    if (!data || data === 'Error' || !Array.isArray(data)) return [];

    return data
      .map((p) => ({
        time: p.datetime,
        value: parseFloat(p.value),
      }))
      .sort(
        (a, b) =>
          new Date(a.time as string).getTime() -
          new Date(b.time as string).getTime()
      );
  }, [data]);

  if (!lineData.length) {
    return <div className={styles.chartDiv}>No data to display</div>;
  }

  return (
    <div className={styles.chartDiv}>
      <LineDispChart data={lineData} height={505} />
    </div>
  );
}
