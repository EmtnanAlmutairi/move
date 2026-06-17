import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'dark' | 'light';
};

export function PrimaryButton({ label, onPress, variant = 'dark' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant === 'light' && styles.light, pressed && styles.pressed]}
    >
      <Text style={[styles.label, variant === 'light' && styles.labelLight]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center'
  },
  light: {
    backgroundColor: '#FFFFFF'
  },
  pressed: {
    opacity: 0.82
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  labelLight: {
    color: '#111111'
  }
});
