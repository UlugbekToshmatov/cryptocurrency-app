import { createContext, useReducer, type Dispatch } from 'react'
import { appInitialState, appReducer, type Action, type AppState } from '../hooks/appReducer';

export const AppReducerStateContext = createContext<AppState | undefined>(undefined);
export const AppReducerDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export default function AppReducerContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, appInitialState);

  return (
    <AppReducerDispatchContext.Provider value={ dispatch }>
      <AppReducerStateContext.Provider value={ state }>
        {children}
      </AppReducerStateContext.Provider>
    </AppReducerDispatchContext.Provider>
  )
}
