

// // app/components/LineChartView/LineChartView.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Chart,
//   AreaSeries,
//   type LineData,
//   type IChartApi,
//   type ISeriesApi,
// } from 'react-lightweight-charts';

// interface TimeSeriesPoint {
//   datetime: string;   // e.g. "2025-08-06T12:34:56Z"
//   open: string;
//   high: string;
//   low: string;
//   close: string;
//   volume: string;
// }

// interface LineChartViewProps {
//   timeseries: TimeSeriesPoint[];
//   width?: number;
//   height?: number;
// }

// export default function LineChartView({
//   timeseries,
//   width = 800,
//   height = 300,
// }: LineChartViewProps) {
//   // 1. Transform your API data into what lightweight-charts expects:
//   const data: LineData[] = useMemo(
//     () =>
//       timeseries.map((pt) => ({
//         // lightweight-charts accepts a JS timestamp in seconds:
//         time: Math.floor(new Date(pt.datetime).getTime() / 1000),
//         value: parseFloat(pt.close),
//       })),
//     [timeseries],
//   );

//   // 2. Render the chart + area series:
//   return (
//     <Chart
//       width={width}
//       height={height}
//       // layout and grid are optional; tweak to taste
//       layout={{
//         backgroundColor: '#ffffff',
//         textColor: '#333',
//       }}
//       grid={{
//         vertLines: { color: '#eee' },
//         horzLines: { color: '#eee' },
//       }}
//       timeScale={{
//         timeVisible: true,
//         secondsVisible: false,
//       }}
//     >
//       <AreaSeries
//         data={data}
//         topColor="rgba(33, 150, 243, 0.56)"
//         bottomColor="rgba(33, 150, 243, 0.04)"
//         lineColor="rgba(33, 150, 243, 1)"
//         lineWidth={2}
//       />
//     </Chart>
//   );
// }
