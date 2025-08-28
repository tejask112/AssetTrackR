
import DetailedStockView from "../DetailedStockView";

interface Props {
  params: { symbol: string };
}

export default function Page({ params }: Props) {
  return <DetailedStockView symbol={params.symbol} />;
}
