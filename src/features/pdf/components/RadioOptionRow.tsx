import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type RadioOptionRowProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

/** Radio row with title + subtitle (per compress mockup) */
export default function RadioOptionRow({ title, subtitle, selected, onPress }: RadioOptionRowProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} className="flex-row items-center py-md active:opacity-75">
      {/* Radio circle */}
      <View
        className="w-6 h-6 rounded-pill items-center justify-center mr-md"
        style={{ borderWidth: 2, borderColor: selected ? theme.primary : theme.border }}
      >
        {selected && (
          <View className="w-3 h-3 rounded-pill" style={{ backgroundColor: theme.primary }} />
        )}
      </View>

      <View className="flex-1">
        <ThemedText className="font-inter-semibold text-body-large">{title}</ThemedText>
        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs">
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}
