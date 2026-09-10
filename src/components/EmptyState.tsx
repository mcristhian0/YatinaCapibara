import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { Button } from './Button';

// Default: the capybara reading "Aymara Tales" — the empty state of the tutor
// and the translator (docs/DESIGN.md §3).
const DEFAULT_MASCOT = require('@/assets/images/mascot/mascot-leyendo-libro.png');

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Pose de la mascota. Por defecto, la que lee el libro. */
  mascot?: ImageSourcePropType;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
};

export function EmptyState({
  title,
  description,
  mascot = DEFAULT_MASCOT,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={mascot} style={styles.mascot} contentFit="contain" />
      <Text style={[typography.lg, styles.title]}>{title}</Text>
      {description ? <Text style={[typography.base, styles.description]}>{description}</Text> : null}
      {action ? <Button label={action.label} onPress={action.onPress} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  mascot: {
    width: 140,
    height: 140,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
  },
  description: {
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
