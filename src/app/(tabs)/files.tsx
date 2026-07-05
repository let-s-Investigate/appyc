import React, { useState, useMemo } from 'react';
import { Image, Pressable, ScrollView, View, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTabSwipe } from '@/hooks/use-tab-swipe';
import AnimatedTabWrapper from '@/components/AnimatedTabWrapper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import FolderIcon from '@/features/files/components/FolderIcon';
import { useFileActions } from '@/hooks/use-file-actions';

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { files, folders, addFolder, deleteFolder, deleteFile } = useFilesStore();
  const { handleOpenFile } = useFileActions();

  const [sortOrder, setSortOrder] = useState<'name' | 'date'>('date');
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Calculate total files (files in root + files inside folders representation)
  const totalFilesCount = useMemo(() => {
    const foldersCount = folders.reduce((sum, f) => sum + f.fileCount, 0);
    return files.length + foldersCount;
  }, [files, folders]);

  // Handle folder creation
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }
    addFolder(newFolderName.trim());
    setNewFolderName('');
    setCreateFolderVisible(false);
  };

  // Sort logic for folders and files
  const sortedFolders = useMemo(() => {
    const list = [...folders];
    if (sortOrder === 'name') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      return list.sort((a, b) => {
        const timeA = new Date(`${a.date} ${a.time}`).getTime();
        const timeB = new Date(`${b.date} ${b.time}`).getTime();
        return timeB - timeA;
      });
    }
  }, [folders, sortOrder]);

  const sortedFiles = useMemo(() => {
    const list = [...files];
    if (sortOrder === 'name') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      return list.sort((a, b) => {
        const timeA = new Date(`${a.date} ${a.time}`).getTime();
        const timeB = new Date(`${b.date} ${b.time}`).getTime();
        return timeB - timeA;
      });
    }
  }, [files, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'name' ? 'date' : 'name'));
  };

  // Options menu triggers
  const handleFolderOptions = (folderId: string, folderName: string) => {
    Alert.alert(
      folderName,
      'Choose an action for this folder',
      [
        { text: 'Rename', onPress: () => {} },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteFolder(folderId),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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

  const scrollContentStyle = {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  };

  const swipeHandlers = useTabSwipe('/', '/premium');

  return (
    <AnimatedTabWrapper index={1}>
      <ThemedView {...swipeHandlers} className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header bar */}
      <View className="flex-row justify-between items-center px-lg py-xs mb-xs">
        <View className="flex-row items-center">
          {/* Logo */}
          <View className="w-9 h-9 rounded-md items-center justify-center mr-sm bg-[#EAEEFF] dark:bg-[#3D5AFE]/20">
            <Image
              source={Images.logo}
              className="w-6 h-6"
              style={{ tintColor: theme.primary }}
              resizeMode="contain"
            />
          </View>
          {/* Page Title */}
          <ThemedText className="font-inter-extrabold text-h2 tracking-tight">
            Files
          </ThemedText>
        </View>

        {/* Top actions: Search & Options */}
        <View className="flex-row items-center gap-xs">
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
          
          <Pressable 
            className="w-11 h-11 items-center justify-center rounded-full active:bg-border/20"
            hitSlop={8}
          >
            <Image
              source={Images.icons.menu}
              className="w-6 h-6"
              style={{ tintColor: theme.text, transform: [{ rotate: '90deg' }] }}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      {/* Main content scroll */}
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Count & Sorting controls row */}
        <View className="flex-row justify-between items-center px-lg mb-md">
          <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-medium">
            Total: {totalFilesCount} files
          </ThemedText>

          <View className="flex-row items-center gap-md">
            {/* Sorting trigger */}
            <Pressable 
              onPress={toggleSortOrder}
              className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
              hitSlop={8}
            >
              <SymbolView
                name={{ ios: 'arrow.up.arrow.down', android: 'sort', web: 'sort' }}
                size={20}
                tintColor={theme.text}
              />
            </Pressable>

            {/* Create Folder trigger */}
            <Pressable 
              onPress={() => setCreateFolderVisible(true)}
              className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
              hitSlop={8}
            >
              <SymbolView
                name={{ ios: 'folder.badge.plus', android: 'create_new_folder', web: 'create_new_folder' }}
                size={22}
                tintColor={theme.text}
              />
            </Pressable>
          </View>
        </View>

        {/* Folders and Files list */}
        <View className="px-lg gap-md">
          {/* Folders Section */}
          {sortedFolders.map((folder) => (
            <View
              key={folder.id}
              className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E]"
            >
              {/* CSS Folder Icon */}
              <View className="mr-md">
                <FolderIcon size="md" />
              </View>

              {/* Folder Details */}
              <View className="flex-1 justify-center">
                <ThemedText 
                  className="font-inter-semibold text-body-large leading-tight pr-sm"
                  numberOfLines={1}
                >
                  {folder.title}
                </ThemedText>
                <View className="flex-row items-center mt-xs gap-xs">
                  <SymbolView 
                    name={{ ios: 'doc', android: 'description', web: 'description' }} 
                    size={11} 
                    tintColor={theme.textSecondary}
                  />
                  <ThemedText 
                    themeColor="textSecondary"
                    className="font-inter-regular text-body-small"
                  >
                    {folder.fileCount} files  •  {folder.date} {folder.time}
                  </ThemedText>
                </View>
              </View>

              {/* Options */}
              <Pressable 
                className="w-9 h-9 items-center justify-center rounded-full active:bg-border/20"
                hitSlop={8}
                onPress={() => handleFolderOptions(folder.id, folder.title)}
              >
                <Image
                  source={Images.icons.menu}
                  className="w-7 h-7"
                  style={{ tintColor: theme.text, transform: [{ rotate: '90deg' }] }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          ))}

          {/* Files Section */}
          {sortedFiles.map((file) => (
            <Pressable
              key={file.id}
              onPress={() => handleOpenFile(file)}
              className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] active:opacity-75"
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
      </ScrollView>

      {/* Create Folder Modal */}
      <Modal
        visible={createFolderVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateFolderVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-lg">
          <View className="w-full max-w-sm rounded-lg p-lg bg-bg dark:bg-surface border border-border">
            <ThemedText className="font-inter-bold text-h3 mb-md">
              Create Folder
            </ThemedText>
            
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder Name"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              className="w-full p-md border border-border rounded-md font-inter-regular text-text-primary mb-lg"
              style={{ color: theme.text, fontSize: 16 }}
            />

            <View className="flex-row justify-end gap-md">
              <Pressable 
                onPress={() => {
                  setNewFolderName('');
                  setCreateFolderVisible(false);
                }}
                className="px-lg py-md rounded-md active:bg-border/10"
              >
                <ThemedText themeColor="textSecondary" className="font-inter-semibold">
                  Cancel
                </ThemedText>
              </Pressable>

              <Pressable 
                onPress={handleCreateFolder}
                className="px-lg py-md rounded-md bg-primary active:bg-primaryDeep"
              >
                <ThemedText className="font-inter-semibold text-white">
                  Create
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ThemedView>
    </AnimatedTabWrapper>
  );
}
