import { memo } from 'react'
import type { ICryptocurrency } from '../models/models';
import { fetchSingleCryptoPrice } from '../utils/api';

interface CryptocurrencyProps {
  coinName: string;
  symbol: string;
  priceUSD: number;
  priceEUR: number;
  setCryptocurrencies: React.Dispatch<React.SetStateAction<ICryptocurrency[]>>;
}

function Cryptocurrency({ coinName, symbol, priceUSD, priceEUR, setCryptocurrencies }: CryptocurrencyProps) {
  
  console.count(`Rendering Cryptocurrency: ${coinName} (${symbol})`);

  function handleUpdate() {
    fetchSingleCryptoPrice({ symbol, coinName }).then((updatedData) => {
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

  return (
    <div className='crypto-info'>
      <p><span>{coinName}</span> (<span>{symbol}</span>) - <span>$ {priceUSD}</span> | <span>€ {priceEUR}</span></p>
      <div className="btns">
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleRemove}>Remove</button>
      </div>
    </div>
  )
}

export default memo(Cryptocurrency);