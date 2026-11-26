import Feather from '@expo/vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeRoutes } from '../../app/navigation/routes';
import { useAppSelector } from '../../app/store';
import { colors, pageMaxWidth, radius, spacing, typography } from '../../shared/theme/tokens';
import { Button, StatusMessage } from '../../shared/ui/controls';
import { FavouriteHeart } from '../favourites/FavouriteHeart';
import { FavouriteStorageNotice } from '../favourites/FavouriteStorageNotice';
import { CountryCard } from './CountryCard';
import { CountryRegionFilter, CountrySearchBar } from './CountryFilters';
import { CountryLoading, CountryMessage } from './CountryState';
import { filterCountries, type RegionFilter } from './countryDiscovery';
import { useGetCountriesQuery } from './countriesApi';

export function HomeScreen({ navigation }: NativeStackScreenProps<HomeRoutes, 'Home'>) {
  const auth = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');
  const { data, isFetching, isError, refetch } = useGetCountriesQuery(undefined, { skip: auth.status !== 'signedIn' });
  const countries = useMemo(() => filterCountries(data ?? [], search, region), [data, search, region]);

  if (auth.status !== 'signedIn') return null;

  const refresh = () => { void refetch(); };
  const clearFilters = () => {
    setSearch('');
    setRegion('All');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={countries}
        keyExtractor={(country) => country.id}
        renderItem={({ item }) => (
          <CountryCard
            country={item}
            action={<FavouriteHeart country={item} />}
            onPress={() => navigation.navigate('CountryDetails', { countryId: item.id })}
          />
        )}
        ItemSeparatorComponent={CountryGap}
        initialNumToRender={10}
        refreshing={data !== undefined && isFetching}
        onRefresh={refresh}
        ListHeaderComponent={(
          <View style={styles.header}>
            <View style={styles.hero}>
              <View style={styles.brand}>
                <Feather name="compass" size={22} color={colors.heroText} />
                <Text style={styles.brandName}>GlobeGo</Text>
              </View>
              <Text style={styles.greeting}>Hello, {auth.user.firstName}</Text>
              <Text accessibilityRole="header" style={styles.title}>Explore the World</Text>
              <Text style={styles.heroCopy}>Pick a region or search for a capital to discover your next destination.</Text>
            </View>
            <CountrySearchBar search={search} onChange={setSearch} />
            <CountryRegionFilter region={region} onChange={setRegion} />
            <FavouriteStorageNotice />
            {data !== undefined && (
              <>
                <View style={styles.results}>
                  <Text accessibilityLiveRegion="polite" style={styles.count}>
                    {countries.length} {countries.length === 1 ? 'country' : 'countries'}
                  </Text>
                  <Button
                    kind="secondary"
                    label={isFetching ? 'Refreshing…' : 'Refresh'}
                    icon="refresh-cw"
                    busy={isFetching}
                    onPress={refresh}
                  />
                </View>
                {isError && <StatusMessage error text="Refresh failed. Showing the last countries loaded. Try refreshing again." />}
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          data === undefined
            ? (isError && !isFetching
              ? <CountryMessage error icon="alert-circle" title="Countries couldn’t load" description="Check your connection and try again." action={{ label: 'Retry', onPress: refresh }} />
              : <CountryLoading label="Loading countries…" />)
            : (data.length === 0
              ? <CountryMessage icon="globe" title="No countries available" description="Refresh to check for countries again." />
              : <CountryMessage icon="search" title="No matching countries" description="Try another country name, capital, or region." action={{ label: 'Clear filters', onPress: clearFilters }} />)
        }
      />
    </SafeAreaView>
  );
}

function CountryGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  content: { width: '100%', maxWidth: pageMaxWidth, alignSelf: 'center', padding: spacing.medium },
  header: { gap: spacing.medium, paddingBottom: spacing.medium },
  hero: { backgroundColor: colors.deepTeal, borderRadius: radius.panel, padding: spacing.large, gap: spacing.tiny },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.small, marginBottom: spacing.medium },
  brandName: { ...typography.section, color: colors.onPrimary },
  greeting: { ...typography.label, color: colors.heroText },
  title: { ...typography.heading, color: colors.onPrimary },
  heroCopy: { ...typography.copy, color: colors.heroText },
  results: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.small },
  count: { ...typography.section, color: colors.heading },
  gap: { height: spacing.small },
});
