// frontend/components/ui/switch.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type SwitchProps = {
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
  trackColor?: { false?: string; true?: string };
  thumbColor?: string;
};

export const Switch = ({ defaultChecked = false, onValueChange, trackColor = { false: '#767577', true: '#6750a4' }, thumbColor = '#f4f3f4' }: SwitchProps) => {
  const [isEnabled, setIsEnabled] = useState(defaultChecked);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TouchableOpacity
      style={[styles.track, { backgroundColor: isEnabled ? trackColor.true : trackColor.false }]}
      onPress={toggleSwitch}
      activeOpacity={0.8}
    >
      <View
        style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX: isEnabled ? 16 : 0 }] }]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    transitionProperty: 'transform',
  },
});