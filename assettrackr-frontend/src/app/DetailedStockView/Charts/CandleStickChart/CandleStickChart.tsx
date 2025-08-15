"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";

export interface TimeSeriesPoint {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

type Colors = {
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;
  upColor?: string;
  downColor?: string;
  borderUpColor?: string;
  borderDownColor?: string;
  wickUpColor?: string;
  wickDownColor?: string;
  volumeUpColor?: string;
  volumeDownColor?: string;
};

type Props = {
  data: TimeSeriesPoint[];
  height?: number;
  colors?: Colors;
  showVolume?: boolean;
};

export default function CandleStickChart({
  data,
  height = 300,
  colors = {},
  showVolume = true,
}: Props) {
  const {
    backgroundColor = "white",
    textColor = "black",
    gridColor = "#e5e7eb",
    upColor = "#16a34a",
    downColor = "#dc2626",
    borderUpColor = "#16a34a",
    borderDownColor = "#dc2626",
    wickUpColor = "#16a34a",
    wickDownColor = "#dc2626",
    volumeUpColor = "rgba(22,163,74,0.6)",
    volumeDownColor = "rgba(220,38,38,0.6)",
  } = colors;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const toUnixSecondsUTC = (s: string): Time => {
    const [d, t] = s.split(" ");
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m, sec] = t.split(":").map(Number);
    return Math.floor(Date.UTC(Y, M - 1, D, h, m, sec) / 1000) as Time;
  };

  const candles = useMemo<CandlestickData<Time>[]>(() => {
    return data
      .map((p) => ({
        time: toUnixSecondsUTC(p.datetime),
        open: parseFloat(p.open),
        high: parseFloat(p.high),
        low: parseFloat(p.low),
        close: parseFloat(p.close),
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, [data]);

  const volumes = useMemo<HistogramData<Time>[]>(() => {
    return data
      .map((p) => {
        const time = toUnixSecondsUTC(p.datetime);
        const o = parseFloat(p.open);
        const c = parseFloat(p.close);
        const value = parseFloat(p.volume);
        const rising = c >= o;
        return { time, value, color: rising ? volumeUpColor : volumeDownColor };
      })
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, [data, volumeUpColor, volumeDownColor]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      height,
      width: containerRef.current.clientWidth,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;

    chart.priceScale("right").applyOptions({
      scaleMargins: { top: 0.1, bottom: showVolume ? 0.2 : 0.1 },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor,
      borderDownColor,
      wickUpColor,
      wickDownColor,
    });
    candleRef.current = candle;

    let volume: ISeriesApi<"Histogram"> | null = null;
    if (showVolume) {
      volume = chart.addSeries(HistogramSeries, {
        priceScaleId: "", // overlay on main pane
        priceFormat: { type: "volume" },
      });
      volumeRef.current = volume;
    }

    candle.setData(candles);
    if (showVolume && volume) volume.setData(volumes);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      candleRef.current = null;
      volumeRef.current = null;
      chartRef.current = null;
    };
  }, [
    backgroundColor,
    textColor,
    gridColor,
    upColor,
    downColor,
    borderUpColor,
    borderDownColor,
    wickUpColor,
    wickDownColor,
    height,
    showVolume,
    candles, // safe because we recreate chart only if colors/height change; candles used for initial set
    volumes,
  ]);

  useEffect(() => {
    candleRef.current?.setData(candles);
    if (showVolume && volumeRef.current) volumeRef.current.setData(volumes);
  }, [candles, volumes, showVolume]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
