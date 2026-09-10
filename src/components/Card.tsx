import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  /** Título opcional; se muestra bajo la greca en Fraunces. */
  title?: string;
  /** Muestra la tira "greca andina" en el borde superior (docs/DESIGN.md §5.3). */
  greca?: boolean;
  /** Color de tinte de la greca. Por nivel se pasa un color distinto. */
  grecaColor?: string;
  style?: ViewStyle;
};

export function Card({
  children,
  title,
  greca = true,
  grecaColor = colors.brandPrimary,
  style,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {greca ? <GrecaStrip color={grecaColor} /> : null}
      <View style={styles.body}>
        {title ? <Text style={[typography.lg, styles.title]}>{title}</Text> : null}
        {children}
      </View>
    </View>
  );
}

// Repeated geometric sawtooth — the edge of an andean weave (docs/DESIGN.md
// §5.3). One shape (a triangle) repeated and tinted a single color; no SVG.
const GRECA_TEETH = 14;

function GrecaStrip({ color }: { color: string }) {
  return (
    <View style={styles.greca} pointerEvents="none">
      {Array.from({ length: GRECA_TEETH }, (_, i) => (
        <View key={i} style={[styles.tooth, { borderBottomColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.creamCard,
    overflow: 'hidden',
  },
  greca: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.creamCard,
  },
  tooth: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
  },
});
