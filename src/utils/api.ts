import type { CryptoPrice, ICryptocurrency, Params, Coin, CoinsResponse, MultiPricesResponse } from "../models/models";

const API_KEY: string = import.meta.env.VITE_API_KEY;
const baseUrl = "https://min-api.cryptocompare.com/data";
const currencies = ["USD", "EUR"].join(",");

if (!API_KEY || API_KEY.trim() === "")
  alert("API key is not set. Please set the VITE_API_KEY environment variable.");

async function get<T>(path: string, params: Params): Promise<T> {
  const url = new URL(`${baseUrl}/${path}`);

  url.search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ).toString();

  const options = {
    method: "GET",
    headers: { "Content-type": "application/json; charset=UTF-8" }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "Error") {
      throw new Error(`${data.Message}`);
    }

    return data as T;
  } catch (error) {
    console.error("Error while fetching data: ", error);
    throw error;
  }
}

export async function fetchAllCoins(): Promise<Coin[]> {
  const path = "all/coinlist";
  const params = {
    api_key: API_KEY,
  };
  const response = await get<CoinsResponse>(path, params);

  const coins: Coin[] = Object.values(response.Data).map((coin) => ({
    symbol: coin.Symbol,
    coinName: coin.CoinName,
  }));

  return coins;
}

export async function fetchSingleCryptoPrice(cryptocoin: Coin, oldPrices?: CryptoPrice): Promise<ICryptocurrency> {
  const path = "price";
  const params = {
    fsym: cryptocoin.symbol,
    tsyms: currencies,
    api_key: API_KEY
  };
  const response = await get<CryptoPrice>(path, params);

  return { coin: cryptocoin, prices: response, oldPrices };
}

export async function fetchCryptoPrices(cryptocoins: ICryptocurrency[]): Promise<ICryptocurrency[]> {
  const path = "pricemulti";
  const params = {
    fsyms: cryptocoins.map(coin => coin.coin.symbol).join(","),
    tsyms: currencies,
    api_key: API_KEY
  };
  const response = await get<MultiPricesResponse>(path, params);
  const cryptoMap = new Map(cryptocoins.map((cryptocoin) => [cryptocoin.coin.symbol, cryptocoin]));
  const result: ICryptocurrency[] = [];

  for (const [symbol, prices] of Object.entries(response)) {
    const existing = cryptoMap.get(symbol);

    // null/undefined safety
    if (!existing || !prices)
      continue;

    result.push({
      coin: existing.coin,
      prices,
      oldPrices: existing.prices,
    });
  }

  return result;
}