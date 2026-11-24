import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../shared/theme/tokens';
import { Button, type FeatherName } from '../../shared/ui/controls';

export function CountryLoading({ label }: { label: string }) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.panel}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

type MessageProps = {
  title: string;
  description: string;
  icon: FeatherName;
  action?: { label: string; onPress: () => void };
  error?: boolean;
};

export function CountryMessage({ title, description, icon, action, error }: MessageProps) {
  return (
    <View style={styles.panel}>
      <Feather name={icon} size={26} color={error ? colors.danger : colors.primary} />
      <Text accessibilityRole={error ? 'alert' : 'header'} style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && <Button kind="secondary" label={action.label} onPress={action.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.softBorder,
    borderWidth: 1,
    borderRadius: radius.panel,
    gap: spacing.small,
    padding: spacing.large,
  },
  title: { ...typography.section, color: colors.heading, textAlign: 'center' },
  description: { ...typography.copy, color: colors.text, textAlign: 'center' },
});
