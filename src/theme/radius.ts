// Corner radii. The app deliberately avoids the fully-rounded "pill"
// (borderRadius: 999) that every Duolingo clone uses — see docs/DESIGN.md §5.2.

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
} as const;

// Cut-corner shape for primary buttons (docs/DESIGN.md §5.2): a diagonal
// "ticket" notch via asymmetric radii. Spread into a style object.
export const cutCorner = {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 16,
  borderBottomLeftRadius: 4,
} as const;
