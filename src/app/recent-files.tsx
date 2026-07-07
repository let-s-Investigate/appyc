import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ScreenContainer from '@/components/screen-container';
import EmptyState from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import FileMenuSheet from '@/features/files/components/FileMenuSheet';
import SharePanelSheet from '@/features/files/components/SharePanelSheet';
import { useFileActions } from '@/hooks/use-file-actions';

export default function RecentFilesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { files } = useFilesStore();
  const { handleOpenFile } = useFileActions();

  const [menuFile, setMenuFile] = useState<ScannedFile | null>(null);
  const [shareFile, setShareFile] = useState<ScannedFile | null>(null);

  const scrollContentStyle = {
    paddingTop: Spacing.two,
    paddingBottom: insets.bottom + Spacing.four,
  };

  return (
    <ScreenContainer>
      {/* Header bar */}
      <View className="flex-row justify-between items-center px-lg py-sm mb-xs">
        <View className="flex-row items-center flex-1">
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center rounded-full active:bg-border/20 mr-xs"
            hitSlop={8}
          >
            <Image
              source={Images.icons.back}
              className="w-6 h-6"
              style={{ tintColor: theme.text }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Screen Title */}
          <ThemedText className="font-inter-bold text-h2">
            Recent Files
          </ThemedText>
        </View>

        {/* Search icon */}
        <Pressable
          className="w-11 h-11 items-center justify-center rounded-full active:bg-border/20"
          hitSlop={8}
          onPress={() => router.push('/search')}
        >
          <Image
            source={Images.icons.search}
            className="w-6 h-6"
            style={{ tintColor: theme.text }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* List of files */}
      {files.length === 0 ? (
        <EmptyState
          icon={{ ios: 'doc', android: 'description', web: 'description' }}
          title="No recent files"
          subtitle="Scan a document or import a PDF to get started"
        />
      ) : (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="px-lg gap-md">
            {files.map((file) => (
              <Pressable
                key={file.id}
                onPress={() => handleOpenFile(file)}
                className="flex-row items-center p-md rounded-lg bg-[#F6F7FB] dark:bg-[#16161C] active:opacity-75"
              >
                {/* Thumbnail */}
                <View className="w-14 h-16 rounded bg-white overflow-hidden border border-[#E5E7EB] dark:border-[#26262E] mr-md">
                  {file.thumbnail && (
                    <Image
                      source={file.thumbnail}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  )}
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
                      setShareFile(file);
                    }}
                    className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
                    hitSlop={8}
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
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation();
                      setMenuFile(file);
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
        </ScrollView>
      )}

      {/* File options + share sheets */}
      <FileMenuSheet visible={!!menuFile} file={menuFile} onClose={() => setMenuFile(null)} />
      <SharePanelSheet visible={!!shareFile} file={shareFile} onClose={() => setShareFile(null)} />
    </ScreenContainer>
  );
}
