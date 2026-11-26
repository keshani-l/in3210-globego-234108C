import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '../theme/tokens';

export type FeatherName = ComponentProps<typeof Feather>['name'];

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: FeatherName;
  busy?: boolean;
  disabled?: boolean;
  kind?: 'primary' | 'secondary';
};

export function Button({ label, onPress, icon, busy = false, disabled = false, kind = 'primary' }: ButtonProps) {
  const primary = kind === 'primary';
  const foreground = primary ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy || disabled }}
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button, primary ? styles.primary : styles.secondary, pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {busy ? <ActivityIndicator color={foreground} /> : icon && <Feather name={icon} size={18} color={foreground} />}
      <Text style={[typography.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function StatusMessage({ text, error = false }: { text: string; error?: boolean }) {
  const foreground = error ? colors.danger : colors.heading;
  return (
    <View
      accessibilityRole={error ? 'alert' : undefined}
      accessibilityLiveRegion={error ? 'assertive' : 'polite'}
      style={[styles.notice, { backgroundColor: error ? colors.dangerSurface : colors.tint }]}
    >
      <Feather name={error ? 'alert-circle' : 'info'} size={18} color={foreground} />
      <Text style={[styles.noticeText, { color: foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    borderRadius: radius.control,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.5 },
  notice: { flexDirection: 'row', gap: spacing.small, padding: spacing.medium, borderRadius: radius.control },
  noticeText: { ...typography.caption, flex: 1 },
});
