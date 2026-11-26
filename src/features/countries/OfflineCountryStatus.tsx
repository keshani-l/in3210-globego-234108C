import { StyleSheet, Text, View } from 'react-native';

import type { ConnectionStatus } from '../../app/connectivity';
import { colors, spacing, typography } from '../../shared/theme/tokens';
import { StatusMessage } from '../../shared/ui/controls';

export function OfflineCountryStatus({ status, hasData, updatedAt }: {
  status: ConnectionStatus; hasData: boolean; updatedAt?: number;
}) {
  if (status !== 'offline' && updatedAt === undefined) return null;

  return (
    <View style={styles.status}>
      {status === 'offline' && <StatusMessage
        text={hasData ? 'You’re offline. Showing saved country information.' : 'You’re offline. Reconnect to download country information.'}
        icon="wifi-off"
      />}
      {updatedAt !== undefined && (
        <Text style={styles.timestamp}>Last updated {new Date(updatedAt).toLocaleString()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: { gap: spacing.small },
  timestamp: { ...typography.caption, color: colors.muted },
});
