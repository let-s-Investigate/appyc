import 'react-native-get-random-values';
import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const resolvedColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={resolvedColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recent-files" />
        <Stack.Screen name="search" />
        <Stack.Screen name="tools" />
        <Stack.Screen name="about" />
        <Stack.Screen name="editor" />
        <Stack.Screen name="viewer" />
        <Stack.Screen name="pdf/merge" />
        <Stack.Screen name="pdf/split" />
        <Stack.Screen name="pdf/compress" />
        <Stack.Screen name="pdf/watermark" />
        <Stack.Screen name="pdf/sign" />
        <Stack.Screen name="pdf/protect" />
      </Stack>
    </ThemeProvider>
  );
}