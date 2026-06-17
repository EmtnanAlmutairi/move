import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeItems } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { StoreItem } from '../types';

type Category = 'all' | 'program' | 'consultation' | 'supplement' | 'equipment';

const CATEGORIES: { id: Category; label: string; lib: 'I' | 'MC'; icon: string }[] = [
  { id: 'all',          label: 'الكل',     lib: 'I',  icon: 'grid-outline' },
  { id: 'program',      label: 'برامج',    lib: 'MC', icon: 'clipboard-list-outline' },
  { id: 'consultation', label: 'استشارات', lib: 'I',  icon: 'person-outline' },
  { id: 'supplement',   label: 'مكملات',   lib: 'MC', icon: 'bottle-tonic-outline' },
  { id: 'equipment',    label: 'معدات',    lib: 'MC', icon: 'dumbbell' },
];

const CAT_LABEL: Record<StoreItem['category'], string> = {
  program:      'برنامج',
  consultation: 'استشارة',
  supplement:   'مكمل',
  equipment:    'معدة',
};

function StarsRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={11}
          color="#FF7A18"
        />
      ))}
    </View>
  );
}

function ItemCard({
  item,
  t,
  inCart,
  onAddToCart,
  onRemoveFromCart,
}: {
  item: StoreItem;
  t: ReturnType<typeof useTheme>['theme'];
  inCart: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
}) {
  const discountPct = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.25 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <View style={[ic.card, { backgroundColor: t.card, borderColor: inCart ? t.primary : t.line }, cardShadow]}>
      <Image source={{ uri: item.imageUrl }} style={ic.img} />
      {inCart && (
        <View style={[ic.inCartBanner, { backgroundColor: t.primary }]}>
          <Ionicons name="checkmark-circle" size={13} color="#fff" />
          <Text style={ic.inCartTxt}>في السلة</Text>
        </View>
      )}
      <View style={ic.content}>
        <View style={ic.badgeRow}>
          <View style={[ic.ratingBadge, { backgroundColor: t.primary + '14' }]}>
            <StarsRow rating={item.rating} />
            <Text style={[ic.ratingTxt, { color: t.primary }]}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={[ic.catBadge, { backgroundColor: t.cardSoft }]}>
            <Text style={[ic.catTxt, { color: t.primary }]}>{CAT_LABEL[item.category]}</Text>
          </View>
        </View>
        <Text style={[ic.name, { color: t.text }]}>{item.name}</Text>
        <Text style={[ic.desc, { color: t.muted }]} numberOfLines={3}>{item.description}</Text>
        <View style={ic.metaRow}>
          <Text style={[ic.meta, { color: t.muted }]}>{item.reviewsCount} تقييم</Text>
          {item.durationWeeks ? <Text style={[ic.meta, { color: t.muted }]}>{item.durationWeeks} أسابيع</Text> : null}
          {item.coachName     ? <Text style={[ic.meta, { color: t.muted }]}>{item.coachName}</Text>             : null}
        </View>
        <View style={ic.priceRow}>
          <Pressable onPress={inCart ? onRemoveFromCart : onAddToCart}>
            {inCart ? (
              <View style={[ic.removeBtn, { borderColor: '#EF4444' + '60', backgroundColor: '#EF444408' }]}>
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={[ic.removeTxt]}>إزالة</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[t.gradientStart, t.gradientEnd]}
                style={ic.buyBtn}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
              >
                <Ionicons name="cart-outline" size={14} color="#fff" />
                <Text style={ic.buyTxt}>إضافة</Text>
              </LinearGradient>
            )}
          </Pressable>
          <View style={ic.priceCol}>
            {item.originalPrice ? (
              <Text style={[ic.origPrice, { color: t.muted }]}>{item.originalPrice} ر.س</Text>
            ) : null}
            <Text style={[ic.price, { color: t.primary }]}>{item.price} ر.س</Text>
          </View>
        </View>
      </View>
      {item.tag ? (
        <View style={[ic.tagBadge, { backgroundColor: t.primary }]}>
          <Text style={ic.tagTxt}>
            {item.tag}{discountPct > 0 ? ` · ${discountPct}%` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const ic = StyleSheet.create({
  card:       { borderRadius: 24, borderWidth: 1, marginBottom: spacing.md, overflow: 'hidden' },
  img:        { width: '100%', height: 190 },
  inCartBanner:{ position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  inCartTxt:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  content:    { padding: spacing.md },
  badgeRow:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  ratingBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  ratingTxt:  { fontSize: 11, fontWeight: '700' },
  catBadge:   { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  catTxt:     { fontSize: 12, fontWeight: '700' },
  name:       { textAlign: 'right', fontSize: 19, fontWeight: '800' },
  desc:       { textAlign: 'right', lineHeight: 20, marginTop: spacing.xs },
  metaRow:    { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  meta:       { fontSize: 12 },
  priceRow:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  buyBtn:     { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyTxt:     { color: '#fff', fontWeight: '800' },
  removeBtn:  { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5 },
  removeTxt:  { color: '#EF4444', fontWeight: '800' },
  priceCol:   { alignItems: 'flex-end' },
  origPrice:  { fontSize: 12, textDecorationLine: 'line-through' },
  price:      { fontSize: 24, fontWeight: '900', marginTop: 2 },
  tagBadge:   { position: 'absolute', top: spacing.md, right: spacing.md, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  tagTxt:     { color: '#fff', fontSize: 11, fontWeight: '800' },
});

export function StoreScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [category, setCategory] = useState<Category>('all');
  const [cart, setCart]         = useState<string[]>([]);

  const featured      = useMemo(() => storeItems.filter((i) => i.isFeatured), []);
  const filteredItems = useMemo(
    () => category === 'all' ? storeItems : storeItems.filter((i) => i.category === category),
    [category]
  );

  const cartTotal = cart.reduce((sum, id) => {
    const item = storeItems.find((i) => i.id === id);
    return sum + (item?.price ?? 0);
  }, 0);

  const toggleCart = (id: string) =>
    setCart((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const goCheckout = () => navigation.navigate('Checkout');

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={[st.scroll, cart.length > 0 && { paddingBottom: 160 }]} showsVerticalScrollIndicator={false}>

        {/* ── TITLE ─────────────────────────────── */}
        <View style={st.titleRow}>
          <Text style={[st.title, { color: t.text }]}>المتجر</Text>
          {cart.length > 0 && (
            <View style={[st.cartBadge, { backgroundColor: t.primary }]}>
              <Ionicons name="cart-outline" size={15} color="#fff" />
              <Text style={st.cartBadgeTxt}>{cart.length}</Text>
            </View>
          )}
        </View>
        <Text style={[st.subtitle, { color: t.muted }]}>برامج، استشارات، منتجات، وكل ما يدعم خطتك اليومية</Text>

        {/* ── HERO ──────────────────────────────── */}
        <LinearGradient
          colors={['#1A0A06', '#3D1408', '#FF4500']}
          style={st.hero}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={st.heroGlow} />
          <View style={st.heroTagRow}>
            <Ionicons name="flash" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={st.heroTag}>MOVE Elite</Text>
          </View>
          <Text style={st.heroTitle}>عروض مبنية على هدفك الحالي</Text>
          <Text style={st.heroBody}>
            وفر على المنتجات المرتبطة بخطة بناء العضلات واستفد من توصيات المدرب وأخصائية التغذية.
          </Text>
          <View style={st.heroStats}>
            {[
              { val: storeItems.length, lbl: 'منتج' },
              { val: featured.length,   lbl: 'مميز' },
              { val: '24h',             lbl: 'شحن سريع' },
            ].map((item, i) => (
              <View key={i} style={st.heroStat}>
                <Text style={st.heroStatVal}>{item.val}</Text>
                <Text style={st.heroStatLbl}>{item.lbl}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── FEATURED HORIZONTAL ───────────────── */}
        {featured.length > 0 && (
          <>
            <View style={st.secHeader}>
              <Text style={[st.secHint, { color: t.muted }]}>مختارات الفريق</Text>
              <Text style={[st.secTitle, { color: t.text }]}>الأكثر طلباً</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.featuredRow}>
              {featured.map((item) => (
                <Pressable
                  key={item.id}
                  style={[st.featuredCard, cart.includes(item.id) && { opacity: 0.8 }]}
                  onPress={() => toggleCart(item.id)}
                >
                  <Image source={{ uri: item.imageUrl }} style={st.featuredImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={st.featuredOverlay}>
                    <Text style={st.featuredCoach}>{item.coachName || 'MOVE'}</Text>
                    <Text style={st.featuredName}>{item.name}</Text>
                    <View style={st.featuredPriceRow}>
                      <Text style={st.featuredPrice}>{item.price} ر.س</Text>
                      {cart.includes(item.id) && (
                        <View style={st.featuredCartBadge}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── CATEGORY CHIPS ────────────────────── */}
        <View style={st.secHeader}>
          <Text style={[st.secHint, { color: t.muted }]}>{filteredItems.length} نتيجة</Text>
          <Text style={[st.secTitle, { color: t.text }]}>تصفح الأقسام</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.catRow}>
          {CATEGORIES.map((item) => {
            const active = category === item.id;
            const color  = active ? t.primary : t.muted;
            return (
              <Pressable
                key={item.id}
                style={[
                  st.catChip,
                  { backgroundColor: active ? t.primary + '14' : t.card, borderColor: active ? t.primary : t.line },
                ]}
                onPress={() => setCategory(item.id)}
              >
                {item.lib === 'MC'
                  ? <MaterialCommunityIcons name={item.icon as any} size={15} color={color} />
                  : <Ionicons name={item.icon as any} size={15} color={color} />}
                <Text style={[st.catLabel, { color }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── ITEMS ─────────────────────────────── */}
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            t={t}
            inCart={cart.includes(item.id)}
            onAddToCart={() => toggleCart(item.id)}
            onRemoveFromCart={() => toggleCart(item.id)}
          />
        ))}

      </ScrollView>

      {/* ── FLOATING CART BAR ─────────────────── */}
      {cart.length > 0 && (
        <View style={[st.cartBar, { backgroundColor: t.card, borderTopColor: t.line }]}>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            onPress={goCheckout}
          >
            <LinearGradient
              colors={['#FF4500', '#FF6800', '#FF9A00']}
              style={st.checkoutBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={st.checkoutBtnTxt}>إتمام الطلب</Text>
              <Text style={st.checkoutTotal}>{cartTotal} ر.س</Text>
            </LinearGradient>
          </Pressable>
          <Text style={[st.cartItemCount, { color: t.muted }]}>{cart.length} {cart.length === 1 ? 'منتج' : 'منتجات'} في السلة</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },

  titleRow:  { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  title:     { textAlign: 'right', fontSize: 32, fontWeight: '900' },
  cartBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  cartBadgeTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  subtitle:  { textAlign: 'right', marginBottom: spacing.md, lineHeight: 20 },

  hero:       { borderRadius: 28, padding: spacing.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  heroGlow:   { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FF450033', top: -60, left: -40 },
  heroTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'flex-end' },
  heroTag:    { color: 'rgba(255,255,255,0.7)', textAlign: 'right', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  heroTitle:  { color: '#fff', textAlign: 'right', fontSize: 28, fontWeight: '900', marginTop: spacing.xs },
  heroBody:   { color: 'rgba(255,255,255,0.84)', textAlign: 'right', marginTop: spacing.xs, lineHeight: 21 },
  heroStats:  { flexDirection: 'row-reverse', gap: 8, marginTop: spacing.md },
  heroStat:   { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 12 },
  heroStatVal:{ color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 20 },
  heroStatLbl:{ color: 'rgba(255,255,255,0.78)', textAlign: 'center', fontSize: 11, marginTop: 2 },

  secHeader:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  secTitle:   { textAlign: 'right', fontSize: 20, fontWeight: '800' },
  secHint:    { fontSize: 12 },

  featuredRow:       { paddingBottom: spacing.md, gap: spacing.sm },
  featuredCard:      { width: 250, height: 186, borderRadius: 22, overflow: 'hidden' },
  featuredImg:       { width: '100%', height: '100%', position: 'absolute' },
  featuredOverlay:   { flex: 1, justifyContent: 'flex-end', padding: spacing.md },
  featuredCoach:     { color: 'rgba(255,255,255,0.8)', textAlign: 'right', fontSize: 11 },
  featuredName:      { color: '#fff', textAlign: 'right', fontSize: 18, fontWeight: '800', marginTop: 3 },
  featuredPriceRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 5 },
  featuredPrice:     { color: 'rgba(255,255,255,0.9)', textAlign: 'right', fontWeight: '800' },
  featuredCartBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },

  catRow:    { gap: spacing.sm, paddingBottom: spacing.md },
  catChip:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 10 },
  catLabel:  { fontWeight: '700' },

  /* cart bar */
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, padding: spacing.lg, paddingBottom: 32, gap: spacing.xs,
  },
  checkoutBtn: {
    borderRadius: 16, paddingVertical: 17,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    shadowColor: '#FF4500', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  checkoutBtnTxt:  { color: '#fff', fontSize: 16, fontWeight: '900' },
  checkoutTotal:   { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 15 },
  cartItemCount:   { textAlign: 'center', fontSize: 12 },
});
