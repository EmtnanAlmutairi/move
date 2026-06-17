import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingStars } from '../components/RatingStars';
import { professionals } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/tokens';

const ROLE_LABEL: Record<string, string> = {
  coach:        'مدرب لياقة',
  nutritionist: 'أخصائية تغذية',
  physio:       'معالج طبيعي',
};

export function ProfessionalProfileScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();
  const professional = professionals.find((p) => p.id === route.params?.professionalId) ?? professionals[0];
  const [selected, setSelected] = useState(!!professional.isSelected);

  const handleSelect = () => {
    setSelected(true);
    Alert.alert(
      'تم الاختيار ✓',
      `تم اختيار ${professional.name} كـ${ROLE_LABEL[professional.role] ?? professional.role}`,
      [{ text: 'ممتاز!', onPress: () => navigation.goBack() }]
    );
  };

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.07,
    shadowRadius: 8,
    elevation: 3,
  };

  const heroShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#5A4A38',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.12,
    shadowRadius: 28,
    elevation: 12,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.container} showsVerticalScrollIndicator={false}>

        <Pressable
          style={[st.backBtn, { backgroundColor: t.cardSoft }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>

        {/* Hero gradient — uses professional's identity color intentionally */}
        <LinearGradient
          colors={[professional.avatarColor, '#1A1208']}
          style={[st.hero, heroShadow]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {professional.badge && (
            <View style={st.badgePill}>
              <Text style={st.badgeText}>{professional.badge}</Text>
            </View>
          )}
          <View style={st.heroTopRow}>
            <View style={[st.heroAvatar, { borderColor: professional.avatarColor + '55' }]}>
              <Text style={st.heroAvatarTxt}>{professional.avatarInitials}</Text>
            </View>
            <View style={st.heroMeta}>
              <Text style={st.heroRole}>{ROLE_LABEL[professional.role] ?? professional.role}</Text>
              <Text style={st.heroName}>{professional.name}</Text>
              <Text style={st.heroSpec}>{professional.specialization}</Text>
              <View style={st.heroRatingRow}>
                <RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} size="sm" />
              </View>
            </View>
          </View>
          <Text style={st.heroBio}>{professional.bio}</Text>
        </LinearGradient>

        {/* Metrics */}
        <View style={st.metricsRow}>
          {[
            { val: `${professional.clientsCount}+`, lbl: 'عميل' },
            { val: String(professional.reviewsCount), lbl: 'تقييم' },
            { val: `${professional.yearsExp}`,        lbl: 'سنوات خبرة' },
          ].map((m) => (
            <View
              key={m.lbl}
              style={[st.metricCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}
            >
              <Text style={[st.metricVal, { color: t.text }]}>{m.val}</Text>
              <Text style={[st.metricLbl, { color: t.muted }]}>{m.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Price card */}
        <View style={[st.priceCard, { backgroundColor: t.primary + '08', borderColor: t.primary + '18' }]}>
          <View style={st.priceTopRow}>
            <View style={st.priceIncluded}>
              {['خطة مخصصة', 'متابعة أسبوعية', 'رسائل مباشرة'].map((f) => (
                <View key={f} style={st.featureRow}>
                  <Text style={[st.featureCheck, { color: t.success }]}>✓</Text>
                  <Text style={[st.featureText, { color: t.text }]}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={st.priceRight}>
              <Text style={[st.priceLabel, { color: t.muted }]}>الاشتراك الشهري</Text>
              <Text style={[st.priceValue, { color: t.primary }]}>{professional.pricePerMonth}</Text>
              <Text style={[st.priceCurrency, { color: t.primary }]}>ريال</Text>
            </View>
          </View>
        </View>

        {/* Videos */}
        <View style={st.sectionHeader}>
          <View style={[st.videoBadge, { backgroundColor: t.cardSoft }]}>
            <Text style={[st.videoBadgeText, { color: t.primary }]}>{professional.videos.length}</Text>
          </View>
          <Text style={[st.sectionTitle, { color: t.text }]}>الفيديوهات التعليمية</Text>
        </View>

        {professional.videos.map((video) => (
          <Pressable
            key={video.id}
            style={({ pressed }) => [
              st.videoCard,
              { backgroundColor: t.card, borderColor: t.line },
              cardShadow,
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={st.videoThumbWrap}>
              <Image source={{ uri: video.thumbnail }} style={st.videoThumb} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(10,6,4,0.75)']} style={st.videoOverlay}>
                <Text style={st.videoViews}>{(video.viewsCount / 1000).toFixed(1)}k مشاهدة</Text>
              </LinearGradient>
              <View style={st.playBtn}>
                <Text style={[st.playIcon, { color: professional.avatarColor }]}>▶</Text>
              </View>
              <View style={st.videoCatBadge}>
                <Text style={st.videoCatText}>{video.category}</Text>
              </View>
            </View>
            <View style={st.videoBody}>
              <Text style={[st.videoTitle, { color: t.text }]}>{video.title}</Text>
              <Text style={[st.videoDur, { color: t.muted }]}>{video.durationMin} دقيقة</Text>
            </View>
          </Pressable>
        ))}

        {/* CTA */}
        <View style={st.ctaRow}>
          <Pressable
            style={[st.secondaryBtn, { borderColor: t.line, backgroundColor: t.card }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[st.secondaryBtnText, { color: t.text }]}>رجوع</Text>
          </Pressable>
          <Pressable
            style={st.primaryBtnWrap}
            onPress={selected ? navigation.goBack : handleSelect}
          >
            {selected ? (
              <View style={[st.primaryBtn, { backgroundColor: t.success + '14', borderWidth: 1.5, borderColor: t.success }]}>
                <Text style={[st.primaryBtnTextSelected, { color: t.success }]}>✓ مختار</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[t.gradientStart, t.gradientEnd]}
                style={st.primaryBtn}
                start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
              >
                <Text style={st.primaryBtnText}>اختيار المختص</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:      { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },

  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },

  hero:        { borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md },
  badgePill:   {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: spacing.sm,
  },
  badgeText:    { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroTopRow:   { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.md },
  heroAvatar:   {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarTxt:{ color: '#fff', fontSize: 24, fontWeight: '900' },
  heroMeta:     { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  heroRole:     { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName:     { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  heroSpec:     { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: 3 },
  heroRatingRow:{ marginTop: 6 },
  heroBio:      { color: 'rgba(255,255,255,0.78)', textAlign: 'right', lineHeight: 21, fontSize: 13 },

  metricsRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  metricCard: {
    flex: 1, borderRadius: radius.lg, borderWidth: 1,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  metricVal:  { fontSize: 20, fontWeight: '900' },
  metricLbl:  { fontSize: 11, marginTop: 3 },

  priceCard:    { borderRadius: radius.xl, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  priceTopRow:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  priceRight:   { alignItems: 'flex-end' },
  priceLabel:   { fontSize: 11, fontWeight: '600' },
  priceValue:   { fontSize: 36, fontWeight: '900', lineHeight: 40 },
  priceCurrency:{ fontSize: 13, fontWeight: '700' },
  priceIncluded:{ gap: 8 },
  featureRow:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  featureCheck: { fontWeight: '900', fontSize: 14 },
  featureText:  { fontSize: 13, fontWeight: '600' },

  sectionHeader:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  sectionTitle:   { fontSize: 18, fontWeight: '800' },
  videoBadge:     { borderRadius: radius.pill, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  videoBadgeText: { fontSize: 12, fontWeight: '800' },

  videoCard:      { borderRadius: radius.xl, borderWidth: 1, marginBottom: spacing.sm, overflow: 'hidden' },
  videoThumbWrap: { height: 160, position: 'relative' },
  videoThumb:     { width: '100%', height: '100%' },
  videoOverlay:   { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: spacing.sm },
  videoViews:     { color: 'rgba(255,255,255,0.82)', fontSize: 11 },
  playBtn:        {
    position: 'absolute', top: '50%', left: '50%',
    marginTop: -22, marginLeft: -22,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon:       { fontSize: 16, marginLeft: 2 },
  videoCatBadge:  {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  videoCatText:   { color: '#fff', fontSize: 10, fontWeight: '700' },
  videoBody:      { padding: spacing.sm },
  videoTitle:     { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  videoDur:       { fontSize: 11, textAlign: 'right', marginTop: 3 },

  ctaRow:              { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.lg },
  primaryBtnWrap:      { flex: 2, borderRadius: radius.lg, overflow: 'hidden' },
  primaryBtn:          { paddingVertical: 15, alignItems: 'center', borderRadius: radius.lg },
  primaryBtnText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  primaryBtnTextSelected: { fontWeight: '800', fontSize: 15 },
  secondaryBtn:        { flex: 1, borderRadius: radius.lg, borderWidth: 1, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText:    { fontWeight: '700' },
});
