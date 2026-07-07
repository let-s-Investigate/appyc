import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import EmptyState from '@/components/empty-state';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from 'nativewind';
import { ScannedFile } from '@/features/files/types';
import { usePdfSource } from '../hooks/use-pdf-source';
import SelectedFileCard from './SelectedFileCard';

type SourcePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (files: ScannedFile[]) => void;
  /** Allow picking several PDFs at once from the device */
  multiple?: boolean;
};

type SourceOption = {
  key: 'library' | 'scan' | 'device';
  label: string;
  subtitle: string;
  icon: { ios: string; android: string; web: string };
};

const OPTIONS: SourceOption[] = [
  { key: 'library', label: 'Choose from Files', subtitle: 'Documents in your file manager', icon: { ios: 'folder', android: 'folder', web: 'folder' } },
  { key: 'scan', label: 'Scan New Document', subtitle: 'Capture pages with the camera', icon: { ios: 'doc.viewfinder', android: 'document_scanner', web: 'document_scanner' } },
  { key: 'device', label: 'Browse Device', subtitle: 'Import a PDF from your device', icon: { ios: 'externaldrive', android: 'smartphone', web: 'smartphone' } },
];

/** Theme-aware bottom sheet offering the three tool input sources */
export default function SourcePickerSheet({ visible, onClose, onSelect, multiple = false }: SourcePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { libraryFiles, pickFromDevice, scanNew } = usePdfSource();
  const [mode, setMode] = useState<'options' | 'library'>('options');

  const close = () => {
    setMode('options');
    onClose();
  };

  const finish = (files: ScannedFile[]) => {
    close();
    if (files.length > 0) onSelect(files);
  };

  const handleOption = async (key: SourceOption['key']) => {
    if (key === 'library') {
      setMode('library');
      return;
    }
    // Hide the sheet before opening native pickers
    close();
    const files = key === 'scan' ? await scanNew() : await pickFromDevice(multiple);
    if (files.length > 0) onSelect(files);
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Pressable style={{ flex: 1 }} onPress={close}>
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
              exiting={SlideOutDown.duration(200)}
              style={{
                backgroundColor: isDark ? '#16161C' : '#FFFFFF',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 12,
                paddingBottom: insets.bottom + 16,
                paddingHorizontal: 20,
                maxHeight: '75%',
              }}
            >
              {/* Drag handle */}
              <View className="self-center w-9 h-1 rounded-pill bg-border mb-md" />

              {mode === 'options' ? (
                <>
                  <ThemedText className="font-inter-bold text-h3 mb-md px-xs">Select Source</ThemedText>
                  {OPTIONS.map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() => handleOption(option.key)}
                      className="flex-row items-center py-md px-sm rounded-lg active:bg-border/10"
                    >
                      <View className="w-12 h-12 rounded-lg items-center justify-center bg-primarySoft dark:bg-[#3D5AFE]/15 mr-md">
                        <SymbolView name={option.icon as any} size={22} tintColor={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-inter-semibold text-body-large">{option.label}</ThemedText>
                        <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs">
                          {option.subtitle}
                        </ThemedText>
                      </View>
                      <SymbolView
                        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                        size={16}
                        tintColor={theme.textSecondary}
                      />
                    </Pressable>
                  ))}
                </>
              ) : (
                <>
                  <View className="flex-row items-center mb-md">
                    <Pressable
                      onPress={() => setMode('options')}
                      className="w-9 h-9 items-center justify-center rounded-full mr-sm active:bg-border/20"
                      hitSlop={8}
                    >
                      <SymbolView
                        name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                        size={18}
                        tintColor={theme.text}
                      />
                    </Pressable>
                    <ThemedText className="font-inter-bold text-h3">Your Files</ThemedText>
                  </View>

                  {libraryFiles.length === 0 ? (
                    <EmptyState
                      icon={{ ios: 'doc', android: 'description', web: 'description' }}
                      title="No documents yet"
                      subtitle="Scan a document or import a PDF to get started"
                    />
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <View className="gap-sm pb-md">
                        {libraryFiles.map((file) => (
                          <SelectedFileCard key={file.id} file={file} onPress={() => finish([file])} />
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
