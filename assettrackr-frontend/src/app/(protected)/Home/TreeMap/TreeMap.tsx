'use client';

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type PortfolioProp = Array<Record<string, string>>;
type TreemapPoint = { x: string; y: number };

function portfolioToTreemapData(portfolio: PortfolioProp): TreemapPoint[] {
  const first = portfolio?.[0] ?? {};
  return Object.entries(first)
    .map(([symbol, qtyStr]) => ({ x: symbol, y: parseFloat(qtyStr) }))
    .filter((p) => Number.isFinite(p.y));
}

function buildRanges(values: number[], steps = 5, colors?: string[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!Number.isFinite(min) || min === max) {
    const color =
      (colors ?? ['#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'])[3];
    return [{ from: -Infinity, to: Infinity, color }];
  }

  const palette =
    colors ?? ['#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'];

  return Array.from({ length: steps }, (_, i) => {
    const from = min + ((max - min) * i) / steps;
    const to =
      min +
      ((max - min) * (i + 1)) / steps -
      (i + 1 === steps ? 0 : 1e-9);
    return { from, to, color: palette[i] };
  });
}

interface Props {
  portfolio: PortfolioProp;
  height?: number;
  showDistributedColors?: boolean;
  colors?: string[];
}

export default function PortfolioTreemap({
  portfolio,
  height = 200,
  showDistributedColors = false,
  colors,
}: Props) {
  const data = portfolioToTreemapData(portfolio);

  const options: ApexOptions = {
    chart: { type: 'treemap', toolbar: { show: false } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (text, opts) => {
        const val = opts.value as number;
        const qty =
          Math.abs(val) >= 100
            ? Math.round(val).toString()
            : val.toFixed(2);
        return `${text}\n${qty}`;
      },
      style: { fontSize: '12px', fontWeight: 500 },
      dropShadow: { enabled: false },
    },
    tooltip: {
      theme: 'light', // or 'dark'
      y: {
        formatter: (val) =>
          new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 6,
          }).format(Number(val)),
        title: { formatter: () => 'Qty' },
      },
    },
    stroke: { width: 1, colors: ['#ffffff'] },
    states: {
      hover: { filter: { type: 'lighten', value: 0.04 } as any },
      active: { filter: { type: 'darken', value: 0.06 } as any },
    },
    fill: { opacity: 1 },
    plotOptions: {
      treemap: showDistributedColors
        ? {
            distributed: true,
            enableShades: false,
          }
        : {
            distributed: false,
            enableShades: true,
            shadeIntensity: 0.2,
            colorScale: { ranges: buildRanges(data.map((d) => d.y)) },
          },
    },
    ...(showDistributedColors && colors ? { colors } : {}),
  };

  const series = [{ data }];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="treemap"
      height={height}
    />
  );
}
