'use client';

import * as d3 from 'd3';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

interface PortfolioItem {
    current_price: number;
    quantity: number;
    ticker: string;
    change_5d_pct?: number;
}

type TreeData = {
    ticker: string;
    children?: PortfolioItem[];
};

interface Props {
    data: PortfolioItem[];
}

export default function TreeMap({ data }: Props) {
    const HEIGHT = 320;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        if (!containerRef.current) return;
            const el = containerRef.current;

            const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width ?? 0;
            setWidth(Math.max(0, Math.floor(w)));
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const formattedData: TreeData = useMemo(() => (
            { ticker: 'root', children: data }
        ), [data]
    );

    const root = useMemo(() => {
        if (!width || !data?.length) return null;

        const hierarchy = d3
            .hierarchy<TreeData | PortfolioItem>(formattedData)
            .sum((d) => ('quantity' in d ? Number(d.quantity) * Number(d.current_price) : 0))
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        // treemap mutates hierarchy; copy avoids weirdness across renders
        return d3
            .treemap<TreeData | PortfolioItem>()
            .size([width, HEIGHT])
            .paddingInner(2)
            .round(true)(hierarchy.copy());
    }, [formattedData, width, data?.length]);

    const colorScale = useMemo(
        () => d3
            .scaleLinear<string>()
            .domain([-5, 0, 5])
            .range(['#f03e3e', '#495057', '#37b24d'])
            .clamp(true),
        []
    );

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            <svg
                width="100%"
                height={HEIGHT}
                viewBox={`0 0 ${Math.max(width, 1)} ${HEIGHT}`}
                preserveAspectRatio="none"
                style={{ display: 'block', borderRadius: 4 }}
            >
                {!root ? null : (
                <>
                    {root.leaves().map((leaf, i) => {
                    const item = leaf.data as PortfolioItem;
                    const w = leaf.x1 - leaf.x0;
                    const h = leaf.y1 - leaf.y0;

                    return (
                        <g key={`${item.ticker}-${i}`} transform={`translate(${leaf.x0},${leaf.y0})`}>
                            <rect
                                width={w}
                                height={h}
                                fill={colorScale(item.change_5d_pct ?? 0)}
                                stroke="rgba(255,255,255,0.15)"
                            />
                            <text x={10} y={25} fontSize={18} fill="white" fontWeight={700}>
                                {item.ticker}
                            </text>
                            <text x={10} y={45} fontSize={12} fill="white" fontWeight={500}>
                                {item.quantity} shares
                            </text>
                            <text x={10} y={60} fontSize={12} fill="white" fontWeight={400}>
                                {(item.quantity * item.current_price).toFixed(2)} USD
                            </text>
                            <text x={10} y={75} fontSize={12} fill="white" fontWeight={400}>
                                {item.change_5d_pct?.toFixed(2)}% 5D 
                            </text>
                        </g>
                    );
                    })}
                </>
                )}
            </svg>
        </div>
    );
}
