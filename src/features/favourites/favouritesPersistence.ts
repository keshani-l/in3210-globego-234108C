import { createListenerMiddleware } from '@reduxjs/toolkit';

import {
  failedFavouriteRestore,
  restoredFavourites,
  retryFavouriteWrite,
  selectSavedCountries,
  settledFavouriteWrite,
  type FavouritesState,
} from './favouritesSlice';
import { loadFavourites, saveFavourites } from './favouritesStorage';

type State = { favourites: FavouritesState };

export function createFavouritesPersistence() {
  const listener = createListenerMiddleware<State>();
  const pendingWrites = new Map<number, Promise<void>>();

  listener.startListening({
    predicate: (_, current, previous) => current.favourites.status === 'loading' && (
      previous.favourites.status !== 'loading' || previous.favourites.session !== current.favourites.session
    ),
    effect: async (_, api) => {
      const { ownerId, session } = api.getState().favourites;
      if (ownerId === null) return;
      try {
        // A quick logout and login can overlap the previous session's last write.
        await pendingWrites.get(ownerId);
        const result = await loadFavourites(ownerId);
        api.dispatch(restoredFavourites({ session, ...result }));
      } catch {
        api.dispatch(failedFavouriteRestore(session));
      }
    },
  });

  listener.startListening({
    predicate: (action, current, previous) => {
      const next = current.favourites;
      const before = previous.favourites;
      return next.status === 'ready' && next.session === before.session && (
        next.revision !== before.revision || (retryFavouriteWrite.match(action) && before.writeError)
      );
    },
    effect: async (_, api) => {
      const state = api.getState();
      const { ownerId, session, revision } = state.favourites;
      if (ownerId === null) return;
      const saved = selectSavedCountries(state);
      const write = (pendingWrites.get(ownerId) ?? Promise.resolve()).then(async () => {
        let failed = false;
        try {
          await saveFavourites(ownerId, saved);
        } catch {
          failed = true;
        }
        api.dispatch(settledFavouriteWrite({ session, revision, failed }));
      });
      pendingWrites.set(ownerId, write);
      await write;
      if (pendingWrites.get(ownerId) === write) pendingWrites.delete(ownerId);
    },
  });

  return listener;
}
