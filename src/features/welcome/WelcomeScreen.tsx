import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../../shared/theme/tokens';

export function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          GlobeGo
        </Text>
        <Text style={styles.tagline}>Explore the World, Anywhere</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.small,
    padding: spacing.large,
  },
  title: {
    ...typography.title,
    color: colors.heading,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
});
