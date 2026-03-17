export interface CryptoPrice {
  USD: number;
  EUR: number;
}

export interface ICryptocurrency {
  coin: Coin;
  prices: CryptoPrice;
  oldPrices?: CryptoPrice;
}

export interface Params {
  fsym?: string;
  fsyms?: string;
  tsyms?: string;
  api_key: string;
}

export interface Coin {
  symbol: string;
  coinName: string;
}

export enum ActionType {
  SET_COINS = 'SET_COINS',
  SET_QUERY = 'SET_QUERY',
  SET_RESULTS = 'SET_RESULTS',
  SET_CRYPTOS = 'SET_CRYPTOS',
  ADD_CRYPTO = 'ADD_CRYPTO',
  UPDATE_CRYPTO = 'UPDATE_CRYPTO',
  REMOVE_CRYPTO = 'REMOVE_CRYPTO',
  SET_ONLINE_STATUS = 'SET_ONLINE_STATUS',
  SET_OFFLINE_STATUS = 'SET_OFFLINE_STATUS'
}