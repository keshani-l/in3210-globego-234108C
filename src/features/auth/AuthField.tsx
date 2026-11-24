import Feather from '@expo/vector-icons/Feather';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '../../shared/theme/tokens';
import type { FeatherName } from '../../shared/ui/controls';

type Props = ComponentProps<typeof TextInput> & {
  label: string;
  icon: FeatherName;
  error?: string;
  password?: boolean;
};

export function AuthField({ label, icon, error, password, ...input }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.control, focused && styles.focused, error && styles.invalid]}>
        <Feather name={icon} size={18} color={colors.muted} />
        <TextInput
          {...input}
          accessibilityLabel={label}
          secureTextEntry={password && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            onPress={() => setVisible(!visible)}
            style={styles.toggle}
          >
            <Feather name={visible ? 'eye-off' : 'eye'} size={19} color={colors.primary} />
          </Pressable>
        )}
      </View>
      {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.tiny },
  label: { ...typography.label, color: colors.heading },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget,
    gap: spacing.small,
    paddingLeft: spacing.medium,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
  input: { flex: 1, minWidth: 0, minHeight: touchTarget, paddingRight: spacing.small, color: colors.heading, fontSize: 16 },
  toggle: { width: touchTarget, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
  error: { ...typography.caption, color: colors.danger },
});
