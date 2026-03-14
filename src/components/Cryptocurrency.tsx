import { memo } from 'react'
import type { ICryptocurrency } from '../models/models';
import { fetchSingleCryptoPrice } from '../utils/api';

interface CryptocurrencyProps {
  coinName: string;
  symbol: string;
  priceUSD: number;
  priceEUR: number;
  oldPriceUSD?: number;
  oldPriceEUR?: number;
  setCryptocurrencies: React.Dispatch<React.SetStateAction<ICryptocurrency[]>>;
}

function Cryptocurrency({ coinName, symbol, priceUSD, priceEUR, oldPriceUSD, oldPriceEUR, setCryptocurrencies }: CryptocurrencyProps) {
  
  console.count(`Rendering Cryptocurrency: ${coinName} (${symbol})`);

  function handleUpdate() {
    const oldPrices = oldPriceUSD && oldPriceEUR ? { USD: oldPriceUSD, EUR: oldPriceEUR } : undefined;
    fetchSingleCryptoPrice({ symbol, coinName }, oldPrices).then((updatedData) => {
      setCryptocurrencies((prev) =>
        prev.map((crypto) =>
          crypto.coin.symbol === symbol ? updatedData : crypto
        )
      );
    }).catch(() => {
      alert(`Failed to update price for "${coinName} (${symbol})". Please try again later.`);
    });
  }

  function handleRemove() {
    setCryptocurrencies((prev) =>
      prev.filter((crypto) => crypto.coin.symbol !== symbol)
    );
  }

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
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleRemove}>Remove</button>
      </div>
    </div>
  )
}

export default memo(Cryptocurrency);