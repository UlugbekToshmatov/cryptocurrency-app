import { useEffect } from "react";
import { useAppReducerDispatchContext } from "./useAppReducerContext";
import { ActionType } from "../models/models";

export function useOnlineStatus( startInterval: () => void, stopInterval: () => void) {
  const dispatch = useAppReducerDispatchContext();

  useEffect(() => {
    function handleOnline() {
      dispatch({ type: ActionType.SET_ONLINE_STATUS });
      startInterval();
    }

    function handleOffline() {
      dispatch({ type: ActionType.SET_OFFLINE_STATUS });
      stopInterval();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Without this, app does not start interval on initial load
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, [dispatch, startInterval, stopInterval]);
}
