import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Images } from '@/constants/images';
import EmptyState from '@/components/empty-state';
import { useFilesStore } from '@/features/files/store/filesStore';
import FileMenuSheet from '@/features/files/components/FileMenuSheet';
import { renderAllPages } from '@/features/pdf/services/pdf-thumbnails';
import { PageThumb } from '@/features/pdf/types';

const HEADER_HEIGHT = 56;

/** In-app PDF previewer (per "PDF previewer screen" mockup) */
export default function ViewerScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { fileId } = useLocalSearchParams<{ fileId: string }>();

  const { files, renameFile } = useFilesStore();
  const file = files.find((f) => f.id === fileId) ?? null;

  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const fileUri = file?.uri;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fileUri) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await renderAllPages(fileUri);
      if (!cancelled) {
        setPages(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUri]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setCurrentPage(first.index + 1);
    },
    []
  );

  const handleRenameConfirm = () => {
    if (file && renameValue.trim()) {
      renameFile(file.id, renameValue.trim());
    }
    setRenaming(false);
  };

  const renderPage = useCallback(
    ({ item }: { item: PageThumb }) => {
      const pageWidth = windowWidth - 32;
      const pageHeight = (item.height / item.width) * pageWidth;
      return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' }}>
          <View style={{ width: pageWidth, height: pageHeight, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
            <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>
        </View>
      );
    },
    [windowWidth]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D12' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      <View style={{ height: insets.top, backgroundColor: '#0D0D12' }} />

      {/* Header */}
      <View style={{ height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#0D0D12', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
        >
          <Image source={Images.icons.back} style={{ width: 22, height: 22, tintColor: '#FFFFFF' }} resizeMode="contain" />
        </Pressable>

        {renaming ? (
          <TextInput
            value={renameValue}
            onChangeText={setRenameValue}
            onSubmitEditing={handleRenameConfirm}
            onBlur={handleRenameConfirm}
            autoFocus
            style={{ flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginHorizontal: 8 }}
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
        ) : (
          <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginHorizontal: 8 }} numberOfLines={1}>
            {file?.title ?? 'Document'}
          </Text>
        )}

        {file && (
          <>
            <Pressable
              onPress={() => {
                setRenameValue(file.title);
                setRenaming(true);
              }}
              hitSlop={8}
              style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
            >
              <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={20} tintColor="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => setMenuVisible(true)}
              hitSlop={8}
              style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
            >
              <SymbolView name={{ ios: 'ellipsis.circle', android: 'more_horiz', web: 'more_horiz' }} size={20} tintColor="#FFFFFF" />
            </Pressable>
          </>
        )}
      </View>

      {/* Pages */}
      {!file || !file.uri ? (
        <EmptyState
          icon={{ ios: 'doc.questionmark', android: 'unknown_document', web: 'unknown_document' }}
          title="Document not available"
          subtitle="This file has no PDF attached or was removed"
        />
      ) : loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3D5AFE" />
          <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16, fontSize: 14 }}>Rendering pages...</Text>
        </View>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
          title="Could not open this PDF"
          subtitle="The file may be damaged or password protected"
        />
      ) : (
        <>
          <FlatList
            data={pages}
            renderItem={renderPage}
            keyExtractor={(_, idx) => String(idx)}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
          />

          {/* Page indicator pill */}
          <View
            pointerEvents="none"
            style={{ position: 'absolute', bottom: insets.bottom + 24, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
              Page {currentPage} of {pages.length}
            </Text>
          </View>
        </>
      )}

      {/* Options menu */}
      <FileMenuSheet
        visible={menuVisible}
        file={file}
        onClose={() => setMenuVisible(false)}
        onDeleted={() => {
          setMenuVisible(false);
          router.back();
        }}
      />
    </View>
  );
}
