import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import ScreenContainer from '@/components/screen-container';
import ToolHeader from '@/components/tool-header';
import PrimaryButton from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import SelectedFileCard from '@/features/pdf/components/SelectedFileCard';
import SourcePickerSheet from '@/features/pdf/components/SourcePickerSheet';
import ToolProgress from '@/features/pdf/components/ToolProgress';
import ToolSuccess from '@/features/pdf/components/ToolSuccess';
import { splitPdf } from '@/features/pdf/services/pdf-split';
import { renderAllPages } from '@/features/pdf/services/pdf-thumbnails';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle } from '@/features/pdf/utils/naming';
import { PageThumb, ToolOutput } from '@/features/pdf/types';

export default function SplitPdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [file, setFile] = useState<ScannedFile | null>(preselected ?? null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pickerVisible, setPickerVisible] = useState(!preselected);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);

  const fileUri = file?.uri;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fileUri) {
        setPages([]);
        return;
      }
      setLoadingPages(true);
      setSelectedPages(new Set());
      const result = await renderAllPages(fileUri, 40);
      if (!cancelled) {
        setPages(result);
        setLoadingPages(false);
        if (result.length === 0) {
          Alert.alert('Could Not Read PDF', 'This file may be damaged or password protected.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUri]);

  const togglePage = (index: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPages(new Set(pages.map((_, i) => i)));
  };

  const handleSplit = async () => {
    if (!file?.uri || selectedPages.size === 0) return;
    setWorking(true);
    try {
      const title = buildOutputTitle('Split');
      const indices = [...selectedPages].sort((a, b) => a - b);
      const result = await splitPdf(file.uri, indices, title);
      const saved = await saveOutput({ ...result, title });
      setOutput(saved);
    } catch (err) {
      console.error('Split failed:', err);
      Alert.alert('Split Failed', 'This PDF could not be processed. It may be damaged or password protected.');
    } finally {
      setWorking(false);
    }
  };

  // 3-column thumbnail grid
  const thumbWidth = (windowWidth - 48 - 24) / 3;
  const thumbHeight = thumbWidth * 1.35;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ToolHeader title="Split PDF" subtitle="Select the pages to extract into a new file." />

        <View className="px-lg mb-lg">
          {file ? (
            <SelectedFileCard
              file={file}
              detail={pages.length > 0 ? `${pages.length} pages` : undefined}
              onRemove={() => {
                setFile(null);
                setPickerVisible(true);
              }}
            />
          ) : (
            <Pressable
              onPress={() => setPickerVisible(true)}
              className="flex-row items-center justify-center h-[52px] rounded-pill bg-primarySoft dark:bg-[#3D5AFE]/15 active:opacity-75"
            >
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={theme.primary} />
              <ThemedText className="font-inter-semibold text-body-large ml-xs" style={{ color: theme.primary }}>
                Select a File
              </ThemedText>
            </Pressable>
          )}
        </View>

        {/* Page grid */}
        {loadingPages && (
          <View className="items-center py-xl">
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-md">
              Rendering pages...
            </ThemedText>
          </View>
        )}

        {!loadingPages && pages.length > 0 && (
          <View className="px-lg">
            <View className="flex-row justify-between items-center mb-md">
              <ThemedText className="font-inter-semibold text-body-large">
                {selectedPages.size} of {pages.length} selected
              </ThemedText>
              <Pressable onPress={selectAll} className="active:opacity-75" hitSlop={8}>
                <ThemedText className="font-inter-semibold text-body-medium" style={{ color: theme.primary }}>
                  Select All
                </ThemedText>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {pages.map((page, index) => {
                const isSelected = selectedPages.has(index);
                return (
                  <Pressable
                    key={index}
                    onPress={() => togglePage(index)}
                    style={{ width: thumbWidth }}
                    className="active:opacity-75"
                  >
                    <View
                      className="rounded-md overflow-hidden bg-white"
                      style={{
                        height: thumbHeight,
                        borderWidth: 2,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                    >
                      <Image source={{ uri: page.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {isSelected && (
                        <View
                          className="absolute top-1 right-1 w-6 h-6 rounded-pill items-center justify-center"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <SymbolView
                            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                            size={12}
                            tintColor="#FFFFFF"
                          />
                        </View>
                      )}
                    </View>
                    <ThemedText themeColor="textSecondary" className="font-inter-regular text-caption text-center mt-xs">
                      {index + 1}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-lg" style={{ paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton
          label={selectedPages.size > 0 ? `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}` : 'Extract'}
          onPress={handleSplit}
          disabled={selectedPages.size === 0}
          loading={working}
        />
      </View>

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(picked) => setFile(picked[0] ?? null)}
      />
      <ToolProgress visible={working} label="Extracting pages..." />
      <ToolSuccess visible={!!output} output={output} onDone={() => { setOutput(null); router.back(); }} />
    </ScreenContainer>
  );
}
