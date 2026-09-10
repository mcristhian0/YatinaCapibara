import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type ProgressBarProps = {
  /** Progreso de 0 a 1. Se recorta a ese rango. */
  progress: number;
  /** Color de la barra. Por defecto el ocre de XP/racha (docs/DESIGN.md §1). */
  color?: string;
  height?: number;
  /** Etiqueta para lectores de pantalla (p. ej. "Lección 3 de 4"). */
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function ProgressBar({
  progress,
  color = colors.brandSecondary,
  height = 10,
  accessibilityLabel,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.creamCard,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
