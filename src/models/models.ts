export interface CryptoPrice {
  USD: number;
  EUR: number;
}

export interface ICryptocurrency {
  coin: Coin;
  prices: CryptoPrice;
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