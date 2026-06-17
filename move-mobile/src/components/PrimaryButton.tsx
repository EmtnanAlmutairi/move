import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
};

export function PrimaryButton({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center'
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800'
  }
});
