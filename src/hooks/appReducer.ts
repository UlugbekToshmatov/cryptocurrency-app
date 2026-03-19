import { ActionType, type Coin, type ICryptocurrency } from "../models/models";

export type Action =
  | { type: ActionType.SET_COINS; payload: Coin[] }
  | { type: ActionType.SET_CRYPTOS; payload: ICryptocurrency[] }
  | { type: ActionType.ADD_CRYPTO; payload: ICryptocurrency }
  | { type: ActionType.UPDATE_CRYPTO; payload: ICryptocurrency }
  | { type: ActionType.REMOVE_CRYPTO; payload: string }
  | { type: ActionType.SET_QUERY; payload: string }
  | { type: ActionType.SET_RESULTS; payload: Coin[] }
  | { type: ActionType.SET_ONLINE_STATUS }
  | { type: ActionType.SET_OFFLINE_STATUS };

export interface AppState {
  cryptocurrencies: ICryptocurrency[];
  allCoins: Coin[];
  searchQuery: string;
  searchResults: Coin[];
  isOnline: boolean;
}

export const appInitialState: AppState = {
  cryptocurrencies: [],
  allCoins: [],
  searchQuery: '',
  searchResults: [],
  isOnline: navigator.onLine
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionType.SET_COINS:
      return { ...state, allCoins: action.payload };

    case ActionType.SET_CRYPTOS: {
      // Build lookup map once
      const updatedMap = new Map(
        action.payload.map(c => [c.coin.symbol, c])
      );

      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.map((crypto) => {
          const updatedCrypto = updatedMap.get(crypto.coin.symbol);

          if (!updatedCrypto) return crypto;

          const isSame =
            crypto.prices.USD === updatedCrypto.prices.USD &&
            crypto.prices.EUR === updatedCrypto.prices.EUR;

          if (isSame) {
            return crypto; // Keep same reference
          }

          return {
            ...crypto,
            prices: updatedCrypto.prices,
            oldPrices: crypto.prices
          };
        })
      };
    }

    case ActionType.ADD_CRYPTO:
      // Use symbol-based duplicate check instead of reference equality
      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.some(
          c => c.coin.symbol === action.payload.coin.symbol
        )
          ? state.cryptocurrencies
          : [...state.cryptocurrencies, action.payload]
      };

    case ActionType.UPDATE_CRYPTO:
      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.map((crypto) =>
          crypto.coin.symbol === action.payload.coin.symbol ? action.payload : crypto
        )
      };

    case ActionType.REMOVE_CRYPTO:
      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.filter(crypto =>
          crypto.coin.symbol !== action.payload
        )
      };

    case ActionType.SET_QUERY:
      return { ...state, searchQuery: action.payload };

    case ActionType.SET_RESULTS:
      return { ...state, searchResults: action.payload };
    
    case ActionType.SET_ONLINE_STATUS:
      return { ...state, isOnline: true };

    case ActionType.SET_OFFLINE_STATUS:
      return { ...state, isOnline: false };

    default:
      return state;
  }
}