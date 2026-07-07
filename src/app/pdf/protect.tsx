import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
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
import { protectPdf } from '@/features/pdf/services/pdf-protect';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle } from '@/features/pdf/utils/naming';
import { ToolOutput } from '@/features/pdf/types';

export default function ProtectPdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [file, setFile] = useState<ScannedFile | null>(preselected ?? null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(!preselected);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);

  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit = !!file && passwordsMatch;

  const handleProtect = async () => {
    if (!file?.uri || !passwordsMatch) return;
    setWorking(true);
    try {
      const title = buildOutputTitle('Protected');
      const result = await protectPdf(file.uri, password, title);
      const saved = await saveOutput({ ...result, title });
      setOutput(saved);
    } catch (err) {
      console.error('Protect failed:', err);
      Alert.alert('Protection Failed', 'This PDF could not be encrypted. It may be damaged or already protected.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" keyboardShouldPersistTaps="handled">
          <ToolHeader title="Protect PDF" subtitle="Encrypt your PDF with a password." />

          <View className="px-lg mb-lg">
            {file ? (
              <SelectedFileCard
                file={file}
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

          {/* Password inputs */}
          <View className="px-lg gap-md">
            <View>
              <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-small mb-xs">
                Password
              </ThemedText>
              <View className="flex-row items-center border border-border rounded-md">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="Enter password"
                  placeholderTextColor={theme.textSecondary}
                  className="flex-1 p-md font-inter-regular"
                  style={{ color: theme.text, fontSize: 16 }}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="w-12 h-12 items-center justify-center"
                  hitSlop={8}
                >
                  <SymbolView
                    name={showPassword
                      ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                      : { ios: 'eye', android: 'visibility', web: 'visibility' }}
                    size={20}
                    tintColor={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View>
              <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-small mb-xs">
                Confirm Password
              </ThemedText>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Repeat password"
                placeholderTextColor={theme.textSecondary}
                className="p-md border border-border rounded-md font-inter-regular"
                style={{ color: theme.text, fontSize: 16 }}
              />
              {confirm.length > 0 && !passwordsMatch && (
                <ThemedText className="font-inter-regular text-body-small mt-xs" style={{ color: theme.error }}>
                  Passwords do not match
                </ThemedText>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="px-lg" style={{ paddingBottom: insets.bottom + 16 }}>
          <PrimaryButton label="Protect" onPress={handleProtect} disabled={!canSubmit} loading={working} />
        </View>
      </KeyboardAvoidingView>

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(picked) => setFile(picked[0] ?? null)}
      />
      <ToolProgress visible={working} label="Encrypting PDF..." />
      <ToolSuccess visible={!!output} output={output} onDone={() => { setOutput(null); router.back(); }} />
    </ScreenContainer>
  );
}
