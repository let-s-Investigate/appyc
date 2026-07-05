export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  h1: {
    fontSize: 32,
    fontFamily: 'Inter_800ExtraBold',
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 31,
  },
  h3: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
  },
  bodyMedium: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  caption: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
  },
} as const;

export type ThemeTypography = typeof typography;
