import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthRoutes = {
  Login: { registered?: boolean } | undefined;
  Register: undefined;
};

export type HomeRoutes = {
  Home: undefined;
  CountryDetails: { countryId: string };
};

export type AppTabs = {
  Explore: NavigatorScreenParams<HomeRoutes> | undefined;
  Favourites: undefined;
  Profile: undefined;
};
