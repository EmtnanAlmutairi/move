import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingStars } from '../components/RatingStars';
import { professionals } from '../data/mockData';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const ROLE_LABEL: Record<string, string> = {
  coach: 'مدرب لياقة',
  nutritionist: 'أخصائية تغذية',
  physio: 'معالج طبيعي'
};

export function ProfessionalProfileScreen({ navigation, route }: any) {
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>→ رجوع</Text>
        </Pressable>

        {/* Hero gradient */}
        <LinearGradient
          colors={[professional.avatarColor, '#1A1208']}
          style={styles.hero}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {professional.badge && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{professional.badge}</Text>
            </View>
          )}
          <View style={styles.heroTopRow}>
            <View style={[styles.heroAvatar, { borderColor: professional.avatarColor + '55' }]}>
              <Text style={styles.heroAvatarTxt}>{professional.avatarInitials}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroRole}>{ROLE_LABEL[professional.role] ?? professional.role}</Text>
              <Text style={styles.heroName}>{professional.name}</Text>
              <Text style={styles.heroSpec}>{professional.specialization}</Text>
              <View style={styles.heroRatingRow}>
                <RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} size="sm" />
              </View>
            </View>
          </View>
          <Text style={styles.heroBio}>{professional.bio}</Text>
        </LinearGradient>

        {/* Metrics row */}
        <View style={styles.metricsRow}>
          {[
            { val: `${professional.clientsCount}+`, lbl: 'عميل' },
            { val: String(professional.reviewsCount), lbl: 'تقييم' },
            { val: `${professional.yearsExp}`, lbl: 'سنوات خبرة' }
          ].map((m) => (
            <View key={m.lbl} style={styles.metricCard}>
              <Text style={styles.metricVal}>{m.val}</Text>
              <Text style={styles.metricLbl}>{m.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Price card */}
        <View style={styles.priceCard}>
          <View style={styles.priceTopRow}>
            <View style={styles.priceIncluded}>
              {['خطة مخصصة', 'متابعة أسبوعية', 'رسائل مباشرة'].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={styles.priceRight}>
              <Text style={styles.priceLabel}>الاشتراك الشهري</Text>
              <Text style={styles.priceValue}>{professional.pricePerMonth}</Text>
              <Text style={styles.priceCurrency}>ريال</Text>
            </View>
          </View>
        </View>

        {/* Videos */}
        <View style={styles.sectionHeader}>
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>{professional.videos.length}</Text>
          </View>
          <Text style={styles.sectionTitle}>الفيديوهات التعليمية</Text>
        </View>

        {professional.videos.map((video) => (
          <Pressable key={video.id} style={({ pressed }) => [styles.videoCard, pressed && { opacity: 0.9 }]}>
            <View style={styles.videoThumbWrap}>
              <Image source={{ uri: video.thumbnail }} style={styles.videoThumb} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(10,6,4,0.75)']} style={styles.videoOverlay}>
                <Text style={styles.videoViews}>{(video.viewsCount / 1000).toFixed(1)}k مشاهدة</Text>
              </LinearGradient>
              <View style={styles.playBtn}>
                <Text style={[styles.playIcon, { color: professional.avatarColor }]}>▶</Text>
              </View>
              <View style={styles.videoCatBadge}>
                <Text style={styles.videoCatText}>{video.category}</Text>
              </View>
            </View>
            <View style={styles.videoBody}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDur}>{video.durationMin} دقيقة</Text>
            </View>
          </Pressable>
        ))}

        {/* CTA */}
        <View style={styles.ctaRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>رجوع</Text>
          </Pressable>
          <Pressable style={styles.primaryBtnWrap} onPress={selected ? navigation.goBack : handleSelect}>
            {selected ? (
              <View style={[styles.primaryBtn, styles.primaryBtnSelected]}>
                <Text style={styles.primaryBtnTextSelected}>✓ مختار</Text>
              </View>
            ) : (
              <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.primaryBtn} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
                <Text style={styles.primaryBtnText}>اختيار المختص</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },

  backBtn: { alignItems: 'flex-end', marginBottom: spacing.sm },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 15 },

  hero: { borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.lg },
  badgePill: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: spacing.sm
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroTopRow: { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.md },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroAvatarTxt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroMeta: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  heroRole: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  heroSpec: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: 3 },
  heroRatingRow: { marginTop: 6 },
  heroBio: { color: 'rgba(255,255,255,0.78)', textAlign: 'right', lineHeight: 21, fontSize: 13 },

  metricsRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm
  },
  metricVal: { color: colors.text, fontSize: 20, fontWeight: '900' },
  metricLbl: { color: colors.muted, fontSize: 11, marginTop: 3 },

  priceCard: {
    backgroundColor: '#FFF7F2',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FFE1D6',
    padding: spacing.md,
    marginBottom: spacing.md
  },
  priceTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  priceRight: { alignItems: 'flex-end' },
  priceLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  priceValue: { color: colors.primary, fontSize: 36, fontWeight: '900', lineHeight: 40 },
  priceCurrency: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  priceIncluded: { gap: 8 },
  featureRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  featureCheck: { color: colors.success, fontWeight: '900', fontSize: 14 },
  featureText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  videoBadge: { backgroundColor: colors.cardSoft, borderRadius: radius.pill, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  videoBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },

  videoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm
  },
  videoThumbWrap: { height: 160, position: 'relative' },
  videoThumb: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: spacing.sm },
  videoViews: { color: 'rgba(255,255,255,0.82)', fontSize: 11 },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -22,
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm
  },
  playIcon: { fontSize: 16, marginLeft: 2 },
  videoCatBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  videoCatText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  videoBody: { padding: spacing.sm },
  videoTitle: { color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'right' },
  videoDur: { color: colors.muted, fontSize: 11, textAlign: 'right', marginTop: 3 },

  ctaRow: { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.lg },
  primaryBtnWrap: { flex: 2, borderRadius: radius.lg, overflow: 'hidden' },
  primaryBtn: { paddingVertical: 15, alignItems: 'center', borderRadius: radius.lg },
  primaryBtnSelected: { backgroundColor: '#EDF9F2', borderWidth: 1.5, borderColor: colors.success },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  primaryBtnTextSelected: { color: colors.success, fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingVertical: 15,
    alignItems: 'center'
  },
  secondaryBtnText: { color: colors.text, fontWeight: '700' }
});
