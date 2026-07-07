import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
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
import { mergePdfs } from '@/features/pdf/services/pdf-merge';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle } from '@/features/pdf/utils/naming';
import { ToolOutput } from '@/features/pdf/types';

export default function MergePdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [selected, setSelected] = useState<ScannedFile[]>(preselected ? [preselected] : []);
  const [name, setName] = useState(buildOutputTitle('Merged'));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);

  const addFiles = (picked: ScannedFile[]) => {
    setSelected((prev) => {
      const existing = new Set(prev.map((f) => f.id));
      return [...prev, ...picked.filter((f) => !existing.has(f.id))];
    });
  };

  const removeFile = (id: string) => {
    setSelected((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (selected.length < 2 || !name.trim()) return;
    setWorking(true);
    try {
      const result = await mergePdfs(
        selected.map((f) => f.uri!),
        name.trim()
      );
      const saved = await saveOutput({ ...result, title: name.trim() });
      setOutput(saved);
    } catch (err) {
      console.error('Merge failed:', err);
      Alert.alert('Merge Failed', 'One of the selected PDFs could not be read. It may be damaged or password protected.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ToolHeader
          title="Merge PDF"
          subtitle={`${selected.length} selected file${selected.length !== 1 ? 's' : ''} to be merged`}
        />

        {/* File name input */}
        <View className="px-lg mb-lg">
          <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-small mb-xs">
            File Name
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            className="font-inter-semibold border-b border-border pb-sm"
            style={{ color: theme.text, fontSize: 18 }}
            placeholder="Merged document name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        {/* Selected files */}
        <View className="px-lg gap-md mb-lg">
          {selected.map((file) => (
            <SelectedFileCard key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}

          {/* Add more files */}
          <Pressable
            onPress={() => setPickerVisible(true)}
            className="flex-row items-center justify-center h-[52px] rounded-pill bg-primarySoft dark:bg-[#3D5AFE]/15 active:opacity-75"
          >
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={theme.primary} />
            <ThemedText className="font-inter-semibold text-body-large ml-xs" style={{ color: theme.primary }}>
              Add More Files
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-lg" style={{ paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton
          label="Merge"
          onPress={handleMerge}
          disabled={selected.length < 2 || !name.trim()}
          loading={working}
        />
      </View>

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={addFiles}
        multiple
      />
      <ToolProgress visible={working} label="Merging PDFs..." />
      <ToolSuccess visible={!!output} output={output} onDone={() => { setOutput(null); router.back(); }} />
    </ScreenContainer>
  );
}
