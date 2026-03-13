import { useState, useEffect, useTransition, useRef } from 'react'
import { fetchAllCoins, fetchCryptoPrices, fetchSingleCryptoPrice } from "./utils/api"
import type { Coin, ICryptocurrency } from './models/models';
import Cryptocurrency from './components/Cryptocurrency';

function App() {
  const [cryptocurrencies, setCryptocurrencies] = useState<ICryptocurrency[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Coin[]>([]);
  const [isPending, startTransition] = useTransition();
  const intervalId = useRef<number | undefined>(undefined);
  const cryptocurrenciesRef = useRef<ICryptocurrency[]>([]);
  
  useEffect(() => {
    fetchSingleCryptoPrice({ symbol: "DOGE", coinName: "Dogecoin" }).then((cryptoData) => {
      console.log("Dogecoin:", cryptoData);
      startTransition(() => {
        setCryptocurrencies([cryptoData]);
      });
    });

    fetchAllCoins().then((coins) => {
      console.log("All coins fetched:", coins.length);
      startTransition(() => {
        setAllCoins(coins);
      });
    });

    intervalId.current = window.setInterval(() => {
      if (cryptocurrenciesRef.current.length > 0) {
        console.count("Updating cryptocurrency prices...");
        fetchCryptoPrices(cryptocurrenciesRef.current.map((crypto) => crypto.coin)).then((updatedCryptos) => {
          console.log("Updated cryptocurrencies:", updatedCryptos);
          setCryptocurrencies(updatedCryptos);
        }).catch(() => {
          console.error("Failed to update cryptocurrency prices in interval.");
        });
      }
    }, 5000);

    return () => clearInterval(intervalId.current);
  }, []);

  useEffect(() => {
    cryptocurrenciesRef.current = cryptocurrencies;
  }, [cryptocurrencies.length]);

  console.count(`All coins: ${allCoins.length}`);
  console.count(`Cryptocurrencies: ${cryptocurrencies.length}`);

  function handleQueryUpdate(query: string) {
    setSearchQuery(query);

    startTransition(() => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }
      const results = allCoins.filter((coin) =>
        coin.coinName.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    });
  }

  function handleSearch() {
    const query = searchQuery.trim().toLowerCase();
    if (query === "") {
      setSearchResults([]);
      return;
    }
    const result = allCoins.find((coin) => {
      const coinFullName = `${coin.coinName} (${coin.symbol})`.trim().toLowerCase();
      return coinFullName === query || coin.coinName.trim().toLowerCase() === query || coin.symbol.trim().toLowerCase() === query;
    });
    setSearchResults([]);
    setSearchQuery("");
    if (result) {
      if (!cryptocurrencies.some((crypto) => crypto.coin.symbol === result.symbol && crypto.coin.coinName === result.coinName)) {
        fetchSingleCryptoPrice(result)
        .then((cryptoData) => {
          console.log("Search result:", cryptoData);
          startTransition(() => {
            setCryptocurrencies((prev) => [...prev, cryptoData]);
          });
        })
        .catch(() => {
          alert(`Price for "${result.coinName} (${result.symbol})" does not exist in the market!`);
        });
      } else {
        alert(`Cryptocurrency "${result.coinName} (${result.symbol})" is already in the list.`);
      }
    } else {
      alert(`No cryptocurrency found for query: "${searchQuery}"`);
    }
  }

  return (
    <main>
      <section>
        <div className='search-bar'>
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => handleQueryUpdate(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <ul>
          {searchResults.map((coin) => (
            <li className='search-coin' key={coin.symbol}
              onClick={() => {
                setSearchQuery(`${coin.coinName} (${coin.symbol})`);
                setSearchResults([]);
              }}
            >
              {`${coin.coinName} (${coin.symbol})`}
            </li>
          ))}
        </ul>
      </section>
      <h2>Cryptocurrencies</h2>
      {isPending ? <p>Loading...</p>
        : (<ul>
            {cryptocurrencies.map((crypto) => (
              <li key={crypto.coin.symbol}>
                <Cryptocurrency
                  coinName={crypto.coin.coinName}
                  symbol={crypto.coin.symbol}
                  priceUSD={crypto.prices.USD}
                  priceEUR={crypto.prices.EUR}
                  setCryptocurrencies={setCryptocurrencies}
                />
              </li>
            ))}
          </ul>)
      }
    </main>
  )
}
export default App
