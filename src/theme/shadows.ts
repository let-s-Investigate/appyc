export const shadows = {
  card: {
    shadowColor: '#0D1326',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export type ThemeShadows = typeof shadows;
