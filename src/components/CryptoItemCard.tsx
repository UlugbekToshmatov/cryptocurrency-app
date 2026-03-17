import { memo } from 'react'

interface CryptoItemCardProps {
  coinName: string;
  symbol: string;
  priceUSD: number;
  priceEUR: number;
  oldPriceUSD?: number;
  oldPriceEUR?: number;
  onUpdate: (symbol: string, coinName: string, oldPriceUSD?: number | undefined, oldPriceEUR?: number | undefined) => void
  onRemove: (symbol: string) => void
}

function CryptoItemCard({ coinName, symbol, priceUSD, priceEUR, oldPriceUSD, oldPriceEUR, onUpdate, onRemove }: CryptoItemCardProps) {

  console.count(`Rendering Cryptocurrency: ${coinName} (${symbol})`);

  const previous = oldPriceUSD ?? priceUSD;
  const percent = ((priceUSD - previous) / previous) * 100;
  const style = {
    color: percent > 0 ? 'green' : percent < 0 ? 'red' : 'gray',
  };
  const priceChangeIndicator = percent > 0 ? '▲' : percent < 0 ? '▼' : '';

  return (
    <div className='crypto-info'>
      <p style={style}><span>{coinName}</span> (<span>{symbol}</span>) - <span>${priceUSD}</span> | <span>€{priceEUR}</span> {priceChangeIndicator}{percent.toFixed(2)}%</p>
      <div className="btns">
        <button onClick={() => onUpdate(symbol, coinName, oldPriceUSD, oldPriceEUR)}>Update</button>
        <button onClick={() => onRemove(symbol)}>Remove</button>
      </div>
    </div>
  );
}

export default memo(CryptoItemCard);