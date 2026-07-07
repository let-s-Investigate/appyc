import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  View,
  Text,
  TextInput,
  Modal,
  Switch,
  PanResponder,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { useScannerStore } from '@/features/scanner/store/scannerStore';
import { useFilesStore } from '@/features/files/store/filesStore';
import FolderIcon from '@/features/files/components/FolderIcon';
import BottomSheetMenu, { SheetMenuItem } from '@/components/bottom-sheet-menu';

const TOUCH_HANDLE_SIZE = 48;
const CORNER_HANDLE_SIZE = 20;
const SIDE_HANDLE_WIDTH = 16;
const SIDE_HANDLE_HEIGHT = 8;
const A4_ASPECT_RATIO = 0.707;
const HEADER_HEIGHT = 56;
const TOOLBAR_HEIGHT = 72;
const BOTTOM_BAR_HEIGHT = 68;

// ─── Discard Confirmation Sheet ───
function DiscardSheet({
  visible,
  onClose,
  onConfirm,
  theme,
  insetBottom
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme: any;
  insetBottom: number;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))} exiting={SlideOutDown.duration(200)} style={{ backgroundColor: '#1C1C24', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: insetBottom + 16, paddingHorizontal: 20 }}>
              <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 }} />
              <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,59,48,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={24} tintColor="#FF3B30" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Discard Scan?</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '400', textAlign: 'center', marginTop: 6 }}>All scanned pages will be permanently lost. This action cannot be undone.</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={onClose} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 14, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Keep Editing</Text>
                </Pressable>
                <Pressable onPress={() => { onClose(); onConfirm(); }} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 14, backgroundColor: pressed ? '#CC2D26' : '#FF3B30', alignItems: 'center', justifyContent: 'center' })}>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Discard</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default function DocumentEditorScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const {
    pages,
    currentPageIndex,
    title,
    updatePage,
    deletePage,
    setTitle,
    clear,
    appendPages
  } = useScannerStore();

  const { folders, addFolder, addFile } = useFilesStore();

  const scrollViewRef = useRef<ScrollView>(null);

  const [filterBarVisible, setFilterBarVisible] = useState(false);
  const [isCropEditing, setIsCropEditing] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // Toggle states
  const [fitEnabled, setFitEnabled] = useState(false);
  const [applyToAll, setApplyToAll] = useState(true);

  // Bottom sheet menu states
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [retakeMenuVisible, setRetakeMenuVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  // Page indicator visibility (auto-hide after swipe)
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const pageIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePage = pages[currentPageIndex] || null;
  const [localCrop, setLocalCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });

  // Sync fitEnabled toggle with active page's fitPage value
  useEffect(() => {
    if (activePage) {
      setFitEnabled(activePage.fitPage ?? false);
    }
  }, [currentPageIndex, activePage?.fitPage]);

  // Synchronize ScrollView offset when currentPageIndex changes externally
  useEffect(() => {
    if (scrollViewRef.current && pages.length > 0) {
      scrollViewRef.current.scrollTo({ x: currentPageIndex * windowWidth, animated: true });
    }
  }, [currentPageIndex, pages.length]);

  // Helper: apply an update to one page or all pages based on applyToAll toggle
  const applyUpdate = useCallback((updates: Record<string, any>) => {
    if (applyToAll) {
      pages.forEach((_, idx) => { updatePage(idx, updates); });
    } else {
      updatePage(currentPageIndex, updates);
    }
  }, [applyToAll, currentPageIndex, pages.length]);

  const handleFitToggle = (value: boolean) => {
    setFitEnabled(value);
    applyUpdate({ fitPage: value });
  };

  const handleApplyToAllToggle = (value: boolean) => {
    setApplyToAll(value);
    if (value && activePage) {
      pages.forEach((_, idx) => {
        updatePage(idx, {
          fitPage: fitEnabled,
          filter: activePage.filter,
          rotation: activePage.rotation
        });
      });
    }
  };

  const flashPageIndicator = useCallback(() => {
    setShowPageIndicator(true);
    if (pageIndicatorTimer.current) clearTimeout(pageIndicatorTimer.current);
    pageIndicatorTimer.current = setTimeout(() => setShowPageIndicator(false), 2000);
  }, []);

  const handleStartCrop = () => {
    if (activePage) {
      setLocalCrop(activePage.crop || { x: 0.0, y: 0.0, w: 1.0, h: 1.0 });
      setIsCropEditing(true);
      setFilterBarVisible(false);
    }
  };

  const handleApplyCrop = () => {
    if (activePage) {
      updatePage(currentPageIndex, { crop: localCrop });
      setIsCropEditing(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropEditing(false);
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const createHandleResponder = (handleType: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (imageLayout.width === 0 || imageLayout.height === 0) return;
        const dx = gestureState.dx / imageLayout.width;
        const dy = gestureState.dy / imageLayout.height;

        setLocalCrop((prev) => {
          const { x, y, w, h } = prev;

          if (handleType === 'tl' || handleType === 't' || handleType === 'l') {
            const nextX = handleType !== 't' ? clamp(x + dx, 0, x + w - 0.1) : x;
            const nextY = handleType !== 'l' ? clamp(y + dy, 0, y + h - 0.1) : y;
            const nextW = handleType !== 't' ? clamp(w - (nextX - x), 0.1, 1 - nextX) : w;
            const nextH = handleType !== 'l' ? clamp(h - (nextY - y), 0.1, 1 - nextY) : h;
            return { x: nextX, y: nextY, w: nextW, h: nextH };
          }
          if (handleType === 'tr') {
            const nextY = clamp(y + dy, 0, y + h - 0.1);
            const nextW = clamp(w + dx, 0.1, 1 - x);
            const nextH = clamp(h - (nextY - y), 0.1, 1 - nextY);
            return { x, y: nextY, w: nextW, h: nextH };
          }
          if (handleType === 'bl') {
            const nextX = clamp(x + dx, 0, x + w - 0.1);
            const nextW = clamp(w - (nextX - x), 0.1, 1 - nextX);
            const nextH = clamp(h + dy, 0.1, 1 - y);
            return { x: nextX, y, w: nextW, h: nextH };
          }
          if (handleType === 'br') {
            const nextW = clamp(w + dx, 0.1, 1 - x);
            const nextH = clamp(h + dy, 0.1, 1 - y);
            return { x, y, w: nextW, h: nextH };
          }
          if (handleType === 'b') {
            const nextH = clamp(h + dy, 0.1, 1 - y);
            return { x, y, w, h: nextH };
          }
          if (handleType === 'r') {
            const nextW = clamp(w + dx, 0.1, 1 - x);
            return { x, y, w: nextW, h };
          }
          return prev;
        });
      },
      onPanResponderEnd: () => {}
    });
  };

  const TLResponder = useRef(createHandleResponder('tl')).current;
  const TRResponder = useRef(createHandleResponder('tr')).current;
  const BLResponder = useRef(createHandleResponder('bl')).current;
  const BRResponder = useRef(createHandleResponder('br')).current;
  const TResponder = useRef(createHandleResponder('t')).current;
  const BResponder = useRef(createHandleResponder('b')).current;
  const LResponder = useRef(createHandleResponder('l')).current;
  const RResponder = useRef(createHandleResponder('r')).current;

  const handleScanMore = async () => {
    try {
      const DocumentScanner = require('react-native-document-scanner-plugin').default;
      const { scannedImages, status } = await DocumentScanner.scanDocument();
      if (status === 'success' && scannedImages && scannedImages.length > 0) {
        appendPages(scannedImages);
      }
    } catch (err) {
      console.warn('Native Scanner not available, opening gallery instead');
      handleImportGallery();
    }
  };

  const handleImportGallery = async () => {
    const ImagePicker = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset: any) => asset.uri);
      appendPages(uris);
    }
  };

  const applyFilter = (filterType: 'none' | 'grayscale' | 'magic' | 'bw') => {
    applyUpdate({ filter: filterType });
    setFilterBarVisible(false);
  };

  // Retake via Camera
  const handleRetakeCamera = async () => {
    try {
      const DocumentScanner = require('react-native-document-scanner-plugin').default;
      const { scannedImages, status } = await DocumentScanner.scanDocument();
      if (status === 'success' && scannedImages && scannedImages.length > 0) {
        updatePage(currentPageIndex, {
          uri: scannedImages[0], originalUri: scannedImages[0],
          crop: null, filter: 'none', rotation: 0
        });
      }
    } catch (err) {
      console.warn('Camera failed');
    }
  };

  // Retake via Gallery
  const handleRetakeGallery = async () => {
    const ImagePicker = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      updatePage(currentPageIndex, {
        uri: result.assets[0].uri, originalUri: result.assets[0].uri,
        crop: null, filter: 'none', rotation: 0
      });
    }
  };

  const handleDeletePage = () => {
    if (pages.length === 1) {
      clear();
      router.back();
    } else {
      deletePage(currentPageIndex);
    }
  };

  const handleSaveDocument = () => {
    if (pages.length === 0) return;
    setSaveModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!title.trim()) return;

    setIsGeneratingPdf(true);
    setSaveModalVisible(false);

    try {
      let pagesHtml = '';
      for (const page of pages) {
        const rotationStyle = `transform: rotate(${page.rotation}deg);`;
        let filterStyle = '';
        if (page.filter === 'grayscale') filterStyle = 'filter: grayscale(100%);';
        else if (page.filter === 'magic') filterStyle = 'filter: contrast(130%) brightness(110%);';
        else if (page.filter === 'bw') filterStyle = 'filter: contrast(200%) grayscale(100%);';

        const objectFitStyle = page.fitPage ? 'cover' : 'contain';
        let imageElementHtml = `<img src="${page.uri}" style="width:100%; height:100%; object-fit:${objectFitStyle}; ${rotationStyle} ${filterStyle}" />`;
        if (page.crop) {
          const { x, y, w, h } = page.crop;
          const containerStyle = `position:relative; overflow:hidden; width:100%; height:100%;`;
          const cropImgStyle = `position:absolute; left:-${x * 100}%; top:-${y * 100}%; width:${100 / w}%; height:${100 / h}%; object-fit:${objectFitStyle}; ${rotationStyle} ${filterStyle}`;
          imageElementHtml = `<div style="${containerStyle}"><img src="${page.uri}" style="${cropImgStyle}" /></div>`;
        }

        pagesHtml += `
          <div style="page-break-after:always; width:595px; height:842px; display:flex; justify-content:center; align-items:center; box-sizing:border-box; padding:20px; background-color:#ffffff;">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
              ${imageElementHtml}
            </div>
          </div>`;
      }

      const fullHtml = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:#fff;}</style></head><body>${pagesHtml}</body></html>`;
      const printResult = await Print.printToFileAsync({ html: fullHtml, base64: false });

      const sanitizeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${sanitizeTitle}_${Date.now()}.pdf`;
      const persistentPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({ from: printResult.uri, to: persistentPath });

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formattedDate = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
      const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const fileInfo = await FileSystem.getInfoAsync(persistentPath);
      addFile({
        title: title.trim(), date: formattedDate, time: formattedTime,
        thumbnail: { uri: pages[0].uri }, uri: persistentPath, folderId: selectedFolderId,
        sizeBytes: fileInfo.exists ? fileInfo.size : undefined, pageCount: pages.length
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(persistentPath, {
          mimeType: 'application/pdf', dialogTitle: title, UTI: 'com.adobe.pdf'
        });
      }

      clear();
      router.replace('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName('');
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / windowWidth);
    if (pageIndex !== currentPageIndex && pageIndex >= 0 && pageIndex < pages.length) {
      useScannerStore.setState({ currentPageIndex: pageIndex });
      flashPageIndicator();
    }
  };

  // Safe top padding
  const safeTop = insets.top + 8;

  const toggleRowHeight = !isCropEditing ? 44 : 0;
  const filterBarHeight = filterBarVisible && !isCropEditing ? 52 : 0;
  const availableVerticalSpace = windowHeight - safeTop - HEADER_HEIGHT - toggleRowHeight - TOOLBAR_HEIGHT - BOTTOM_BAR_HEIGHT - filterBarHeight - (isCropEditing ? 80 : 0) - insets.bottom - 24;
  const containerWidth = Math.min(windowWidth * 0.88, availableVerticalSpace * A4_ASPECT_RATIO);
  const containerHeight = containerWidth / A4_ASPECT_RATIO;

  // Render crop handles
  const renderCornerHandle = (responder: any, position: Record<string, any>) => (
    <View {...responder.panHandlers} style={{ position: 'absolute', ...position, width: TOUCH_HANDLE_SIZE, height: TOUCH_HANDLE_SIZE, alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <View style={{ width: CORNER_HANDLE_SIZE, height: CORNER_HANDLE_SIZE, borderRadius: CORNER_HANDLE_SIZE / 2, backgroundColor: '#FFFFFF', borderColor: '#3D5AFE', borderWidth: 3 }} />
    </View>
  );

  const renderSideHandle = (responder: any, position: Record<string, any>, vertical: boolean) => (
    <View {...responder.panHandlers} style={{ position: 'absolute', ...position, width: TOUCH_HANDLE_SIZE, height: TOUCH_HANDLE_SIZE, alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
      <View style={{ width: vertical ? SIDE_HANDLE_HEIGHT : SIDE_HANDLE_WIDTH, height: vertical ? SIDE_HANDLE_WIDTH : SIDE_HANDLE_HEIGHT, backgroundColor: '#FFFFFF', borderColor: '#3D5AFE', borderWidth: 2, borderRadius: 1 }} />
    </View>
  );

  // ─── More Menu Items ───
  const moreMenuItems: SheetMenuItem[] = [
    {
      label: 'Retake This Page',
      icon: { ios: 'arrow.triangle.2.circlepath.camera', android: 'refresh', web: 'refresh' },
      onPress: () => setRetakeMenuVisible(true)
    },
    {
      label: 'Import from Gallery',
      icon: { ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' },
      onPress: handleImportGallery
    },
    {
      label: `Delete Page ${currentPageIndex + 1}`,
      icon: { ios: 'trash', android: 'delete', web: 'delete' },
      destructive: true,
      onPress: handleDeletePage
    },
    {
      label: 'Discard All & Exit',
      icon: { ios: 'xmark.circle', android: 'cancel', web: 'cancel' },
      destructive: true,
      onPress: () => setDiscardVisible(true)
    }
  ];

  // ─── Retake Menu Items ───
  const retakeMenuItems: SheetMenuItem[] = [
    {
      label: 'Retake with Camera',
      icon: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
      onPress: handleRetakeCamera
    },
    {
      label: 'Replace from Gallery',
      icon: { ios: 'photo', android: 'image', web: 'image' },
      onPress: handleRetakeGallery
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D12' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />

      {/* Safe area spacer */}
      <View style={{ height: safeTop, backgroundColor: '#0D0D12' }} />

      {/* ─── Header ─── */}
      <View style={{ height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#0D0D12', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Pressable
            onPress={isCropEditing ? handleCancelCrop : () => setDiscardVisible(true)}
            hitSlop={8}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginRight: 8, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
          >
            <Image source={Images.icons.back} style={{ width: 22, height: 22, tintColor: '#FFFFFF' }} resizeMode="contain" />
          </Pressable>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{ flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginRight: 12 }}
            placeholder="Scan Title"
            placeholderTextColor="rgba(255,255,255,0.35)"
            editable={!isCropEditing}
          />
        </View>

        {!isCropEditing && pages.length > 0 && (
          <Pressable
            onPress={() => setMoreMenuVisible(true)}
            hitSlop={8}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
          >
            <SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={20} tintColor="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* ─── Toggle Row (below header) ─── */}
      {!isCropEditing && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0D0D12' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>Fit to Page</Text>
            <Switch
              value={fitEnabled}
              onValueChange={handleFitToggle}
              trackColor={{ false: '#3A3A42', true: theme.primary }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3A3A42"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>Apply to All</Text>
            <Switch
              value={applyToAll}
              onValueChange={handleApplyToAllToggle}
              trackColor={{ false: '#3A3A42', true: theme.primary }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3A3A42"
            />
          </View>
        </View>
      )}

      {/* ─── Canvas ─── */}
      <View style={{ flex: 1, backgroundColor: '#1A1816', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        {pages.length === 0 ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: '#FFFFFF', marginTop: 16 }}>Loading scanned pages...</Text>
          </View>
        ) : (
          <>
            {/* Wood grain lines */}
            <View className="absolute inset-0">
              <View className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-black/20" />
              <View className="absolute top-0 bottom-0 left-2/4 w-[1px] bg-black/20" />
              <View className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-black/20" />
              <View className="absolute top-1/4 left-0 right-0 h-[1px] bg-black/15" />
              <View className="absolute top-2/4 left-0 right-0 h-[1px] bg-black/15" />
              <View className="absolute top-3/4 left-0 right-0 h-[1px] bg-black/15" />
            </View>

            {/* Horizontal swipable pages */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={!isCropEditing}
              onMomentumScrollEnd={handleScroll}
              ref={scrollViewRef}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              {pages.map((page, idx) => {
                const isSelected = idx === currentPageIndex;
                const pageFit = page.fitPage;

                return (
                  <View key={page.id} style={{ width: windowWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View
                      style={{ width: containerWidth, height: containerHeight, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12, overflow: 'hidden', borderRadius: 12 }}
                      onLayout={(e) => { if (isSelected) { const { x, y, width, height } = e.nativeEvent.layout; setImageLayout({ x, y, width, height }); } }}
                    >
                      <View style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                        <View style={{ width: '100%', height: '100%', transform: [{ rotate: `${page.rotation}deg` }], position: 'relative' }}>
                          {page.crop && !isCropEditing ? (
                            <View style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                              <Image
                                source={{ uri: page.uri }}
                                style={{ position: 'absolute', left: `${-page.crop.x * 100}%`, top: `${-page.crop.y * 100}%`, width: `${100 / page.crop.w}%`, height: `${100 / page.crop.h}%`, opacity: page.filter === 'grayscale' || page.filter === 'bw' ? 0.9 : 1 }}
                                resizeMode={pageFit ? 'cover' : 'contain'}
                              />
                            </View>
                          ) : (
                            <Image
                              source={{ uri: page.uri }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode={isCropEditing || pageFit ? 'cover' : 'contain'}
                            />
                          )}

                          {/* Filter overlays */}
                          {page.filter === 'grayscale' && <View className="absolute inset-0 bg-black/10" pointerEvents="none"><View className="absolute inset-0 bg-gray-500/20" /></View>}
                          {page.filter === 'magic' && <View className="absolute inset-0 bg-white/10" pointerEvents="none"><View className="absolute inset-0 bg-yellow-100/5" /></View>}
                          {page.filter === 'bw' && <View className="absolute inset-0 bg-zinc-600/30" pointerEvents="none" />}
                        </View>

                        {/* Crop overlay */}
                        {isCropEditing && isSelected && (
                          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="absolute inset-0 bg-black/40">
                            <View style={{ position: 'absolute', left: `${localCrop.x * 100}%`, top: `${localCrop.y * 100}%`, width: `${localCrop.w * 100}%`, height: `${localCrop.h * 100}%`, borderWidth: 2, borderColor: '#3D5AFE' }}>
                              {renderCornerHandle(TLResponder, { left: -TOUCH_HANDLE_SIZE / 2, top: -TOUCH_HANDLE_SIZE / 2 })}
                              {renderCornerHandle(TRResponder, { right: -TOUCH_HANDLE_SIZE / 2, top: -TOUCH_HANDLE_SIZE / 2 })}
                              {renderCornerHandle(BLResponder, { left: -TOUCH_HANDLE_SIZE / 2, bottom: -TOUCH_HANDLE_SIZE / 2 })}
                              {renderCornerHandle(BRResponder, { right: -TOUCH_HANDLE_SIZE / 2, bottom: -TOUCH_HANDLE_SIZE / 2 })}
                              {renderSideHandle(TResponder, { left: '50%', top: -TOUCH_HANDLE_SIZE / 2, marginLeft: -TOUCH_HANDLE_SIZE / 2 }, false)}
                              {renderSideHandle(BResponder, { left: '50%', bottom: -TOUCH_HANDLE_SIZE / 2, marginLeft: -TOUCH_HANDLE_SIZE / 2 }, false)}
                              {renderSideHandle(LResponder, { left: -TOUCH_HANDLE_SIZE / 2, top: '50%', marginTop: -TOUCH_HANDLE_SIZE / 2 }, true)}
                              {renderSideHandle(RResponder, { right: -TOUCH_HANDLE_SIZE / 2, top: '50%', marginTop: -TOUCH_HANDLE_SIZE / 2 }, true)}
                            </View>
                          </Animated.View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pagination pill — only visible briefly after swiping */}
            {!isCropEditing && pages.length > 1 && showPageIndicator && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(400)} style={{ position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>{currentPageIndex + 1} / {pages.length}</Text>
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* ─── Crop Action Bar ─── */}
      {isCropEditing && (
        <Animated.View entering={SlideInDown.duration(200)} exiting={SlideOutDown.duration(200)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 72, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0D0D12', gap: 12 }}>
          <Pressable onPress={handleCancelCrop} style={({ pressed }) => ({ flex: 1, height: 44, borderRadius: 14, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleApplyCrop} style={({ pressed }) => ({ flex: 1, height: 44, borderRadius: 14, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, alignItems: 'center', justifyContent: 'center' })}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Apply Crop</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* ─── Filter Sub-Options ─── */}
      {filterBarVisible && !isCropEditing && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#131318', gap: 8 }}>
          {[{ id: 'none', label: 'Original' }, { id: 'grayscale', label: 'Grayscale' }, { id: 'magic', label: 'Magic Color' }, { id: 'bw', label: 'B&W' }].map((f) => (
            <Pressable
              key={f.id}
              onPress={() => applyFilter(f.id as any)}
              style={({ pressed }) => ({ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: activePage?.filter === f.id ? theme.primary : pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500' }}>{f.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* ─── Toolbar ─── */}
      {!isCropEditing && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: TOOLBAR_HEIGHT, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0D0D12' }}>
          <Pressable onPress={() => { const next = activePage?.filter === 'magic' ? 'none' : 'magic'; applyUpdate({ filter: next }); }} style={{ alignItems: 'center', justifyContent: 'center', width: 52, paddingVertical: 4 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: activePage?.filter === 'magic' ? theme.primary : 'transparent' }}>
              <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_fix_high', web: 'auto_fix_high' }} size={19} tintColor="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>Auto</Text>
          </Pressable>

          <Pressable onPress={handleImportGallery} style={{ alignItems: 'center', justifyContent: 'center', width: 52, paddingVertical: 4 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }}>
              <SymbolView name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} size={19} tintColor="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>Gallery</Text>
          </Pressable>

          <Pressable onPress={handleStartCrop} style={{ alignItems: 'center', justifyContent: 'center', width: 52, paddingVertical: 4 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }}>
              <SymbolView name={{ ios: 'crop', android: 'crop', web: 'crop' }} size={19} tintColor="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>Crop</Text>
          </Pressable>

          <Pressable onPress={() => { if (activePage) applyUpdate({ rotation: (activePage.rotation + 90) % 360 }); }} style={{ alignItems: 'center', justifyContent: 'center', width: 52, paddingVertical: 4 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }}>
              <SymbolView name={{ ios: 'rotate.right', android: 'rotate_right', web: 'rotate_right' }} size={19} tintColor="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>Rotate</Text>
          </Pressable>

          <Pressable onPress={() => setFilterBarVisible(!filterBarVisible)} style={{ alignItems: 'center', justifyContent: 'center', width: 52, paddingVertical: 4 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: filterBarVisible ? theme.primary : 'transparent' }}>
              <SymbolView name={{ ios: 'camera.filters', android: 'tune', web: 'tune' }} size={19} tintColor="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>Filter</Text>
          </Pressable>
        </View>
      )}

      {/* ─── Bottom Actions ─── */}
      {!isCropEditing && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: insets.bottom + 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0D0D12', gap: 12 }}>
          <Pressable onPress={handleScanMore} style={({ pressed }) => ({ height: 48, flex: 1, backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' })}>
            <SymbolView name={{ ios: 'plus.circle', android: 'add_circle', web: 'add_circle' }} size={17} tintColor="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Scan More</Text>
          </Pressable>

          <Pressable onPress={handleSaveDocument} style={({ pressed }) => ({ height: 48, flex: 1, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' })}>
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <SymbolView name={{ ios: 'doc.plaintext', android: 'article', web: 'article' }} size={17} tintColor="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Save PDF</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* ─── More Menu Bottom Sheet ─── */}
      <BottomSheetMenu
        visible={moreMenuVisible}
        title="Page Options"
        subtitle={pages.length > 0 ? `Page ${currentPageIndex + 1} of ${pages.length}` : undefined}
        items={moreMenuItems}
        onClose={() => setMoreMenuVisible(false)}
        insetBottom={insets.bottom}
      />

      {/* ─── Retake Menu Bottom Sheet ─── */}
      <BottomSheetMenu
        visible={retakeMenuVisible}
        title="Retake This Page"
        subtitle="Replace the current page with a new scan"
        items={retakeMenuItems}
        onClose={() => setRetakeMenuVisible(false)}
        insetBottom={insets.bottom}
      />

      {/* ─── Discard Confirmation Sheet ─── */}
      <DiscardSheet
        visible={discardVisible}
        onClose={() => setDiscardVisible(false)}
        onConfirm={() => { clear(); router.back(); }}
        theme={theme}
        insetBottom={insets.bottom}
      />

      {/* ─── Save Location Modal ─── */}
      <Modal visible={saveModalVisible} transparent animationType="none" onRequestClose={() => setSaveModalVisible(false)} statusBarTranslucent>
        <Pressable style={{ flex: 1 }} onPress={() => setSaveModalVisible(false)}>
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Animated.View entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))} exiting={SlideOutDown.duration(200)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <View style={{ backgroundColor: '#1C1C24', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 20, maxHeight: windowHeight * 0.75 }}>
                    {/* Drag handle */}
                    <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />

                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <View>
                        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Save Document</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>{pages.length} page{pages.length !== 1 ? 's' : ''} • PDF</Text>
                      </View>
                      <Pressable onPress={() => setSaveModalVisible(false)} style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)' })}>
                        <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor="rgba(255,255,255,0.7)" />
                      </Pressable>
                    </View>

                    {/* Folder section label */}
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Save to Folder</Text>

                    <ScrollView style={{ maxHeight: 180, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
                      {/* Root folder */}
                      <Pressable
                        onPress={() => setSelectedFolderId(null)}
                        style={({ pressed }) => ({
                          flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
                          borderRadius: 14, marginBottom: 6,
                          borderWidth: 1.5,
                          backgroundColor: selectedFolderId === null ? `${theme.primary}15` : pressed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                          borderColor: selectedFolderId === null ? theme.primary : 'transparent'
                        })}
                      >
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: selectedFolderId === null ? `${theme.primary}25` : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                          <SymbolView name={{ ios: 'folder', android: 'folder', web: 'folder' }} size={18} tintColor={selectedFolderId === null ? theme.primary : '#FFFFFF'} />
                        </View>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 12, flex: 1 }}>My Documents</Text>
                        {selectedFolderId === null && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={theme.primary} />}
                      </Pressable>

                      {folders.map((folder) => (
                        <Pressable
                          key={folder.id}
                          onPress={() => setSelectedFolderId(folder.id)}
                          style={({ pressed }) => ({
                            flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
                            borderRadius: 14, marginBottom: 6,
                            borderWidth: 1.5,
                            backgroundColor: selectedFolderId === folder.id ? `${theme.primary}15` : pressed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                            borderColor: selectedFolderId === folder.id ? theme.primary : 'transparent'
                          })}
                        >
                          <FolderIcon size="sm" />
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 12, flex: 1 }}>{folder.title}</Text>
                          {selectedFolderId === folder.id && <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor={theme.primary} />}
                        </Pressable>
                      ))}
                    </ScrollView>

                    {/* Create new folder inline */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <TextInput
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        placeholder="New folder name"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 42, color: '#FFFFFF', fontSize: 14 }}
                      />
                      <Pressable
                        onPress={handleCreateNewFolder}
                        style={({ pressed }) => ({ backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, borderRadius: 12, paddingHorizontal: 16, height: 42, justifyContent: 'center', alignItems: 'center' })}
                      >
                        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor="#FFFFFF" />
                      </Pressable>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Pressable onPress={() => setSaveModalVisible(false)} style={({ pressed }) => ({ flex: 1, height: 48, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' })}>
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
                      </Pressable>
                      <Pressable onPress={handleConfirmSave} style={({ pressed }) => ({ flex: 1.5, height: 48, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 })}>
                        <SymbolView name={{ ios: 'square.and.arrow.down', android: 'save', web: 'save' }} size={16} tintColor="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Save Document</Text>
                      </Pressable>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
