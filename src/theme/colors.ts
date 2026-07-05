export const colors = {
  // Brand / Primary
  primary: '#3D5AFE',
  primaryDeep: '#2C3EE0',
  primaryLight: '#5B7BFF',
  primarySoft: '#EAEEFF',

  // Semantic
  success: '#22C55E',
  warning: '#FFB020',
  error: '#FF4D4F',
  info: '#4D8BFF',

  // Neutrals — Light Mode
  light: {
    text: '#0D1326',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    surface: '#F6F7FB',
    background: '#FFFFFF',
  },

  // Neutrals — Dark Mode
  dark: {
    text: '#F5F6FA',
    textSecondary: '#8A8A94',
    border: '#26262E',
    surface: '#16161C',
    background: '#0D0D12',
  },
} as const;

export type ThemeColors = typeof colors;
