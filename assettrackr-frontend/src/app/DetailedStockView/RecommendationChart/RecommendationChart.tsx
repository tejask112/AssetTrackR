'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

export interface Recommendation {
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
}

interface RecommendationChartProps {
    data: Recommendation[];
}

const RecommendationChart: React.FC<RecommendationChartProps> = ({ data: rawData }) => {

    const data = rawData.slice().sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()).map(({ period, strongBuy, buy, hold, sell, strongSell }) => {
        const d = new Date(period);
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year2 = String(d.getFullYear()).slice(-2);
        return {
        name: `${month} '${year2}`,
        strongBuy,
        buy,
        hold,
        sell,
        strongSell
        };
    });

    return (
        <div style={{ width: '100%', height: 225 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name"/>
                    <YAxis label={{
                        value: '#Number of Analysts',
                        angle: -90,
                        offset: 10,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 14 }
                    }}/>
                    <Tooltip 
                        wrapperStyle={{ zIndex: 1000 }}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}/>
                    <Legend
                        verticalAlign="bottom"
                        align='right'
                        iconType="square"
                        formatter={(value) => <span style={{ color: '#000' }}>{value}</span>} >
                    </Legend>
                    <Bar dataKey="strongSell" name="Strong Sell" stackId="a" fill="#813131"/>
                    <Bar dataKey="sell" name="Sell" stackId="a" fill="#f45b5b"  />
                    <Bar dataKey="hold" name="Hold" stackId="a" fill="#b98b1d" />
                    <Bar dataKey="buy" name="Buy" stackId="a" fill="#1db954" />
                    <Bar dataKey="strongBuy" name="Strong Buy" stackId="a" fill="#176f37"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
    );
}

export default RecommendationChart;