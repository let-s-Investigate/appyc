import React, { useState, useMemo } from 'react';
import { Image, Pressable, ScrollView, View, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import FolderIcon from '@/features/files/components/FolderIcon';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const { 
    files, 
    folders, 
    previousSearches, 
    addSearchKeyword, 
    removeSearchKeyword, 
    clearSearchKeywords,
    deleteFile,
    deleteFolder
  } = useFilesStore();

  const [searchText, setSearchText] = useState('');

  // Submit search keyword to history
  const handleSubmitSearch = () => {
    if (searchText.trim()) {
      addSearchKeyword(searchText.trim());
    }
  };

  // Click on a previous search keyword
  const handleSelectKeyword = (keyword: string) => {
    setSearchText(keyword);
    addSearchKeyword(keyword);
  };

  // Filter logic
  const filteredFolders = useMemo(() => {
    if (!searchText.trim()) return [];
    return folders.filter((f) => 
      f.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [folders, searchText]);

  const filteredFiles = useMemo(() => {
    if (!searchText.trim()) return [];
    return files.filter((f) => 
      f.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [files, searchText]);

  const hasResults = filteredFolders.length > 0 || filteredFiles.length > 0;
  const isSearching = searchText.trim().length > 0;

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

  return (
    <ThemedView 
      className="flex-1"
      style={{ paddingTop: insets.top }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Search Header Bar (Wider bar, pl-sm, pr-md to prevent layout overflows) */}
        <View className="flex-row items-center pl-sm pr-md py-sm border-b border-border/20">
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

          {/* Input Bar (Fixed h-11 height, center elements) */}
          <View 
            className="flex-1 flex-row items-center h-11 px-md bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] rounded-full"
          >
            {/* Search Icon */}
            <Image
              source={Images.icons.search}
              className="w-4 h-4 mr-sm"
              style={{ tintColor: theme.textSecondary }}
              resizeMode="contain"
            />
            
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search"
              placeholderTextColor={theme.textSecondary}
              onSubmitEditing={handleSubmitSearch}
              className="flex-1 font-inter-regular py-0 h-full text-text-primary"
              style={{ color: theme.text, fontSize: 14 }}
              autoFocus
              returnKeyType="search"
            />

            {/* Clear button */}
            {searchText.length > 0 && (
              <Pressable 
                onPress={() => setSearchText('')}
                className="p-xs rounded-full active:bg-border/30"
                hitSlop={8}
              >
                <ThemedText themeColor="textSecondary" className="font-inter-bold text-[14px] px-xs">
                  ✕
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: Spacing.four }}
        >
          {/* State 1: Previous Search List (Input is empty) */}
          {!isSearching && (
            <View className="px-lg pt-md">
              {previousSearches.length > 0 ? (
                <>
                  {/* Previous Search Header */}
                  <View className="flex-row justify-between items-center mb-sm">
                    <ThemedText className="font-inter-bold text-body-large">
                      Previous Search
                    </ThemedText>
                    
                    {/* Clear all searches */}
                    <Pressable 
                      onPress={clearSearchKeywords}
                      className="p-xs active:opacity-60"
                      hitSlop={8}
                    >
                      <ThemedText themeColor="textSecondary" className="text-[14px] font-inter-bold">
                        ✕
                      </ThemedText>
                    </Pressable>
                  </View>

                  {/* Keywords List */}
                  <View className="divide-y divide-border/20">
                    {previousSearches.map((keyword, index) => (
                      <View 
                        key={index}
                        className="flex-row justify-between items-center py-md"
                      >
                        <Pressable 
                          onPress={() => handleSelectKeyword(keyword)}
                          className="flex-1 py-xs"
                        >
                          <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-medium">
                            {keyword}
                          </ThemedText>
                        </Pressable>

                        {/* Remove item */}
                        <Pressable 
                          onPress={() => removeSearchKeyword(keyword)}
                          className="p-xs"
                          hitSlop={8}
                        >
                          <ThemedText themeColor="textSecondary" className="text-[12px] px-xs">
                            ✕
                          </ThemedText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View className="items-center justify-center py-xl">
                  <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-medium">
                    No search history
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* State 2: Searching and Results found */}
          {isSearching && hasResults && (
            <View className="px-lg pt-md gap-md">
              {/* Filtered Folders */}
              {filteredFolders.map((folder) => (
                <View
                  key={folder.id}
                  className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E]"
                >
                  <View className="mr-md">
                    <FolderIcon size="md" />
                  </View>

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

              {/* Filtered Files */}
              {filteredFiles.map((file) => (
                <View
                  key={file.id}
                  className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E]"
                >
                  <View className="w-14 h-16 rounded bg-white overflow-hidden border border-[#E5E7EB] dark:border-[#26262E] mr-md">
                    <Image
                      source={file.thumbnail}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

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

                  <View className="flex-row items-center gap-xs">
                    <Pressable 
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
                      onPress={() => handleFileOptions(file.id, file.title)}
                    >
                      <Image
                        source={Images.icons.menu}
                        className="w-7 h-7"
                        style={{ tintColor: theme.text, transform: [{ rotate: '90deg' }] }}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* State 3: Searching and No results (Not Found screen - Image 4) */}
          {isSearching && !hasResults && (
            <View className="items-center justify-center px-xl pt-[60px] pb-lg">
              {/* Illustration */}
              <Image
                source={Images.placeholders.notFound}
                className="w-[260px] h-[260px] mb-lg"
                resizeMode="contain"
              />
              
              {/* Title */}
              <ThemedText className="font-inter-bold text-h2 text-center mb-sm">
                Not Found
              </ThemedText>

              {/* Paragraph description */}
              <ThemedText 
                themeColor="textSecondary"
                className="font-inter-regular text-body-large text-center leading-relaxed"
              >
                We're sorry, the keyword you were looking for could not be found. Please search with another keywords.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
