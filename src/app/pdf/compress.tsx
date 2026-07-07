import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
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
import RadioOptionRow from '@/features/pdf/components/RadioOptionRow';
import ToolProgress from '@/features/pdf/components/ToolProgress';
import ToolSuccess from '@/features/pdf/components/ToolSuccess';
import { compressPdf } from '@/features/pdf/services/pdf-compress';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle, formatBytes } from '@/features/pdf/utils/naming';
import { CompressionLevel, ToolOutput } from '@/features/pdf/types';

const LEVELS: { key: CompressionLevel; title: string; subtitle: string }[] = [
  { key: 'high', title: 'High Compression', subtitle: 'Smallest size, lower quality' },
  { key: 'medium', title: 'Medium Compression', subtitle: 'Medium size, medium quality' },
  { key: 'low', title: 'Low Compression', subtitle: 'Largest size, better quality' },
];

export default function CompressPdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [file, setFile] = useState<ScannedFile | null>(preselected ?? null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [pickerVisible, setPickerVisible] = useState(!preselected);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);
  const [detail, setDetail] = useState<string | undefined>(undefined);

  const handleCompress = async () => {
    if (!file?.uri) return;
    setWorking(true);
    try {
      const title = buildOutputTitle('Compressed');
      const result = await compressPdf(file.uri, level, title);
      const saved = await saveOutput({
        uri: result.uri,
        sizeBytes: result.afterBytes,
        pageCount: result.pageCount,
        title,
      });
      setDetail(`${formatBytes(result.beforeBytes)} → ${formatBytes(result.afterBytes)}`);
      setOutput(saved);
    } catch (err) {
      console.error('Compress failed:', err);
      Alert.alert('Compression Failed', 'This PDF could not be processed. It may be damaged or password protected.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ToolHeader title="Compress PDF" subtitle="Reduce the size of your PDF file." />

        <View className="px-lg mb-lg">
          {file ? (
            <SelectedFileCard
              file={file}
              detail={file.sizeBytes ? `${file.date}  ${formatBytes(file.sizeBytes)}` : undefined}
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

        {/* Compression levels */}
        <View className="px-lg">
          <ThemedText className="font-inter-semibold text-body-large mb-xs">
            Select compression level:
          </ThemedText>
          {LEVELS.map((option) => (
            <RadioOptionRow
              key={option.key}
              title={option.title}
              subtitle={option.subtitle}
              selected={level === option.key}
              onPress={() => setLevel(option.key)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-lg" style={{ paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton label="Compress" onPress={handleCompress} disabled={!file} loading={working} />
      </View>

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(picked) => setFile(picked[0] ?? null)}
      />
      <ToolProgress visible={working} label="Compressing PDF..." />
      <ToolSuccess
        visible={!!output}
        output={output}
        detail={detail}
        onDone={() => { setOutput(null); router.back(); }}
      />
    </ScreenContainer>
  );
}
