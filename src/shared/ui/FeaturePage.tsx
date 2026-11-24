import Feather from '@expo/vector-icons/Feather';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../theme/tokens';
import type { FeatherName } from './controls';

type Props = PropsWithChildren<{ icon: FeatherName; title: string; description: string; belowHeader?: boolean }>;

export function FeaturePage({ icon, title, description, belowHeader, children }: Props) {
  return (
    <SafeAreaView edges={belowHeader ? ['left', 'right'] : ['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.panel}>
            <View style={styles.icon}><Feather name={icon} color={colors.primary} size={26} /></View>
            <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.large },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: spacing.medium },
  panel: { borderRadius: radius.panel, backgroundColor: colors.surface, padding: spacing.large, gap: spacing.small },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.control,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.small,
  },
  heading: { ...typography.heading, color: colors.heading },
  description: { ...typography.copy, color: colors.text },
});
