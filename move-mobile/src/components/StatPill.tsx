import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  title: string;
  value: string;
};

export function StatPill({ title, value }: Props) {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  value: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    textAlign: 'right'
  },
  title: {
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
    marginTop: 2
  }
});
