import Feather from '@expo/vector-icons/Feather';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { LoginScreen } from '../../features/auth/LoginScreen';
import { RegistrationScreen } from '../../features/auth/RegistrationScreen';
import { endSession, restoreSession } from '../../features/auth/sessionActions';
import { CountryDetailsScreen } from '../../features/countries/CountryScreens';
import { HomeScreen } from '../../features/countries/HomeScreen';
import { FavouritesScreen } from '../../features/favourites/FavouritesScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { colors, spacing, touchTarget, typography } from '../../shared/theme/tokens';
import type { FeatherName } from '../../shared/ui/controls';
import { useAppDispatch, useAppSelector } from '../store';
import type { AppTabs, AuthRoutes, HomeRoutes } from './routes';

const Auth = createNativeStackNavigator<AuthRoutes>();
const Home = createNativeStackNavigator<HomeRoutes>();
const Tabs = createBottomTabNavigator<AppTabs>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.heading,
    border: colors.border,
  },
};

const tabs: Record<keyof AppTabs, { label: string; icon: FeatherName }> = {
  Explore: { label: 'Home', icon: 'compass' },
  Favourites: { label: 'Favourites', icon: 'heart' },
  Profile: { label: 'Profile', icon: 'user' },
};

function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login">
        {({ navigation, route }) => (
          <LoginScreen registered={route.params?.registered} openRegistration={() => navigation.navigate('Register')} />
        )}
      </Auth.Screen>
      <Auth.Screen name="Register" options={{ gestureEnabled: false }}>
        {({ navigation }) => (
          <RegistrationScreen
            backToLogin={() => navigation.goBack()}
            onRegistered={() => {
              if (navigation.isFocused()) navigation.popTo('Login', { registered: true });
            }}
          />
        )}
      </Auth.Screen>
    </Auth.Navigator>
  );
}

function HomeNavigator() {
  return (
    <Home.Navigator>
      <Home.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Home.Screen
        name="CountryDetails"
        component={CountryDetailsScreen}
        options={({ navigation }) => ({
          title: 'Country details',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => navigation.goBack()} style={styles.back}>
              <Feather name="arrow-left" size={22} color={colors.primary} />
            </Pressable>
          ),
        })}
      />
    </Home.Navigator>
  );
}

function SignedInTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        title: tabs[route.name].label,
        tabBarAccessibilityLabel: tabs[route.name].label,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { minHeight: touchTarget },
        tabBarIcon: ({ color, size }) => <Feather name={tabs[route.name].icon} size={size} color={color} />,
      })}
    >
      <Tabs.Screen name="Explore" component={HomeNavigator} />
      <Tabs.Screen name="Favourites" component={FavouritesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const expiresAt = auth.status === 'signedIn' ? auth.expiresAt : null;

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (expiresAt === null) return;
    const expireIfNeeded = () => {
      if (Date.now() >= expiresAt) void dispatch(endSession('expired'));
    };
    const timer = setTimeout(expireIfNeeded, Math.max(0, expiresAt - Date.now()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') expireIfNeeded();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [dispatch, expiresAt]);

  if (auth.status === 'restoring') {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel="Restoring session" style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Opening GlobeGo…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      {auth.status === 'signedIn' ? <SignedInTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, gap: spacing.small, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { ...typography.copy, color: colors.text },
  back: { minHeight: touchTarget, minWidth: touchTarget, alignItems: 'center', justifyContent: 'center' },
});
