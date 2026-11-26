import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { colors, radius, touchTarget } from '../../shared/theme/tokens';
import { selectIsFavourite, toggleFavourite, type FavouriteCountry } from './favouritesSlice';

export function FavouriteHeart({ country }: { country: FavouriteCountry }) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => selectIsFavourite(state, country.id));
  const ready = useAppSelector((state) => state.favourites.status === 'ready');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${saved ? 'Remove' : 'Add'} ${country.name} ${saved ? 'from' : 'to'} favourites`}
      accessibilityState={{ selected: saved, disabled: !ready }}
      disabled={!ready}
      onPress={() => dispatch(toggleFavourite(country))}
      style={({ pressed }) => [styles.heart, saved && styles.saved, pressed && styles.pressed, !ready && styles.disabled]}
    >
      <Feather name="heart" size={22} color={saved ? colors.onPrimary : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heart: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderColor: colors.softBorder,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  saved: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { backgroundColor: colors.deepTeal },
  disabled: { opacity: 0.45 },
});
