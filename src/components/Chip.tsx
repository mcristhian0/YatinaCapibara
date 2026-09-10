import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Si se pasa, el chip es interactivo (filtros, opciones de respuesta). */
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Chip({ label, selected = false, onPress, icon, style }: ChipProps) {
  const content = (
    <View
      style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle, style]}
      pointerEvents={onPress ? 'auto' : 'none'}>
      {icon}
      <Text style={[typography.sm, selected ? styles.labelSelected : styles.labelIdle]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.creamCard,
    borderColor: colors.creamCard,
  },
  chipSelected: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  labelIdle: {
    color: colors.ink,
  },
  labelSelected: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.7,
  },
});
