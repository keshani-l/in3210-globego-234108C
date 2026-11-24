import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { colors, radius, spacing, typography } from '../../shared/theme/tokens';
import { Button, StatusMessage } from '../../shared/ui/controls';
import { FeaturePage } from '../../shared/ui/FeaturePage';
import { endSession } from '../auth/sessionActions';

export function ProfileScreen() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (auth.status !== 'signedIn') return null;
  const { user } = auth;

  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(false);
    try {
      await dispatch(endSession('logout'));
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <FeaturePage icon="user" title="Profile" description={`${user.firstName} ${user.lastName}`}>
      <View style={styles.panel}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user.username}</Text>
        <Text style={styles.label}>Email address</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>
      {error && <StatusMessage error text="GlobeGo could not clear your secure session. Please try again." />}
      <Button kind="secondary" icon="log-out" label={busy ? 'Signing out…' : 'Sign out'} busy={busy} onPress={logout} />
    </FeaturePage>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: radius.panel, padding: spacing.large, gap: spacing.small },
  label: { ...typography.label, color: colors.heading },
  value: { ...typography.copy, color: colors.text },
});
