import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useFilesStore } from '@/features/files/store/filesStore';

interface AnimatedTabWrapperProps {
  children: React.ReactNode;
  index: number;
}

export default function AnimatedTabWrapper({ children, index }: AnimatedTabWrapperProps) {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const { setTabIndex } = useFilesStore();

  const translateX = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check what the active tab was before this focus event
      const prev = useFilesStore.getState().currentTabIndex;
      
      if (index !== prev) {
        // Set the tab index updates
        setTabIndex(index);
        
        // Slide direction:
        // Pushing forward (index > prev) -> slide in from right
        // Popping backward (index < prev) -> slide in from left
        if (index > prev) {
          translateX.value = screenWidth;
        } else {
          translateX.value = -screenWidth;
        }
        
        // Smoothly animate the horizontal shift back to 0
        translateX.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

    return unsubscribe;
  }, [navigation, index, screenWidth, setTabIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
