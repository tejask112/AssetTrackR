'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockLineChartProps {
    prices: number[]
}

export default function StockLineChart({prices}: StockLineChartProps) {
   const data = prices.map((price: number, index: number) => ({ index,close: price, }));

    return (
        <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="50%">
                <LineChart data={data}>
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line type="monotone" dataKey="close" stroke="green" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )


}