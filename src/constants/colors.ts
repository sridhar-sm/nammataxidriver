export const colors = {
  // Primary brand colors
  primary: '#007AFF',
  secondary: '#5856D6',

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  // Background colors
  background: {
    primary: '#F2F2F7',
    secondary: '#FFFFFF',
    tertiary: '#E5E5EA',
  },

  // Text colors
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    primary: '#E5E5EA',
    secondary: '#C7C7CC',
  },

  // Status colors (for trip badges, etc.)
  status: {
    proposed: '#FF9500',
    confirmed: '#007AFF',
    active: '#34C759',
    completed: '#8E8E93',
    cancelled: '#FF3B30',
  },

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

// Type for accessing colors
export type Colors = typeof colors;
