import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView 
      className="flex-1 items-center justify-center p-xl"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Illustration */}
      <Image
        source={Images.placeholders.notFound}
        className="w-[280px] h-[280px] mb-lg"
        resizeMode="contain"
      />

      {/* Heading */}
      <ThemedText className="font-inter-bold text-h2 text-center mb-sm">
        Page Not Found
      </ThemedText>

      {/* Paragraph */}
      <ThemedText 
        themeColor="textSecondary"
        className="font-inter-regular text-body-large text-center leading-relaxed mb-xl"
      >
        We're sorry, the page you are looking for does not exist or has been moved.
      </ThemedText>

      {/* Go Home Button */}
      <Link href="/" asChild>
        <Pressable 
          className="w-full max-w-xs h-[52px] rounded-full bg-primary items-center justify-center active:bg-primaryDeep"
          style={{
            boxShadow: '0 4px 16px rgba(61, 90, 254, 0.25)',
          }}
        >
          <ThemedText className="font-inter-semibold text-white text-body-large">
            Go to Home
          </ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
