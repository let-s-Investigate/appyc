/**
 * Centralized theme configuration bridging separated design tokens
 * from src/theme with the legacy export format.
 */

import '@/global.css';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: colors.light.text,
    background: colors.light.background,
    backgroundElement: colors.light.surface,
    backgroundSelected: colors.primarySoft,
    textSecondary: colors.light.textSecondary,
    border: colors.light.border,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  dark: {
    text: colors.dark.text,
    background: colors.dark.background,
    backgroundElement: colors.dark.surface,
    backgroundSelected: colors.dark.border,
    textSecondary: colors.dark.textSecondary,
    border: colors.dark.border,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: spacing.xs / 2, // 2px
  one: spacing.xs,      // 4px
  two: spacing.sm,      // 8px
  three: spacing.md,    // 16px
  four: spacing.lg,     // 24px
  five: spacing.xl,     // 32px
  six: spacing.xl * 2,  // 64px
} as const;

export const Radius = radius;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
