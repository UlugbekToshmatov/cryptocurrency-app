import { useEffect, useTransition, useRef } from 'react'
import { fetchAllCoins, fetchCryptoPrices, fetchSingleCryptoPrice } from "./utils/api"
import { ActionType, type ICryptocurrency } from './models/models';
import Cryptocurrency from './components/Cryptocurrency';
import { useAppReducerDispatchContext, useAppReducerStateContext } from './hooks/useAppReducerContext';

function App() {
  const { state } = useAppReducerStateContext();
  const { dispatch } = useAppReducerDispatchContext();
  const [isPending, startTransition] = useTransition();
  const intervalId = useRef<number | undefined>(undefined);
  const cryptocurrenciesRef = useRef<ICryptocurrency[]>([]);
  
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

    intervalId.current = window.setInterval(() => {
      if (cryptocurrenciesRef.current.length > 0) {
        fetchCryptoPrices(cryptocurrenciesRef.current.map((crypto) => crypto)).then((updatedCryptos) => {
          console.log("Updated cryptocurrencies:", updatedCryptos);
          dispatch({ type: ActionType.SET_CRYPTOS, payload: updatedCryptos });
        }).catch(() => {
          console.error("Failed to update cryptocurrency prices in interval.");
        });
      }
    }, 5000);

    return () => clearInterval(intervalId.current);
  }, []);

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
      
      intervalId.current = window.setInterval(() => {
        if (cryptocurrenciesRef.current.length > 0) {
          fetchCryptoPrices(cryptocurrenciesRef.current.map((crypto) => crypto)).then((updatedCryptos) => {
            console.log("Updated cryptocurrencies:", updatedCryptos);
            dispatch({ type: ActionType.SET_CRYPTOS, payload: updatedCryptos });
          }).catch(() => {
            console.error("Failed to update cryptocurrency prices in interval.");
          });
        }
      }, 5000);
    }).catch(() => {
      alert("Failed to update cryptocurrency prices. Please try again later.");
    });
  }

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
              onClick={() => {
                dispatch({ type: ActionType.SET_QUERY, payload: `${coin.coinName} (${coin.symbol})` });
                dispatch({ type: ActionType.SET_RESULTS, payload: [] });
              }}
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
        <ul>
          {state.cryptocurrencies.map((crypto) => (
            <li key={crypto.coin.symbol}>
              <Cryptocurrency
                coinName={crypto.coin.coinName}
                symbol={crypto.coin.symbol}
                priceUSD={crypto.prices.USD}
                priceEUR={crypto.prices.EUR}
                oldPriceUSD={crypto.oldPrices?.USD}
                oldPriceEUR={crypto.oldPrices?.EUR}
              />
            </li>
          ))}
        </ul>
      )}
      {state.cryptocurrencies.length > 0 && (
        <button onClick={handleUpdateAll}>
          Update All
        </button>
      )}
    </main>
  );
}

export default App;
