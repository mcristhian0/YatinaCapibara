import type { TextStyle } from 'react-native';

// Two families, both free via @expo-google-fonts (docs/DESIGN.md §2):
//  - Fraunces    → headings and large numbers (XP, streak, level titles).
//                  Weight 600-700, "retro poster" character.
//  - Nunito Sans → body, buttons, UI. Rounded but neutral, very legible small.
//
// These string keys are the font names registered by useAppFonts() with
// expo-font — keep both in sync. When a custom fontFamily is set we never also
// set fontWeight (it breaks face selection on Android).
export const fontFamily = {
  headingSemiBold: 'Fraunces_600SemiBold',
  headingBold: 'Fraunces_700Bold',
  bodyRegular: 'NunitoSans_400Regular',
  bodySemiBold: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
} as const;

// Type scale from docs/DESIGN.md §2: xs 12 / sm 14 / base 16 / lg 20 /
// xl 28 (Fraunces) / display 40 (Fraunces). No loose sizes in components.
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
  display: 40,
} as const;

// Ready-to-spread text styles. xs-lg use Nunito Sans; xl and display use
// Fraunces, as specified in §2.
export const typography = {
  xs: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  sm: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  base: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.base,
    lineHeight: 24,
  },
  button: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  lg: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    lineHeight: 28,
  },
  xl: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.xl,
    lineHeight: 34,
  },
  display: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.display,
    lineHeight: 46,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
