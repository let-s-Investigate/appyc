import React from 'react';
import { Image, Pressable, ScrollView, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useScannerStore } from '@/features/scanner/store/scannerStore';

interface ToolItem {
  name: string;
  description: string;
  icon: any; // Image asset or SymbolView name
  isSymbol?: boolean;
}

interface ToolCategory {
  title: string;
  items: ToolItem[];
}

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

  const CATEGORIES: ToolCategory[] = [
    {
      title: 'Scan Modes',
      items: [
        { name: 'Document Scan', description: 'Auto edge detection scanner', icon: 'doc.viewfinder', isSymbol: true },
        { name: 'QR & Barcode', description: 'Scan QR codes instantly', icon: Images.icons.scanCode },
        { name: 'ID Card Scan', description: 'Dual-side card layouts', icon: 'person.text.rectangle', isSymbol: true },
        { name: 'Book Scan', description: 'Curved page flattening scan', icon: 'book', isSymbol: true },
        { name: 'Business Card', description: 'Extract card contacts', icon: 'greetingcard', isSymbol: true },
      ],
    },
    {
      title: 'PDF & Image Tools',
      items: [
        { name: 'Add Watermark', description: 'Protect your files with overlays', icon: Images.icons.watermark },
        { name: 'Digital Signature', description: 'eSign documents securely', icon: Images.icons.esign },
        { name: 'Merge PDF', description: 'Combine files into single PDF', icon: Images.icons.mergePdf },
        { name: 'Split PDF', description: 'Extract pages from PDF', icon: Images.icons.splitPdf },
        { name: 'Compress PDF', description: 'Reduce PDF file size', icon: Images.icons.compressPdf },
        { name: 'Protect PDF', description: 'Add password encryption', icon: Images.icons.protectPdf },
      ],
    },
    {
      title: 'Export & OCR',
      items: [
        { name: 'Extract Text (OCR)', description: 'Convert image scans to TXT', icon: 'text.justify.left', isSymbol: true },
        { name: 'Convert to Word', description: 'Export to editable DOCX', icon: 'doc.text', isSymbol: true },
        { name: 'Convert to Excel', description: 'Export tabular data to XLSX', icon: 'tablecells', isSymbol: true },
      ],
    },
  ];

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
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
        contentContainerStyle={{ paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}
        className="flex-1 animate-fadeIn"
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
                  onPress={() => {
                    if (tool.name === 'Document Scan') {
                      handleDocumentScan();
                    }
                  }}
                  className="flex-row items-center p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] active:opacity-75"
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
                    <ThemedText className="font-inter-semibold text-body-large">
                      {tool.name}
                    </ThemedText>
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
    </ThemedView>
  );
}
