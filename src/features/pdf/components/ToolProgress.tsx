import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ToolProgressProps = {
  visible: boolean;
  label: string;
};

/** Blocking full-screen progress overlay shown while a PDF operation runs */
export default function ToolProgress({ visible, label }: ToolProgressProps) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/55">
        <View
          className="items-center px-xl py-lg rounded-lg"
          style={{ backgroundColor: isDark ? '#16161C' : '#FFFFFF', minWidth: 200 }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText className="font-inter-semibold text-body-large mt-md text-center">
            {label}
          </ThemedText>
          <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs text-center">
            This may take a moment
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}
