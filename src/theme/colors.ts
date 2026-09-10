// Palette CONFIRMED — sampled pixel-by-pixel from the real logo and mascot art
// (docs/DESIGN.md §1). Do not tweak these values by eye.

export const colors = {
  // Functional — used frequently across the whole UI
  brandPrimary: '#B33A1D', // poncho tile-red — primary CTA
  brandSecondary: '#D9A33D', // poncho mustard/ochre — XP, streak, accents
  brandTertiary: '#2D7D4F', // green from the official logo (the "AYMARA" circle) — success

  // Poncho — reserved for decorative use (card border motif, confetti, level
  // path), NOT for buttons or body text. Use 1-2 at a time, never all five
  // together on the same screen.
  ponchoTeal: '#4E9F7E', // teal-green of the stripes
  ponchoPlum: '#7A3B54', // plum of the hat — also the tutor's "info"
  ponchoRose: '#C0555C', // pink of the pompom

  // Base
  ink: '#3A1710', // the real outline/ink of the art — primary text
  inkMuted: '#6B5040',
  cream: '#F5F1E4', // the real background of the asset files
  creamCard: '#EDE4CE',
  white: '#FFFBF2',

  // Illustration (outside the UI: for when something needs to "look capybara")
  furWarm: '#B28252',
  furShadow: '#8B5A38',

  // State
  success: '#2D7D4F', // = brandTertiary
  error: '#A5304A', // wine — deliberately NOT the brand red, so an error never
                    // reads as a "brand action"
  info: '#7A3B54', // = ponchoPlum — so the tutor uses a color that already
                   // exists in the mascot's visual world, not an imported blue
                   // that appears nowhere in the logo

  // Google Translate (secondary engine): deliberately NEUTRAL, not a brand
  // color, so it reads as "this is something else, not the recommended engine"
  googleNeutral: '#8A8478',

  // Derived UI token (not from §1): modal / sheet backdrop — `ink` at ~55%.
  scrim: 'rgba(58, 23, 16, 0.55)',
} as const;

// For decorative uses (card border motif, confetti, the poncho stripe in any
// illustration): the real order they appear in the poncho, outside-in.
export const ponchoStripes = [
  colors.ponchoTeal,
  colors.brandSecondary, // mustard
  colors.brandPrimary, // tile-red
  colors.ponchoPlum,
  colors.ponchoRose,
] as const;
