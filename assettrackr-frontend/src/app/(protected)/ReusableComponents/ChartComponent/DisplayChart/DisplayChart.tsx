'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type UTCTimestamp,
} from 'lightweight-charts';

export type LinePoint = { time: number | string | Date; value: number };

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'Since Start';

type Colors = {
  backgroundColor?: string;
  lineColor?: string;
  textColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
};

type Props = {
  data: LinePoint[];
  height?: number;
  colors?: Colors;
  timeframe?: Timeframe;
};

export default function LineDispChart({
  data,
  height = 300,
  colors = {},
  timeframe = 'Since Start',
}: Props) {
  const {
    backgroundColor = 'white',
    lineColor = '#2962FF',
    textColor = 'black',
    areaTopColor = '#2962FF',
    areaBottomColor = 'rgba(41, 98, 255, 0.28)',
  } = colors;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const normalizedDataRef = useRef<AreaData<UTCTimestamp>[]>([]);

  const toUTCTimestamp = (t: LinePoint['time']): UTCTimestamp => {
    let n: number;
    if (t instanceof Date) n = Math.floor(t.getTime() / 1000);
    else if (typeof t === 'number') n = t > 1e12 ? Math.floor(t / 1000) : t;
    else n = Math.floor(new Date(t).getTime() / 1000);
    return n as UTCTimestamp;
  };

  const normalize = (arr: LinePoint[]): AreaData<UTCTimestamp>[] =>
    arr
      .map((p) => ({ time: toUTCTimestamp(p.time), value: p.value }))
      .sort((a, b) => (a.time as number) - (b.time as number));

  const getTimeframeSeconds = (tf: Timeframe): number | null => {
    const DAY = 24 * 60 * 60;
    const MONTH = 30 * DAY;
    
    switch (tf) {
      case '1D': return DAY;
      case '5D': return 5 * DAY;
      case '1M': return MONTH;
      case '3M': return 3 * MONTH;
      case '6M': return 6 * MONTH;
      case '1Y': return 365 * DAY;
      case 'Since Start': return null;
      default: return null;
    }
  };

  const applyTimeframeRange = () => {
    const chart = chartRef.current;
    const data = normalizedDataRef.current;
    if (!chart || data.length === 0) return;

    const to = data[data.length - 1].time as UTCTimestamp;
    const first = data[0].time as UTCTimestamp;
    
    const timeframeSeconds = getTimeframeSeconds(timeframe);
    
    let from: UTCTimestamp;
    if (timeframeSeconds === null) {
      from = first;
    } else {
      from = ((to as number) - timeframeSeconds) as UTCTimestamp;
      if ((from as number) < (first as number)) from = first;
    }

    chart.timeScale().applyOptions({
      timeVisible: true,
      secondsVisible: false,
    });

    chart.timeScale().setVisibleRange({ from, to });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      height,
      width: containerRef.current.clientWidth,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;

    const s = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    seriesRef.current = s;

    const nd = normalize(data);
    normalizedDataRef.current = nd;
    s.setData(nd);
    applyTimeframeRange();

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      seriesRef.current = null;
      chartRef.current = null;
    };
  }, [backgroundColor, textColor, lineColor, areaTopColor, areaBottomColor, height]);

  // Use stringified data to avoid dependency array size issues
  const dataString = JSON.stringify(data);

  useEffect(() => {
    const s = seriesRef.current;
    if (!s) return;
    const nd = normalize(data);
    normalizedDataRef.current = nd;
    s.setData(nd);
    applyTimeframeRange();
  }, [dataString, timeframe]);

  return <div ref={containerRef} style={{ flex: '1 1 0', width: '100%' }} />;
}
