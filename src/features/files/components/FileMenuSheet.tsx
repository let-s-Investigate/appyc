import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import FolderIcon from '@/features/files/components/FolderIcon';

type FileMenuSheetProps = {
  visible: boolean;
  file: ScannedFile | null;
  onClose: () => void;
  /** Called after the file is deleted (e.g. to leave a viewer showing it) */
  onDeleted?: () => void;
};

type MenuItem = {
  label: string;
  icon: { ios: string; android: string; web: string };
  needsUri?: boolean;
  destructive?: boolean;
  topDivider?: boolean;
  onPress: () => void;
};

type SubSheet = 'none' | 'rename' | 'move';

/** Long-press / options menu for a file (per "file menus panel" mockup) */
export default function FileMenuSheet({ visible, file, onClose, onDeleted }: FileMenuSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { folders, renameFile, moveFile, deleteFile } = useFilesStore();

  const [subSheet, setSubSheet] = useState<SubSheet>('none');
  const [renameValue, setRenameValue] = useState('');

  if (!visible || !file) return null;

  const close = () => {
    setSubSheet('none');
    onClose();
  };

  const pushTool = (path: string) => {
    close();
    router.push({ pathname: path as any, params: { fileId: file.id } });
  };

  const handleSaveToDevice = async () => {
    if (!file.uri) return;
    try {
      const Sharing = require('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: file.title,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (err) {
      console.warn('Save to device failed:', err);
      Alert.alert('Error', 'Could not export this file.');
    }
  };

  const handlePrint = async () => {
    if (!file.uri) return;
    try {
      const Print = require('expo-print');
      await Print.printAsync({ uri: file.uri });
    } catch (err) {
      // User closing the print dialog also rejects — only warn
      console.warn('Print dismissed or failed:', err);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete File', `Delete "${file.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteFile(file.id);
          onDeleted?.();
        },
      },
    ]);
  };

  const items: MenuItem[] = [
    { label: 'Save to Device', icon: { ios: 'square.and.arrow.down', android: 'download', web: 'download' }, needsUri: true, onPress: handleSaveToDevice },
    { label: 'Add Watermark', icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' }, needsUri: true, topDivider: true, onPress: () => pushTool('/pdf/watermark') },
    { label: 'Add Digital Signature', icon: { ios: 'signature', android: 'draw', web: 'draw' }, needsUri: true, onPress: () => pushTool('/pdf/sign') },
    { label: 'Split PDF', icon: { ios: 'scissors', android: 'content_cut', web: 'content_cut' }, needsUri: true, onPress: () => pushTool('/pdf/split') },
    { label: 'Merge PDF', icon: { ios: 'doc.on.doc', android: 'file_copy', web: 'file_copy' }, needsUri: true, onPress: () => pushTool('/pdf/merge') },
    { label: 'Protect PDF', icon: { ios: 'lock', android: 'lock', web: 'lock' }, needsUri: true, onPress: () => pushTool('/pdf/protect') },
    { label: 'Compress PDF', icon: { ios: 'arrow.down.right.and.arrow.up.left', android: 'compress', web: 'compress' }, needsUri: true, onPress: () => pushTool('/pdf/compress') },
    { label: 'Rename', icon: { ios: 'pencil', android: 'edit', web: 'edit' }, topDivider: true, onPress: () => { setRenameValue(file.title); setSubSheet('rename'); } },
    { label: 'Move to Folder', icon: { ios: 'folder', android: 'folder', web: 'folder' }, onPress: () => setSubSheet('move') },
    { label: 'Print', icon: { ios: 'printer', android: 'print', web: 'print' }, needsUri: true, onPress: handlePrint },
    { label: 'Delete', icon: { ios: 'trash', android: 'delete', web: 'delete' }, destructive: true, onPress: handleDelete },
  ];

  const handleRenameConfirm = () => {
    if (!renameValue.trim()) {
      Alert.alert('Error', 'File name cannot be empty');
      return;
    }
    renameFile(file.id, renameValue.trim());
    close();
  };

  const handleMove = (folderId: string | null) => {
    moveFile(file.id, folderId);
    close();
  };

  const sheetBg = isDark ? '#16161C' : '#FFFFFF';

  return (
    <Modal visible transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Pressable style={{ flex: 1 }} onPress={close}>
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
              exiting={SlideOutDown.duration(200)}
              style={{
                backgroundColor: sheetBg,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 12,
                paddingBottom: insets.bottom + 16,
                paddingHorizontal: 20,
                maxHeight: '85%',
              }}
            >
              {/* Drag handle */}
              <View className="self-center w-9 h-1 rounded-pill bg-border mb-md" />

              {subSheet === 'none' && (
                <>
                  {/* File header card */}
                  <View className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#0D0D12] border border-[#E5E7EB] dark:border-[#26262E] mb-md">
                    <View className="w-12 h-14 rounded bg-white overflow-hidden border border-[#E5E7EB] dark:border-[#26262E] mr-md">
                      {file.thumbnail && (
                        <Image source={file.thumbnail} className="w-full h-full" resizeMode="cover" />
                      )}
                    </View>
                    <View className="flex-1">
                      <ThemedText className="font-inter-semibold text-body-large" numberOfLines={1}>
                        {file.title}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs">
                        {file.date}  {file.time}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Menu items */}
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {items.map((item, idx) => {
                      const disabled = item.needsUri && !file.uri;
                      return (
                        <View key={idx}>
                          {item.topDivider && <View className="h-[1px] bg-border/40 my-xs" />}
                          <Pressable
                            onPress={() => {
                              if (disabled) {
                                Alert.alert(file.title, 'This placeholder file has no PDF attached.');
                                return;
                              }
                              item.onPress();
                            }}
                            className={`flex-row items-center py-sm px-xs rounded-lg active:bg-border/10 ${disabled ? 'opacity-40' : ''}`}
                          >
                            <View className="w-9 h-9 items-center justify-center mr-md">
                              <SymbolView
                                name={item.icon as any}
                                size={20}
                                tintColor={item.destructive ? theme.error : theme.text}
                              />
                            </View>
                            <ThemedText
                              className="font-inter-medium text-body-large flex-1"
                              style={item.destructive ? { color: theme.error } : undefined}
                            >
                              {item.label}
                            </ThemedText>
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {subSheet === 'rename' && (
                <View>
                  <ThemedText className="font-inter-bold text-h3 mb-md">Rename File</ThemedText>
                  <TextInput
                    value={renameValue}
                    onChangeText={setRenameValue}
                    autoFocus
                    placeholder="File name"
                    placeholderTextColor={theme.textSecondary}
                    className="w-full p-md border border-border rounded-md font-inter-regular mb-lg"
                    style={{ color: theme.text, fontSize: 16 }}
                  />
                  <View className="flex-row justify-end gap-md">
                    <Pressable onPress={() => setSubSheet('none')} className="px-lg py-md rounded-md active:bg-border/10">
                      <ThemedText themeColor="textSecondary" className="font-inter-semibold">Cancel</ThemedText>
                    </Pressable>
                    <Pressable onPress={handleRenameConfirm} className="px-lg py-md rounded-md bg-primary active:opacity-90">
                      <ThemedText className="font-inter-semibold text-white">Rename</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}

              {subSheet === 'move' && (
                <View>
                  <ThemedText className="font-inter-bold text-h3 mb-md">Move to Folder</ThemedText>
                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
                    <Pressable
                      onPress={() => handleMove(null)}
                      className="flex-row items-center py-md px-xs rounded-lg active:bg-border/10"
                    >
                      <View className="w-9 h-9 items-center justify-center mr-md">
                        <SymbolView name={{ ios: 'folder', android: 'folder', web: 'folder' }} size={20} tintColor={theme.primary} />
                      </View>
                      <ThemedText className="font-inter-medium text-body-large flex-1">My Documents</ThemedText>
                      {file.folderId === null && (
                        <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} tintColor={theme.primary} />
                      )}
                    </Pressable>
                    {folders.map((folder) => (
                      <Pressable
                        key={folder.id}
                        onPress={() => handleMove(folder.id)}
                        className="flex-row items-center py-md px-xs rounded-lg active:bg-border/10"
                      >
                        <View className="mr-md">
                          <FolderIcon size="sm" />
                        </View>
                        <ThemedText className="font-inter-medium text-body-large flex-1" numberOfLines={1}>
                          {folder.title}
                        </ThemedText>
                        {file.folderId === folder.id && (
                          <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={18} tintColor={theme.primary} />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable onPress={() => setSubSheet('none')} className="items-center py-md mt-xs active:opacity-75">
                    <ThemedText themeColor="textSecondary" className="font-inter-semibold">Cancel</ThemedText>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
