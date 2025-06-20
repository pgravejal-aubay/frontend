// frontend/components/ui/button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

type ButtonProps = {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'icon';
  style?: ViewStyle;
  onPress?: () => void;
  title?: string; // Texte optionnel
  color?: string;
  disabled?: boolean;
  children?: React.ReactNode; // Ajoute children comme prop optionnelle
};

export const Button = ({ variant = 'default', size = 'default', style, onPress, title, color, disabled = false, children }: ButtonProps) => {
  const buttonStyles = {
    default: [styles.button, styles.default, size === 'icon' && styles.icon, color && { backgroundColor: color }],
    ghost: [styles.button, styles.ghost, size === 'icon' && styles.icon],
    outline: [styles.button, styles.outline, size === 'icon' && styles.icon],
  }[variant] || styles.button;

  return (
    <TouchableOpacity
      style={[buttonStyles, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children ? children : <Text style={[styles.text, color && { color }]}>{title || 'Button'}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: '#6750a4',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#cac4d0',
    backgroundColor: 'transparent',
  },
  icon: {
    padding: 4,
    width: 32,
    height: 32,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});