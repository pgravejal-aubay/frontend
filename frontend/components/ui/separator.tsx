// frontend/components/ui/separator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

type SeparatorProps = {
  style?: any;
  orientation?: 'horizontal' | 'vertical';
};

export const Separator = ({ style, orientation = 'horizontal' }: SeparatorProps) => (
  <View style={[styles.separator, orientation === 'vertical' ? styles.vertical : styles.horizontal, style]} />
);

const styles = StyleSheet.create({
  separator: {
    backgroundColor: '#a0a0a0',
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});