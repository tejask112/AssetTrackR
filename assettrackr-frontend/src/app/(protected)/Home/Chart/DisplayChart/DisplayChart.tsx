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
};

export default function LineDispChart({
  data,
  height = 300,
  colors = {},
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

  // Always show only the last 1 day (24 hours) of data
  const applyLastDayRange = () => {
    const chart = chartRef.current;
    const data = normalizedDataRef.current;
    if (!chart || data.length === 0) return;

    const to = data[data.length - 1].time as UTCTimestamp;
    const oneDaySeconds = 24 * 60 * 60;
    let from = ((to as number) - oneDaySeconds) as UTCTimestamp;

    const first = data[0].time as UTCTimestamp;
    if ((from as number) < (first as number)) from = first;

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
    applyLastDayRange();

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

  useEffect(() => {
    const s = seriesRef.current;
    if (!s) return;
    const nd = normalize(data);
    normalizedDataRef.current = nd;
    s.setData(nd);
    applyLastDayRange();
  }, [data]);

  return <div ref={containerRef} style={{ flex: '1 1 0', width: '100%' }} />;
}
