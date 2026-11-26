import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { countriesApi } from '../features/countries/countriesApi';
import { restoreCountryList } from '../features/countries/countryCacheSlice';
import { connectionStatus, connectivityChanged } from './connectivity';
import { useAppDispatch } from './store';

// Use platform connectivity signals. A third-party HTTP probe can fail on its own.
NetInfo.configure({ reachabilityShouldRun: () => false });

export function CountryServices() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreCountryList());
    const report = (connected: boolean | null) => {
      const status = connectionStatus(connected);
      dispatch(connectivityChanged(status));
      if (status === 'offline') {
        // Release running requests so their timeout cannot block the reconnect refresh.
        for (const request of dispatch(countriesApi.util.getRunningQueriesThunk())) request.abort();
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const reportBrowserConnection = () => report(window.navigator.onLine);
      reportBrowserConnection();
      window.addEventListener('online', reportBrowserConnection);
      window.addEventListener('offline', reportBrowserConnection);
      return () => {
        window.removeEventListener('online', reportBrowserConnection);
        window.removeEventListener('offline', reportBrowserConnection);
      };
    }

    const unsubscribe = NetInfo.addEventListener(({ isConnected }) => report(isConnected));
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') void NetInfo.refresh().catch(() => {});
    });
    return () => {
      unsubscribe();
      foreground.remove();
    };
  }, [dispatch]);

  return null;
}
