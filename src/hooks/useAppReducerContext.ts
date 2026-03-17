import { useContext } from 'react'
import { AppReducerDispatchContext, AppReducerStateContext } from '../contexts/AppReducerContextProvider'

export function useAppReducerStateContext() {
  const state = useContext(AppReducerStateContext);
  if (!state)
    throw new Error('AppReducerStateContext not initiated!');
  return state;
}

export function useAppReducerDispatchContext() {
  const dispatch = useContext(AppReducerDispatchContext);
  if (!dispatch)
    throw new Error("AppReducerDispatchContext not initiated!");
  return dispatch;
}
