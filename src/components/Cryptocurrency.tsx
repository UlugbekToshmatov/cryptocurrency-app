import { memo } from 'react'
import { ActionType } from '../models/models';
import { fetchSingleCryptoPrice } from '../utils/api';
import { useAppReducerDispatchContext } from '../hooks/useAppReducerContext';

interface CryptocurrencyProps {
  coinName: string;
  symbol: string;
  priceUSD: number;
  priceEUR: number;
  oldPriceUSD?: number;
  oldPriceEUR?: number;
}

function Cryptocurrency({ coinName, symbol, priceUSD, priceEUR, oldPriceUSD, oldPriceEUR }: CryptocurrencyProps) {
  const { dispatch } = useAppReducerDispatchContext();
  console.count(`Rendering Cryptocurrency: ${coinName} (${symbol})`);

  function handleUpdate() {
    const oldPrices = oldPriceUSD && oldPriceEUR ? { USD: oldPriceUSD, EUR: oldPriceEUR } : undefined;
    fetchSingleCryptoPrice({ symbol, coinName }, oldPrices).then((updatedData) => {
      dispatch({ type: ActionType.UPDATE_CRYPTO, payload: updatedData });
    }).catch(() => {
      alert(`Failed to update price for "${coinName} (${symbol})". Please try again later.`);
    });
  }

  function handleRemove() {
    dispatch({ type: ActionType.REMOVE_CRYPTO, payload: symbol });
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