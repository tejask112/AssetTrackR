"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  ColorType,
  BarSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type BarData,
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
  // chart
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;

  // OHLC bars
  upColor?: string;
  downColor?: string;

  // volume overlay
  volumeUpColor?: string;
  volumeDownColor?: string;

  // tooltip
  tooltipBg?: string;
  tooltipText?: string;
  tooltipBorder?: string;
};

type Props = {
  data: TimeSeriesPoint[];
  height?: number;
  colors?: Colors;
  showVolume?: boolean;
  thinBars?: boolean;
  openVisible?: boolean; 
};

export default function OHLCChart({
  data,
  height = 300,
  colors = {},
  showVolume = true,
  thinBars = true,
  openVisible = true,
}: Props) {
  const {
    backgroundColor = "white",
    textColor = "black",
    gridColor = "#e5e7eb",
    upColor = "#16a34a",
    downColor = "#dc2626",
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
  const ohlcRef = useRef<ISeriesApi<"Bar"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const toUnixSecondsUTC = (s: string): Time => {
    const [d, t] = s.split(" ");
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m, sec] = t.split(":").map(Number);
    return Math.floor(Date.UTC(Y, M - 1, D, h, m, sec) / 1000) as Time;
  };

  const bars = useMemo<BarData<Time>[]>(() => {
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = createChart(canvasRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      height,
      width: canvasRef.current.clientWidth,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;

    chart.priceScale("right").applyOptions({
      scaleMargins: { top: 0.1, bottom: showVolume ? 0.2 : 0.1 },
    });

    const ohlc = chart.addSeries(BarSeries, {
      upColor,
      downColor,
      thinBars,
      openVisible,
    });
    ohlcRef.current = ohlc;
    ohlc.setData(bars);

    if (showVolume) {
      const volume = chart.addSeries(HistogramSeries, {
        priceScaleId: "", 
        priceFormat: { type: "volume" },
      });
      volumeRef.current = volume;
      volume.setData(volumes);
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });
    ro.observe(canvasRef.current);

    const onMove = (param: any) => {
      const tip = tooltipRef.current;
      if (!tip || !rootRef.current || !param?.point || !param?.time) {
        if (tip) tip.style.display = "none";
        return;
      }

      const bar = ohlcRef.current
        ? (param.seriesData.get(ohlcRef.current) as BarData<Time> | undefined)
        : undefined;

      if (!bar) {
        tip.style.display = "none";
        return;
      }

      const t = (param.time as number) * 1000;
      const dt = new Date(t);

      const volFromSeries =
        showVolume && volumeRef.current
          ? (param.seriesData.get(volumeRef.current) as HistogramData<Time> | undefined)?.value
          : undefined;

      const volume = volFromSeries ?? volByTime.get(param.time as number) ?? undefined;

      const fmt2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "-");
      const volStr = volume !== undefined ? Number(volume).toLocaleString() : "—";

      tip.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;">${dt.toLocaleString()}</div>
        <div>O: <b>${fmt2(bar.open!)}</b> &nbsp; H: <b>${fmt2(bar.high!)}</b></div>
        <div>L: <b>${fmt2(bar.low!)}</b> &nbsp; C: <b>${fmt2(bar.close!)}</b></div>
        <div>Vol: <b>${volStr}</b></div>
      `;

      const { x, y } = param.point;
      const container = rootRef.current;

      tip.style.display = "block";
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const pad = 12;

      let left = x + pad;
      if (left + tw > container.clientWidth) left = x - tw - pad;

      let top = y + pad;
      if (top + th > container.clientHeight) top = y - th - pad;

      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };

    chart.subscribeCrosshairMove(onMove);

    return () => {
      chart.unsubscribeCrosshairMove(onMove);
      ro.disconnect();
      chart.remove();
      ohlcRef.current = null;
      volumeRef.current = null;
      chartRef.current = null;
    };
  }, [
    backgroundColor,
    textColor,
    gridColor,
    upColor,
    downColor,
    thinBars,
    openVisible,
    height,
    showVolume,
    bars,
    volumes,
    volByTime,
  ]);

  useEffect(() => {
    ohlcRef.current?.setData(bars);
    if (showVolume && volumeRef.current) volumeRef.current.setData(volumes);
  }, [bars, volumes, showVolume]);

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
