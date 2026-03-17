import type { CryptoPrice, ICryptocurrency, Params, Coin } from "../models/models";

const API_KEY = import.meta.env.VITE_API_KEY;
const baseUrl = 'https://min-api.cryptocompare.com/data';
const currencies = ['USD', 'EUR'].join(",");

async function get(path: string, params: Params): Promise<any> {
  const url = new URL(`${baseUrl}/${path}`);
  // url.search = new URLSearchParams(params as Record<string, string>).toString();
  url.search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ).toString();

  const options = {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
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
    return data;
  } catch (error) {
    console.error('Error while fetching data: ', error);
    throw error;
  }
}

export async function fetchAllCoins(): Promise<Coin[]> {
  const path = 'all/coinlist';
  const params = {
    api_key: API_KEY
  };
  const response = await get(path, params);

  try {
    const coins: Coin[] = Object.values(response.Data).map((coin: any) => ({
      symbol: coin.Symbol,
      coinName: coin.CoinName,
    }));
    
    return coins;
  } catch (error) {
    console.error('Error processing coin data: ', error);
    throw error;
  }
}

export async function fetchSingleCryptoPrice(cryptocoin: Coin, oldPrices?: CryptoPrice): Promise<ICryptocurrency> {
  const path = "price";
  const params = {
    fsym: cryptocoin.symbol,
    tsyms: currencies,
    api_key: API_KEY
  };
  const response = await get(path, params) as CryptoPrice;
  
  return { coin: cryptocoin, prices: response, oldPrices };
}

export async function fetchCryptoPrices(cryptocoins: ICryptocurrency[]): Promise<ICryptocurrency[]> {
  const path = "pricemulti";
  const params = {
    fsyms: cryptocoins.map(coin => coin.coin.symbol).join(","),
    tsyms: currencies,
    api_key: API_KEY
  };
  const response = await get(path, params);

  try {
    const coins = Object.entries(response).map(([coinSymbol, prices]) => ({
      coin: cryptocoins.find(crypto => crypto.coin.symbol === coinSymbol)?.coin as Coin,
      prices: prices as CryptoPrice,
      oldPrices: cryptocoins.find(crypto => crypto.coin.symbol === coinSymbol)?.prices
    }));

    return coins;
  } catch (error) {
    console.error("Error processing crypto prices: ", error);
    throw error;
  }
}