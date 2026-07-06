import React from 'react';
import { type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ScreenTopPadding } from '@/constants/theme';

type ScreenContainerProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard page wrapper. Applies ONE consistent top padding
 * (safe-area inset + ScreenTopPadding) below the status bar on every screen.
 */
export default function ScreenContainer({ children, className, style, ...rest }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView
      className={`flex-1 ${className ?? ''}`}
      style={[{ paddingTop: insets.top + ScreenTopPadding }, style]}
      {...rest}
    >
      {children}
    </ThemedView>
  );
}
