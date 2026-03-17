import { createContext, useReducer, type Dispatch } from 'react'
import { appInitialState, appReducer, type Action, type AppState } from '../hooks/appReducer';

interface AppReducerStateContextType {
  state: AppState;
}

interface AppReducerDispatchContextType {
  dispatch: Dispatch<Action>;
}

export const AppReducerStateContext = createContext<AppReducerStateContextType | undefined>(undefined);
export const AppReducerDispatchContext = createContext<AppReducerDispatchContextType | undefined>(undefined);

export default function AppReducerContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, appInitialState);

  return (
    <AppReducerDispatchContext value={{ dispatch }}>
      <AppReducerStateContext value={{ state }}>
        {children}
      </AppReducerStateContext>
    </AppReducerDispatchContext>
  )
}
