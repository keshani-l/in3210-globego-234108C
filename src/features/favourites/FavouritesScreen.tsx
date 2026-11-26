import Feather from '@expo/vector-icons/Feather';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppTabs } from '../../app/navigation/routes';
import { useAppSelector } from '../../app/store';
import { colors, pageMaxWidth, radius, spacing, typography } from '../../shared/theme/tokens';
import { CountryCard } from '../countries/CountryCard';
import { CountryLoading, CountryMessage } from '../countries/CountryState';
import { FavouriteHeart } from './FavouriteHeart';
import { FavouriteStorageNotice } from './FavouriteStorageNotice';
import { selectFavouriteCount, selectSavedCountries } from './favouritesSlice';

export function FavouritesScreen({ navigation }: BottomTabScreenProps<AppTabs, 'Favourites'>) {
  const countries = useAppSelector(selectSavedCountries);
  const count = useAppSelector(selectFavouriteCount);
  const status = useAppSelector((state) => state.favourites.status);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={countries}
        keyExtractor={(country) => country.id}
        ItemSeparatorComponent={WishlistGap}
        renderItem={({ item }) => (
          <CountryCard
            country={item}
            action={<FavouriteHeart country={item} />}
            onPress={() => navigation.navigate('Explore', {
              screen: 'CountryDetails', params: { countryId: item.id }, initial: false,
            })}
          />
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
            <View style={styles.hero}>
              <Feather name="heart" size={24} color={colors.heroText} />
              <Text accessibilityRole="header" style={styles.title}>My Favourites</Text>
              <Text style={styles.subtitle}>Your personal travel wishlist</Text>
            </View>
            <FavouriteStorageNotice />
            {status === 'ready' && (
              <Text accessibilityLiveRegion="polite" style={styles.count}>
                {count} saved {count === 1 ? 'country' : 'countries'}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={status === 'loading' ? (
          <CountryLoading label="Restoring favourites…" />
        ) : status === 'ready' ? (
          <CountryMessage
            icon="heart"
            title="No favourites yet"
            description="Explore the world and save countries you would love to visit."
            action={{ label: 'Explore Countries', onPress: () => navigation.navigate('Explore', { screen: 'Home' }) }}
          />
        ) : undefined}
      />
    </SafeAreaView>
  );
}

function WishlistGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: pageMaxWidth, alignSelf: 'center', padding: spacing.medium },
  header: { gap: spacing.medium, paddingBottom: spacing.medium },
  hero: { backgroundColor: colors.deepTeal, borderRadius: radius.panel, padding: spacing.large, gap: spacing.small },
  title: { ...typography.heading, color: colors.onPrimary },
  subtitle: { ...typography.copy, color: colors.heroText },
  count: { ...typography.section, color: colors.heading },
  gap: { height: spacing.small },
});
