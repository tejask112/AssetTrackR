'use client';

import React, { useEffect, useRef } from 'react';
import {createChart, ColorType, AreaSeries, type IChartApi, type ISeriesApi,} from 'lightweight-charts';

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


  const normalize = (arr: LinePoint[]) =>
    arr
      .map(p => {
        let t = p.time as any;
        if (t instanceof Date) t = Math.floor(t.getTime() / 1000);
        else if (typeof t === 'number') t = t > 1e12 ? Math.floor(t / 1000) : t; 
        else t = Math.floor(new Date(t).getTime() / 1000);
        return { time: t, value: p.value };
      })
      .sort((a, b) => a.time - b.time);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      height,
      width: containerRef.current.clientWidth,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
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
    s.setData(normalize(data));
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(entries => {
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
    if (seriesRef.current) seriesRef.current.setData(normalize(data));
  }, [data]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
