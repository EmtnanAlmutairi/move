import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSubscriptionPlans } from '../services/subscriptionService';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { SubscriptionPlan } from '../types';

const PLAN_FEATURES: Record<string, { iconLib: 'Ionicons' | 'MC'; iconName: string; text: string }[]> = {
  'move-plus': [
    { iconLib: 'MC',       iconName: 'dumbbell',           text: 'خطة تدريب مصورة تتحدث أسبوعياً' },
    { iconLib: 'Ionicons', iconName: 'leaf-outline',       text: 'خطة تغذية يومية قابلة للتعديل' },
    { iconLib: 'Ionicons', iconName: 'body-outline',       text: 'متابعة إصابات واستشفاء' },
    { iconLib: 'Ionicons', iconName: 'people-outline',     text: 'مجتمع وتحديات شهرية' },
  ],
  'move-pro': [
    { iconLib: 'Ionicons', iconName: 'star',               text: 'كل مميزات MOVE Plus' },
    { iconLib: 'Ionicons', iconName: 'medkit-outline',     text: 'فريق صحي متكامل (مدرب + تغذية + علاج)' },
    { iconLib: 'Ionicons', iconName: 'videocam-outline',   text: 'اجتماع أسبوعي مباشر مع الفريق' },
    { iconLib: 'Ionicons', iconName: 'bar-chart-outline',  text: 'تحليلات صحية متقدمة' },
    { iconLib: 'Ionicons', iconName: 'flash-outline',      text: 'أولوية الردود وأدوات تتبع ذكية' },
  ],
};

function FeatureIcon({ lib, name, isPro }: { lib: string; name: string; isPro: boolean }) {
  const { theme: t } = useTheme();
  const color = isPro ? 'rgba(255,255,255,0.7)' : t.muted;
  const s = 16;
  if (lib === 'MC') return <MaterialCommunityIcons name={name as any} size={s} color={color} />;
  return <Ionicons name={name as any} size={s} color={color} />;
}

const TRUST_ITEMS = [
  { iconName: 'lock-closed-outline', label: 'دفع آمن' },
  { iconName: 'refresh-outline',     label: 'إلغاء مجاني' },
  { iconName: 'flash-outline',       label: 'تفعيل فوري' },
];

export function SubscriptionScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();
  const goalId = route?.params?.goalId;
  const [plans,    setPlans]    = useState<SubscriptionPlan[]>([]);
  const [selected, setSelected] = useState('move-pro');

  useEffect(() => { getSubscriptionPlans().then(setPlans); }, []);

  const selectedPlan = plans.find((p) => p.id === selected);

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.07,
    shadowRadius: 16,
    elevation: 5,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <View style={st.header}>
          <Text style={[st.eyebrow, { color: t.primary }]}>الاشتراك</Text>
          <Text style={[st.title, { color: t.text }]}>اختر خطتك</Text>
          <Text style={[st.subtitle, { color: t.muted }]}>
            فريق صحي متكامل · مدرب + تغذية + علاج طبيعي
          </Text>
        </View>

        <View style={st.cards}>
          {plans.map((plan) => {
            const isPro    = plan.id === 'move-pro';
            const isActive = plan.id === selected;
            const features = PLAN_FEATURES[plan.id] ?? [];

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelected(plan.id)}
                style={({ pressed }) => [
                  st.card,
                  isPro
                    ? st.cardDark
                    : { backgroundColor: t.cardSoft, borderColor: isActive ? t.primary : 'transparent' },
                  isActive && !isPro && cardShadow,
                  pressed && { opacity: 0.9 },
                ]}
              >
                {isPro && (
                  <View style={[st.badge, { backgroundColor: t.primary }]}>
                    <Text style={st.badgeText}>الأكثر شيوعاً ⭐</Text>
                  </View>
                )}

                <View style={st.planTop}>
                  <View style={[
                    st.radio,
                    isPro ? st.radioDark : { borderColor: isActive ? t.primary : t.line },
                    isActive && !isPro && { borderColor: t.primary },
                  ]}>
                    {isActive && (
                      <View style={[st.radioDot, { backgroundColor: isPro ? '#fff' : t.primary }]} />
                    )}
                  </View>
                  <View style={st.planNames}>
                    <Text style={[st.planTitle, isPro && st.textWhite, !isPro && { color: t.text }]}>
                      {plan.title}
                    </Text>
                    <Text style={[st.planDesc, isPro && st.textWhiteMuted, !isPro && { color: t.muted }]}>
                      {plan.description}
                    </Text>
                  </View>
                </View>

                <View style={st.priceRow}>
                  <Text style={[st.priceUnit, isPro ? st.textWhiteMuted : { color: t.muted }]}>ر.س / شهر</Text>
                  <Text style={[st.price, isPro ? st.textWhite : { color: t.text }]}>
                    {plan.priceSarMonthly}
                  </Text>
                </View>

                <View style={[st.featureDivider, isPro ? { borderTopColor: 'rgba(255,255,255,0.12)' } : { borderTopColor: t.line }]} />

                <View style={st.features}>
                  {features.map((f, i) => (
                    <View key={i} style={st.featureRow}>
                      <Text style={[st.featureText, isPro ? st.textWhite : { color: t.text }]}>{f.text}</Text>
                      <FeatureIcon lib={f.iconLib} name={f.iconName} isPro={isPro} />
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={st.trust}>
          {TRUST_ITEMS.map((item) => (
            <View key={item.label} style={st.trustItemRow}>
              <Ionicons name={item.iconName as any} size={14} color={t.muted} />
              <Text style={[st.trustItem, { color: t.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [st.btn, pressed && { opacity: 0.82 }]}
          onPress={() => navigation.navigate('Checkout', {
            planId: selected,
            planTitle: selectedPlan?.title,
            planPrice: selectedPlan?.priceSarMonthly,
          })}
        >
          <Text style={st.btnText}>
            متابعة للدفع · {selectedPlan?.priceSarMonthly} ر.س
          </Text>
        </Pressable>

        <Pressable style={st.skipRow} onPress={() => navigation.replace('MainTabs')}>
          <Text style={[st.skipText, { color: t.muted }]}>تخطي الآن · سأشترك لاحقاً</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 110 },

  header:   { alignItems: 'flex-end', marginBottom: spacing.xl },
  eyebrow:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.xs },
  title:    { fontSize: 32, fontWeight: '900', textAlign: 'right', marginBottom: spacing.xs },
  subtitle: { fontSize: 15, textAlign: 'right' },

  cards: { gap: spacing.md, marginBottom: spacing.lg },

  card: {
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#111111',
    borderColor: 'transparent',
  },

  badge:     { alignSelf: 'flex-end', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: spacing.sm },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  planTop:   { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  planNames: { flex: 1, alignItems: 'flex-end' },
  planTitle: { fontSize: 20, fontWeight: '900', textAlign: 'right' },
  planDesc:  { fontSize: 13, textAlign: 'right', marginTop: 2 },

  radio:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioDark:  { borderColor: 'rgba(255,255,255,0.3)' },
  radioDot:   { width: 11, height: 11, borderRadius: 6 },

  priceRow:  { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4, marginBottom: spacing.md },
  price:     { fontSize: 42, fontWeight: '900' },
  priceUnit: { fontSize: 14, fontWeight: '600' },

  featureDivider: { borderTopWidth: 1, marginBottom: spacing.md },

  features:    { gap: spacing.xs },
  featureRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  featureText: { fontSize: 14, flex: 1, textAlign: 'right' },

  textWhite:     { color: '#FFFFFF' },
  textWhiteMuted:{ color: 'rgba(255,255,255,0.55)' },

  trust:       { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: spacing.lg },
  trustItemRow:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustItem:   { fontSize: 12, fontWeight: '600' },

  btn:     { backgroundColor: '#111111', borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginBottom: spacing.sm },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  skipRow:  { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: 13 },
});
