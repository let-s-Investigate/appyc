import { Colors } from '@/constants/theme';
import { useColorScheme } from 'nativewind';

export function useTheme() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'unspecified' || !colorScheme ? 'light' : colorScheme;

  return Colors[theme];
}
