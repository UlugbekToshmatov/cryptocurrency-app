import { useContext } from 'react'
import { AppReducerDispatchContext, AppReducerStateContext } from '../contexts/AppReducerContextProvider'

export function useAppReducerStateContext() {
  const context = useContext(AppReducerStateContext);
    if (!context)
      throw new Error('AppReducerStateContext not initiated!');
    return context;
}

export function useAppReducerDispatchContext() {
  const context = useContext(AppReducerDispatchContext);
    if (!context)
      throw new Error('AppReducerDispatchContext not initiated!');
    return context;
}
