import { useRef } from 'react';
import { PanResponder } from 'react-native';
import { router } from 'expo-router';

/**
 * Custom hook to detect horizontal swipe gestures on tab screens
 * and navigate to the previous or next tab.
 * 
 * @param prevRoute - The route path to navigate to when swiping right (e.g. '/' or '/files')
 * @param nextRoute - The route path to navigate to when swiping left (e.g. '/files' or '/premium')
 */
export function useTabSwipe(prevRoute: string | null, nextRoute: string | null) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercept movement only if it's primarily horizontal and exceeds a threshold (30px)
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2.5;
        const isMinDistance = Math.abs(gestureState.dx) > 30;
        return isHorizontal && isMinDistance;
      },
      onPanResponderTerminate: () => {},
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -65 && nextRoute) {
          // Dragged hand to left (swipe left) -> navigate next
          router.navigate(nextRoute as any);
        } else if (gestureState.dx > 65 && prevRoute) {
          // Dragged hand to right (swipe right) -> navigate previous
          router.navigate(prevRoute as any);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
