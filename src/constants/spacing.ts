/**
 * Spacing and layout constants for consistent UI throughout the app
 */

// Spacing scale (following 4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Font sizes
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  largeTitle: 28,
} as const;

// Font weights (React Native compatible)
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Hit slop for touch targets (minimum 44x44 for accessibility)
export const hitSlop = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};

// Minimum touch target size
export const minTouchTarget = 44;

// Common layout patterns
export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  cardGap: spacing.md,
  sectionGap: spacing.lg,
  inputHeight: 48,
  buttonHeight: 48,
  tabBarHeight: 49,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type FontSize = typeof fontSize;
