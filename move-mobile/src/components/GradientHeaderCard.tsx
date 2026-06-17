import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function GradientHeaderCard({ title, subtitle, children }: Props) {
  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'right'
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: spacing.xs,
    textAlign: 'right'
  },
  content: {
    marginTop: spacing.md
  }
});
