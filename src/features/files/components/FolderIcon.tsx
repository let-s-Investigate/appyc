import React from 'react';
import { View } from 'react-native';

interface FolderIconProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function FolderIcon({ size = 'md' }: FolderIconProps) {
  // Determine dimensions based on size selection
  const containerStyle = {
    sm: { width: 36, height: 30 },
    md: { width: 48, height: 40 },
    lg: { width: 64, height: 52 },
  }[size];

  const notchStyle = {
    sm: { top: -2, left: 3, width: 14, height: 5 },
    md: { top: -3, left: 5, width: 18, height: 7 },
    lg: { top: -4, left: 7, width: 24, height: 10 },
  }[size];

  const pillStyle = {
    sm: { width: 16, height: 4 },
    md: { width: 22, height: 6 },
    lg: { width: 30, height: 8 },
  }[size];

  return (
    <View style={containerStyle} className="bg-primary rounded-md items-center justify-center relative">
      {/* Folder Tab/Notch */}
      <View 
        style={notchStyle} 
        className="absolute bg-primary rounded-t-[3px]" 
      />
      {/* Inner horizontal line/pill */}
      <View 
        style={pillStyle} 
        className="bg-white/80 dark:bg-white/40 rounded-full" 
      />
    </View>
  );
}
