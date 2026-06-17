import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  chats,
  feedPosts,
  healthSnapshot,
  leaderboard,
  weeklyProgress,
  weeklyWorkout,
} from '../data/mockData';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

// ─── Pulsing Ring ──────────────────────────────────────────────────────────────
function PulsingRing({ size, color, delay }: { size: number; color: string; delay: number }) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1.9, { duration: 2200, easing: Easing.out(Easing.ease) }), withTiming(1.0, { duration: 0 })),
      -1,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(withTiming(0, { duration: 2200, easing: Easing.out(Easing.ease) }), withTiming(0.45, { duration: 0 })),
      -1,
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: color }, animStyle]} />
  );
}


// ─── Fade + Slide Entrance ────────────────────────────────────────────────────
function FadeSlide({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const translateY = useSharedValue(26);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 110 }));
    opacity.value    = withDelay(delay, withTiming(1, { duration: 360 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }], opacity: opacity.value }));
  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

// ─── Readiness Gauge (dot ring) ───────────────────────────────────────────────
function ReadinessGauge({ pct }: { pct: number }) {
  const DOT_COUNT   = 40;
  const RADIUS      = 62;
  const DOT_R       = 3.5;
  const filledCount = Math.round((pct / 100) * DOT_COUNT);
  const SIZE        = (RADIUS + DOT_R + 8) * 2;

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angle = ((i / DOT_COUNT) * 360 - 90) * (Math.PI / 180);
    return {
      x:      RADIUS * Math.cos(angle),
      y:      RADIUS * Math.sin(angle),
      filled: i < filledCount,
    };
  });

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <PulsingRing size={72} color="rgba(255,255,255,0.35)" delay={0} />
      {dots.map((dot, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width:        DOT_R * 2,
            height:       DOT_R * 2,
            borderRadius: DOT_R,
            backgroundColor: dot.filled ? '#fff' : 'rgba(255,255,255,0.18)',
            left: SIZE / 2 + dot.x - DOT_R,
            top:  SIZE / 2 + dot.y - DOT_R,
          }}
        />
      ))}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 0 }}>{pct}%</Text>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1 }}>جاهزية</Text>
      </View>
    </View>
  );
}

// ─── Activity Bars ────────────────────────────────────────────────────────────
function ActivityBars({ t }: { t: ThemeTokens }) {
  const MAX_H = 52;

  return (
    <View style={ab.row}>
      {weeklyProgress.map((d, i) => {
        const isToday  = i === 0;
        const intensity = (d.workoutDone ? 0.6 : 0) + Math.min((d.runKm ?? 0) / 10, 0.4);
        const height   = Math.max(intensity * MAX_H, isToday ? 10 : 4);
        const isEmpty  = intensity === 0;

        return (
          <View key={d.dayShort} style={ab.col}>
            <View style={[ab.track, { height: MAX_H, justifyContent: 'flex-end' }]}>
              {!isEmpty ? (
                <LinearGradient
                  colors={isToday ? [t.gradientStart, t.gradientEnd] : [t.primary + '55', t.primary + '28']}
                  style={[ab.bar, { height }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ) : (
                <View style={[ab.barEmpty, { backgroundColor: t.line }]} />
              )}
            </View>
            {isToday && <View style={[ab.todayDot, { backgroundColor: t.primary }]} />}
            <Text style={[ab.label, { color: isToday ? t.text : t.muted }, isToday && { fontWeight: '800' }]}>
              {d.dayShort}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const ab = StyleSheet.create({
  row:      { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 4 },
  col:      { alignItems: 'center', gap: 4, flex: 1 },
  track:    { width: 22, alignItems: 'center' },
  bar:      { width: 22, borderRadius: 7 },
  barEmpty: { width: 22, height: 4, borderRadius: 3 },
  todayDot: { width: 5, height: 5, borderRadius: 3 },
  label:    { fontSize: 9 },
});

// ─── Leaderboard Podium ───────────────────────────────────────────────────────
function LeaderboardPodium({ t, onPress, cardShadow }: { t: ThemeTokens; onPress: () => void; cardShadow: any }) {
  const top3 = leaderboard.slice(0, 3);
  // Podium order: 2nd | 1st | 3rd (left-to-right visual, but RTL so row-reverse)
  // In row-reverse: first child is rightmost, so order: [3rd, 1st, 2nd] for RTL display
  const order    = [top3[2], top3[0], top3[1]].filter(Boolean);
  const podH     = [60, 110, 80]; // heights for 3rd / 1st / 2nd in RTL order
  const medals   = ['🥉', '🥇', '🥈'];

  return (
    <Pressable style={[pd.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]} onPress={onPress}>
      <View style={pd.header}>
        <Ionicons name="chevron-back" size={14} color={t.primary} />
        <Text style={[pd.title, { color: t.text }]}>لوحة الأبطال</Text>
      </View>

      <View style={pd.stage}>
        {order.map((entry, i) => {
          if (!entry) return null;
          const isMe = entry.isMe;
          return (
            <View key={entry.rank} style={pd.col}>
              <Text style={pd.medal}>{medals[i]}</Text>
              <View style={[pd.avatar, { backgroundColor: isMe ? t.primary + '20' : t.line, borderColor: isMe ? t.primary : t.muted }]}>
                <Text style={[pd.avatarTxt, { color: isMe ? t.primary : t.text }]}>{entry.avatar ?? entry.name.charAt(0)}</Text>
              </View>
              <Text style={[pd.name, { color: isMe ? t.primary : t.text }]} numberOfLines={1}>
                {isMe ? 'أنت' : entry.name.split(' ')[0]}
              </Text>
              <Text style={[pd.pts, { color: t.muted }]}>{entry.weeklyPoints.toLocaleString()}</Text>
              <View style={[pd.bar, { height: podH[i], backgroundColor: isMe ? 'transparent' : t.line, overflow: 'hidden' }]}>
                {isMe && (
                  <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
                )}
                <Text style={[pd.rankNum, { color: isMe ? '#fff' : t.muted }]}>{entry.rank}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const pd = StyleSheet.create({
  card:     { borderRadius: 20, padding: spacing.md, marginBottom: spacing.xs, borderWidth: 1 },
  header:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
  title:    { flex: 1, fontSize: 17, fontWeight: '900', textAlign: 'right' },
  stage:    { flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'center', gap: spacing.sm },
  col:      { flex: 1, alignItems: 'center', gap: 4 },
  medal:    { fontSize: 20 },
  avatar:   { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:{ fontSize: 15, fontWeight: '900' },
  name:     { fontSize: 11, fontWeight: '700' },
  pts:      { fontSize: 10, fontWeight: '600' },
  bar:      { width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  rankNum:  { fontWeight: '900', fontSize: 22 },
});

// ─── Community Pulse ──────────────────────────────────────────────────────────
function CommunityPulse({ t, onSeeAll, cardShadow }: { t: ThemeTokens; onSeeAll: () => void; cardShadow: any }) {
  const [liked, setLiked] = useState<Record<string, boolean>>(
    Object.fromEntries(feedPosts.map((p) => [p.id, p.isLiked ?? false]))
  );
  const toggle = (id: string) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={{ marginBottom: spacing.xs }}>
      <View style={cp.head}>
        <Pressable onPress={onSeeAll} style={cp.seeAll}>
          <Text style={[cp.seeAllTxt, { color: t.primary }]}>عرض الكل</Text>
          <Ionicons name="chevron-back" size={13} color={t.primary} />
        </Pressable>
        <Text style={[cp.headTitle, { color: t.text }]}>ما يحدث الآن</Text>
      </View>
      {feedPosts.slice(0, 4).map((post) => {
        const isLiked = liked[post.id];
        const delta   = isLiked && !post.isLiked ? 1 : !isLiked && post.isLiked ? -1 : 0;
        return (
          <View key={post.id} style={[cp.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
            {/* Avatar */}
            <View style={[cp.avatar, { backgroundColor: post.userColor + '22', borderColor: post.userColor }]}>
              <Text style={[cp.avatarTxt, { color: post.userColor }]}>{post.userInitials}</Text>
            </View>

            {/* Body */}
            <View style={cp.body}>
              <View style={cp.nameRow}>
                <Text style={[cp.name, { color: t.text }]}>{post.userName}</Text>
                {post.isPR && (
                  <View style={[cp.prBadge, { backgroundColor: '#FFD700' + '22' }]}>
                    <Text style={cp.prTxt}>🏆 رقم قياسي</Text>
                  </View>
                )}
              </View>
              <Text style={[cp.headline, { color: t.textSub }]} numberOfLines={1}>{post.headline}</Text>
              {post.metric != null && (
                <View style={cp.metricRow}>
                  <Text style={[cp.metricVal, { color: t.primary }]}>{post.metric}</Text>
                  <Text style={[cp.metricLbl, { color: t.muted }]}>{post.metricLabel}</Text>
                </View>
              )}
              <Text style={[cp.time, { color: t.muted }]}>{post.timeLabel}</Text>
            </View>

            {/* Kudos */}
            <Pressable style={[cp.kudos, isLiked && { backgroundColor: t.primary + '14' }]} onPress={() => toggle(post.id)}>
              <Text style={{ fontSize: 16 }}>{isLiked ? '💪' : '🤜'}</Text>
              <Text style={[cp.kudosN, { color: isLiked ? t.primary : t.muted }]}>{post.likesCount + delta}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const cp = StyleSheet.create({
  head:      { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: spacing.sm, paddingTop: spacing.xs },
  headTitle: { flex: 1, fontSize: 17, fontWeight: '900', textAlign: 'right' },
  seeAll:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllTxt: { fontSize: 13, fontWeight: '700' },
  card:      { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm, borderRadius: 18, padding: spacing.md, borderWidth: 1, marginBottom: spacing.xs },
  avatar:    { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontWeight: '800', fontSize: 14 },
  body:      { flex: 1, alignItems: 'flex-end', gap: 3 },
  nameRow:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name:      { fontWeight: '700', fontSize: 13 },
  prBadge:   { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  prTxt:     { fontSize: 10, fontWeight: '800', color: '#B8860B' },
  headline:  { fontSize: 12, textAlign: 'right', lineHeight: 17 },
  metricRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 3 },
  metricVal: { fontSize: 17, fontWeight: '900' },
  metricLbl: { fontSize: 11, fontWeight: '600' },
  time:      { fontSize: 10 },
  kudos:     { alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10, minWidth: 40 },
  kudosN:    { fontSize: 11, fontWeight: '700' },
});

// ─── Quick Action Tile ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'workout',    icon: 'barbell-outline'    as const, label: 'تمرين',  sub: 'ابدأ التمرين',  color: '#FF7A18', route: 'Workout'    },
  { id: 'run',        icon: 'walk-outline'        as const, label: 'جري',    sub: 'تتبع المسار',   color: '#FF7A18', route: 'Run'        },
  { id: 'exercises',  icon: 'list-outline'        as const, label: 'التمارين', sub: 'شاهد الشرح',  color: '#8E5CF5', route: 'WeeklyPlan' },
  { id: 'nutrition',  icon: 'nutrition-outline'   as const, label: 'تغذية',  sub: 'خطة اليوم',     color: '#22C55E', route: 'Nutrition'  },
  { id: 'progress',   icon: 'trending-up-outline' as const, label: 'تقدم',   sub: 'تحليل الأداء',  color: '#3B82F6', route: 'Progress'   },
] as const;

function QuickTile({ action, delay, onPress, t }: { action: typeof QUICK_ACTIONS[number]; delay: number; onPress: () => void; t: ThemeTokens }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <FadeSlide delay={delay} style={qt.wrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 14 }); }}
      >
        <Animated.View style={[qt.tile, { backgroundColor: t.card, borderColor: t.line }, animStyle]}>
          <View style={[qt.iconBg, { backgroundColor: t.primary + '12' }]}>
            <Ionicons name={action.icon} size={24} color={t.primary} />
          </View>
          <Text style={[qt.label, { color: t.text }]}>{action.label}</Text>
        </Animated.View>
      </Pressable>
    </FadeSlide>
  );
}

const qt = StyleSheet.create({
  wrapper:   { width: '48%' },
  tile:      { borderRadius: 14, borderWidth: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: spacing.sm, gap: spacing.sm },
  iconBg:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label:     { fontSize: 14, fontWeight: '800', textAlign: 'center' },
});

// ─── Dashboard Screen ──────────────────────────────────────────────────────────
export function DashboardScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const todayWorkout = weeklyWorkout.find((w) => !w.completed) || weeklyWorkout[0];
  const unreadCount  = chats.reduce((sum, c) => sum + c.unreadCount, 0);
  const daysActive   = weeklyProgress.filter((d) => d.workoutDone || (d.runKm ?? 0) > 0).length;
  const dayStr       = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };


  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TOP BAR ─────────────────────────────────────── */}
        <FadeSlide delay={0}>
          <View style={st.topBar}>
            <View style={st.greetingWrap}>
              <Text style={[st.dayStr, { color: t.muted }]}>{dayStr}</Text>
              <Text style={[st.greeting, { color: t.text }]}>أهلاً، امتنان</Text>
            </View>
            <View style={st.topActions}>
              <Pressable style={[st.iconBtn, { backgroundColor: t.card }, cardShadow]} onPress={() => navigation.navigate('Store')}>
                <Ionicons name="bag-outline" size={19} color={t.text} />
              </Pressable>
              <Pressable style={[st.iconBtn, { backgroundColor: t.card }, cardShadow]} onPress={() => navigation.navigate('Notifications')}>
                <View style={[st.notifDot, { backgroundColor: t.primary, borderColor: t.background }]} />
                <Ionicons name="notifications-outline" size={19} color={t.text} />
              </Pressable>
              <Pressable style={[st.iconBtn, { backgroundColor: t.card }, cardShadow]} onPress={() => navigation.navigate('Chat')}>
                {unreadCount > 0 && (
                  <View style={[st.msgBadge, { backgroundColor: t.primary }]}>
                    <Text style={st.msgBadgeText}>{unreadCount}</Text>
                  </View>
                )}
                <Ionicons name="chatbubble-outline" size={19} color={t.text} />
              </Pressable>
            </View>
          </View>
        </FadeSlide>

        {/* ── HERO: Readiness Gauge ─────────────────────────── */}
        <FadeSlide delay={80}>
          <LinearGradient
            colors={[t.primary, t.primary]}
            style={st.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header row */}
            <View style={st.heroTop}>
              <Text style={st.heroEyebrow}>جاهزيتك اليوم</Text>
            </View>

            {/* Gauge + stats split */}
            <View style={st.heroBody}>
              {/* LEFT: workout info */}
              <View style={st.heroInfo}>
                <Text style={st.heroWorkout}>{todayWorkout.title}</Text>
                <Text style={st.heroMeta}>{todayWorkout.durationMin} د · {todayWorkout.exercises?.length ?? 0} تمارين</Text>
                <View style={st.heroRule} />
                <View style={st.heroStats}>
                  <View style={st.heroStat}>
                    <Text style={st.heroStatVal}>{healthSnapshot.sleepHours}<Text style={st.heroStatUnit}> س</Text></Text>
                    <Text style={st.heroStatLbl}>نوم</Text>
                  </View>
                  <View style={st.heroStatDivider} />
                  <View style={st.heroStat}>
                    <Text style={st.heroStatVal}>{healthSnapshot.heartRate}</Text>
                    <Text style={st.heroStatLbl}>نبض</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT: dot-ring gauge */}
              <ReadinessGauge pct={healthSnapshot.readinessPercent} />
            </View>

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.88 }]}
              onPress={() => navigation.navigate('Workout', { workoutId: todayWorkout.id })}
            >
              <View style={st.heroBtn}>
                <Ionicons name="flash" size={15} color={t.primary} />
                <Text style={[st.heroBtnText, { color: t.primary }]}>ابدأ التمرين</Text>
              </View>
            </Pressable>
          </LinearGradient>
        </FadeSlide>

        {/* ── QUICK ACTIONS ────────────────────────────────────── */}
        <View style={st.quickGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <QuickTile key={a.id} action={a} delay={160 + i * 50} t={t} onPress={() => navigation.navigate(a.route as any)} />
          ))}
        </View>

        {/* ── ACTIVITY BARS ────────────────────────────────────── */}
        <FadeSlide delay={440}>
          <View style={[st.activityCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
            <View style={st.activityHeader}>
              <Text style={[st.activitySub, { color: t.muted }]}>{daysActive} / {weeklyProgress.length} أيام نشطة</Text>
              <Text style={[st.activityTitle, { color: t.text }]}>هذا الأسبوع</Text>
            </View>
            <ActivityBars t={t} />
          </View>
        </FadeSlide>

        {/* ── LEADERBOARD PODIUM ───────────────────────────────── */}
        <FadeSlide delay={520}>
          <LeaderboardPodium t={t} cardShadow={cardShadow} onPress={() => navigation.navigate('Community')} />
        </FadeSlide>

        {/* ── TEAM CONCIERGE BAR ────────────────────────────────── */}


        {/* ── COMMUNITY PULSE ──────────────────────────────────── */}
        <FadeSlide delay={600}>
          <CommunityPulse t={t} cardShadow={cardShadow} onSeeAll={() => navigation.navigate('Community')} />
        </FadeSlide>


        {/* ── STEPS PROGRESS ────────────────────────────────────── */}
        

        {/* ── LAST RUN ──────────────────────────────────────────── */}
        

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  /* ── top bar ── */
  topBar:       { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  topActions:   { flexDirection: 'row', gap: spacing.xs },
  greetingWrap: { alignItems: 'flex-end', gap: 1 },
  dayStr:       { fontSize: 11, fontWeight: '500' },
  greeting:     { fontSize: 24, fontWeight: '900' },
  iconBtn:      { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  notifDot:     { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  msgBadge:     { position: 'absolute', top: -1, right: -1, borderRadius: 999, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  msgBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  /* ── hero ── */
  hero: {
    borderRadius: 18, padding: 20, marginBottom: spacing.md, overflow: 'hidden',
    shadowColor: '#111', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  heroTop:            { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  heroEyebrow:  { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600' },

  heroBody:  { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.md },
  heroInfo:  { flex: 1, alignItems: 'flex-end', gap: 4, paddingRight: 12 },
  heroWorkout:    { color: '#fff', fontSize: 17, fontWeight: '900', textAlign: 'right' },
  heroMeta:       { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'right' },
  heroRule:       { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch', marginVertical: 8 },
  heroStats:      { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  heroStat:       { alignItems: 'center' },
  heroStatVal:    { color: '#fff', fontSize: 18, fontWeight: '900' },
  heroStatUnit:   { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  heroStatLbl:    { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 },
  heroStatDivider:{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.25)' },

  heroBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  heroBtnText: { fontSize: 15, fontWeight: '800' },

  /* ── quick actions ── */
  quickGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm, marginBottom: spacing.md },

  /* ── shared card ── */
  card: { borderRadius: 20, marginBottom: spacing.xs },

  /* ── activity bars ── */
  activityCard:   { borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  activityHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  activityTitle:  { fontWeight: '800', fontSize: 15, textAlign: 'right' },
  activitySub:    { fontSize: 11 },

  /* ── team bar ── */
  teamBar:        { borderRadius: 20, paddingVertical: spacing.md, paddingHorizontal: spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  teamBarBody:    { flex: 1, alignItems: 'flex-end' },
  teamBarTitle:   { fontSize: 14, fontWeight: '800' },
  teamBarSub:     { fontSize: 11, marginTop: 2 },
  teamAvatars:    { flexDirection: 'row-reverse', alignItems: 'center' },
  teamAvatar:     { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontSize: 11, fontWeight: '900' },

  /* ── steps ── */
  progressNumbers: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6, padding: spacing.md, paddingBottom: 0 },
  progressNum:     { fontSize: 52, fontWeight: '900', letterSpacing: 0 },
  progressGoal:    { fontSize: 13 },
  progressUnit:    { fontSize: 13, textAlign: 'right', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  stepsTrack:      { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xs },
  stepsFillBase:   { height: 8, borderRadius: 4, overflow: 'hidden' },
  stepsNote:       { fontSize: 12, textAlign: 'right', padding: spacing.md, paddingTop: spacing.xs },

  /* ── last run ── */
  runCard:     { borderRadius: 22, overflow: 'hidden', marginBottom: spacing.xs },
  runImg:      { width: '100%', height: 200 },
  runOverlay:  { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, paddingBottom: spacing.lg },
  runDist:     { color: '#fff', fontSize: 46, fontWeight: '900', textAlign: 'right', letterSpacing: 0 },
  runDistUnit: { fontSize: 22, fontWeight: '700' },
  runStatsRow: { flexDirection: 'row-reverse', gap: spacing.lg, marginTop: 6 },
  runStat:     { alignItems: 'center' },
  runStatVal:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  runStatLbl:  { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 },
});
