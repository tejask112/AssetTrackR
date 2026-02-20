import DetailedStockView from "../DetailedStockView";

interface Props {
  params: Promise<{ symbol: string }>;
}

export default async function Page({ params }: Props) {
  const { symbol } = await params;
  return <DetailedStockView symbol={symbol} />;
}