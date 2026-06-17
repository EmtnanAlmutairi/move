import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeItems } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';
import { StoreItem } from '../types';

type Category = 'all' | 'program' | 'consultation' | 'supplement' | 'equipment';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all', label: 'الكل', icon: '🛍️' },
  { id: 'program', label: 'برامج', icon: '📋' },
  { id: 'consultation', label: 'استشارات', icon: '🧑‍⚕️' },
  { id: 'supplement', label: 'مكملات', icon: '🥤' },
  { id: 'equipment', label: 'معدات', icon: '🏋️' }
];

function categoryLabel(category: StoreItem['category']) {
  if (category === 'program') return 'برنامج';
  if (category === 'consultation') return 'استشارة';
  if (category === 'supplement') return 'مكمل';
  return 'معدة';
}

function MarketplaceCard({ item }: { item: StoreItem }) {
  const discountPct = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  return (
    <Pressable style={styles.itemCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemBadgeRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {item.rating}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryLabel(item.category)}</Text>
          </View>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.itemMetaRow}>
          <Text style={styles.metaText}>{item.reviewsCount} تقييم</Text>
          {item.durationWeeks ? <Text style={styles.metaText}>{item.durationWeeks} أسابيع</Text> : null}
          {item.coachName ? <Text style={styles.metaText}>{item.coachName}</Text> : null}
        </View>
        <View style={styles.priceRow}>
          <View style={styles.buyPill}>
            <Text style={styles.buyPillText}>إضافة</Text>
          </View>
          <View style={styles.priceCol}>
            {item.originalPrice ? <Text style={styles.originalPrice}>{item.originalPrice} ر.س</Text> : null}
            <Text style={styles.price}>{item.price} ر.س</Text>
          </View>
        </View>
      </View>
      {item.tag ? (
        <View style={[styles.tagBadge, item.isFeatured && styles.tagBadgeFeatured]}>
          <Text style={styles.tagText}>
            {item.tag}
            {discountPct > 0 ? ` • ${discountPct}%` : ''}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function StoreScreen() {
  const [category, setCategory] = useState<Category>('all');

  const featured = useMemo(() => storeItems.filter((item) => item.isFeatured), []);
  const filteredItems = useMemo(
    () => (category === 'all' ? storeItems : storeItems.filter((item) => item.category === category)),
    [category]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>المتجر</Text>
        <Text style={styles.title}>Marketplace MOVE</Text>
        <Text style={styles.subtitle}>برامج، استشارات، منتجات، وكل ما يدعم خطتك اليومية</Text>

        <LinearGradient
          colors={['#201815', '#533128', '#FF7C52']}
          style={styles.heroCard}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.heroTag}>مختارات هذا الأسبوع</Text>
          <Text style={styles.heroTitle}>عروض مبنية على هدفك الحالي</Text>
          <Text style={styles.heroBody}>
            وفر على المنتجات المرتبطة بخطة بناء العضلات واستفد من توصيات المدرب وأخصائية التغذية.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{storeItems.length}</Text>
              <Text style={styles.heroStatLabel}>منتج</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{featured.length}</Text>
              <Text style={styles.heroStatLabel}>مميز</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>24h</Text>
              <Text style={styles.heroStatLabel}>شحن سريع</Text>
            </View>
          </View>
        </LinearGradient>

        {featured.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الأكثر طلبا</Text>
              <Text style={styles.sectionHint}>مختارات الفريق</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRow}
            >
              {featured.map((item) => (
                <Pressable key={item.id} style={styles.featuredCard}>
                  <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.featuredOverlay}
                  >
                    <Text style={styles.featuredCoach}>{item.coachName || 'MOVE'}</Text>
                    <Text style={styles.featuredName}>{item.name}</Text>
                    <Text style={styles.featuredPrice}>{item.price} ر.س</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>تصفح الأقسام</Text>
          <Text style={styles.sectionHint}>{filteredItems.length} نتيجة</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.categoryChip, category === item.id && styles.categoryChipActive]}
              onPress={() => setCategory(item.id)}
            >
              <Text style={styles.categoryChipIcon}>{item.icon}</Text>
              <Text style={[styles.categoryChipLabel, category === item.id && styles.categoryChipLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredItems.map((item) => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120
  },
  kicker: {
    textAlign: 'right',
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  title: {
    textAlign: 'right',
    fontSize: 32,
    fontWeight: '900',
    color: colors.text
  },
  subtitle: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 20
  },
  heroCard: {
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  heroTag: {
    color: '#FFD3B8',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700'
  },
  heroTitle: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing.xs
  },
  heroBody: {
    color: 'rgba(255,255,255,0.84)',
    textAlign: 'right',
    marginTop: spacing.xs,
    lineHeight: 21
  },
  heroStats: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: spacing.md
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12
  },
  heroStatValue: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 20
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    textAlign: 'right',
    color: colors.text,
    fontSize: 20,
    fontWeight: '800'
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 12
  },
  featuredRow: {
    paddingBottom: spacing.md,
    gap: spacing.sm
  },
  featuredCard: {
    width: 250,
    height: 186,
    borderRadius: 22,
    overflow: 'hidden'
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md
  },
  featuredCoach: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    fontSize: 11
  },
  featuredName: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3
  },
  featuredPrice: {
    color: '#FFD58A',
    textAlign: 'right',
    fontWeight: '800',
    marginTop: 5
  },
  categoryRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  categoryChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  categoryChipActive: {
    backgroundColor: colors.cardSoft,
    borderColor: colors.primary
  },
  categoryChipIcon: {
    fontSize: 15
  },
  categoryChipLabel: {
    color: colors.muted,
    fontWeight: '700'
  },
  categoryChipLabelActive: {
    color: colors.primary
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  itemImage: {
    width: '100%',
    height: 190
  },
  itemContent: {
    padding: spacing.md
  },
  itemBadgeRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  ratingBadge: {
    backgroundColor: '#FFF0DE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  ratingText: {
    color: '#B86B1D',
    fontSize: 12,
    fontWeight: '700'
  },
  categoryBadge: {
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  itemName: {
    textAlign: 'right',
    fontSize: 19,
    fontWeight: '800',
    color: colors.text
  },
  itemDesc: {
    textAlign: 'right',
    color: colors.muted,
    lineHeight: 20,
    marginTop: spacing.xs
  },
  itemMetaRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm
  },
  metaText: {
    color: colors.muted,
    fontSize: 12
  },
  priceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md
  },
  buyPill: {
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  buyPillText: {
    color: '#fff',
    fontWeight: '800'
  },
  priceCol: {
    alignItems: 'flex-end'
  },
  originalPrice: {
    color: colors.muted,
    fontSize: 12,
    textDecorationLine: 'line-through'
  },
  price: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2
  },
  tagBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  tagBadgeFeatured: {
    backgroundColor: colors.primary
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800'
  }
});
