import Feather from '@expo/vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeRoutes } from '../../app/navigation/routes';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { cardShadow, colors, pageMaxWidth, radius, spacing, typography } from '../../shared/theme/tokens';
import { Button, StatusMessage, type FeatherName } from '../../shared/ui/controls';
import { FavouriteStorageNotice } from '../favourites/FavouriteStorageNotice';
import { captureFavouriteDetails, toggleFavourite, type FavouriteCountry } from '../favourites/favouritesSlice';
import { formatCountryNumber } from './countryDiscovery';
import { CountryLoading, CountryMessage } from './CountryState';
import { FlagImage } from './FlagImage';
import { OfflineCountryStatus } from './OfflineCountryStatus';
import { useOfflineCountryDetails } from './useOfflineCountries';

function CountryInfoCard({ title, icon, children }: PropsWithChildren<{ title: string; icon: FeatherName }>) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Feather name={icon} size={20} color={colors.primary} />
        <Text accessibilityRole="header" style={styles.section}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Unavailable'}</Text>
    </View>
  );
}

export function CountryDetailsScreen({ route }: NativeStackScreenProps<HomeRoutes, 'CountryDetails'>) {
  const { countryId } = route.params;
  const { country: snapshot, fullDetails, hasFullDetails, saved, updatedAt, status, pauseRequests, ready, isError, notFound, refresh } =
    useOfflineCountryDetails(countryId);
  const dispatch = useAppDispatch();
  const favouritesStatus = useAppSelector((state) => state.favourites.status);

  useEffect(() => {
    if (fullDetails && saved && saved.languages === undefined) dispatch(captureFavouriteDetails(fullDetails));
  }, [fullDetails, dispatch, saved]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <FavouriteStorageNotice />
        <OfflineCountryStatus status={status} hasData={snapshot !== undefined} updatedAt={updatedAt} />
        {(isError || notFound) && snapshot && (
          <StatusMessage text="Couldn’t refresh country details. Showing saved information." error />
        )}
        {snapshot ? (
          <>
            {!hasFullDetails && <StatusMessage text="Only a country summary is available. Missing details are marked as unavailable." />}
            <Button
              label={favouritesStatus === 'loading' ? 'Restoring favourites…' : saved ? 'Remove from Favourites' : 'Add to Favourites'}
              kind={saved ? 'secondary' : 'primary'}
              icon="heart"
              busy={favouritesStatus === 'loading'}
              disabled={favouritesStatus === 'loadError'}
              onPress={() => dispatch(toggleFavourite(snapshot))}
            />
            {(isError || notFound) && refresh && <Button kind="secondary" label="Retry" onPress={refresh} />}
            <DetailsContent country={snapshot} />
          </>
        ) : notFound ? (
          <CountryMessage icon="map-pin" title="Country not found" description="Go back to Home to choose another country." />
        ) : !ready ? (
          <CountryLoading label="Checking for saved country details…" />
        ) : pauseRequests ? (
          <CountryMessage icon="wifi-off" title="Country details aren’t saved yet" description="Reconnect to download details for this country." />
        ) : isError ? (
          <CountryMessage error icon="alert-circle" title="Country details couldn’t load" description="Try downloading the country details again." action={refresh && { label: 'Retry', onPress: refresh }} />
        ) : (
          <CountryLoading label="Loading country details…" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailsContent({ country }: { country: FavouriteCountry }) {
  return (
    <>
    <View style={styles.hero}>
      <FlagImage name={country.name} uri={country.flagUrl} style={styles.flag} />
      <View style={styles.heroCopy}>
        <Text accessibilityRole="header" style={styles.title}>{country.name}</Text>
        {country.officialName && <Text style={styles.official}>{country.officialName}</Text>}
      </View>
    </View>
    <CountryInfoCard title="At a glance" icon="globe">
      <InfoRow label="Country code" value={country.id} />
      <InfoRow label={country.capitals.length > 1 ? 'Capital cities' : 'Capital city'} value={country.capitals.join(', ')} />
      <InfoRow label="Region" value={country.region} />
      <InfoRow label="Subregion" value={country.subregion} />
      <InfoRow label="Independent" value={country.independent === undefined ? undefined : country.independent ? 'Yes' : 'No'} />
    </CountryInfoCard>
    <CountryInfoCard title="Population and area" icon="bar-chart-2">
      <InfoRow label="Population" value={formatCountryNumber(country.population)} />
      <InfoRow label="Area" value={country.area === undefined ? undefined : `${formatCountryNumber(country.area)} km²`} />
    </CountryInfoCard>
    <CountryInfoCard title="Travel information" icon="briefcase">
      <InfoRow label="Languages" value={country.languages?.join(', ')} />
      <InfoRow label="Currencies" value={country.currencies?.map(({ code, name, symbol }) =>
        [name, code, symbol ? `(${symbol})` : undefined].filter(Boolean).join(' '),
      ).join(', ')} />
      <InfoRow label="Time zones" value={country.timeZones?.join(', ')} />
    </CountryInfoCard>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: pageMaxWidth, alignSelf: 'center', padding: spacing.medium, gap: spacing.medium },
  hero: { backgroundColor: colors.deepTeal, borderRadius: radius.panel, padding: spacing.medium, gap: spacing.medium },
  flag: { width: '100%', aspectRatio: 2, maxHeight: 240 },
  heroCopy: { gap: spacing.tiny, paddingHorizontal: spacing.small, paddingBottom: spacing.small },
  title: { ...typography.heading, color: colors.onPrimary },
  official: { ...typography.copy, color: colors.heroText },
  card: {
    ...cardShadow,
    backgroundColor: colors.surface,
    borderColor: colors.softBorder,
    borderWidth: 1,
    borderRadius: radius.panel,
    gap: spacing.medium,
    padding: spacing.medium,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.small },
  section: { ...typography.section, color: colors.heading, flex: 1 },
  row: { gap: spacing.tiny, borderTopColor: colors.softBorder, borderTopWidth: 1, paddingTop: spacing.small },
  label: { ...typography.label, color: colors.heading },
  value: { ...typography.copy, color: colors.text },
});
