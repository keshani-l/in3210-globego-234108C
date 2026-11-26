import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, radius, spacing, touchTarget, typography } from '../../shared/theme/tokens';
import type { CountrySummary } from './countryData';
import { formatCountryNumber } from './countryDiscovery';
import { FlagImage } from './FlagImage';

export function CountryCard({ country, onPress, action }: { country: CountrySummary; onPress: () => void; action?: ReactNode }) {
  const capital = country.capitals.join(', ') || 'Capital unavailable';

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${country.name}. ${capital}. ${country.region ?? 'Region unavailable'}.`}
        onPress={onPress}
        style={({ pressed }) => [styles.country, pressed && styles.pressed]}
      >
        <FlagImage name={country.name} uri={country.flagUrl} style={styles.flag} />
        <View style={styles.copy}>
          <Text style={styles.title}>{country.name}</Text>
          <Text style={styles.caption}>{capital}</Text>
          <Text style={styles.meta}>
            {country.region ?? 'Region unavailable'}
            {country.population !== undefined && ` · ${formatCountryNumber(country.population)} people`}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.primary} />
      </Pressable>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.softBorder,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  country: {
    flex: 1, minWidth: 0, minHeight: touchTarget, flexDirection: 'row', alignItems: 'center',
    gap: spacing.small, padding: spacing.medium, borderRadius: radius.control,
  },
  action: { paddingRight: spacing.small },
  pressed: { backgroundColor: colors.tint },
  flag: { width: 64, height: 46 },
  copy: { flex: 1, minWidth: 0, gap: spacing.tiny },
  title: { ...typography.label, color: colors.heading },
  caption: { ...typography.caption, color: colors.text },
  meta: { ...typography.caption, color: colors.muted },
});
