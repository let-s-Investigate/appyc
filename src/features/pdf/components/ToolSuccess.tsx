import React from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import PrimaryButton from '@/components/primary-button';
import { useTheme } from '@/hooks/use-theme';
import { ToolOutput } from '../types';
import { formatBytes } from '../utils/naming';

type ToolSuccessProps = {
  visible: boolean;
  output: ToolOutput | null;
  /** Optional extra line, e.g. "2.4 MB → 800 KB" for compression */
  detail?: string;
  /** Called after any action closes the sheet; typically navigates back */
  onDone: () => void;
};

/** Success sheet with Open / Share / Done actions shown after a tool finishes */
export default function ToolSuccess({ visible, output, detail, onDone }: ToolSuccessProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible || !output) return null;

  const handleShare = async () => {
    try {
      const Sharing = require('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(output.uri, {
          mimeType: 'application/pdf',
          dialogTitle: output.title,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (err) {
      console.warn('Share failed:', err);
      Alert.alert('Error', 'Could not open the share sheet.');
    }
  };

  const handleOpen = () => {
    onDone();
    router.push({ pathname: '/viewer', params: { fileId: output.fileId } });
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDone} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          className="absolute inset-0 bg-black/55"
        />
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
          }}
        >
          {/* Drag handle */}
          <View className="self-center w-9 h-1 rounded-pill bg-border mb-lg" />

          {/* Check icon */}
          <View className="items-center mb-lg">
            <View className="w-16 h-16 rounded-pill items-center justify-center bg-success/15 mb-md">
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                size={30}
                tintColor={theme.success}
              />
            </View>
            <ThemedText className="font-inter-bold text-h3 text-center">Success!</ThemedText>
            <ThemedText className="font-inter-semibold text-body-large text-center mt-xs" numberOfLines={1}>
              {output.title}.pdf
            </ThemedText>
            <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small text-center mt-xs">
              {detail ?? `${output.pageCount} page${output.pageCount !== 1 ? 's' : ''} • ${formatBytes(output.sizeBytes)}`}
            </ThemedText>
          </View>

          {/* Actions */}
          <View className="gap-sm">
            <PrimaryButton label="Open" onPress={handleOpen} />
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <PrimaryButton label="Share" variant="secondary" onPress={handleShare} />
              </View>
              <View className="flex-1">
                <PrimaryButton label="Done" variant="secondary" onPress={onDone} />
              </View>
            </View>
          </View>

          {/* Saved note */}
          <Pressable onPress={onDone} className="items-center mt-md">
            <ThemedText themeColor="textSecondary" className="font-inter-regular text-caption">
              Saved to your files
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
