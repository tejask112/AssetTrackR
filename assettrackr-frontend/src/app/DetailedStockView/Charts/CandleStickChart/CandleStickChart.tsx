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
  type UTCTimestamp,
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
  tooltipBg?: string;
  tooltipText?: string;
  tooltipBorder?: string;
};

export type TimeFrame =
  | "1Hour"
  | "4Hour"
  | "1Day"
  | "5Day"
  | "1Month"
  | "6Month"
  | "1Year";

type Props = {
  data: TimeSeriesPoint[];
  height?: number;
  colors?: Colors;
  showVolume?: boolean;
  timeFrame: TimeFrame;
};

export default function CandleStickChart({
  data,
  height = 300,
  colors = {},
  showVolume = true,
  timeFrame,
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
    tooltipBg = "black",
    tooltipText = "#fff",
    tooltipBorder = "black",
  } = colors;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

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

  const volByTime = useMemo(() => {
    const m = new Map<number, number>();
    for (const v of volumes) m.set(v.time as number, v.value);
    return m;
  }, [volumes]);

  const computeFrom = (toSec: UTCTimestamp, frame: TimeFrame): UTCTimestamp => {
    const toDate = new Date((toSec as number) * 1000);
    const fromDate = new Date(toDate.getTime());

    switch (frame) {
      case "1Hour":
        fromDate.setHours(toDate.getHours() - 1);
        break;
      case "4Hour":
        fromDate.setHours(toDate.getHours() - 4);
        break;
      case "1Day":
        fromDate.setDate(toDate.getDate() - 1);
        break;
      case "5Day":
        fromDate.setDate(toDate.getDate() - 5);
        break;
      case "1Month":
        fromDate.setMonth(toDate.getMonth() - 1);
        break;
      case "6Month":
        fromDate.setMonth(toDate.getMonth() - 6);
        break;
      case "1Year":
        fromDate.setFullYear(toDate.getFullYear() - 1);
        break;
    }
    return Math.floor(fromDate.getTime() / 1000) as UTCTimestamp;
  };

  const applyTimeFrame = () => {
    const chart = chartRef.current;
    if (!chart || candles.length === 0) return;

    const to = candles[candles.length - 1].time as UTCTimestamp;
    let from = computeFrom(to, timeFrame);
    const first = candles[0].time as UTCTimestamp;
    if ((from as number) < (first as number)) from = first;

    const isIntraday = timeFrame === "1Hour" || timeFrame === "4Hour";

    chart.timeScale().applyOptions({
      timeVisible: true,
      secondsVisible: isIntraday,
    });

    chart.timeScale().setVisibleRange({ from, to });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = createChart(canvasRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      height,
      width: canvasRef.current.clientWidth,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
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
    candle.setData(candles);

    if (showVolume) {
      const volume = chart.addSeries(HistogramSeries, {
        priceScaleId: "",
        priceFormat: { type: "volume" },
      });
      volumeRef.current = volume;
      volume.setData(volumes);
    }

    applyTimeFrame();

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });
    ro.observe(canvasRef.current);

    const handler = (param: any) => {
      const tip = tooltipRef.current;
      if (!tip || !rootRef.current || !param?.point || !param?.time) {
        if (tip) tip.style.display = "none";
        return;
      }

      const cdl = candleRef.current
        ? (param.seriesData.get(candleRef.current) as CandlestickData<Time> | undefined)
        : undefined;

      if (!cdl) {
        tip.style.display = "none";
        return;
      }

      const t = (param.time as number) * 1000;
      const dt = new Date(t);
      const volFromSeries =
        showVolume && volumeRef.current
          ? (param.seriesData.get(volumeRef.current) as HistogramData<Time> | undefined)?.value
          : undefined;
      const volume =
        volFromSeries ?? volByTime.get(param.time as number) ?? undefined;

      const fmt2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "-");
      const volStr = volume !== undefined ? Number(volume).toLocaleString() : "—";

      tip.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;">${dt.toLocaleString()}</div>
        <div>O: <b>${fmt2(cdl.open)}</b> &nbsp; H: <b>${fmt2(cdl.high)}</b></div>
        <div>L: <b>${fmt2(cdl.low)}</b> &nbsp; C: <b>${fmt2(cdl.close)}</b></div>
        <div>Vol: <b>${volStr}</b></div>
      `;

      const { x, y } = param.point;
      const container = rootRef.current;

      tip.style.display = "block";
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const pad = 12;

      let left = x + pad;
      if (left + tw > container!.clientWidth) left = x - tw - pad;

      let top = y + pad;
      if (top + th > container!.clientHeight) top = y - th - pad;

      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };

    chart.subscribeCrosshairMove(handler);

    return () => {
      chart.unsubscribeCrosshairMove(handler);
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
    candles,
    volumes,
    volByTime,
  ]);

  useEffect(() => {
    candleRef.current?.setData(candles);
    if (showVolume) volumeRef.current?.setData(volumes);
    applyTimeFrame();
  }, [candles, volumes, showVolume]);

  useEffect(() => {
    applyTimeFrame();
  }, [timeFrame]);

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
      <div ref={canvasRef} style={{ width: "100%" }} />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          display: "none",
          pointerEvents: "none",
          transform: "translateZ(0)",
          padding: "8px 10px",
          borderRadius: 10,
          border: `1px solid ${tooltipBorder}`,
          background: tooltipBg,
          color: tooltipText,
          fontSize: 12,
          lineHeight: 1.35,
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
          zIndex: 5,
        }}
      />
    </div>
  );
}
