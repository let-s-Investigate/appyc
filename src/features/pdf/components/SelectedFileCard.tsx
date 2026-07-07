import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ScannedFile } from '@/features/files/types';

type SelectedFileCardProps = {
  file: ScannedFile;
  onPress?: () => void;
  /** Renders an ✕ remove button when provided (per merge mockup) */
  onRemove?: () => void;
  /** Extra line under the date, e.g. a file size */
  detail?: string;
};

/** File card with thumbnail used inside tool screens (per mockups) */
export default function SelectedFileCard({ file, onPress, onRemove, detail }: SelectedFileCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] active:opacity-75"
    >
      {/* Thumbnail */}
      <View className="w-14 h-16 rounded bg-white overflow-hidden border border-[#E5E7EB] dark:border-[#26262E] mr-md">
        {file.thumbnail && (
          <Image source={file.thumbnail} className="w-full h-full" resizeMode="cover" />
        )}
      </View>

      {/* Details */}
      <View className="flex-1 justify-center">
        <ThemedText className="font-inter-semibold text-body-large leading-tight pr-sm" numberOfLines={2}>
          {file.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs">
          {detail ?? `${file.date}  ${file.time}`}
        </ThemedText>
      </View>

      {/* Remove */}
      {onRemove && (
        <Pressable
          onPress={onRemove}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
          hitSlop={8}
        >
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={16}
            tintColor={theme.text}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
