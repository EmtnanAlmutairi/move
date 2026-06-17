import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  bodyMeasurements,
  myPostGrid,
  runHistory,
  userProfile,
  weeklyProgress,
  weeklyWorkout,
} from '../data/mockData';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const SCREEN_W = Dimensions.get('window').width;
const GRID_ITEM = (SCREEN_W - spacing.lg * 2 - 4) / 3;

// ─── Trophy Case ──────────────────────────────────────────────────────────────
const TROPHIES = [
  { id: 't1', num: null,  icon: 'run',           label: '5 كم أول',          earned: true,  color: '#30B36A' },
  { id: 't2', num: null,  icon: 'fire',           label: 'أسبوع كامل',        earned: true,  color: '#FF7A18' },
  { id: 't3', num: null,  icon: 'dumbbell',       label: 'بناء العضلات',      earned: true,  color: '#FF5C39' },
  { id: 't4', num: 10,    icon: null,             label: '10 تمارين',         earned: true,  color: '#1A9ECC' },
  { id: 't5', num: null,  icon: 'podium',         label: 'أفضل 10',           earned: false, color: '#8E5CF5' },
  { id: 't6', num: null,  icon: 'trophy-outline', label: 'متصدر الأسبوع',    earned: false, color: '#FFD700' },
  { id: 't7', num: 30,    icon: null,             label: '30 يوم نشاط',      earned: false, color: '#5E81F4' },
  { id: 't8', num: 50,    icon: null,             label: '50 كم مجموع',      earned: false, color: '#FF7A18' },
] as const;

function TrophyBadge({ item, t }: { item: typeof TROPHIES[number]; t: ThemeTokens }) {
  const bg = item.earned ? item.color : t.cardSoft;
  const border = item.earned ? item.color : t.line;
  const fg = item.earned ? '#fff' : t.muted;
  return (
    <View style={tb.wrap}>
      <View style={[tb.badge, { backgroundColor: bg, borderColor: border }]}>
        {item.num != null
          ? <Text style={[tb.num, { color: fg }]}>{item.num}</Text>
          : <MaterialCommunityIcons name={item.icon as any} size={22} color={fg} />
        }
        {item.earned && <View style={[tb.shine, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />}
      </View>
      <Text style={[tb.label, { color: item.earned ? t.text : t.muted }]} numberOfLines={2}>
        {item.label}
      </Text>
    </View>
  );
}
const tb = StyleSheet.create({
  wrap:  { width: 74, alignItems: 'center', gap: 6 },
  badge: { width: 58, height: 58, borderRadius: 16, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  num:   { fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  label: { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
});

// ─── Kudos Avatar Stack ───────────────────────────────────────────────────────
const KUDOS_GIVERS = [
  { id: 'k1', color: '#FF6B35', initials: 'أم' },
  { id: 'k2', color: '#5E81F4', initials: 'سع' },
  { id: 'k3', color: '#8E5CF5', initials: 'رش' },
];
function KudosAvatars({ count, t }: { count: number; t: ThemeTokens }) {
  return (
    <View style={ka.row}>
      <View style={ka.stack}>
        {KUDOS_GIVERS.map((g, i) => (
          <View
            key={g.id}
            style={[ka.avatar, { backgroundColor: g.color, borderColor: t.card, marginRight: i > 0 ? -8 : 0, zIndex: 3 - i }]}
          >
            <Text style={ka.initials}>{g.initials}</Text>
          </View>
        ))}
      </View>
      <Text style={[ka.txt, { color: t.muted }]}>{count} أعطوا كودوس</Text>
    </View>
  );
}
const ka = StyleSheet.create({
  row:      { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  stack:    { flexDirection: 'row-reverse' },
  avatar:   { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 8, fontWeight: '900' },
  txt:      { fontSize: 12, fontWeight: '600' },
});

// ─── Achievement Banner ───────────────────────────────────────────────────────
function AchievementBanner({ text, t }: { text: string; t: ThemeTokens }) {
  return (
    <View style={[ab.banner, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
      <Text style={[ab.text, { color: t.text }]}>{text}</Text>
      <View style={[ab.iconWrap, { backgroundColor: '#FFD700' + '25' }]}>
        <MaterialCommunityIcons name="medal" size={20} color="#B8860B" />
      </View>
    </View>
  );
}
const ab = StyleSheet.create({
  banner:   { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 10, borderWidth: 1, padding: spacing.sm },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text:     { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right', lineHeight: 18 },
});

// ─── Pace formatter ───────────────────────────────────────────────────────────
function formatPace(secPerKm: number) {
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Strava-style Area Line Chart ────────────────────────────────────────────
const CHART_AREA_W = SCREEN_W - spacing.lg * 2 - spacing.md * 2;

function AreaLineChart({ data, color, t }: { data: number[]; color: string; t: ThemeTokens }) {
  const W = CHART_AREA_W;
  const H = 130;
  const PAD_T = 20;
  const PAD_B = 20;
  const PAD_H = 6;
  const cW = W - PAD_H * 2;
  const cH = H - PAD_T - PAD_B;
  const maxV = Math.max(...data, 0.1);
  const STROKE = 2;
  const DOT_R = 4.5;

  const pts = data.map((v, i) => ({
    x: PAD_H + (i / (data.length - 1)) * cW,
    y: PAD_T + (1 - v / maxV) * cH,
    v,
  }));

  return (
    <View style={{ width: W, height: H }}>
      {/* Y-axis labels */}
      <Text style={{ position: 'absolute', top: PAD_T - 14, left: 0, color: t.muted, fontSize: 9, fontWeight: '600' }}>
        {Math.round(maxV)} كم
      </Text>
      <Text style={{ position: 'absolute', bottom: PAD_B - 6, left: 0, color: t.muted, fontSize: 9, fontWeight: '600' }}>
        0 كم
      </Text>

      {/* Horizontal grid lines */}
      {[0, 0.5, 1].map((f, gi) => (
        <View key={gi} style={{
          position: 'absolute', left: PAD_H,
          top: PAD_T + f * cH, width: cW, height: 1,
          backgroundColor: t.line, opacity: 0.6,
        }} />
      ))}

      {/* Area fill — gradient columns between adjacent points */}
      {pts.slice(0, -1).map((p, i) => {
        const nx = pts[i + 1];
        const topY = Math.min(p.y, nx.y);
        const fillH = H - PAD_B - topY;
        return (
          <LinearGradient key={i}
            colors={[color + '50', color + '04']}
            style={{ position: 'absolute', left: p.x, top: topY, width: nx.x - p.x + 1, height: Math.max(0, fillH) }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          />
        );
      })}

      {/* Line segments (rotated around midpoint) */}
      {pts.slice(0, -1).map((p, i) => {
        const nx = pts[i + 1];
        const dx = nx.x - p.x, dy = nx.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const cx = (p.x + nx.x) / 2, cy = (p.y + nx.y) / 2;
        return (
          <View key={i} style={{
            position: 'absolute', left: cx - len / 2, top: cy - STROKE / 2,
            width: len, height: STROKE, borderRadius: 1,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }} />
        );
      })}

      {/* Dots */}
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1;
        return (
          <View key={i} style={{
            position: 'absolute', left: p.x - DOT_R, top: p.y - DOT_R,
            width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
            backgroundColor: isLast ? color : t.card,
            borderWidth: STROKE, borderColor: color,
          }} />
        );
      })}

      {/* Current-week value label */}
      {(() => {
        const lp = pts[pts.length - 1];
        return (
          <Text style={{
            position: 'absolute', left: lp.x - 22, top: lp.y - 20,
            color, fontSize: 11, fontWeight: '900', width: 44, textAlign: 'center',
          }}>
            {lp.v.toFixed(1)} كم
          </Text>
        );
      })()}

      {/* X-axis month labels */}
      {['مار', '', '', '', 'أبر', '', '', '', '', '', '', 'الآن'].slice(0, data.length).map((lbl, i) => {
        if (!lbl) return null;
        const x = PAD_H + (i / (data.length - 1)) * cW;
        return (
          <Text key={i} style={{
            position: 'absolute', bottom: 2, left: x - 14,
            width: 28, textAlign: 'center',
            color: t.muted, fontSize: 9, fontWeight: '700',
          }}>{lbl}</Text>
        );
      })}
    </View>
  );
}

// ─── Reusable Chart Components ────────────────────────────────────────────────
function GradBar({ val, maxVal, color, label, active, barH: chartH, t }: {
  val: number; maxVal: number; color: string; label: string; active: boolean; barH: number; t: ThemeTokens;
}) {
  const h = Math.max(4, (val / maxVal) * (chartH - 22));
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: chartH, gap: 3 }}>
      <LinearGradient
        colors={active ? [color, color + '70'] : [t.cardSoft, t.cardSoft] as [string, string]}
        style={{ width: '82%', height: h, borderRadius: 5 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function ChartCard({ title, hint, badge, children, t, cardShadow }: {
  title: string; hint: string; badge?: string; children: React.ReactNode; t: ThemeTokens; cardShadow: object;
}) {
  return (
    <View style={[chc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      <View style={chc.header}>
        <View style={chc.left}>
          {badge && (
            <View style={[chc.badge, { backgroundColor: t.primary + '14', borderColor: t.primary + '35' }]}>
              <Text style={[chc.badgeTxt, { color: t.primary }]}>{badge}</Text>
            </View>
          )}
          <Text style={[chc.hint, { color: t.muted }]}>{hint}</Text>
        </View>
        <Text style={[chc.title, { color: t.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const chc = StyleSheet.create({
  card:     { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  header:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title:    { fontSize: 15, fontWeight: '900' },
  left:     { alignItems: 'flex-start', gap: 4 },
  hint:     { fontSize: 11 },
  badge:    { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
});

// ─── Dot line overlay helper ──────────────────────────────────────────────────
function TrendDots({ vals, maxVal, color, chartH }: {
  vals: number[]; maxVal: number; color: string; chartH: number;
}) {
  const barH = chartH - 22;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: chartH - 22, flexDirection: 'row-reverse', alignItems: 'flex-end' }}>
      {vals.map((v, i) => {
        const dotY = barH - Math.max(4, (v / maxVal) * barH);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, marginBottom: Math.max(0, (v / maxVal) * barH) - 3 }} />
          </View>
        );
      })}
    </View>
  );
}

type ProfileTab = 'activities' | 'achievements' | 'stats' | 'photos';

export function ProfileScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('activities');
  const [kudosGiven, setKudosGiven] = useState<Record<string, boolean>>({});

  const completedWorkouts = weeklyWorkout.filter((w) => w.completed).length;
  const weeklyDistance = weeklyProgress.reduce((sum, day) => sum + (day.runKm ?? 0), 0);
  const weeklyCalories = weeklyProgress.reduce((sum, day) => sum + day.caloriesBurned, 0);
  const streakDays = weeklyProgress.filter((day) => day.workoutDone || (day.runKm ?? 0) > 0).length;
  const latestWeight = bodyMeasurements[bodyMeasurements.length - 1]?.weightKg ?? userProfile.currentWeight;

  const maxRunKm = Math.max(...runHistory.map((r) => r.distanceKm));
  const bestPace = Math.min(...runHistory.map((r) => r.avgPaceSecPerKm));

  // Activity titles by time (simulated)
  const runTitles = ['جري الصباح', 'جري المساء', 'جري الصباح', 'جري طويل', 'جري سريع'];

  const activities = [
    ...runHistory.slice(0, 4).map((run, i) => ({
      id: run.id,
      icon: 'run' as const,
      type: 'جري',
      title: runTitles[i] ?? 'جري',
      distance: `${run.distanceKm} كم`,
      pace: `${formatPace(run.avgPaceSecPerKm)} /كم`,
      time: `${Math.floor(run.durationSec / 60)} د`,
      calories: `${run.calories}`,
      meta: run.dateLabel,
      kudos: 24 - i * 3,
      comments: 5 - i,
      isPR: run.distanceKm === maxRunKm,
      isBestPace: run.avgPaceSecPerKm === bestPace,
      achievementText:
        run.distanceKm === maxRunKm
          ? `أسرع جري لـ ${run.distanceKm} كم في تاريخك!`
          : run.avgPaceSecPerKm === bestPace
          ? `أسرع إيقاع سجّلته — ${formatPace(run.avgPaceSecPerKm)} /كم`
          : null,
    })),
    ...weeklyWorkout.filter((workout) => workout.completed).slice(0, 2).map((workout, i) => ({
      id: workout.id,
      icon: 'dumbbell' as const,
      type: 'تمرين',
      title: workout.title,
      distance: '-',
      pace: '-',
      time: `${workout.durationMin} د`,
      calories: '520',
      meta: workout.dayLabel,
      kudos: 18 - i * 4,
      comments: 3,
      isPR: false,
      isBestPace: false,
      achievementText: i === 0 ? 'أتممت 100% من التمرين المخطط!' : null,
    })),
  ];

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  const earnedCount = TROPHIES.filter((x) => x.earned).length;

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={st.header}>
          <Pressable
            style={[st.headerBtn, { backgroundColor: t.card, borderColor: t.line }]}
            onPress={() => navigation.navigate('Tweaks')}
          >
            <Ionicons name="settings-outline" size={16} color={t.muted} />
            <Text style={[st.headerBtnTxt, { color: t.muted }]}>إعدادات</Text>
          </Pressable>
          <Text style={[st.headerTitle, { color: t.text }]}>ملفي</Text>
          <Pressable
            style={[st.headerBtn, { backgroundColor: t.primary + '14', borderColor: t.primary + '40' }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={16} color={t.primary} />
            <Text style={[st.headerBtnTxt, { color: t.primary }]}>تعديل</Text>
          </Pressable>
        </View>

        {/* ── Public Profile Banner ── */}
        <View style={[st.publicBanner, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
          <Ionicons name="eye-outline" size={14} color={t.muted} />
          <Text style={[st.publicBannerTxt, { color: t.muted }]}>ما يراه أعضاء المجتمع عنك</Text>
        </View>

        {/* ── Identity ── */}
        <View style={st.identity}>
          <View style={[st.avatar, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
            <Text style={[st.avatarText, { color: t.text }]}>{userProfile.avatarInitials}</Text>
          </View>
          <Text style={[st.name, { color: t.text }]}>{userProfile.name}</Text>
          <View style={[st.statusPill, { backgroundColor: t.card, borderColor: t.line }]}>
            <View style={[st.statusDot, { backgroundColor: t.primary }]} />
            <Text style={[st.statusText, { color: t.muted }]}>نشط اليوم</Text>
          </View>
          <View style={st.socialRow}>
            <View style={st.socialItem}>
              <Text style={[st.socialVal, { color: t.text }]}>248</Text>
              <Text style={[st.socialLbl, { color: t.muted }]}>متابع</Text>
            </View>
            <View style={[st.divider, { backgroundColor: t.line }]} />
            <View style={st.socialItem}>
              <Text style={[st.socialVal, { color: t.text }]}>183</Text>
              <Text style={[st.socialLbl, { color: t.muted }]}>يتابع</Text>
            </View>
          </View>
          <View style={st.actions}>
            <Pressable
              style={[st.followBtn, { backgroundColor: following ? t.card : t.primary, borderColor: following ? t.line : t.primary }]}
              onPress={() => setFollowing((v) => !v)}
            >
              <Text style={[st.followText, { color: following ? t.text : '#fff' }]}>{following ? 'تتابعه' : 'متابعة'}</Text>
            </Pressable>
            <Pressable style={[st.messageBtn, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => navigation.navigate('Chat')}>
              <Text style={[st.messageText, { color: t.text }]}>رسالة</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Weekly Summary ── */}
        <View style={[st.summaryCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <View style={st.summaryHeader}>
            <Text style={[st.summaryHint, { color: t.muted }]}>هذا الأسبوع</Text>
            <Text style={[st.summaryTitle, { color: t.text }]}>ملخص الأداء</Text>
          </View>
          <View style={st.summaryGrid}>
            {[
              { value: String(completedWorkouts), label: 'تمارين', icon: null },
              { value: weeklyDistance.toFixed(1), label: 'كم', icon: null },
              { value: String(weeklyCalories), label: 'سعرة', icon: null },
              { value: `${latestWeight}`, label: 'كغ', icon: null },
              { value: String(streakDays), label: 'ستريك', icon: '🔥' },
              { value: '#3', label: 'ترتيب', icon: null },
            ].map((item) => (
              <View key={item.label} style={st.summaryItem}>
                <View style={st.summaryValueRow}>
                  {item.icon && <Text style={st.summaryIcon}>{item.icon}</Text>}
                  <Text style={[st.summaryValue, { color: item.icon ? t.primary : t.text }]}>{item.value}</Text>
                </View>
                <Text style={[st.summaryLabel, { color: t.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Weekly Distance Trend ── */}
        <View style={[st.trendCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <View style={st.trendHeader}>
            <View>
              <Text style={[st.trendKm, { color: t.text }]}>{weeklyDistance.toFixed(1)} كم</Text>
              <Text style={[st.trendSub, { color: t.muted }]}>{completedWorkouts} تمارين · هذا الأسبوع</Text>
            </View>
            <View style={st.trendRight}>
              <MaterialCommunityIcons name="run-fast" size={16} color={t.muted} />
              <Text style={[st.trendTitle, { color: t.text }]}>المسافة الأسبوعية</Text>
            </View>
          </View>
          <AreaLineChart
            data={[8.2, 14.5, 11.2, 18.7, 9.4, 15.8, 12.1, 19.2, 7.8, 16.4, 10.5, weeklyDistance]}
            color={t.primary}
            t={t}
          />
        </View>

        {/* ── Tabs ── */}
        <View style={[st.tabs, { backgroundColor: t.cardSoft }]}>
          {(['activities', 'achievements', 'stats', 'photos'] as const).map((tab) => {
            const selected = activeTab === tab;
            const label = tab === 'activities' ? 'الأنشطة' : tab === 'achievements' ? 'الإنجازات' : tab === 'stats' ? 'الإحصاء' : 'الصور';
            return (
              <Pressable key={tab} style={[st.tab, selected && { backgroundColor: t.card }]} onPress={() => setActiveTab(tab)}>
                <Text style={[st.tabText, { color: selected ? t.primary : t.muted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ══════ ACTIVITIES TAB ══════ */}
        {activeTab === 'activities' && (
          <View style={st.activityList}>
            {activities.map((activity) => {
              const hasKudos = kudosGiven[activity.id] ?? false;
              const kudosCount = activity.kudos + (hasKudos ? 1 : 0);
              return (
                <View key={activity.id} style={[st.postCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>

                  {/* Post header: avatar + name + meta */}
                  <View style={st.postHeader}>
                    <View style={st.postHeaderBody}>
                      <Text style={[st.postName, { color: t.text }]}>{userProfile.name}</Text>
                      <View style={st.postMetaRow}>
                        <MaterialCommunityIcons name={activity.icon} size={12} color={t.muted} />
                        <Text style={[st.postMeta, { color: t.muted }]}>{activity.meta} · {activity.type}</Text>
                      </View>
                    </View>
                    <View style={[st.postAvatar, { backgroundColor: t.primary + '18', borderColor: t.primary + '40' }]}>
                      <Text style={[st.postAvatarTxt, { color: t.primary }]}>{userProfile.avatarInitials}</Text>
                    </View>
                  </View>

                  {/* Activity title */}
                  <Text style={[st.postTitle, { color: t.text }]}>{activity.title}</Text>

                  {/* Stat grid: Distance | Pace | Time | Calories */}
                  <View style={[st.statGrid, { borderColor: t.line }]}>
                    {[
                      { val: activity.distance, lbl: 'مسافة' },
                      { val: activity.pace,     lbl: 'إيقاع' },
                      { val: activity.time,     lbl: 'وقت'   },
                      { val: activity.calories, lbl: 'سعرة'  },
                    ].map((s, i) => (
                      <View key={s.lbl} style={[st.statCell, i > 0 && { borderRightWidth: 1, borderRightColor: t.line }]}>
                        <Text style={[st.statVal, { color: t.text }]}>{s.val}</Text>
                        <Text style={[st.statLbl, { color: t.muted }]}>{s.lbl}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Achievement banner */}
                  {activity.achievementText && (
                    <AchievementBanner text={activity.achievementText} t={t} />
                  )}

                  {/* Kudos avatar stack */}
                  <KudosAvatars count={kudosCount} t={t} />

                  {/* Action row: Kudos | Comment | Share */}
                  <View style={[st.actionRow, { borderTopColor: t.line }]}>
                    <Pressable
                      style={st.actionCell}
                      onPress={() => setKudosGiven((prev) => ({ ...prev, [activity.id]: !prev[activity.id] }))}
                    >
                      <Text style={{ fontSize: 16 }}>{hasKudos ? '💪' : '🤜'}</Text>
                      <Text style={[st.actionLabel, { color: hasKudos ? t.primary : t.muted }]}>كودوس</Text>
                    </Pressable>
                    <View style={[st.actionDivider, { backgroundColor: t.line }]} />
                    <Pressable style={st.actionCell}>
                      <Ionicons name="chatbubble-outline" size={16} color={t.muted} />
                      <Text style={[st.actionLabel, { color: t.muted }]}>تعليق</Text>
                    </Pressable>
                    <View style={[st.actionDivider, { backgroundColor: t.line }]} />
                    <Pressable style={st.actionCell}>
                      <Ionicons name="share-outline" size={16} color={t.muted} />
                      <Text style={[st.actionLabel, { color: t.muted }]}>مشاركة</Text>
                    </Pressable>
                  </View>

                </View>
              );
            })}
          </View>
        )}

        {/* ══════ ACHIEVEMENTS TAB — Trophy Case ══════ */}
        {activeTab === 'achievements' && (
          <View>
            {/* Trophy Case header */}
            <View style={st.trophyHeader}>
              <Text style={[st.trophyCount, { color: t.muted }]}>{earnedCount}</Text>
              <Text style={[st.trophyTitle, { color: t.text }]}>خزانة الجوائز</Text>
            </View>

            {/* Badge grid — horizontal scroll rows of 4 */}
            <View style={st.trophyGrid}>
              {TROPHIES.map((item) => (
                <TrophyBadge key={item.id} item={item} t={t} />
              ))}
            </View>

            {/* All trophies link */}
            <Pressable style={[st.allTrophiesRow, { borderColor: t.line }]}>
              <Ionicons name="chevron-back" size={16} color={t.primary} />
              <Text style={[st.allTrophiesTxt, { color: t.text }]}>جميع الجوائز</Text>
            </Pressable>
          </View>
        )}

        {/* ══════ STATS TAB ══════ */}
        {activeTab === 'stats' && (() => {
          const CHART_H = 110;
          // Weekly training: calories burned per day
          const weekCals = weeklyProgress.map(d => d.caloriesBurned);
          const maxCal   = Math.max(...weekCals);
          // Run distance history (oldest → newest)
          const distVals = [...runHistory].reverse().map(r => r.distanceKm);
          const maxDist  = Math.max(...distVals);
          // Pace trend (oldest → newest): invert so faster = taller bar
          const paceVals = [...runHistory].reverse().map(r => r.avgPaceSecPerKm);
          const maxPace  = Math.max(...paceVals);
          const paceInv  = paceVals.map(p => maxPace - p + 20); // invert
          const maxPaceInv = Math.max(...paceInv);
          // Body weight (oldest → newest)
          const weightVals = bodyMeasurements.map(m => m.weightKg);
          const minW = Math.min(...weightVals);
          const maxW = Math.max(...weightVals);
          const weightRange = maxW - minW || 1;
          const weightBars  = weightVals.map(w => 40 + ((w - minW) / weightRange) * 60);
          const weightTrend = (weightVals[weightVals.length - 1] - weightVals[0]).toFixed(1);
          // Heart rate zones from run history
          const hrVals = [...runHistory].reverse().map(r => r.avgHeartRate);
          const maxHR  = Math.max(...hrVals);

          return (
            <View>
              {/* Weekly training load */}
              <ChartCard title="حمل التدريب الأسبوعي" hint="هذا الأسبوع" badge={`${weekCals.reduce((a, b) => a + b)} سعرة`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {weeklyProgress.map((day, i) => (
                    <GradBar key={i} val={day.caloriesBurned} maxVal={maxCal}
                      color={day.workoutDone || (day.runKm ?? 0) > 0 ? t.primary : t.primary}
                      active={day.workoutDone || (day.runKm ?? 0) > 0}
                      label={day.dayShort} barH={CHART_H} t={t} />
                  ))}
                </View>
                <View style={[st.chartLegend, { borderTopColor: t.line }]}>
                  <View style={[st.legendDot, { backgroundColor: t.primary }]} />
                  <Text style={[st.legendTxt, { color: t.muted }]}>تمرين مكتمل</Text>
                  <View style={[st.legendDot, { backgroundColor: t.cardSoft, borderWidth: 1, borderColor: t.line }]} />
                  <Text style={[st.legendTxt, { color: t.muted }]}>يوم راحة</Text>
                </View>
              </ChartCard>

              {/* Run distance history */}
              <ChartCard title="مسافة كل جري" hint="آخر 5 جولات" badge={`أقصى ${maxDist} كم`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {[...runHistory].reverse().map((run, i) => (
                    <GradBar key={i} val={run.distanceKm} maxVal={maxDist}
                      color="#30B36A" active label={`${run.distanceKm}`} barH={CHART_H} t={t} />
                  ))}
                </View>
                {/* Date labels */}
                <View style={{ flexDirection: 'row-reverse', gap: 4, marginTop: 2 }}>
                  {[...runHistory].reverse().map((run, i) => (
                    <Text key={i} style={{ flex: 1, textAlign: 'center', color: t.muted, fontSize: 8 }} numberOfLines={1}>{run.dateLabel}</Text>
                  ))}
                </View>
              </ChartCard>

              {/* Pace trend (faster = taller) */}
              <ChartCard title="تطور الإيقاع" hint="كلما ارتفع العمود كلما كنت أسرع" badge="🏃 تحسّن" t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {[...runHistory].reverse().map((run, i) => {
                    const inv = maxPace - run.avgPaceSecPerKm + 20;
                    const isBest = run.avgPaceSecPerKm === bestPace;
                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                        <LinearGradient
                          colors={isBest ? ['#FFD700', '#FF7A18'] : [t.primary + 'AA', t.primary + '44']}
                          style={{ width: '82%', height: Math.max(4, (inv / maxPaceInv) * (CHART_H - 22)), borderRadius: 5 }}
                          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        />
                        <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{formatPace(run.avgPaceSecPerKm)}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={[st.prRow, { backgroundColor: '#FFD700' + '14', borderColor: '#FFD700' + '44' }]}>
                  <MaterialCommunityIcons name="trophy" size={12} color="#B8860B" />
                  <Text style={[st.prTxt, { color: '#B8860B' }]}>أفضل إيقاع: {formatPace(bestPace)} /كم</Text>
                </View>
              </ChartCard>

              {/* Body weight trend */}
              <ChartCard title="تطور الوزن" hint="آخر 4 أشهر" badge={`${parseFloat(weightTrend) < 0 ? '↓' : '↑'} ${Math.abs(parseFloat(weightTrend))} كغ`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {bodyMeasurements.map((m, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                      <LinearGradient
                        colors={['#5E81F4', '#5E81F4' + '66']}
                        style={{ width: '82%', height: weightBars[i], borderRadius: 5 }}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      />
                      <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{m.date}</Text>
                    </View>
                  ))}
                </View>
                <View style={[st.prRow, { backgroundColor: '#5E81F4' + '12', borderColor: '#5E81F4' + '35' }]}>
                  <MaterialCommunityIcons name="trending-down" size={13} color="#5E81F4" />
                  <Text style={[st.prTxt, { color: '#5E81F4' }]}>
                    من {bodyMeasurements[0].weightKg} إلى {bodyMeasurements[bodyMeasurements.length - 1].weightKg} كغ
                  </Text>
                </View>
              </ChartCard>

              {/* Heart rate by run */}
              <ChartCard title="معدل نبض القلب" hint="متوسط لكل جولة" t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {[...runHistory].reverse().map((run, i) => {
                    const zone = run.avgHeartRate >= 160 ? '#FF4500' : run.avgHeartRate >= 145 ? '#FF7A18' : '#30B36A';
                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                        <LinearGradient
                          colors={[zone, zone + '66']}
                          style={{ width: '82%', height: Math.max(4, (run.avgHeartRate / maxHR) * (CHART_H - 22)), borderRadius: 5 }}
                          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        />
                        <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{run.avgHeartRate}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={[st.chartLegend, { borderTopColor: t.line }]}>
                  {[{ c: '#FF4500', l: 'منطقة 5 (شديد)' }, { c: '#FF7A18', l: 'منطقة 4' }, { c: '#30B36A', l: 'منطقة 3' }].map(z => (
                    <React.Fragment key={z.c}>
                      <View style={[st.legendDot, { backgroundColor: z.c }]} />
                      <Text style={[st.legendTxt, { color: t.muted }]}>{z.l}</Text>
                    </React.Fragment>
                  ))}
                </View>
              </ChartCard>
            </View>
          );
        })()}

        {/* ══════ PHOTOS TAB ══════ */}
        {activeTab === 'photos' && (
          <View style={st.photosGrid}>
            {myPostGrid.map((post) => (
              <Pressable key={post.id} style={[st.photoItem, { width: GRID_ITEM, height: GRID_ITEM }]}>
                <Image source={{ uri: post.imageUrl }} style={st.photo} />
                <View style={st.photoOverlay}>
                  <Ionicons name="thumbs-up" size={11} color="#fff" />
                  <Text style={st.photoText}>{post.likesCount}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 110 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  headerBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  headerBtnTxt: { fontSize: 12, fontWeight: '700' },
  publicBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 8, marginBottom: spacing.md },
  publicBannerTxt: { fontSize: 12, fontWeight: '600' },

  // identity
  identity:   { alignItems: 'center', marginBottom: spacing.md },
  avatar:     { width: 88, height: 88, borderRadius: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 28, fontWeight: '900' },
  name:       { fontSize: 25, fontWeight: '900', marginBottom: spacing.xs },
  statusPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: spacing.md },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  socialRow:  { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.md },
  socialItem: { width: 92, alignItems: 'center' },
  socialVal:  { fontSize: 18, fontWeight: '900' },
  socialLbl:  { fontSize: 12, marginTop: 2 },
  divider:    { width: 1, height: 34 },
  actions:    { flexDirection: 'row-reverse', gap: spacing.sm, width: '100%' },
  followBtn:  { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 13, alignItems: 'center' },
  followText: { fontSize: 14, fontWeight: '900' },
  messageBtn: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 13, alignItems: 'center' },
  messageText:{ fontSize: 14, fontWeight: '800' },

  // weekly summary
  summaryCard:     { borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  summaryHeader:   { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryTitle:    { fontSize: 17, fontWeight: '900' },
  summaryHint:     { fontSize: 12, fontWeight: '600' },
  summaryGrid:     { flexDirection: 'row-reverse', flexWrap: 'wrap', rowGap: spacing.sm },
  summaryItem:     { width: '33.33%', alignItems: 'center' },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  summaryIcon:     { fontSize: 14 },
  summaryValue:    { fontSize: 20, fontWeight: '900' },
  summaryLabel:    { fontSize: 11, marginTop: 2 },

  // trend card
  trendCard:   { borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  trendHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  trendRight:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  trendTitle:  { fontSize: 13, fontWeight: '700' as const },
  trendKm:     { fontSize: 24, fontWeight: '900' as const },
  trendSub:    { fontSize: 12, fontWeight: '600' as const, marginTop: 2 },

  // tabs
  tabs:    { flexDirection: 'row-reverse', borderRadius: 12, padding: 3, gap: 2, marginBottom: spacing.md },
  tab:     { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '900' },

  // activity posts (Strava-style)
  activityList: { gap: spacing.md },
  postCard:     { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

  postHeader:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.xs },
  postAvatar:     { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  postAvatarTxt:  { fontSize: 13, fontWeight: '900' },
  postHeaderBody: { flex: 1, alignItems: 'flex-end' },
  postName:       { fontSize: 14, fontWeight: '800' },
  postMetaRow:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  postMeta:       { fontSize: 11, fontWeight: '600' },

  postTitle: { fontSize: 20, fontWeight: '900', textAlign: 'right', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },

  statGrid: { flexDirection: 'row-reverse', borderTopWidth: 1, borderBottomWidth: 1, marginBottom: spacing.sm },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  statVal:  { fontSize: 15, fontWeight: '900' },
  statLbl:  { fontSize: 10, fontWeight: '600', marginTop: 2 },

  // action row
  actionRow:     { flexDirection: 'row-reverse', borderTopWidth: 1, marginTop: spacing.sm },
  actionCell:    { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14 },
  actionLabel:   { fontSize: 13, fontWeight: '700' },
  actionDivider: { width: 1, marginVertical: 10 },

  // trophy case
  trophyHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  trophyTitle:  { fontSize: 19, fontWeight: '900' },
  trophyCount:  { fontSize: 15, fontWeight: '700' },
  trophyGrid:   { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start', marginBottom: spacing.md },
  allTrophiesRow:{ flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, paddingTop: spacing.md },
  allTrophiesTxt:{ flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'right' },

  // photos
  photosGrid:  { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 2 },
  photoItem:   { borderRadius: 8, overflow: 'hidden' },
  photo:       { width: '100%', height: '100%' },
  photoOverlay:{ position: 'absolute', left: 6, bottom: 5, flexDirection: 'row', alignItems: 'center', gap: 3 },
  photoText:   { color: '#fff', fontSize: 11, fontWeight: '800' },

  // charts
  chartLegend: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  legendDot:   { width: 9, height: 9, borderRadius: 5 },
  legendTxt:   { fontSize: 10, fontWeight: '600' },
  prRow:       { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 7, marginTop: spacing.sm },
  prTxt:       { fontSize: 11, fontWeight: '700', flex: 1, textAlign: 'right' },
});
