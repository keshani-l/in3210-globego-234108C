import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { spacing } from '../../shared/theme/tokens';
import { Button, StatusMessage } from '../../shared/ui/controls';
import { retryFavouriteRestore, retryFavouriteWrite } from './favouritesSlice';

export function FavouriteStorageNotice() {
  const dispatch = useAppDispatch();
  const loadError = useAppSelector((state) => state.favourites.status === 'loadError');
  const writeError = useAppSelector((state) => state.favourites.writeError);
  const recovered = useAppSelector((state) => state.favourites.recovered);

  if (!loadError && !writeError && !recovered) return null;

  return (
    <View style={styles.notice}>
      {loadError ? (
        <>
          <StatusMessage error text="GlobeGo couldn’t open your saved favourites. Try loading them again." />
          <Button kind="secondary" label="Retry loading favourites" onPress={() => dispatch(retryFavouriteRestore())} />
        </>
      ) : writeError ? (
        <>
          <StatusMessage error text="Your latest wishlist changes couldn’t be saved on this device. Try saving again." />
          <Button kind="secondary" label="Retry saving favourites" onPress={() => dispatch(retryFavouriteWrite())} />
        </>
      ) : (
        <StatusMessage text="Some saved favourite data couldn’t be read. Any readable countries are shown in your wishlist." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ notice: { gap: spacing.small } });
