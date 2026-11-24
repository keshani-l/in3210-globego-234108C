import Feather from '@expo/vector-icons/Feather';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../shared/theme/tokens';

type Props = PropsWithChildren<{ title: string; description: string }>;

export function AuthLayout({ title, description, children }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.brand}>
              <View style={styles.mark}>
                <Feather name="compass" size={28} color={colors.onPrimary} />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.name}>GlobeGo</Text>
                <Text style={styles.tagline}>Explore the World, Anywhere</Text>
              </View>
            </View>
            <View style={styles.panel}>
              <View style={styles.intro}>
                <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.medium },
  content: { width: '100%', maxWidth: 500, alignSelf: 'center', gap: spacing.large },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.medium, paddingHorizontal: spacing.small },
  mark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    backgroundColor: colors.primary,
  },
  brandCopy: { flex: 1 },
  name: { ...typography.body, fontWeight: '700', color: colors.heading },
  tagline: { ...typography.caption, color: colors.text },
  panel: { backgroundColor: colors.surface, borderRadius: radius.panel, padding: spacing.large, gap: spacing.medium },
  intro: { gap: spacing.tiny },
  heading: { ...typography.heading, color: colors.heading },
  description: { ...typography.copy, color: colors.text },
});
