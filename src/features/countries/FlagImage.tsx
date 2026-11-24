import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '../../shared/theme/tokens';

export function FlagImage({ name, uri, style }: { name: string; uri?: string; style?: StyleProp<ViewStyle> }) {
  const [failedUri, setFailedUri] = useState<string>();
  const showImage = uri && uri !== failedUri;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={showImage ? `Flag of ${name}` : `Flag of ${name} unavailable`}
      style={[styles.frame, style]}
    >
      {showImage ? (
        <Image source={{ uri }} resizeMode="contain" style={styles.image} onError={() => setFailedUri(uri)} />
      ) : (
        <Feather name="flag" size={24} color={colors.muted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
