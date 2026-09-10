// Spacing scale. Every margin/padding/gap in the app comes from here — no
// "magic" pixel values loose in a component (see .claude/rules/ui.md).
// docs/DESIGN.md §1-2 fixes color and typography; this scale is the project
// baseline agreed for Phase 2.

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
