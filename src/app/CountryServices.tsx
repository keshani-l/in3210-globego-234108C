import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { restoreCountryList } from '../features/countries/countryCacheSlice';
import { connectionStatus, connectivityChanged } from './connectivity';
import { useAppDispatch } from './store';

// Use platform connectivity signals. A third-party HTTP probe can fail on its own.
NetInfo.configure({ reachabilityShouldRun: () => false });

export function CountryServices() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreCountryList());
    const unsubscribe = NetInfo.addEventListener((state) => dispatch(connectivityChanged(connectionStatus(state))));
    const foreground = Platform.OS === 'web' ? undefined : AppState.addEventListener('change', (state) => {
      if (state === 'active') void NetInfo.refresh().catch(() => {});
    });
    return () => {
      unsubscribe();
      foreground?.remove();
    };
  }, [dispatch]);

  return null;
}
