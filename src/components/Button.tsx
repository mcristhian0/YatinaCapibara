import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, cutCorner, spacing, typography } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// Extra Pressable props are forwarded to the underlying Pressable — including
// the `onPress` / `onClick` / `href` / `role` that expo-router's <Link asChild>
// injects, so `<Link asChild><Button …/></Link>` navigates on native and web.
type ButtonProps = Omit<PressableProps, 'style' | 'children' | 'disabled'> & {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Icono opcional a la izquierda del texto. */
  icon?: React.ReactNode;
  style?: ViewStyle;
};

// Cut-corner shape (docs/DESIGN.md §5.2), never the rounded pill.
export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, onPress, variant = 'primary', disabled = false, loading = false, icon, style, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  const palette = VARIANTS[variant];

  return (
    <Pressable
      ref={ref}
      {...rest}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[typography.button, { color: palette.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
});

const VARIANTS: Record<ButtonVariant, { background: string; border: string; text: string }> = {
  primary: { background: colors.brandPrimary, border: colors.brandPrimary, text: colors.white },
  secondary: { background: colors.brandSecondary, border: colors.brandSecondary, text: colors.ink },
  ghost: { background: 'transparent', border: colors.brandPrimary, text: colors.brandPrimary },
};

const styles = StyleSheet.create({
  base: {
    ...cutCorner,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
