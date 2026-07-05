import React from 'react';
import { Image, Pressable, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { useFileActions } from '@/hooks/use-file-actions';

export default function RecentFiles() {
  const theme = useTheme();
  const { files, deleteFile } = useFilesStore();
  const { handleOpenFile } = useFileActions();

  // Show only the first 3 recent files on the home screen
  const recentFilesSubset = files.slice(0, 3);

  const handleFileOptions = (fileId: string, fileName: string) => {
    Alert.alert(
      fileName,
      'Choose an action for this file',
      [
        { text: 'Rename', onPress: () => {} },
        { text: 'Move to folder', onPress: () => {} },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteFile(fileId),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (files.length === 0) {
    return (
      <View className="px-lg pb-xl items-center justify-center py-xl">
        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-medium">
          No recent files
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="px-lg pb-xl">
      {/* Section Header (Pressable to view all recent files) */}
      <Pressable 
        className="flex-row justify-between items-center mb-md active:opacity-75"
        onPress={() => router.push('/recent-files')}
      >
        <ThemedText className="font-inter-bold text-h3">
          Recent Files
        </ThemedText>
        <View className="p-xs">
          <Image
            source={Images.icons.arrowRight}
            className="w-5 h-5"
            style={{ tintColor: theme.primary }}
            resizeMode="contain"
          />
        </View>
      </Pressable>

      {/* Files List */}
      <View className="gap-md">
        {recentFilesSubset.map((file) => (
          <Pressable
            key={file.id}
            onPress={() => handleOpenFile(file)}
            className="flex-row items-center p-md rounded-lg bg-[#F6F7FB] dark:bg-[#16161C] active:opacity-75"
          >
            {/* Thumbnail */}
            <View className="w-14 h-16 rounded bg-white overflow-hidden border border-[#E5E7EB] dark:border-[#26262E] mr-md">
              <Image
                source={file.thumbnail}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Document Details */}
            <View className="flex-1 justify-center">
              <ThemedText 
                className="font-inter-semibold text-body-large leading-tight pr-sm"
                numberOfLines={2}
              >
                {file.title}
              </ThemedText>
              <ThemedText 
                themeColor="textSecondary"
                className="font-inter-regular text-body-small mt-xs"
              >
                {file.date}  {file.time}
              </ThemedText>
            </View>

            {/* Actions */}
            <View className="flex-row items-center gap-xs">
              <Pressable 
                onPress={(e) => {
                  e.stopPropagation();
                  handleOpenFile(file);
                }}
                className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
                hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
              >
                <Image
                  source={Images.icons.share}
                  className="w-7 h-7"
                  style={{ tintColor: theme.text }}
                  resizeMode="contain"
                />
              </Pressable>
              
              <Pressable 
                className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
                hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                onPress={(e) => {
                  e.stopPropagation();
                  handleFileOptions(file.id, file.title);
                }}
              >
                <Image
                  source={Images.icons.menu}
                  className="w-7 h-7"
                  style={{ tintColor: theme.text, transform: [{ rotate: '90deg' }] }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
