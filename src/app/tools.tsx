import React from 'react';
import { Image, Pressable, ScrollView, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import ScreenContainer from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useScannerStore } from '@/features/scanner/store/scannerStore';

interface ToolItem {
  name: string;
  description: string;
  icon: any; // Image asset or SymbolView ios name
  isSymbol?: boolean;
  /** Route pushed on press; use action for custom handlers */
  route?: string;
  action?: 'scan';
  comingSoon?: boolean;
}

interface ToolCategory {
  title: string;
  items: ToolItem[];
}

const CATEGORIES: ToolCategory[] = [
  {
    title: 'Scan & Capture',
    items: [
      { name: 'Scan to PDF', description: 'Multi-page camera capture with auto-crop', icon: 'doc.viewfinder', isSymbol: true, action: 'scan' },
      { name: 'Image to PDF', description: 'Combine gallery photos into a PDF', icon: Images.icons.gallery, comingSoon: true },
      { name: 'QR & Barcode', description: 'Scan QR codes instantly', icon: Images.icons.scanCode, comingSoon: true },
      { name: 'ID Card Scan', description: 'Dual-side card layouts', icon: 'person.text.rectangle', isSymbol: true, comingSoon: true },
    ],
  },
  {
    title: 'Organize',
    items: [
      { name: 'Merge PDF', description: 'Combine files into a single PDF', icon: Images.icons.mergePdf, route: '/pdf/merge' },
      { name: 'Split PDF', description: 'Extract pages into a new file', icon: Images.icons.splitPdf, route: '/pdf/split' },
      { name: 'Organize Pages', description: 'Reorder, add, and delete pages', icon: 'square.grid.2x2', isSymbol: true, comingSoon: true },
      { name: 'Rotate PDF', description: 'Rotate selected or all pages', icon: 'rotate.right', isSymbol: true, comingSoon: true },
      { name: 'Page Numbers', description: 'Insert page numbers', icon: 'number', isSymbol: true, comingSoon: true },
      { name: 'Crop PDF', description: 'Trim margins or a selected area', icon: 'crop', isSymbol: true, comingSoon: true },
    ],
  },
  {
    title: 'Optimize',
    items: [
      { name: 'Compress PDF', description: 'Reduce PDF file size', icon: Images.icons.compressPdf, route: '/pdf/compress' },
      { name: 'Repair PDF', description: 'Recover a damaged PDF', icon: 'wrench.and.screwdriver', isSymbol: true, comingSoon: true },
      { name: 'OCR PDF', description: 'Make scanned PDFs searchable', icon: 'text.viewfinder', isSymbol: true, comingSoon: true },
    ],
  },
  {
    title: 'Edit',
    items: [
      { name: 'Add Watermark', description: 'Stamp text or logo overlays', icon: Images.icons.watermark, route: '/pdf/watermark' },
      { name: 'Edit PDF', description: 'Add text, shapes, and annotations', icon: 'pencil.and.outline', isSymbol: true, comingSoon: true },
      { name: 'PDF Forms', description: 'Fill and create form fields', icon: 'list.bullet.rectangle', isSymbol: true, comingSoon: true },
    ],
  },
  {
    title: 'Security',
    items: [
      { name: 'Sign PDF', description: 'eSign documents securely', icon: Images.icons.esign, route: '/pdf/sign' },
      { name: 'Protect PDF', description: 'Add password encryption', icon: Images.icons.protectPdf, route: '/pdf/protect' },
      { name: 'Unlock PDF', description: 'Remove a known password', icon: 'lock.open', isSymbol: true, comingSoon: true },
      { name: 'Redact PDF', description: 'Permanently remove content', icon: 'rectangle.fill.on.rectangle.fill', isSymbol: true, comingSoon: true },
      { name: 'Compare PDF', description: 'Highlight version differences', icon: 'rectangle.on.rectangle', isSymbol: true, comingSoon: true },
    ],
  },
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { setPages } = useScannerStore();

  const handleDocumentScan = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow camera access to scan documents.');
        return;
      }

      const DocumentScanner = require('react-native-document-scanner-plugin').default;
      const { scannedImages, status: scanStatus } = await DocumentScanner.scanDocument();

      if (scanStatus === 'success' && scannedImages && scannedImages.length > 0) {
        setPages(scannedImages);
        router.push('/editor');
      }
    } catch (err) {
      console.warn('Native Document Scanner failed or not available:', err);
      Alert.alert(
        'Scanner Mock Sandbox',
        'The native edge-detection scanner requires a physical device. Would you like to select photos from your library to test the custom editor?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Select Photos',
            onPress: async () => {
              const ImagePicker = require('expo-image-picker');
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const uris = result.assets.map((asset: any) => asset.uri);
                setPages(uris);
                router.push('/editor');
              }
            }
          }
        ]
      );
    }
  };

  const handleToolPress = (tool: ToolItem) => {
    if (tool.comingSoon) return;
    if (tool.action === 'scan') {
      handleDocumentScan();
      return;
    }
    if (tool.route) {
      router.push(tool.route as any);
    }
  };

  return (
    <ScreenContainer>
      {/* Header bar */}
      <View className="flex-row justify-between items-center px-lg py-xs mb-xs">
        <View className="flex-row items-center">
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center rounded-full mr-sm active:bg-border/20"
            hitSlop={8}
          >
            <Image
              source={Images.icons.back}
              className="w-6 h-6"
              style={{ tintColor: theme.text }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Page Title */}
          <ThemedText className="font-inter-extrabold text-h2 tracking-tight">
            All Tools
          </ThemedText>
        </View>
      </View>

      {/* Scrollable grid */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {CATEGORIES.map((category, catIdx) => (
          <View key={catIdx} className="mb-lg">
            {/* Category Header */}
            <ThemedText className="px-lg font-inter-bold text-h3 mb-sm">
              {category.title}
            </ThemedText>

            {/* Grid of tool cards */}
            <View className="px-lg gap-md">
              {category.items.map((tool, itemIdx) => (
                <Pressable
                  key={itemIdx}
                  onPress={() => handleToolPress(tool)}
                  className={`flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] active:opacity-75 ${tool.comingSoon ? 'opacity-50' : ''}`}
                >
                  {/* Icon container */}
                  <View className="w-12 h-12 rounded-lg items-center justify-center bg-primarySoft dark:bg-[#3D5AFE]/15 mr-md">
                    {tool.isSymbol ? (
                      <SymbolView
                        name={{ ios: tool.icon, android: 'construction', web: 'construction' }}
                        size={24}
                        tintColor={theme.primary}
                      />
                    ) : (
                      <Image
                        source={tool.icon}
                        className="w-6 h-6"
                        style={{ tintColor: theme.primary }}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  {/* Tool details */}
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <ThemedText className="font-inter-semibold text-body-large">
                        {tool.name}
                      </ThemedText>
                      {tool.comingSoon && (
                        <View className="ml-sm px-sm py-[2px] rounded-pill bg-border/40">
                          <ThemedText themeColor="textSecondary" className="font-inter-semibold text-[10px]">
                            SOON
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText themeColor="textSecondary" className="font-inter-regular text-body-small mt-xs">
                      {tool.description}
                    </ThemedText>
                  </View>

                  {/* Chevron right */}
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={16}
                    tintColor={theme.textSecondary}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
