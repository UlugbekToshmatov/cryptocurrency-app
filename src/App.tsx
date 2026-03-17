import { useEffect, useTransition, useRef, useCallback } from 'react'
import { fetchAllCoins, fetchCryptoPrices, fetchSingleCryptoPrice } from "./utils/api"
import { ActionType, type ICryptocurrency } from './models/models';
import { useAppReducerDispatchContext, useAppReducerStateContext } from './hooks/useAppReducerContext';
import CryptoList from './components/CryptoList';

function App() {
  const state = useAppReducerStateContext();
  const dispatch = useAppReducerDispatchContext();
  const [isPending, startTransition] = useTransition();
  const intervalId = useRef<number | undefined>(undefined);
  const cryptocurrenciesRef = useRef<ICryptocurrency[]>([]);
  
  const startInterval = useCallback(() => {
    clearInterval(intervalId.current);    // In case useEffect runs multiple times
    intervalId.current = window.setInterval(() => {
      const current = cryptocurrenciesRef.current;
      if (current.length === 0) return;
      fetchCryptoPrices(current).then((updatedCryptos) => {
        dispatch({ type: ActionType.SET_CRYPTOS, payload: updatedCryptos });
      }).catch(() => {
        console.error("Failed to update cryptocurrency prices in interval.");
      });
    }, 5000);
  }, [dispatch]);

  useEffect(() => {
    fetchSingleCryptoPrice({ symbol: "DOGE", coinName: "Dogecoin" }).then((cryptoData) => {
      console.log("Dogecoin:", cryptoData);
      startTransition(() => {
        dispatch({ type: ActionType.ADD_CRYPTO, payload: cryptoData });
      });
    });

    fetchAllCoins().then((coins) => {
      console.log("All coins fetched:", coins.length);
      startTransition(() => {
        dispatch({ type: ActionType.SET_COINS, payload: coins });
      });
    });

    startInterval();

    return () => clearInterval(intervalId.current);
  }, []);
  // startInterval and dispatch are stable refs — intentionally excluded
  // to prevent re-running the setup effect on every render

  useEffect(() => {
    cryptocurrenciesRef.current = state.cryptocurrencies;
  }, [state.cryptocurrencies.length]);

  if (state.allCoins.length === 0)
    console.count(`All coins: ${state.allCoins.length}`);
  console.count(`Cryptocurrencies: ${state.cryptocurrencies.length}`);

  function handleQueryUpdate(query: string) {
    dispatch({ type: ActionType.SET_QUERY, payload: query });

    startTransition(() => {
      if (query.trim() === "") {
        dispatch({ type: ActionType.SET_RESULTS, payload: [] });
        return;
      }
      const results = state.allCoins.filter((coin) =>
        coin.coinName.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
      dispatch({ type: ActionType.SET_RESULTS, payload: results });
    });
  }

  function handleSearch() {
    const query = state.searchQuery.trim().toLowerCase();
    if (query === "") {
      dispatch({ type: ActionType.SET_RESULTS, payload: [] });
      return;
    }
    const result = state.allCoins.find((coin) => {
      const coinFullName = `${coin.coinName} (${coin.symbol})`.trim().toLowerCase();
      return coinFullName === query || coin.coinName.trim().toLowerCase() === query || coin.symbol.trim().toLowerCase() === query;
    });


    dispatch({ type: ActionType.SET_RESULTS, payload: [] });
    dispatch({ type: ActionType.SET_QUERY, payload: "" });
    if (result) {
      if (!state.cryptocurrencies.some((crypto) => crypto.coin.symbol === result.symbol && crypto.coin.coinName === result.coinName)) {
        fetchSingleCryptoPrice(result).then((cryptoData) => {
          console.log("Search result:", cryptoData);
          startTransition(() => {
            dispatch({ type: ActionType.ADD_CRYPTO, payload: cryptoData })
          });
        })
        .catch(() => {
          alert(`Price for "${result.coinName} (${result.symbol})" does not exist in the market!`);
        });
      } else {
        alert(`Cryptocurrency "${result.coinName} (${result.symbol})" is already in the list.`);
      }
    } else {
      alert(`No cryptocurrency found for query: "${state.searchQuery}"`);
    }
  }

  function handleUpdateAll() {
    clearInterval(intervalId.current);
    fetchCryptoPrices(state.cryptocurrencies).then((updatedCryptos) => {
      console.log("Updated all cryptocurrencies:", updatedCryptos);
      dispatch({ type: ActionType.SET_CRYPTOS, payload: updatedCryptos });
      
      startInterval();
    }).catch(() => {
      alert("Failed to update cryptocurrency prices. Please try again later.");
    });
  }

  function handleResultSelection(coinName: string, symbol: string) {
    dispatch({ type: ActionType.SET_QUERY, payload: `${coinName} (${symbol})` });
    dispatch({ type: ActionType.SET_RESULTS, payload: [] });
  }

  const handleUpdate = useCallback((symbol: string, coinName: string, oldPriceUSD?: number, oldPriceEUR?: number) => {
    const oldPrices = oldPriceUSD && oldPriceEUR ? {USD: oldPriceUSD, EUR: oldPriceEUR} : undefined;
    fetchSingleCryptoPrice({ symbol, coinName }, oldPrices).then((updatedData) => {
      dispatch({ type: ActionType.UPDATE_CRYPTO, payload: updatedData });
    }).catch(() => {
      alert(`Failed to update price for "${coinName} (${symbol})". Please try again later.`);
    });
  }, [dispatch]);

  const handleRemove = useCallback((symbol: string) => {
    dispatch({ type: ActionType.REMOVE_CRYPTO, payload: symbol });
  }, [dispatch]);

  return (
    <main>
      <section>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={state.searchQuery}
            onChange={(e) => handleQueryUpdate(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <ul>
          {state.searchResults.map((coin) => (
            <li
              className="search-coin"
              key={coin.symbol}
              onClick={() => handleResultSelection(coin.coinName, coin.symbol)}
            >
              {`${coin.coinName} (${coin.symbol})`}
            </li>
          ))}
        </ul>
      </section>
      <h2>Cryptocurrencies</h2>
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <CryptoList handleUpdate={handleUpdate} handleRemove={handleRemove} />
      )}
      {state.cryptocurrencies.length > 0 && (
        <button onClick={handleUpdateAll}>Update All</button>
      )}
    </main>
  );
}

export default App;
