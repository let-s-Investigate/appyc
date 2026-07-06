import React, { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useFilesStore } from '@/features/files/store/filesStore';

interface AnimatedTabWrapperProps {
  children: React.ReactNode;
  index: number;
}

export default function AnimatedTabWrapper({ children, index }: AnimatedTabWrapperProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { setTabIndex } = useFilesStore();

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      const prev = useFilesStore.getState().currentTabIndex;

      if (index !== prev) {
        setTabIndex(index);

        // Hide immediately so the destination never flashes at its
        // final position, place it off-screen, then slide it in.
        opacity.value = 0;
        translateX.value = index > prev ? screenWidth : -screenWidth;

        opacity.value = withTiming(1, { duration: 90 });
        translateX.value = withTiming(0, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        // Re-focusing the same tab (e.g. coming back from a pushed screen)
        opacity.value = 1;
        translateX.value = 0;
      }
      // Reanimated shared values are stable refs and must not be hook deps
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, screenWidth, setTabIndex])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
