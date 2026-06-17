import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md';
};

export function RatingStars({ rating, reviewsCount, size = 'md' }: Props) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const fontSize = size === 'sm' ? 12 : 15;

  return (
    <View style={styles.row}>
      {reviewsCount !== undefined && (
        <Text style={[styles.count, { fontSize: fontSize - 2 }]}>({reviewsCount})</Text>
      )}
      <Text style={[styles.value, { fontSize }]}>{rating.toFixed(1)}</Text>
      <View style={styles.stars}>
        {'★'.repeat(full).split('').map((_, i) => (
          <Text key={`f${i}`} style={[styles.star, styles.starFull, { fontSize }]}>★</Text>
        ))}
        {half && <Text style={[styles.star, styles.starHalf, { fontSize }]}>⯨</Text>}
        {'☆'.repeat(empty).split('').map((_, i) => (
          <Text key={`e${i}`} style={[styles.star, styles.starEmpty, { fontSize }]}>☆</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  stars: { flexDirection: 'row-reverse' },
  star: { lineHeight: 20 },
  starFull: { color: '#F79A3E' },
  starHalf: { color: '#F79A3E' },
  starEmpty: { color: '#D9C9BA' },
  value: { color: colors.text, fontWeight: '700' },
  count: { color: colors.muted }
});
