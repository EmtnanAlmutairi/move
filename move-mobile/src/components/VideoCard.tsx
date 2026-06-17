import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/tokens';

type Props = {
  thumbnail: string;
  title: string;
  meta: string;
  eyebrow?: string;
  height?: number;
  onPress?: () => void;
};

export function VideoCard({ thumbnail, title, meta, eyebrow, height = 200, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { height }, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Image source={{ uri: thumbnail }} style={styles.image} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(10,6,4,0.90)']}
        style={styles.overlay}
      >
        <View style={styles.playBtn}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    ...shadows.md
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md
  },
  playBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm
  },
  playIcon: { color: colors.primary, fontSize: 16, fontWeight: '900', marginLeft: 2 },
  eyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
    lineHeight: 24
  },
  meta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4
  }
});
