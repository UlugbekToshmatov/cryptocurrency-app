import { memo } from "react";
import { useAppReducerStateContext } from "../hooks/useAppReducerContext";
import CryptoItemCard from "./CryptoItemCard";

interface CryptoListProps {
  handleUpdate: (
    symbol: string,
    coinName: string,
    oldPriceUSD?: number,
    oldPriceEUR?: number,
  ) => void;
  handleRemove: (symbol: string) => void;
}

function CryptoList({ handleUpdate, handleRemove }: CryptoListProps) {
  const state = useAppReducerStateContext();

  return (
    <ul>
      {state.cryptocurrencies.map((crypto) => (
        <li key={crypto.coin.symbol}>
          <CryptoItemCard
            coinName={crypto.coin.coinName}
            symbol={crypto.coin.symbol}
            priceUSD={crypto.prices.USD}
            priceEUR={crypto.prices.EUR}
            oldPriceUSD={crypto.oldPrices?.USD}
            oldPriceEUR={crypto.oldPrices?.EUR}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        </li>
      ))}
    </ul>
  );
}

export default memo(CryptoList);
