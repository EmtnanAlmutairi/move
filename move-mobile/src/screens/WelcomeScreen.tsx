import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Share, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { UserGoal } from '../types';

// ─── Goal metadata ─────────────────────────────────────────────────────────────
const GOAL_INFO: Record<UserGoal, {
  emoji: string; title: string; subtitle: string;
  team: string[]; color: [string, string]; shareText: string; stat: string;
}> = {
  'muscle-gain': {
    emoji: '💪',
    title: 'بناء العضلات',
    subtitle: 'برنامج مقاومة متقدم + تغذية بروتينية عالية',
    team: ['مدرب القوة', 'التغذية الرياضية', 'العلاج الطبيعي'],
    color: ['#FF4500', '#FF7A18'],
    shareText: 'انضممت لـ MOVE وبدأت رحلتي في بناء العضلات! 💪\nانضم معي على تطبيق MOVE',
    stat: '+18,400 رياضي يبنون عضلاتهم الآن',
  },
  'weight-loss': {
    emoji: '🔥',
    title: 'خسارة الوزن',
    subtitle: 'برنامج كارديو هادف + تغذية علاجية متخصصة',
    team: ['مدرب الكارديو', 'التغذية العلاجية', 'العلاج الطبيعي'],
    color: ['#FF6B00', '#FF9A00'],
    shareText: 'بدأت رحلتي في إنقاص الوزن مع MOVE! 🔥\nانضم معي على تطبيق MOVE',
    stat: '+12,000 شخص حقق هدفه هذا العام',
  },
  fitness: {
    emoji: '⚡',
    title: 'اللياقة العامة',
    subtitle: 'برنامج متوازن + صحة شاملة يومية',
    team: ['مدرب اللياقة', 'التغذية المتوازنة', 'الاستشفاء'],
    color: ['#FF4500', '#FF9A00'],
    shareText: 'انضممت لـ MOVE لأبدأ رحلة اللياقة الحقيقية! ⚡\nانضم معي على تطبيق MOVE',
    stat: '+5,000 بدأوا هذا الشهر',
  },
};

// ─── Confetti Particle ────────────────────────────────────────────────────────
const PARTICLE_COLORS = ['#FF4500', '#FF9A00', '#B5FF45', '#FF7A18', '#FFF', '#FFD700'];

function Particle({ x, baseY, color, delay, size, shape }: {
  x: number; baseY: number; color: string; delay: number; size: number; shape: 'circle' | 'square';
}) {
  const ty  = useSharedValue(0);
  const op  = useSharedValue(0);
  const sc  = useSharedValue(0.2);
  const rot = useSharedValue(0);

  useEffect(() => {
    const dir = Math.random() > 0.5 ? 1 : -1;
    ty.value  = withDelay(delay, withTiming(-(260 + Math.random() * 140), { duration: 2400, easing: Easing.out(Easing.ease) }));
    op.value  = withDelay(delay, withSequence(
      withTiming(0.85, { duration: 200 }),
      withDelay(1600, withTiming(0, { duration: 600 })),
    ));
    sc.value  = withDelay(delay, withSpring(1, { damping: 10, stiffness: 160 }));
    rot.value = withDelay(delay, withTiming(540 * dir, { duration: 2400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: ty.value },
      { scale: sc.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: op.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: baseY,
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : size * 0.2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// Pre-generate stable particle data (avoid re-randomizing on re-render)
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 20 + (i * 17) % 340,
  baseY: 300 + (i * 29) % 80,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: (i * 90) % 800,
  size: 6 + (i % 3) * 4,
  shape: (i % 3 === 0 ? 'square' : 'circle') as 'circle' | 'square',
}));

// ─── Pulsing Ring ─────────────────────────────────────────────────────────────
function PulsingRing({ size, color, delay }: { size: number; color: string; delay: number }) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1.0, { duration: 0 }),
      ), -1,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 }),
      ), -1,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: color,
    }, style]} />
  );
}

// ─── Trophy hero ─────────────────────────────────────────────────────────────
function TrophyHero({ color }: { color: string }) {
  const scale   = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value   = withDelay(100, withSpring(1, { damping: 8, stiffness: 100 }));
    opacity.value = withDelay(100, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[st.trophyWrap, style]}>
      <View style={st.trophyRings}>
        <PulsingRing size={110} color={color} delay={0}   />
        <PulsingRing size={160} color={color} delay={700} />
        <PulsingRing size={200} color={color} delay={1400} />
      </View>
      <LinearGradient
        colors={['#FF4500', '#FF9A00']}
        style={st.trophyCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={st.trophyEmoji}>🏆</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Fade + Slide ─────────────────────────────────────────────────────────────
function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ty = useSharedValue(28);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 100 }));
    op.value = withDelay(delay, withTiming(1, { duration: 380 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
export function WelcomeScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();
  const goalId: UserGoal = route?.params?.goalId ?? 'fitness';
  const info = GOAL_INFO[goalId];

  const handleShare = async () => {
    try {
      await Share.share({
        message: info.shareText,
        title: 'MOVE — رحلتي في اللياقة',
      });
    } catch (_) {}
  };

  const handleContinue = () => {
    navigation.replace('Subscription', { goalId });
  };

  return (
    <View style={[st.root, { backgroundColor: t.background }]}>
      {/* Confetti layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PARTICLES.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </View>

      {/* Background glow orbs */}
      <View style={[st.orb1, { backgroundColor: info.color[0] }]} pointerEvents="none" />
      <View style={[st.orb2, { backgroundColor: '#B5FF45' }]} pointerEvents="none" />

      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── TROPHY HERO ─────────────────────────── */}
          <TrophyHero color={info.color[0]} />

          {/* ── HEADLINE ────────────────────────────── */}
          <FadeSlide delay={300}>
            <View style={st.headlineWrap}>
              <Text style={[st.welcomeLabel, { color: t.primary }]}>مرحباً بك في MOVE</Text>
              <Text style={[st.headlineTitle, { color: t.text }]}>أنت الآن جزء{'\n'}من المجتمع</Text>
              <Text style={[st.headlineSub, { color: t.muted }]}>
                فريقك يُبنى الآن، خطتك ستكون جاهزة خلال ثوانٍ
              </Text>
            </View>
          </FadeSlide>

          {/* ── GOAL CARD ───────────────────────────── */}
          <FadeSlide delay={440}>
            <LinearGradient
              colors={info.color}
              style={st.goalCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={st.goalCardTop}>
                <View style={st.goalBadge}>
                  <Text style={st.goalBadgeText}>هدفك</Text>
                </View>
                <Text style={st.goalEmoji}>{info.emoji}</Text>
              </View>
              <Text style={st.goalTitle}>{info.title}</Text>
              <Text style={st.goalSub}>{info.subtitle}</Text>
              <View style={st.goalStat}>
                <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={st.goalStatText}>{info.stat}</Text>
              </View>
            </LinearGradient>
          </FadeSlide>

          {/* ── TEAM CARD ───────────────────────────── */}
          <FadeSlide delay={560}>
            <View style={[st.teamCard, { backgroundColor: t.card, borderColor: t.line }]}>
              <View style={st.teamCardHeader}>
                <View style={[st.teamIconBg, { backgroundColor: t.primary + '14' }]}>
                  <Ionicons name="people" size={16} color={t.primary} />
                </View>
                <Text style={[st.teamCardTitle, { color: t.text }]}>فريقك الصحي</Text>
              </View>
              <View style={st.teamPills}>
                {info.team.map((member, i) => (
                  <View key={i} style={[st.teamPill, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                    <View style={[st.teamPillDot, { backgroundColor: t.primary }]} />
                    <Text style={[st.teamPillText, { color: t.text }]}>{member}</Text>
                  </View>
                ))}
              </View>
              <Text style={[st.teamNote, { color: t.muted }]}>
                يمكنك التواصل مع فريقك مباشرة من قسم الرسائل
              </Text>
            </View>
          </FadeSlide>

          {/* ── STEPS INDICATOR ─────────────────────── */}
          <FadeSlide delay={640}>
            <View style={st.stepsRow}>
              {[
                { label: 'الهدف', done: true },
                { label: 'الاشتراك', done: false, active: true },
                { label: 'ابدأ', done: false },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <View style={st.stepItem}>
                    <View style={[
                      st.stepCircle,
                      step.done   && { backgroundColor: t.success, borderColor: t.success },
                      step.active && { borderColor: t.primary },
                      !step.done && !step.active && { borderColor: t.line },
                    ]}>
                      {step.done
                        ? <Ionicons name="checkmark" size={12} color="#fff" />
                        : <View style={[st.stepDot, { backgroundColor: step.active ? t.primary : t.line }]} />
                      }
                    </View>
                    <Text style={[st.stepLabel, {
                      color: step.done ? t.success : step.active ? t.primary : t.muted,
                      fontWeight: step.active ? '800' : '500',
                    }]}>
                      {step.label}
                    </Text>
                  </View>
                  {i < 2 && (
                    <View style={[st.stepLine, { backgroundColor: i === 0 ? t.success : t.line }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </FadeSlide>

          {/* ── SHARE CARD ──────────────────────────── */}
          <FadeSlide delay={700}>
            <Pressable
              style={({ pressed }) => [
                st.shareCard,
                { backgroundColor: t.cardSoft, borderColor: t.line },
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleShare}
            >
              <View style={st.shareCardLeft}>
                <View style={[st.shareIconBg, { backgroundColor: t.primary + '14' }]}>
                  <Ionicons name="share-social-outline" size={18} color={t.primary} />
                </View>
                <View style={st.shareCardText}>
                  <Text style={[st.shareTitle, { color: t.text }]}>شارك انضمامك</Text>
                  <Text style={[st.shareSub, { color: t.muted }]}>شجّع أصدقاءك على الانضمام</Text>
                </View>
              </View>
              <View style={[st.shareArrow, { backgroundColor: t.primary }]}>
                <Ionicons name="arrow-back" size={14} color="#fff" />
              </View>
            </Pressable>
          </FadeSlide>

          {/* ── CTA ─────────────────────────────────── */}
          <FadeSlide delay={780}>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.88 }]}
              onPress={handleContinue}
            >
              <LinearGradient
                colors={['#FF4500', '#FF6800', '#FF9A00']}
                style={st.ctaBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flash" size={17} color="#fff" />
                <Text style={st.ctaBtnText}>اختر اشتراكك وابدأ</Text>
                <Ionicons name="arrow-back" size={17} color="#fff" />
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('MainTabs')} style={st.skipBtn}>
              <Text style={[st.skipText, { color: t.muted }]}>تخطى الآن، اشترك لاحقاً</Text>
            </Pressable>
          </FadeSlide>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 48,
    alignItems: 'stretch',
  },

  // Background
  orb1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    top: -80, right: -60, opacity: 0.12,
  },
  orb2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    top: 160, left: -80, opacity: 0.10,
  },

  // Trophy hero
  trophyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: spacing.lg,
  },
  trophyRings: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  trophyCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },
  trophyEmoji: { fontSize: 42, lineHeight: 50 },

  // Headline
  headlineWrap:  { alignItems: 'center', marginBottom: spacing.xl },
  welcomeLabel:  { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: spacing.xs },
  headlineTitle: { fontSize: 38, fontWeight: '900', textAlign: 'center', lineHeight: 44, letterSpacing: -0.5 },
  headlineSub:   { fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },

  // Goal card
  goalCard: {
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.sm,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  goalCardTop:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  goalBadge:    { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  goalBadgeText:{ color: '#fff', fontSize: 11, fontWeight: '800' },
  goalEmoji:    { fontSize: 32 },
  goalTitle:    { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'right', letterSpacing: -0.5 },
  goalSub:      { color: 'rgba(255,255,255,0.72)', fontSize: 13, textAlign: 'right', marginTop: 4, lineHeight: 20 },
  goalStat: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 5,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  goalStatText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },

  // Team card
  teamCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCardHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  teamIconBg:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  teamCardTitle:  { fontSize: 15, fontWeight: '800' },
  teamPills:      { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  teamPill:       { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  teamPillDot:    { width: 6, height: 6, borderRadius: 3 },
  teamPillText:   { fontSize: 13, fontWeight: '600' },
  teamNote:       { fontSize: 12, textAlign: 'right', lineHeight: 18 },

  // Steps
  stepsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: 0,
  },
  stepItem:   { alignItems: 'center', gap: 5 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepDot:    { width: 8, height: 8, borderRadius: 4 },
  stepLabel:  { fontSize: 11 },
  stepLine:   { flex: 1, height: 1.5, marginHorizontal: 6, marginBottom: 18 },

  // Share card
  shareCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  shareCardLeft:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, flex: 1 },
  shareIconBg:    { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shareCardText:  { flex: 1, alignItems: 'flex-end' },
  shareTitle:     { fontSize: 14, fontWeight: '800' },
  shareSub:       { fontSize: 12, marginTop: 2 },
  shareArrow:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // CTA
  ctaBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.sm,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  skipBtn:    { alignItems: 'center', paddingVertical: spacing.sm },
  skipText:   { fontSize: 13, fontWeight: '600' },
});
