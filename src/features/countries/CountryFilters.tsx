import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '../../shared/theme/tokens';
import { regions, type RegionFilter } from './countryDiscovery';

export function CountrySearchBar({ search, onChange }: { search: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.search}>
      <Feather name="search" size={20} color={colors.primary} />
      <TextInput
        accessibilityLabel="Search by country or capital"
        placeholder="Search by country or capital"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={onChange}
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
      {search !== '' && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChange('')} style={styles.clear}>
          <Feather name="x" size={20} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

export function CountryRegionFilter({ region, onChange }: { region: RegionFilter; onChange: (value: RegionFilter) => void }) {
  return (
    <ScrollView horizontal keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chips}>
      {regions.map((value) => {
        const selected = value === region;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${value}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(value)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.chipText, selected && styles.selectedText]}>{value}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingLeft: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { ...typography.copy, flex: 1, minWidth: 0, minHeight: touchTarget, color: colors.heading, paddingRight: spacing.small },
  clear: { width: touchTarget, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: spacing.small, paddingBottom: spacing.small },
  chip: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.softBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.heading },
  selectedText: { color: colors.onPrimary },
});
