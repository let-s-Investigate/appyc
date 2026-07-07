import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';

type ToolHeaderProps = {
  title: string;
  subtitle?: string;
};

/** Back arrow + large title + subtitle header used by all tool screens (per mockups) */
export default function ToolHeader({ title, subtitle }: ToolHeaderProps) {
  const theme = useTheme();

  return (
    <View className="px-lg mb-md">
      <Pressable
        onPress={() => router.back()}
        className="w-11 h-11 items-center justify-center rounded-full -ml-sm active:bg-border/20"
        hitSlop={8}
      >
        <Image
          source={Images.icons.back}
          className="w-6 h-6"
          style={{ tintColor: theme.text }}
          resizeMode="contain"
        />
      </Pressable>

      <ThemedText className="font-inter-extrabold text-h1 tracking-tight mt-sm">
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-medium mt-xs">
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}
