import AutoScrollRow from "./AutoScrollRow/AutoScrollRow"
import StockTickerCarousel from './StockTickerCarousel/StockTickerCarousel'

interface Props {
    marketSector: "Technology" | "Healthcare" | "Financials" | "Energy" | "Consumer Staples"
}

export default function StockTickers({ marketSector }: Props) {

    if (marketSector == "Technology") {
        // AAPL — gentle uptrend, low/moderate volatility
        const aaplData = [{ index: 0, close: 228.00 },{ index: 1, close: 228.35 },{ index: 2, close: 228.67 },{ index: 3, close: 229.06 },{ index: 4, close: 230.43 },{ index: 5, close: 230.80 },{ index: 6, close: 229.53 },{ index: 7, close: 230.46 },{ index: 8, close: 230.67 },{ index: 9, close: 230.94 },{ index: 10, close: 231.61 },{ index: 11, close: 232.42 },{ index: 12, close: 234.34 },{ index: 13, close: 235.65 },{ index: 14, close: 236.31 },{ index: 15, close: 235.95 },{ index: 16, close: 236.60 },{ index: 17, close: 237.10 },{ index: 18, close: 238.18 },{ index: 19, close: 238.76 },];
        // NVDA — volatile uptrend (bigger swings)
        const nvdaData = [{ index: 0, close: 225.00 }, { index: 1, close: 231.49 }, { index: 2, close: 229.64 }, { index: 3, close: 234.64 }, { index: 4, close: 236.58 }, { index: 5, close: 234.44 }, { index: 6, close: 240.67 }, { index: 7, close: 244.73 }, { index: 8, close: 243.67 }, { index: 9, close: 247.44 }, { index: 10, close: 248.84 }, { index: 11, close: 251.71 }, { index: 12, close: 248.26 }, { index: 13, close: 252.27 }, { index: 14, close: 256.27 }, { index: 15, close: 254.92 }, { index: 16, close: 258.75 }, { index: 17, close: 259.51 }, { index: 18, close: 255.83 }, { index: 19, close: 262.38 }];
        // MSFT — very stable/sideways
        const msftData = [{ index: 0, close: 231.00 }, { index: 1, close: 230.68 }, { index: 2, close: 231.14 }, { index: 3, close: 231.35 }, { index: 4, close: 231.23 }, { index: 5, close: 231.29 }, { index: 6, close: 231.66 }, { index: 7, close: 231.47 }, { index: 8, close: 231.63 }, { index: 9, close: 231.87 }, { index: 10, close: 231.60 }, { index: 11, close: 231.92 }, { index: 12, close: 231.67 }, { index: 13, close: 231.92 }, { index: 14, close: 231.84 }, { index: 15, close: 231.75 }, { index: 16, close: 231.77 }, { index: 17, close: 232.02 }, { index: 18, close: 231.82 }, { index: 19, close: 232.28 }];
        // GOOG — drifting down
        const googData = [{ index: 0, close: 236.00 }, { index: 1, close: 235.13 }, { index: 2, close: 234.73 }, { index: 3, close: 233.30 }, { index: 4, close: 232.26 }, { index: 5, close: 231.67 }, { index: 6, close: 230.55 }, { index: 7, close: 229.67 }, { index: 8, close: 229.63 }, { index: 9, close: 229.47 }, { index: 10, close: 229.36 }, { index: 11, close: 229.08 }, { index: 12, close: 229.24 }, { index: 13, close: 229.13 }, { index: 14, close: 229.06 }, { index: 15, close: 228.58 }, { index: 16, close: 228.17 }, { index: 17, close: 227.26 }, { index: 18, close: 226.92 }, { index: 19, close: 228.64 }];
        // AMZN — choppy, slight uptrend
        const amznData = [{ index: 0, close: 229.00 }, { index: 1, close: 230.09 }, { index: 2, close: 229.39 }, { index: 3, close: 232.28 }, { index: 4, close: 229.71 }, { index: 5, close: 230.57 }, { index: 6, close: 232.55 }, { index: 7, close: 233.71 }, { index: 8, close: 231.90 }, { index: 9, close: 232.55 }, { index: 10, close: 233.57 }, { index: 11, close: 233.95 }, { index: 12, close: 234.74 }, { index: 13, close: 234.98 }, { index: 14, close: 235.77 }, { index: 15, close: 236.57 }, { index: 16, close: 235.75 }, { index: 17, close: 233.38 }, { index: 18, close: 234.60 }, { index: 19, close: 235.45 }];
        // META — volatile downtrend
        const metaData = [{ index: 0, close: 240.00 }, { index: 1, close: 238.33 }, { index: 2, close: 239.62 }, { index: 3, close: 238.89 }, { index: 4, close: 237.50 }, { index: 5, close: 236.24 }, { index: 6, close: 234.86 }, { index: 7, close: 234.39 }, { index: 8, close: 233.45 }, { index: 9, close: 232.39 }, { index: 10, close: 232.76 }, { index: 11, close: 231.53 }, { index: 12, close: 231.04 }, { index: 13, close: 229.32 }, { index: 14, close: 228.63 }, { index: 15, close: 227.35 }, { index: 16, close: 226.35 }, { index: 17, close: 225.44 }, { index: 18, close: 228.15 }, { index: 19, close: 226.98 }];

        return (
            <AutoScrollRow speed={1.3} pauseOnHover direction="forward">
                <StockTickerCarousel ticker="AAPL" companyName="Apple Inc."  price={239.78} change={2.55} data={aaplData} color="green" />
                <StockTickerCarousel ticker="NVDA" companyName="Nvidia"      price={171.66} change={0.61} data={nvdaData} color="green" />
                <StockTickerCarousel ticker="MSFT" companyName="Microsoft"   price={507.97} change={0.52} data={msftData} color="green" />
                <StockTickerCarousel ticker="GOOG" companyName="Google"      price={232.66} change={-2.68} data={googData} color="red" />
                <StockTickerCarousel ticker="AMZN" companyName="Amazon Inc." price={235.68} change={4.03} data={amznData} color="green" />
                <StockTickerCarousel ticker="META" companyName="Meta"        price={748.65} change={-0.42} data={metaData} color="red" />
            </AutoScrollRow>
        )
    }

    else if (marketSector == "Healthcare") {
        // LLY (Eli Lilly) — High price, very volatile uptrend
        const LLY_DATA = [{ index: 0, close: 885.00 }, { index: 1, close: 892.15 }, { index: 2, close: 888.40 }, { index: 3, close: 895.60 }, { index: 4, close: 902.11 }, { index: 5, close: 896.55 }, { index: 6, close: 890.80 }, { index: 7, close: 865.23 }, { index: 8, close: 903.67 }, { index: 9, close: 912.44 }, { index: 10, close: 915.89 }, { index: 11, close: 908.21 }, { index: 12, close: 918.50 }, { index: 13, close: 922.34 }, { index: 14, close: 925.01 }, { index: 15, close: 919.88 }, { index: 16, close: 950.75 }, { index: 17, close: 958.10 }, { index: 18, close: 955.45 }, { index: 19, close: 959.62 }];
        // JNJ (Johnson & Johnson) — Blue-chip stock, very stable / sideways movement
        const JNJ_DATA = [{ index: 0, close: 152.50 }, { index: 1, close: 152.35 }, { index: 2, close: 152.67 }, { index: 3, close: 152.81 }, { index: 4, close: 152.70 }, { index: 5, close: 153.05 }, { index: 6, close: 152.88 }, { index: 7, close: 152.95 }, { index: 8, close: 153.11 }, { index: 9, close: 152.99 }, { index: 10, close: 153.20 }, { index: 11, close: 153.42 }, { index: 12, close: 153.30 }, { index: 13, close: 153.65 }, { index: 14, close: 153.41 }, { index: 15, close: 153.55 }, { index: 16, close: 153.60 }, { index: 17, close: 153.25 }, { index: 18, close: 153.33 }, { index: 19, close: 153.78 }];
        // ABBV (AbbVie) — Gentle uptrend with moderate volatility
        const ABBV_DATA = [{ index: 0, close: 171.00 }, { index: 1, close: 170.45 }, { index: 2, close: 171.88 }, { index: 3, close: 172.50 }, { index: 4, close: 171.95 }, { index: 5, close: 173.10 }, { index: 6, close: 172.64 }, { index: 7, close: 173.90 }, { index: 8, close: 174.15 }, { index: 9, close: 173.80 }, { index: 10, close: 174.55 }, { index: 11, close: 175.21 }, { index: 12, close: 174.89 }, { index: 13, close: 175.99 }, { index: 14, close: 176.30 }, { index: 15, close: 175.40 }, { index: 16, close: 176.80 }, { index: 17, close: 177.12 }, { index: 18, close: 182.56 }, { index: 19, close: 183.20 }];
        // UNH (UnitedHealth) — Dip and recovery pattern (a "V" shape)
        const UNH_DATA = [{ index: 0, close: 498.00 }, { index: 1, close: 495.50 }, { index: 2, close: 492.33 }, { index: 3, close: 493.12 }, { index: 4, close: 489.60 }, { index: 5, close: 487.80 }, { index: 6, close: 490.25 }, { index: 7, close: 491.70 }, { index: 8, close: 489.95 }, { index: 9, close: 492.60 }, { index: 10, close: 494.10 }, { index: 11, close: 493.55 }, { index: 12, close: 496.22 }, { index: 13, close: 498.80 }, { index: 14, close: 497.90 }, { index: 15, close: 493.50 }, { index: 16, close: 487.24 }, { index: 17, close: 485.40 }, { index: 18, close: 485.65 }, { index: 19, close: 485.98 }];
        // RHHBY (Roche) — Low volatility, gentle downtrend
        const RHHBY_DATA = [{ index: 0, close: 38.50 }, { index: 1, close: 38.42 }, { index: 2, close: 38.61 }, { index: 3, close: 38.35 }, { index: 4, close: 35.21 }, { index: 5, close: 33.05 }, { index: 6, close: 32.99 }, { index: 7, close: 32.10 }, { index: 8, close: 37.85 }, { index: 9, close: 37.76 }, { index: 10, close: 37.54 }, { index: 11, close: 37.60 }, { index: 12, close: 36.45 }, { index: 13, close: 36.22 }, { index: 14, close: 35.18 }, { index: 15, close: 34.25 }, { index: 16, close: 34.01 }, { index: 17, close: 33.95 }, { index: 18, close: 33.80 }, { index: 19, close: 32.88 }];
        // NVS (Novartis) — Simulates a sharp drop from bad news, followed by a slow recovery
        const NVS_DATA = [{ index: 0, close: 104.00 }, { index: 1, close: 104.32 }, { index: 2, close: 103.88 }, { index: 3, close: 104.15 }, { index: 4, close: 98.50 }, { index: 5, close: 97.90 }, { index: 6, close: 98.25 }, { index: 7, close: 98.11 }, { index: 8, close: 97.65 }, { index: 9, close: 95.40 }, { index: 10, close: 90.66 }, { index: 11, close: 90.05 }, { index: 12, close: 104.88 }, { index: 13, close: 105.21 }, { index: 14, close: 101.43 }, { index: 15, close: 99.50 }, { index: 16, close: 99.78 }, { index: 17, close: 100.15 }, { index: 18, close: 100.40 }, { index: 19, close: 100.22 }];

        return (
            <AutoScrollRow speed={1.5} pauseOnHover direction="forward">
                <StockTickerCarousel ticker="LLY" companyName="Eli Lilly" price={742.91} change={3.21}  data={LLY_DATA}   color="green" />
                <StockTickerCarousel ticker="JNJ" companyName="Johnson & Johnson" price={742.91} change={0.21}  data={JNJ_DATA}   color="green" />
                <StockTickerCarousel ticker="ABBV" companyName="AbbVie" price={213.00} change={1.20}  data={ABBV_DATA}  color="green" />
                <StockTickerCarousel ticker="UNH" companyName="UnitedHealth" price={295.38} change={-2.76}  data={UNH_DATA}   color="red" />
                <StockTickerCarousel ticker="RHH" companyName="Roche" price={42.74}  change={-2.56}  data={RHHBY_DATA} color="red" />
                <StockTickerCarousel ticker="NVS" companyName="Novartis" price={128.42} change={-0.37} data={NVS_DATA}   color="red" />
            </AutoScrollRow>
        )


    }
    
    else if (marketSector == "Financials") {
        // BRK.B — gentle uptrend, low/moderate volatility
        const brkbData = [{ index: 0, close: 494.00 },{ index: 1, close: 494.55 },{ index: 2, close: 490.10 },{ index: 3, close: 489.72 },{ index: 4, close: 485.30 },{ index: 5, close: 482.88 },{ index: 6, close: 500.40 },{ index: 7, close: 495.22 },{ index: 8, close: 497.80 },{ index: 9, close: 499.10 },{ index: 10, close: 499.85 },{ index: 11, close: 500.37 },{ index: 12, close: 501.06 },{ index: 13, close: 500.62 },{ index: 14, close: 501.55 },{ index: 15, close: 502.18 },{ index: 16, close: 502.90 },{ index: 17, close: 503.44 },{ index: 18, close: 504.22 },{ index: 19, close: 505.10 }];
        // JPM — choppy slight uptrend
        const jpmData = [{ index: 0, close: 292.00 },{ index: 1, close: 292.75 },{ index: 2, close: 291.90 },{ index: 3, close: 295.10 },{ index: 4, close: 290.85 },{ index: 5, close: 300.20 },{ index: 6, close: 300.60 },{ index: 7, close: 307.80 },{ index: 8, close: 299.15 },{ index: 9, close: 294.55 },{ index: 10, close: 295.70 },{ index: 11, close: 290.00 },{ index: 12, close: 293.92 },{ index: 13, close: 287.48 },{ index: 14, close: 290.90 },{ index: 15, close: 281.35 },{ index: 16, close: 283.88 },{ index: 17, close: 282.52 },{ index: 18, close: 281.10 },{ index: 19, close: 281.55 }];
        // V — very stable/sideways
        const vData = [{ index: 0, close: 342.00 },{ index: 1, close: 342.15 },{ index: 2, close: 343.98 },{ index: 3, close: 346.22 },{ index: 4, close: 347.10 },{ index: 5, close: 347.35 },{ index: 6, close: 348.28 },{ index: 7, close: 349.46 },{ index: 8, close: 340.31 },{ index: 9, close: 341.57 },{ index: 10, close: 344.44 },{ index: 11, close: 343.62 },{ index: 12, close: 339.55 },{ index: 13, close: 338.70 },{ index: 14, close: 335.60 },{ index: 15, close: 340.74 },{ index: 16, close: 342.68 },{ index: 17, close: 345.83 },{ index: 18, close: 346.72 },{ index: 19, close: 349.90 }];
        // MA — volatile uptrend
        const maData = [{ index: 0, close: 580.00 },{ index: 1, close: 578.80 },{ index: 2, close: 578.10 },{ index: 3, close: 579.60 },{ index: 4, close: 570.30 },{ index: 5, close: 571.40 },{ index: 6, close: 584.75 },{ index: 7, close: 581.10 },{ index: 8, close: 582.20 },{ index: 9, close: 572.40 },{ index: 10, close: 571.10 },{ index: 11, close: 573.85 },{ index: 12, close: 571.70 },{ index: 13, close: 582.25 },{ index: 14, close: 594.40 },{ index: 15, close: 597.10 },{ index: 16, close: 598.55 },{ index: 17, close: 596.90 },{ index: 18, close: 599.80 },{ index: 19, close: 601.75 }];
        // BAC — gentle uptrend
        const bacData = [{ index: 0, close: 49.60 },{ index: 1, close: 48.72 },{ index: 2, close: 48.55 },{ index: 3, close: 48.90 },{ index: 4, close: 49.05 },{ index: 5, close: 48.98 },{ index: 6, close: 49.20 },{ index: 7, close: 49.35 },{ index: 8, close: 49.22 },{ index: 9, close: 49.48 },{ index: 10, close: 49.60 },{ index: 11, close: 49.42 },{ index: 12, close: 49.70 },{ index: 13, close: 49.85 },{ index: 14, close: 49.72 },{ index: 15, close: 49.96 },{ index: 16, close: 50.05 },{ index: 17, close: 49.88 },{ index: 18, close: 50.12 },{ index: 19, close: 50.25 }];
        // WFC — drifting down
        const wfcData = [{ index: 0, close: 81.50 },{ index: 1, close: 81.10 },{ index: 2, close: 80.85 },{ index: 3, close: 80.40 },{ index: 4, close: 80.10 },{ index: 5, close: 79.95 },{ index: 6, close: 79.60 },{ index: 7, close: 79.45 },{ index: 8, close: 79.30 },{ index: 9, close: 79.05 },{ index: 10, close: 78.90 },{ index: 11, close: 78.75 },{ index: 12, close: 78.65 },{ index: 13, close: 78.55 },{ index: 14, close: 78.50 },{ index: 15, close: 78.40 },{ index: 16, close: 78.35 },{ index: 17, close: 78.25 },{ index: 18, close: 78.20 },{ index: 19, close: 78.10 }];

        return (
            <AutoScrollRow speed={1.2} pauseOnHover direction="forward">
                <StockTickerCarousel ticker="BRK.B" companyName="Berkshire Hathaway" price={498.96} change={2.55} data={brkbData} color="green" />
                <StockTickerCarousel ticker="JPM" companyName="JPMorgan Chase & Co." price={295.85} change={-0.61} data={jpmData} color="red" />
                <StockTickerCarousel ticker="V" companyName="Visa Inc." price={507.97} change={0.52} data={vData} color="green" />
                <StockTickerCarousel ticker="MA" companyName="Mastercard Incorporated" price={232.66} change={2.68} data={maData} color="green" />
                <StockTickerCarousel ticker="BAC" companyName="Bank of America" price={235.68} change={4.03} data={bacData} color="green" />
                <StockTickerCarousel ticker="WFC" companyName="Wells Fargo & Co." price={748.65} change={-0.42} data={wfcData} color="red" />
            </AutoScrollRow>
        )
    }

    else if (marketSector == "Consumer Staples") {
        // WMT — gentle uptrend, low/moderate volatility
        const wmtData = [{ index: 0, close: 98.50 }, { index: 1, close: 98.70 }, { index: 2, close: 99.45 }, { index: 3, close: 100.90 }, { index: 4, close: 101.10 }, { index: 5, close: 98.95 }, { index: 6, close: 98.30 }, { index: 7, close: 99.50 }, { index: 8, close: 99.20 }, { index: 9, close: 100.65 }, { index: 10, close: 99.80 }, { index: 11, close: 98.70 }, { index: 12, close: 99.85 }, { index: 13, close: 100.00 }, { index: 14, close: 99.90 }, { index: 15, close: 100.15 }, { index: 16, close: 104.35 }, { index: 17, close: 103.20 }, { index: 18, close: 104.50 }, { index: 19, close: 105.70 }];
        // COST — steady rise, very low volatility
        const costData = [{ index: 0, close: 948.50 }, { index: 1, close: 949.00 }, { index: 2, close: 947.00 }, { index: 3, close: 948.80 }, { index: 4, close: 949.20 }, { index: 5, close: 949.50 }, { index: 6, close: 949.40 }, { index: 7, close: 950.70 }, { index: 8, close: 951.00 }, { index: 9, close: 952.90 }, { index: 10, close: 952.20 }, { index: 11, close: 953.40 }, { index: 12, close: 954.30 }, { index: 13, close: 954.60 }, { index: 14, close: 953.50 }, { index: 15, close: 956.70 }, { index: 16, close: 954.00 }, { index: 17, close: 954.90 }, { index: 18, close: 956.20 }, { index: 19, close: 955.50 }];
        // NKE — modest uptrend, mild volatility
        const nkeData = [{ index: 0, close: 72.00 }, { index: 1, close: 72.20 }, { index: 2, close: 72.05 }, { index: 3, close: 72.40 }, { index: 4, close: 72.65 }, { index: 5, close: 72.50 }, { index: 6, close: 72.80 }, { index: 7, close: 73.05 }, { index: 8, close: 72.90 }, { index: 9, close: 73.20 }, { index: 10, close: 73.35 }, { index: 11, close: 73.10 }, { index: 12, close: 74.40 }, { index: 13, close: 75.55 }, { index: 14, close: 75.30 }, { index: 15, close: 76.65 }, { index: 16, close: 76.80 }, { index: 17, close: 77.50 }, { index: 18, close: 77.90 }, { index: 19, close: 78.10 }];
        // PEP — steady, low volatility
        const pepData = [{ index: 0, close: 146.00 }, { index: 1, close: 146.20 }, { index: 2, close: 142.10 }, { index: 3, close: 143.35 }, { index: 4, close: 144.55 }, { index: 5, close: 144.45 }, { index: 6, close: 143.70 }, { index: 7, close: 141.85 }, { index: 8, close: 140.75 }, { index: 9, close: 141.00 }, { index: 10, close: 139.10 }, { index: 11, close: 136.95 }, { index: 12, close: 137.15 }, { index: 13, close: 138.25 }, { index: 14, close: 136.05 }, { index: 15, close: 136.30 }, { index: 16, close: 137.45 }, { index: 17, close: 138.25 }, { index: 18, close: 136.50 }, { index: 19, close: 136.70 }];
        // UL — moderate uptrend, low volatility
        const ulData = [{ index: 0, close: 63.00 }, { index: 1, close: 62.10 }, { index: 2, close: 62.05 }, { index: 3, close: 62.30 }, { index: 4, close: 62.50 }, { index: 5, close: 62.40 }, { index: 6, close: 62.60 }, { index: 7, close: 62.75 }, { index: 8, close: 64.65 }, { index: 9, close: 65.90 }, { index: 10, close: 66.00 }, { index: 11, close: 67.85 }, { index: 12, close: 64.10 }, { index: 13, close: 65.20 }, { index: 14, close: 67.05 }, { index: 15, close: 67.35 }, { index: 16, close: 68.45 }, { index: 17, close: 67.25 }, { index: 18, close: 67.55 }, { index: 19, close: 67.80 }];
        // LULU — upward trend, moderate volatility
        const luluData = [{ index: 0, close: 170.00 }, { index: 1, close: 171.25 }, { index: 2, close: 172.80 }, { index: 3, close: 163.10 }, { index: 4, close: 167.00 }, { index: 5, close: 162.50 }, { index: 6, close: 162.75 }, { index: 7, close: 165.80 }, { index: 8, close: 164.00 }, { index: 9, close: 163.25 }, { index: 10, close: 162.00 }, { index: 11, close: 165.50 }, { index: 12, close: 166.50 }, { index: 13, close: 166.20 }, { index: 14, close: 166.80 }, { index: 15, close: 164.90 }, { index: 16, close: 164.40 }, { index: 17, close: 166.80 }, { index: 18, close: 163.70 }, { index: 19, close: 165.30 }];

        return (
            <AutoScrollRow speed={1.4} pauseOnHover direction="forward">
                <StockTickerCarousel ticker="WMT" companyName="Walmart Inc." price={99.73} change={2.55} data={wmtData} color="green" />
                <StockTickerCarousel ticker="COST" companyName="Costco Wholesale Corp." price={967.87} change={1.61} data={costData} color="green" />
                <StockTickerCarousel ticker="NKE" companyName="Nike Inc" price={507.97} change={2.17} data={nkeData} color="green" />
                <StockTickerCarousel ticker="PEP" companyName="PepsiCo, Inc." price={146.50} change={-2.68} data={pepData} color="red" />
                <StockTickerCarousel ticker="UL" companyName="Unilever PLC" price={64.44} change={4.03} data={ulData} color="green" />
                <StockTickerCarousel ticker="LULU" companyName="Lululemon Athletica" price={167.57} change={-0.42} data={luluData} color="red" />
            </AutoScrollRow>
        )
    }

    else if (marketSector == "Energy") {
        // XOM — modest uptrend, mild chop (ends ~109.9)
        const xomData = [{ index: 0, close: 106.20 }, { index: 1, close: 106.55 }, { index: 2, close: 106.10 }, { index: 3, close: 106.90 }, { index: 4, close: 107.35 }, { index: 5, close: 107.10 }, { index: 6, close: 107.80 }, { index: 7, close: 108.25 }, { index: 8, close: 107.95 }, { index: 9, close: 108.60 }, { index: 10, close: 108.85 }, { index: 11, close: 108.50 }, { index: 12, close: 109.10 }, { index: 13, close: 109.35 }, { index: 14, close: 109.00 }, { index: 15, close: 109.45 }, { index: 16, close: 109.60 }, { index: 17, close: 109.20 }, { index: 18, close: 109.70 }, { index: 19, close: 109.92 }];

        // SHEL — mostly sideways, slight rise (ends ~71.3)
        const shelData = [{ index: 0, close: 72.20 }, { index: 1, close: 73.35 }, { index: 2, close: 73.25 }, { index: 3, close: 72.55 }, { index: 4, close: 72.70 }, { index: 5, close: 73.52 }, { index: 6, close: 73.88 }, { index: 7, close: 72.02 }, { index: 8, close: 72.85 }, { index: 9, close: 72.10 }, { index: 10, close: 72.05 }, { index: 11, close: 72.18 }, { index: 12, close: 73.08 }, { index: 13, close: 74.22 }, { index: 14, close: 74.15 }, { index: 15, close: 74.26 }, { index: 16, close: 75.20 }, { index: 17, close: 75.28 }, { index: 18, close: 73.30 }, { index: 19, close: 70.33 }];

        // TTE — gentle uptrend (ends ~60.6)
        const tteData = [{ index: 0, close: 59.80 }, { index: 1, close: 58.95 }, { index: 2, close: 59.88 }, { index: 3, close: 59.10 }, { index: 4, close: 60.22 }, { index: 5, close: 61.35 }, { index: 6, close: 62.48 }, { index: 7, close: 61.62 }, { index: 8, close: 60.55 }, { index: 9, close: 59.80 }, { index: 10, close: 57.92 }, { index: 11, close: 58.05 }, { index: 12, close: 57.96 }, { index: 13, close: 58.15 }, { index: 14, close: 59.02 }, { index: 15, close: 62.20 }, { index: 16, close: 59.28 }, { index: 17, close: 59.38 }, { index: 18, close: 60.48 }, { index: 19, close: 60.56 }];

        // NEE — drifting lower (ends ~70.6)
        const neeData = [{ index: 0, close: 72.40 }, { index: 1, close: 72.10 }, { index: 2, close: 71.95 }, { index: 3, close: 71.70 }, { index: 4, close: 71.45 }, { index: 5, close: 71.35 }, { index: 6, close: 71.10 }, { index: 7, close: 70.95 }, { index: 8, close: 70.82 }, { index: 9, close: 70.70 }, { index: 10, close: 70.85 }, { index: 11, close: 70.62 }, { index: 12, close: 70.55 }, { index: 13, close: 70.48 }, { index: 14, close: 70.65 }, { index: 15, close: 70.50 }, { index: 16, close: 70.58 }, { index: 17, close: 70.45 }, { index: 18, close: 70.52 }, { index: 19, close: 70.57 }];

        // CVX — choppy, slight uptrend (ends ~154.6)
        const cvxData = [{ index: 0, close: 152.80 }, { index: 1, close: 153.25 }, { index: 2, close: 152.95 }, { index: 3, close: 153.70 }, { index: 4, close: 154.10 }, { index: 5, close: 153.40 }, { index: 6, close: 154.35 }, { index: 7, close: 155.00 }, { index: 8, close: 154.48 }, { index: 9, close: 155.30 }, { index: 10, close: 154.82 }, { index: 11, close: 154.05 }, { index: 12, close: 153.62 }, { index: 13, close: 153.95 }, { index: 14, close: 154.28 }, { index: 15, close: 154.10 }, { index: 16, close: 154.65 }, { index: 17, close: 154.20 }, { index: 18, close: 154.38 }, { index: 19, close: 154.55 }];

        // BP — gentle uptrend (ends ~33.85)
        const bpData = [{ index: 0, close: 32.90 }, { index: 1, close: 32.98 }, { index: 2, close: 33.05 }, { index: 3, close: 33.00 }, { index: 4, close: 33.12 }, { index: 5, close: 33.20 }, { index: 6, close: 33.18 }, { index: 7, close: 33.28 }, { index: 8, close: 33.22 }, { index: 9, close: 33.35 }, { index: 10, close: 33.42 }, { index: 11, close: 33.36 }, { index: 12, close: 33.48 }, { index: 13, close: 33.55 }, { index: 14, close: 33.50 }, { index: 15, close: 33.62 }, { index: 16, close: 33.70 }, { index: 17, close: 33.66 }, { index: 18, close: 33.78 }, { index: 19, close: 33.85 }];

        return (
            <AutoScrollRow speed={1.6} pauseOnHover direction="forward">
                <StockTickerCarousel ticker="XOM" companyName="Exxon Mobil Corp." price={109.92} change={2.55} data={xomData} color="green" />
                <StockTickerCarousel ticker="SHEL" companyName="Shell Plc" price={71.33} change={-1.61} data={shelData} color="red" />
                <StockTickerCarousel ticker="TTE" companyName="TotalEnergies SE" price={60.56} change={0.67} data={tteData} color="green" />
                <StockTickerCarousel ticker="NEE" companyName="NextEra Energy Inc" price={70.570} change={-2.68} data={neeData} color="red" />
                <StockTickerCarousel ticker="CVX" companyName="Chevron Corp." price={154.55} change={1.14} data={cvxData} color="green" />
                <StockTickerCarousel ticker="BP" companyName="BP plc" price={33.845} change={3.455} data={bpData} color="green" />  
            </AutoScrollRow>
        )
    }

}