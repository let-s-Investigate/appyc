import React from 'react';
import { View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon: { ios: string; android: string; web: string };
  title: string;
  subtitle?: string;
};

/** Centered icon + message for empty lists and unavailable content */
export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-xl py-xl">
      <View className="w-16 h-16 rounded-pill items-center justify-center bg-primarySoft dark:bg-[#3D5AFE]/15 mb-md">
        <SymbolView name={icon as any} size={28} tintColor={theme.primary} />
      </View>
      <ThemedText className="font-inter-semibold text-body-large text-center">
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small text-center mt-xs">
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}
