import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { RootNavigator } from './src/app/navigation/RootNavigator';
import { store } from './src/app/store';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="dark" />
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
