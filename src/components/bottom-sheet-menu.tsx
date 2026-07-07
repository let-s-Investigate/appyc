import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

export type SheetMenuItem = {
  label: string;
  icon: { ios: string; android: string; web: string };
  destructive?: boolean;
  onPress: () => void;
};

/**
 * Reusable dark bottom-sheet action menu (extracted from the scan editor).
 */
export default function BottomSheetMenu({
  visible,
  title,
  subtitle,
  items,
  onClose,
  insetBottom,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  items: SheetMenuItem[];
  onClose: () => void;
  insetBottom: number;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))} exiting={SlideOutDown.duration(200)} style={{ backgroundColor: '#1C1C24', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: insetBottom + 16, paddingHorizontal: 20 }}>
              {/* Drag handle */}
              <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />

              {/* Title */}
              <View style={{ marginBottom: 16, paddingHorizontal: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{title}</Text>
                {subtitle && <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '400', marginTop: 2 }}>{subtitle}</Text>}
              </View>

              {/* Items */}
              {items.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => { onClose(); setTimeout(item.onPress, 200); }}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12,
                    borderRadius: 14, marginBottom: 4,
                    backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent'
                  })}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.destructive ? 'rgba(255,59,48,0.12)' : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <SymbolView name={item.icon as any} size={20} tintColor={item.destructive ? '#FF3B30' : '#FFFFFF'} />
                  </View>
                  <Text style={{ color: item.destructive ? '#FF3B30' : '#FFFFFF', fontSize: 15, fontWeight: '500', flex: 1 }}>{item.label}</Text>
                  <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor="rgba(255,255,255,0.3)" />
                </Pressable>
              ))}

              {/* Cancel button */}
              <Pressable onPress={onClose} style={({ pressed }) => ({ marginTop: 8, height: 48, borderRadius: 14, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
