'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockLineChartProps {
    prices: number[];
    chartColor: string;
}

export default function StockLineChart({prices, chartColor}: StockLineChartProps) {
   const data = prices.map((price: number, index: number) => ({ index,close: price, }));

    return (
        <div className="w-full h-full" >
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}