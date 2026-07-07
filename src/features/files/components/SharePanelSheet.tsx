import React, { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ScannedFile } from '@/features/files/types';
import { formatBytes } from '@/features/pdf/utils/naming';

type SharePanelSheetProps = {
  visible: boolean;
  file: ScannedFile | null;
  onClose: () => void;
};

/** Share options sheet: PDF / JPG / PNG (per "share panel" mockup) */
export default function SharePanelSheet({ visible, file, onClose }: SharePanelSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [busy, setBusy] = useState(false);

  if (!visible || !file) return null;

  const shareUri = async (uri: string, mimeType: string) => {
    const Sharing = require('expo-sharing');
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType, dialogTitle: file.title });
    }
  };

  const handleSharePdf = async () => {
    if (!file.uri) return;
    onClose();
    try {
      await shareUri(file.uri, 'application/pdf');
    } catch (err) {
      console.warn('Share failed:', err);
    }
  };

  const handleShareImage = async (format: 'jpeg' | 'png') => {
    if (!file.uri || busy) return;
    setBusy(true);
    try {
      const { renderFirstPage } = require('@/features/pdf/services/pdf-thumbnails');
      const page = await renderFirstPage(file.uri, 90);
      if (!page) throw new Error('render failed');

      const { ImageManipulator, SaveFormat } = require('expo-image-manipulator');
      const rendered = await ImageManipulator.manipulate(page.uri).renderAsync();
      const saved = await rendered.saveAsync({
        compress: 0.9,
        format: format === 'jpeg' ? SaveFormat.JPEG : SaveFormat.PNG,
      });

      onClose();
      await shareUri(saved.uri, format === 'jpeg' ? 'image/jpeg' : 'image/png');
    } catch (err) {
      console.warn('Image share failed:', err);
      Alert.alert('Error', 'Could not convert this document to an image.');
    } finally {
      setBusy(false);
    }
  };

  const rows = [
    {
      label: 'Share PDF',
      hint: file.sizeBytes ? formatBytes(file.sizeBytes) : undefined,
      icon: { ios: 'doc.text', android: 'description', web: 'description' },
      onPress: handleSharePdf,
    },
    {
      label: 'Share JPG',
      hint: 'First page',
      icon: { ios: 'photo', android: 'image', web: 'image' },
      onPress: () => handleShareImage('jpeg'),
    },
    {
      label: 'Share PNG',
      hint: 'First page',
      icon: { ios: 'photo.on.rectangle', android: 'imagesmode', web: 'imagesmode' },
      onPress: () => handleShareImage('png'),
    },
  ];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
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
              }}
            >
              {/* Drag handle */}
              <View className="self-center w-9 h-1 rounded-pill bg-border mb-md" />

              <ThemedText className="font-inter-bold text-h3 text-center mb-md">Share</ThemedText>

              {rows.map((row, idx) => (
                <Pressable
                  key={idx}
                  onPress={row.onPress}
                  disabled={busy || !file.uri}
                  className={`flex-row items-center py-md px-xs rounded-lg active:bg-border/10 ${!file.uri ? 'opacity-40' : ''}`}
                >
                  <View className="w-9 h-9 items-center justify-center mr-md">
                    <SymbolView name={row.icon as any} size={20} tintColor={theme.text} />
                  </View>
                  <ThemedText className="font-inter-medium text-body-large">{row.label}</ThemedText>
                  {row.hint && (
                    <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small ml-sm">
                      ({row.hint})
                    </ThemedText>
                  )}
                </Pressable>
              ))}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
