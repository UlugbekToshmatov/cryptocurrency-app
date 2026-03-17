import { ActionType, type Coin, type ICryptocurrency } from "../models/models";

export type Action =
  | { type: ActionType.SET_COINS; payload: Coin[] }
  | { type: ActionType.SET_CRYPTOS; payload: ICryptocurrency[] }
  | { type: ActionType.ADD_CRYPTO; payload: ICryptocurrency }
  | { type: ActionType.UPDATE_CRYPTO; payload: ICryptocurrency }
  | { type: ActionType.REMOVE_CRYPTO; payload: string }
  | { type: ActionType.SET_QUERY; payload: string }
  | { type: ActionType.SET_RESULTS; payload: Coin[] };

export interface AppState {
  cryptocurrencies: ICryptocurrency[];
  allCoins: Coin[];
  searchQuery: string;
  searchResults: Coin[];
}

export const appInitialState: AppState = {
  cryptocurrencies: [],
  allCoins: [],
  searchQuery: '',
  searchResults: []
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionType.SET_COINS:
      return { ...state, allCoins: action.payload };

    case ActionType.SET_CRYPTOS:
      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.map((crypto) => {
          const updated = action.payload.find(
            c => c.coin.symbol === crypto.coin.symbol
          );

          if (!updated) return crypto;

          // Only update if price changed
          if (
            updated.prices.USD === crypto.prices.USD &&
            updated.prices.EUR === crypto.prices.EUR
          ) {
            return crypto; // preserve reference
          }

          return {
            ...crypto,
            prices: updated.prices,
            oldPrices: crypto.prices
          };
        })
      };

    case ActionType.ADD_CRYPTO:
      return {
        ...state,
        cryptocurrencies: state.cryptocurrencies.includes(action.payload)
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

    default:
      return state;
  }
}