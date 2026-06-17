import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedPosts, leaderboard, nearbyUsers } from '../data/mockData';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { FeedPost, SportType } from '../types';

const SCREEN_W = Dimensions.get('window').width;
const GRID_ITEM = (SCREEN_W - spacing.lg * 2 - 4) / 3;
const CHART_AREA_W = SCREEN_W - spacing.lg * 2 - spacing.md * 2;

function AreaLineChart({ data, color, t }: { data: number[]; color: string; t: ThemeTokens }) {
  const W = CHART_AREA_W;
  const H = 130;
  const PAD_T = 20, PAD_B = 20, PAD_H = 6;
  const cW = W - PAD_H * 2, cH = H - PAD_T - PAD_B;
  const maxV = Math.max(...data, 0.1);
  const STROKE = 2, DOT_R = 4.5;

  const pts = data.map((v, i) => ({
    x: PAD_H + (i / (data.length - 1)) * cW,
    y: PAD_T + (1 - v / maxV) * cH,
    v,
  }));

  return (
    <View style={{ width: W, height: H }}>
      <Text style={{ position: 'absolute', top: PAD_T - 14, left: 0, color: t.muted, fontSize: 9, fontWeight: '600' }}>
        {Math.round(maxV)} كم
      </Text>
      <Text style={{ position: 'absolute', bottom: PAD_B - 6, left: 0, color: t.muted, fontSize: 9, fontWeight: '600' }}>
        0 كم
      </Text>
      {[0, 0.5, 1].map((f, gi) => (
        <View key={gi} style={{
          position: 'absolute', left: PAD_H,
          top: PAD_T + f * cH, width: cW, height: 1,
          backgroundColor: t.line, opacity: 0.6,
        }} />
      ))}
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

const SPORT_ICON: Record<SportType, string>  = { run: 'run', lift: 'dumbbell', yoga: 'yoga', cycle: 'bike' };
const SPORT_LABEL: Record<SportType, string> = { run: 'جري', lift: 'رفع أثقال', yoga: 'يوغا', cycle: 'ركوب' };

// Deterministic per-user stats seeded from numeric id
function userStats(seed: number) {
  const weeklyKm       = [5.2, 12.4, 8.7, 15.1, 3.8, 9.4, 6.2][seed % 7];
  const weeklyWorkouts = [3, 5, 4, 6, 2, 4, 3][seed % 7];
  const weeklyTime     = ['1س 42د', '3س 18د', '2س 05د', '4س 22د', '58د', '2س 31د', '1س 50د'][seed % 7];
  const streak         = [7, 21, 14, 30, 6, 12, 9][seed % 7];
  const totalKmYear    = [89.4, 217.8, 154.2, 382.6, 42.1, 178.9, 95.3][seed % 7];
  const followers      = [248, 731, 412, 89, 156, 324, 178][seed % 7];
  const following      = [34, 4, 67, 12, 41, 88, 23][seed % 7];
  const rank           = [1, 2, 4, 5, 6, 7, 8][seed % 7];
  return { weeklyKm, weeklyWorkouts, weeklyTime, streak, totalKmYear, followers, following, rank };
}

// Extra simulated activity posts for users with < 3 real posts
const EXTRA_POSTS: Record<string, Omit<FeedPost, 'userId'>[]> = {
  n1: [
    { id: 'ex1', userName: '', userInitials: '', userColor: '',
      sport: 'run', activityType: 'run',
      headline: 'جري صباحي متواصل',
      subtext: 'معدل الإيقاع: 4:58 دقيقة/كم',
      metric: '7.2', metricLabel: 'كم',
      timeLabel: 'منذ 3 أيام', likesCount: 31, commentsCount: 4, isLiked: false, isPR: false, pointsEarned: 90 },
  ],
  n2: [
    { id: 'ex2', userName: '', userInitials: '', userColor: '',
      sport: 'lift', activityType: 'workout',
      headline: 'تمرين الظهر والبايسبس',
      subtext: 'حجم إجمالي: 9,200 كغ',
      metric: '70', metricLabel: 'دقيقة',
      timeLabel: 'منذ يومين', likesCount: 19, commentsCount: 2, isLiked: false, isPR: false, pointsEarned: 80 },
  ],
  n3: [
    { id: 'ex3', userName: '', userInitials: '', userColor: '',
      sport: 'yoga', activityType: 'workout',
      headline: 'جلسة تأمل ويوغا عميقة',
      subtext: '30 يوم متواصل — إنجاز استثنائي',
      timeLabel: 'منذ أسبوع', likesCount: 88, commentsCount: 11, isLiked: false, isPR: false, pointsEarned: 120 },
  ],
  n6: [
    { id: 'ex4', userName: '', userInitials: '', userColor: '',
      sport: 'run', activityType: 'pr',
      headline: 'رقم قياسي جديد في 10 كم',
      subtext: 'أسرع من سابقه بـ 2:15 دقيقة',
      metric: '10.0', metricLabel: 'كم',
      timeLabel: 'منذ 4 أيام', likesCount: 74, commentsCount: 9, isLiked: false, isPR: true, pointsEarned: 200 },
  ],
  n7: [
    { id: 'ex5', userName: '', userInitials: '', userColor: '',
      sport: 'lift', activityType: 'pr',
      headline: 'تجاوز الـ 100 كغ في البنش بريس',
      subtext: 'هدف كان يسعى إليه 3 أشهر',
      metric: '100', metricLabel: 'كغ',
      timeLabel: 'منذ أسبوع', likesCount: 142, commentsCount: 22, isLiked: false, isPR: true, pointsEarned: 250 },
  ],
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
  'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400',
];

// ─── Kudos Avatar Stack ───────────────────────────────────────────────────────
const KUDOS_POOL = [
  { color: '#FF6B35', initials: 'أم' },
  { color: '#5E81F4', initials: 'سع' },
  { color: '#8E5CF5', initials: 'رش' },
  { color: '#FF69B4', initials: 'نو' },
];
function KudosRow({ count, t }: { count: number; t: ThemeTokens }) {
  const show = KUDOS_POOL.slice(0, Math.min(3, count));
  return (
    <View style={kr.row}>
      <View style={kr.stack}>
        {show.map((g, i) => (
          <View key={i} style={[kr.avatar, { backgroundColor: g.color, borderColor: t.card, marginRight: i > 0 ? -8 : 0, zIndex: 3 - i }]}>
            <Text style={kr.txt}>{g.initials}</Text>
          </View>
        ))}
      </View>
      <Text style={[kr.label, { color: t.muted }]}>{count} أعطوا كودوس</Text>
    </View>
  );
}
const kr = StyleSheet.create({
  row:    { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  stack:  { flexDirection: 'row-reverse' },
  avatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  txt:    { color: '#fff', fontSize: 8, fontWeight: '900' },
  label:  { fontSize: 12, fontWeight: '600' },
});

// ─── Achievement Banner ───────────────────────────────────────────────────────
function AchBanner({ text, t }: { text: string; t: ThemeTokens }) {
  return (
    <View style={[ach.banner, { backgroundColor: t.cardSoft, borderColor: t.line, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
      <Text style={[ach.txt, { color: t.text }]}>{text}</Text>
      <View style={[ach.icon, { backgroundColor: '#FFD700' + '22' }]}>
        <MaterialCommunityIcons name="medal" size={18} color="#B8860B" />
      </View>
    </View>
  );
}
const ach = StyleSheet.create({
  banner: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 10, borderWidth: 1, padding: spacing.sm },
  icon:   { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txt:    { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right', lineHeight: 17 },
});

// ─── Activity Post Card (Strava-style) ────────────────────────────────────────
function ActivityPostCard({ post, user, t, cardShadow }: {
  post: FeedPost | (Omit<FeedPost, 'userId'> & { userId?: string });
  user: { initials: string; color: string; name: string };
  t: ThemeTokens;
  cardShadow: object;
}) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [kudos, setKudos] = useState(post.likesCount + (post.isLiked ? 0 : 0));

  const achText =
    post.isPR && post.metric
      ? `${user.name.split(' ')[0]}'s fastest — ${post.metric} ${post.metricLabel ?? ''}`
      : post.activityType === 'milestone'
      ? 'إنجاز غير عادي — واصل الزخم!'
      : null;

  const metricLabel = post.metricLabel ?? '';

  return (
    <View style={[apc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>

      {/* Post header */}
      <View style={apc.header}>
        <View style={apc.headerBody}>
          <Text style={[apc.name, { color: t.text }]}>{user.name}</Text>
          <View style={apc.metaRow}>
            {post.sport && <MaterialCommunityIcons name={SPORT_ICON[post.sport as SportType] as any} size={11} color={t.muted} />}
            <Text style={[apc.meta, { color: t.muted }]}>{post.timeLabel} · {SPORT_LABEL[post.sport as SportType]}</Text>
          </View>
        </View>
        <View style={[apc.avatar, { backgroundColor: user.color + '18', borderColor: user.color + '55' }]}>
          <Text style={[apc.avatarTxt, { color: user.color }]}>{user.initials}</Text>
        </View>
      </View>

      {/* PR tag + title */}
      {post.isPR && (
        <View style={[apc.prTag, { backgroundColor: '#FFD700' + '18', borderColor: '#FFD70055', marginHorizontal: spacing.md, marginBottom: 4 }]}>
          <MaterialCommunityIcons name="trophy" size={11} color="#B8860B" />
          <Text style={apc.prTxt}>رقم قياسي جديد</Text>
        </View>
      )}
      <Text style={[apc.title, { color: t.text }]}>{post.headline}</Text>
      {post.subtext && <Text style={[apc.sub, { color: t.muted }]}>{post.subtext}</Text>}

      {/* Stat grid */}
      {(post.metric || post.pointsEarned) && (
        <View style={[apc.statGrid, { borderColor: t.line }]}>
          {post.metric && (
            <View style={apc.statCell}>
              <Text style={[apc.statVal, { color: t.text }]}>{post.metric}</Text>
              <Text style={[apc.statLbl, { color: t.muted }]}>{metricLabel}</Text>
            </View>
          )}
          {post.sport === 'run' && post.metric && (
            <View style={[apc.statCell, { borderRightWidth: 1, borderRightColor: t.line }]}>
              <Text style={[apc.statVal, { color: t.text }]}>4:52</Text>
              <Text style={[apc.statLbl, { color: t.muted }]}>/كم</Text>
            </View>
          )}
          {post.pointsEarned && (
            <View style={[apc.statCell, { borderRightWidth: 1, borderRightColor: t.line }]}>
              <Text style={[apc.statVal, { color: t.primary }]}>+{post.pointsEarned}</Text>
              <Text style={[apc.statLbl, { color: t.muted }]}>نقطة</Text>
            </View>
          )}
        </View>
      )}

      {/* Optional image */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={apc.img} resizeMode="cover" />
      )}

      {/* Achievement banner */}
      {achText && <AchBanner text={achText} t={t} />}

      {/* Kudos avatars */}
      <KudosRow count={liked ? kudos + 1 : kudos} t={t} />

      {/* Action row */}
      <View style={[apc.actionRow, { borderTopColor: t.line }]}>
        <Pressable
          style={apc.actionCell}
          onPress={() => { setLiked(v => !v); }}
        >
          <Text style={{ fontSize: 15 }}>{liked ? '💪' : '🤜'}</Text>
          <Text style={[apc.actionLabel, { color: liked ? t.primary : t.muted }]}>كودوس</Text>
        </Pressable>
        <View style={[apc.actionDiv, { backgroundColor: t.line }]} />
        <Pressable style={apc.actionCell}>
          <Ionicons name="chatbubble-outline" size={15} color={t.muted} />
          <Text style={[apc.actionLabel, { color: t.muted }]}>تعليق</Text>
        </Pressable>
        <View style={[apc.actionDiv, { backgroundColor: t.line }]} />
        <Pressable style={apc.actionCell}>
          <Ionicons name="share-outline" size={15} color={t.muted} />
          <Text style={[apc.actionLabel, { color: t.muted }]}>مشاركة</Text>
        </Pressable>
      </View>
    </View>
  );
}
const apc = StyleSheet.create({
  card:      { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: spacing.md },
  header:    { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.xs },
  avatar:    { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontSize: 13, fontWeight: '900' },
  headerBody:{ flex: 1, alignItems: 'flex-end' },
  name:      { fontSize: 14, fontWeight: '800' },
  metaRow:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  meta:      { fontSize: 11 },
  prTag:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end' },
  prTxt:     { fontSize: 10, fontWeight: '800', color: '#B8860B' },
  title:     { fontSize: 19, fontWeight: '900', textAlign: 'right', paddingHorizontal: spacing.md, marginBottom: 4, lineHeight: 26 },
  sub:       { fontSize: 12, textAlign: 'right', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  statGrid:  { flexDirection: 'row-reverse', borderTopWidth: 1, borderBottomWidth: 1, marginBottom: spacing.sm },
  statCell:  { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal:   { fontSize: 15, fontWeight: '900' },
  statLbl:   { fontSize: 10, fontWeight: '600', marginTop: 2 },
  img:       { width: '100%', height: 180, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row-reverse', borderTopWidth: 1 },
  actionCell:{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 13 },
  actionLabel:{ fontSize: 12, fontWeight: '700' },
  actionDiv: { width: 1, marginVertical: 10 },
});

// ─── Trophy Badge ─────────────────────────────────────────────────────────────
function TrophyBadge({ num, icon, label, earned, color, t }: {
  num?: number | null; icon?: string | null; label: string; earned: boolean; color: string; t: ThemeTokens;
}) {
  const bg = earned ? color : t.cardSoft;
  const border = earned ? color : t.line;
  const fg = earned ? '#fff' : t.muted;
  return (
    <View style={trophy.wrap}>
      <View style={[trophy.badge, { backgroundColor: bg, borderColor: border }]}>
        {num != null
          ? <Text style={[trophy.num, { color: fg }]}>{num}</Text>
          : icon ? <MaterialCommunityIcons name={icon as any} size={20} color={fg} /> : null
        }
        {earned && <View style={[trophy.shine, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />}
      </View>
      <Text style={[trophy.label, { color: earned ? t.text : t.muted }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}
const trophy = StyleSheet.create({
  wrap:  { width: 72, alignItems: 'center', gap: 5 },
  badge: { width: 56, height: 56, borderRadius: 15, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  num:   { fontSize: 20, fontWeight: '900' },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', borderTopLeftRadius: 13, borderTopRightRadius: 13 },
  label: { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
});

type Tab = 'activities' | 'trophies' | 'stats' | 'photos';

// ─── Seeded chart data generator ──────────────────────────────────────────────
function seedCharts(seed: number) {
  const weekCals = [320, 480, 210, 550, 290, 410, 180].map((v, i) => Math.round(v * (0.7 + ((seed + i) % 5) * 0.1)));
  const weekActive = [true, true, false, true, false, true, false].map((v, i) => (seed + i) % 3 !== 0 ? v : !v);
  const distVals   = [3.8, 5.2, 4.4, 7.1, 6.0].map((v, i) => parseFloat((v * (0.8 + (seed % 4) * 0.1)).toFixed(1)));
  const paceVals   = [489, 450, 460, 440, 430].map((v, i) => Math.round(v + ((seed * i) % 40) - 20));
  const weightVals = [85.2, 84.1, 83.0, 82.1].map((v, i) => parseFloat((v - seed * 0.5 + i * 0.2).toFixed(1)));
  const hrVals     = [142, 155, 148, 158, 152].map(v => Math.round(v + (seed % 8) - 4));
  return { weekCals, weekActive, distVals, paceVals, weightVals, hrVals };
}

function formatPaceSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ─── Reusable bar for user profile charts ─────────────────────────────────────
function UPBar({ val, maxVal, color, active, label, chartH, t }: {
  val: number; maxVal: number; color: string; active: boolean; label: string; chartH: number; t: ThemeTokens;
}) {
  const h = Math.max(4, (val / maxVal) * (chartH - 22));
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: chartH, gap: 3 }}>
      <LinearGradient
        colors={active ? [color, color + '70'] : ['transparent', 'transparent'] as [string, string]}
        style={{ width: '82%', height: h, borderRadius: 5, backgroundColor: active ? undefined : t.cardSoft }}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
      <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function UPChartCard({ title, hint, badge, children, t, cardShadow }: {
  title: string; hint: string; badge?: string; children: React.ReactNode; t: ThemeTokens; cardShadow: object;
}) {
  return (
    <View style={[upcc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      <View style={upcc.header}>
        <View style={upcc.left}>
          {badge && <View style={[upcc.badge, { backgroundColor: t.primary + '14', borderColor: t.primary + '33' }]}><Text style={[upcc.badgeTxt, { color: t.primary }]}>{badge}</Text></View>}
          <Text style={[upcc.hint, { color: t.muted }]}>{hint}</Text>
        </View>
        <Text style={[upcc.title, { color: t.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const upcc = StyleSheet.create({
  card:     { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  header:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title:    { fontSize: 15, fontWeight: '900' },
  left:     { alignItems: 'flex-start', gap: 4 },
  hint:     { fontSize: 11 },
  badge:    { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
});

// ─── UserProfileScreen ────────────────────────────────────────────────────────
export function UserProfileScreen({ route, navigation }: any) {
  const { theme: t } = useTheme();
  const { userId } = route.params ?? {};

  const user  = nearbyUsers.find(u => u.id === userId) ?? nearbyUsers[0];
  const seed  = parseInt(user.id.replace('n', '') || '1');
  const stats = userStats(seed);
  const sport = user.sport as SportType;

  // Leaderboard entry for rank + streak
  const lbEntry = leaderboard.find(e => e.name === user.name);

  // Posts: real + simulated extra
  const realPosts  = feedPosts.filter(p => p.userId === user.id);
  const extraRaw   = (EXTRA_POSTS[user.id] ?? []).map(p => ({ ...p, userId: user.id, userName: user.name, userInitials: user.initials, userColor: user.color }));
  const allPosts   = [...realPosts, ...extraRaw] as FeedPost[];

  // Grid: use post images, pad with fallbacks
  const gridImages = [
    ...allPosts.filter(p => p.imageUrl).map(p => ({ uri: p.imageUrl!, likes: p.likesCount })),
    ...FALLBACK_IMAGES.map((uri, i) => ({ uri, likes: 15 + i * 6 })),
  ].slice(0, 9);

  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('activities');

  // Per-user achievements (earned based on seed parity)
  const USER_TROPHIES = [
    { num: null,  icon: SPORT_ICON[sport], label: `${SPORT_LABEL[sport]}`, earned: true,          color: user.color },
    { num: null,  icon: 'fire',            label: `${stats.streak} يوم`,   earned: stats.streak >= 7, color: '#FF7A18' },
    { num: 10,    icon: null,              label: '10 أنشطة',              earned: seed % 2 === 1, color: '#1A9ECC' },
    { num: 50,    icon: null,              label: '50 كم',                 earned: stats.totalKmYear >= 50, color: '#30B36A' },
    { num: null,  icon: 'podium',          label: 'أفضل 10',               earned: stats.rank <= 10, color: '#8E5CF5' },
    { num: null,  icon: 'trophy-outline',  label: 'متصدر الأسبوع',        earned: stats.rank === 1, color: '#FFD700' },
  ];
  const earnedCount = USER_TROPHIES.filter(x => x.earned).length;

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TOP BAR ── */}
        <View style={st.topBar}>
          <View style={st.topRight}>
            <Pressable style={[st.iconBtn, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="ellipsis-horizontal" size={18} color={t.muted} />
            </Pressable>
            <Pressable style={[st.iconBtn, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="share-outline" size={18} color={t.muted} />
            </Pressable>
          </View>
          <Pressable style={[st.iconBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
        </View>

        {/* ── COVER GRADIENT + AVATAR ── */}
        <View style={st.heroWrap}>
          <LinearGradient
            colors={[user.color + '44', user.color + '08', 'transparent']}
            style={st.coverGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          <View style={[st.avatarRing, { borderColor: user.color + '60', backgroundColor: t.background }]}>
            <View style={[st.avatar, { backgroundColor: user.color + '18' }]}>
              <Text style={[st.avatarTxt, { color: user.color }]}>{user.initials}</Text>
            </View>
            {user.isLive && (
              <View style={[st.liveRing, { borderColor: t.background }]}>
                <View style={[st.liveDot, { backgroundColor: '#22C55E' }]} />
              </View>
            )}
          </View>

          <Text style={[st.heroName, { color: t.text }]}>{user.name}</Text>

          {/* Sport + live badge */}
          <View style={st.badgeRow}>
            <View style={[st.sportBadge, { backgroundColor: user.color + '14', borderColor: user.color + '40' }]}>
              <MaterialCommunityIcons name={SPORT_ICON[sport] as any} size={12} color={user.color} />
              <Text style={[st.sportTxt, { color: user.color }]}>{SPORT_LABEL[sport]}</Text>
            </View>
            {user.isLive && (
              <View style={[st.liveBadge, { backgroundColor: '#22C55E18', borderColor: '#22C55E55' }]}>
                <View style={[st.liveDotSmall, { backgroundColor: '#22C55E' }]} />
                <Text style={[st.liveTxt, { color: '#22C55E' }]}>نشط الآن</Text>
              </View>
            )}
            {lbEntry && (
              <View style={[st.rankBadge, { backgroundColor: t.primary + '12', borderColor: t.primary + '40' }]}>
                <MaterialCommunityIcons name="trophy" size={10} color={t.primary} />
                <Text style={[st.rankTxt, { color: t.primary }]}>#{lbEntry.rank}</Text>
              </View>
            )}
          </View>

          {/* Stats row: followers / following / activities */}
          <View style={[st.statsCard, { backgroundColor: t.cardSoft }]}>
            {[
              { val: stats.followers,  label: 'متابِع' },
              { val: stats.following,  label: 'يتابع'  },
              { val: allPosts.length,  label: 'نشاط'   },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={st.statItem}>
                  <Text style={[st.statNum, { color: t.text }]}>{s.val}</Text>
                  <Text style={[st.statLbl, { color: t.muted }]}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={[st.statDiv, { backgroundColor: t.line }]} />}
              </React.Fragment>
            ))}
          </View>

          {/* Actions */}
          <View style={st.actions}>
            <Pressable
              style={[st.followBtn, following
                ? { backgroundColor: t.cardSoft, borderColor: t.primary, borderWidth: 1.5 }
                : { backgroundColor: t.primary }
              ]}
              onPress={() => setFollowing(v => !v)}
            >
              <Ionicons name={following ? 'checkmark' : 'person-add'} size={14} color={following ? t.primary : '#fff'} />
              <Text style={[st.followTxt, { color: following ? t.primary : '#fff' }]}>
                {following ? 'تتابعه' : 'متابعة'}
              </Text>
            </Pressable>
            <Pressable
              style={[st.msgBtn, { backgroundColor: t.cardSoft, borderColor: t.line }]}
              onPress={() => navigation.navigate('Chat')}
            >
              <Ionicons name="chatbubble-outline" size={14} color={t.text} />
              <Text style={[st.msgTxt, { color: t.text }]}>رسالة</Text>
            </Pressable>
          </View>
        </View>

        {/* ── THIS WEEK SUMMARY ── */}
        <View style={[st.weekCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <View style={st.weekHeader}>
            <Text style={[st.weekHint, { color: t.muted }]}>هذا الأسبوع</Text>
            <Text style={[st.weekTitle, { color: t.text }]}>ملخص الأداء</Text>
          </View>
          <View style={st.weekGrid}>
            {[
              { val: `${stats.weeklyKm} كم`, label: 'مسافة',  icon: null },
              { val: stats.weeklyTime,        label: 'وقت',    icon: null },
              { val: String(stats.weeklyWorkouts), label: 'تمارين', icon: null },
              { val: String(stats.streak),    label: 'ستريك',  icon: '🔥' },
            ].map((item) => (
              <View key={item.label} style={st.weekItem}>
                <View style={st.weekValRow}>
                  {item.icon && <Text style={st.weekIcon}>{item.icon}</Text>}
                  <Text style={[st.weekVal, { color: item.icon ? t.primary : t.text }]}>{item.val}</Text>
                </View>
                <Text style={[st.weekLabel, { color: t.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
          {/* Year total */}
          <View style={[st.yearRow, { borderTopColor: t.line }]}>
            <Text style={[st.yearVal, { color: t.primary }]}>{stats.totalKmYear} كم</Text>
            <Text style={[st.yearLabel, { color: t.muted }]}>إجمالي هذا العام</Text>
          </View>
        </View>

        {/* ── Weekly Distance Trend ── */}
        {(() => {
          const charts = seedCharts(seed);
          const histKm = [8.2, 14.5, 11.2, 18.7, 9.4, 15.8, 12.1, 19.2, 7.8, 16.4, 10.5].map(
            (v, i) => parseFloat((v * (0.6 + (seed % 5) * 0.1) + i * 0.2).toFixed(1))
          );
          const trendData = [...histKm, stats.weeklyKm];
          return (
            <View style={[st.trendCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
              <View style={st.trendHeader}>
                <View>
                  <Text style={[st.trendKm, { color: t.text }]}>{stats.weeklyKm} كم</Text>
                  <Text style={[st.trendSub, { color: t.muted }]}>{stats.weeklyWorkouts} تمارين · هذا الأسبوع</Text>
                </View>
                <View style={st.trendRight}>
                  <MaterialCommunityIcons name="run-fast" size={16} color={t.muted} />
                  <Text style={[st.trendTitle, { color: t.text }]}>المسافة الأسبوعية</Text>
                </View>
              </View>
              <AreaLineChart data={trendData} color={user.color} t={t} />
            </View>
          );
        })()}

        {/* ── TABS ── */}
        <View style={[st.tabs, { backgroundColor: t.cardSoft }]}>
          {(['activities', 'trophies', 'stats', 'photos'] as Tab[]).map((tab) => {
            const on = activeTab === tab;
            const label = tab === 'activities' ? 'الأنشطة' : tab === 'trophies' ? 'الجوائز' : tab === 'stats' ? 'الإحصاء' : 'الصور';
            return (
              <Pressable key={tab} style={[st.tab, on && { backgroundColor: t.card }]} onPress={() => setActiveTab(tab)}>
                <Text style={[st.tabTxt, { color: on ? t.primary : t.muted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ══════ ACTIVITIES TAB ══════ */}
        {activeTab === 'activities' && (
          <View>
            {allPosts.length === 0 ? (
              <View style={[st.emptyCard, { backgroundColor: t.card, borderColor: t.line }]}>
                <Ionicons name="flash-outline" size={32} color={t.muted} />
                <Text style={[st.emptyTxt, { color: t.muted }]}>لا توجد أنشطة بعد</Text>
              </View>
            ) : (
              allPosts.map(post => (
                <ActivityPostCard
                  key={post.id}
                  post={post}
                  user={{ initials: user.initials, color: user.color, name: user.name }}
                  t={t}
                  cardShadow={cardShadow}
                />
              ))
            )}
          </View>
        )}

        {/* ══════ TROPHIES TAB ══════ */}
        {activeTab === 'trophies' && (
          <View>
            <View style={st.trophyHeader}>
              <Text style={[st.trophyCount, { color: t.muted }]}>{earnedCount}</Text>
              <Text style={[st.trophyTitle, { color: t.text }]}>خزانة الجوائز</Text>
            </View>
            <View style={st.trophyGrid}>
              {USER_TROPHIES.map((item, i) => (
                <TrophyBadge
                  key={i}
                  num={item.num}
                  icon={item.icon}
                  label={item.label}
                  earned={item.earned}
                  color={item.color}
                  t={t}
                />
              ))}
            </View>
            {/* Best performances */}
            <View style={[st.bestCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
              <Text style={[st.bestTitle, { color: t.text }]}>أفضل إنجازات</Text>
              {[
                { label: 'أسرع 5 كم',    val: '24:18', icon: 'run'     },
                { label: 'أطول مسافة',    val: `${stats.totalKmYear >= 10 ? (stats.weeklyKm + 2).toFixed(1) : '5.2'} كم`, icon: 'map-marker-path' },
                { label: 'إجمالي هذا العام', val: `${stats.totalKmYear} كم`, icon: 'calendar-check' },
              ].map((b) => (
                <View key={b.label} style={[st.bestRow, { borderTopColor: t.line }]}>
                  <Text style={[st.bestVal, { color: t.primary }]}>{b.val}</Text>
                  <View style={st.bestLeft}>
                    <MaterialCommunityIcons name={b.icon as any} size={14} color={t.muted} />
                    <Text style={[st.bestLabel, { color: t.text }]}>{b.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════ STATS TAB ══════ */}
        {activeTab === 'stats' && (() => {
          const charts = seedCharts(seed);
          const CHART_H = 110;
          const maxCal    = Math.max(...charts.weekCals);
          const maxDist   = Math.max(...charts.distVals);
          const maxPace   = Math.max(...charts.paceVals);
          const paceInv   = charts.paceVals.map(p => maxPace - p + 20);
          const maxPI     = Math.max(...paceInv);
          const bestPaceV = Math.min(...charts.paceVals);
          const wVals     = charts.weightVals;
          const wMin = Math.min(...wVals), wMax = Math.max(...wVals), wRange = wMax - wMin || 1;
          const wBars = wVals.map(v => 40 + ((v - wMin) / wRange) * 60);
          const wDelta = (wVals[wVals.length - 1] - wVals[0]).toFixed(1);
          const maxHR = Math.max(...charts.hrVals);
          const DAYS = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];
          const runLabels = ['الثلاثاء', 'الأحد', 'الخميس', 'الثلاثاء', 'أمس'];
          const months = ['يناير', 'فبراير', 'مارس', 'أبريل'];
          return (
            <View>
              {/* Weekly training load */}
              <UPChartCard title="حمل التدريب الأسبوعي" hint="هذا الأسبوع"
                badge={`${charts.weekCals.reduce((a, b) => a + b)} سعرة`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {charts.weekCals.map((v, i) => (
                    <UPBar key={i} val={v} maxVal={maxCal} color={t.primary}
                      active={charts.weekActive[i]} label={DAYS[i]} chartH={CHART_H} t={t} />
                  ))}
                </View>
              </UPChartCard>

              {/* Run distance history */}
              <UPChartCard title="مسافة كل جري" hint="آخر 5 جولات"
                badge={`أقصى ${maxDist} كم`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {charts.distVals.map((v, i) => (
                    <UPBar key={i} val={v} maxVal={maxDist} color="#30B36A"
                      active label={`${v}`} chartH={CHART_H} t={t} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row-reverse', gap: 4, marginTop: 2 }}>
                  {runLabels.map((l, i) => (
                    <Text key={i} style={{ flex: 1, textAlign: 'center', color: t.muted, fontSize: 8 }} numberOfLines={1}>{l}</Text>
                  ))}
                </View>
              </UPChartCard>

              {/* Pace trend */}
              <UPChartCard title="تطور الإيقاع" hint="أعلى = أسرع"
                badge={`🏆 ${formatPaceSec(bestPaceV)}/كم`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {charts.paceVals.map((v, i) => {
                    const inv = maxPace - v + 20;
                    const isBest = v === bestPaceV;
                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                        <LinearGradient
                          colors={isBest ? ['#FFD700', '#FF7A18'] : [t.primary + 'AA', t.primary + '44']}
                          style={{ width: '82%', height: Math.max(4, (inv / maxPI) * (CHART_H - 22)), borderRadius: 5 }}
                          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        />
                        <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{formatPaceSec(v)}</Text>
                      </View>
                    );
                  })}
                </View>
              </UPChartCard>

              {/* Weight trend */}
              <UPChartCard title="تطور الوزن" hint="آخر 4 أشهر"
                badge={`${parseFloat(wDelta) < 0 ? '↓' : '↑'} ${Math.abs(parseFloat(wDelta))} كغ`} t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {wVals.map((v, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                      <LinearGradient
                        colors={['#5E81F4', '#5E81F4' + '66']}
                        style={{ width: '82%', height: wBars[i], borderRadius: 5 }}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      />
                      <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{months[i]}</Text>
                    </View>
                  ))}
                </View>
                <View style={[upst.infoRow, { backgroundColor: '#5E81F4' + '12', borderColor: '#5E81F4' + '35' }]}>
                  <MaterialCommunityIcons name="trending-down" size={13} color="#5E81F4" />
                  <Text style={[upst.infoTxt, { color: '#5E81F4' }]}>
                    من {wVals[0]} إلى {wVals[wVals.length - 1]} كغ
                  </Text>
                </View>
              </UPChartCard>

              {/* Heart rate */}
              <UPChartCard title="معدل نبض القلب" hint="متوسط لكل جولة" t={t} cardShadow={cardShadow}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', height: CHART_H, gap: 4 }}>
                  {charts.hrVals.map((v, i) => {
                    const zone = v >= 160 ? '#FF4500' : v >= 145 ? '#FF7A18' : '#30B36A';
                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H, gap: 3 }}>
                        <LinearGradient
                          colors={[zone, zone + '66']}
                          style={{ width: '82%', height: Math.max(4, (v / maxHR) * (CHART_H - 22)), borderRadius: 5 }}
                          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        />
                        <Text style={{ color: t.muted, fontSize: 9, fontWeight: '600' }}>{v}</Text>
                      </View>
                    );
                  })}
                </View>
              </UPChartCard>
            </View>
          );
        })()}

        {/* ══════ PHOTOS TAB ══════ */}
        {activeTab === 'photos' && (
          <View style={st.photosGrid}>
            {gridImages.map((item, i) => (
              <Pressable key={i} style={[st.photoItem, { width: GRID_ITEM, height: GRID_ITEM }]}>
                <Image source={{ uri: item.uri }} style={st.photo} />
                <View style={st.photoOverlay}>
                  <Ionicons name="heart" size={11} color="#fff" />
                  <Text style={st.photoLikes}>{item.likes}</Text>
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
  scroll: { paddingBottom: 80 },

  // top bar
  topBar:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  topRight:{ flexDirection: 'row', gap: spacing.xs },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // hero
  heroWrap:  { alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, position: 'relative' },
  coverGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  avatarRing:{ width: 92, height: 92, borderRadius: 46, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, position: 'relative' },
  avatar:    { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 30, fontWeight: '900' },
  liveRing:  { position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#22C55E' },
  liveDot:   { width: 10, height: 10, borderRadius: 5 },

  heroName:  { fontSize: 26, fontWeight: '900', marginBottom: spacing.sm },

  badgeRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  sportBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  sportTxt:    { fontSize: 12, fontWeight: '700' },
  liveBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  liveDotSmall:{ width: 6, height: 6, borderRadius: 3 },
  liveTxt:     { fontSize: 12, fontWeight: '700' },
  rankBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  rankTxt:     { fontSize: 12, fontWeight: '800' },

  statsCard:  { flexDirection: 'row-reverse', borderRadius: 14, padding: spacing.md, width: '100%', marginBottom: spacing.md },
  statItem:   { flex: 1, alignItems: 'center' },
  statNum:    { fontSize: 22, fontWeight: '900' },
  statLbl:    { fontSize: 11, marginTop: 2 },
  statDiv:    { width: 1 },

  actions:   { flexDirection: 'row-reverse', gap: spacing.sm, width: '100%' },
  followBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  followTxt: { fontWeight: '800', fontSize: 14 },
  msgBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  msgTxt:    { fontWeight: '700', fontSize: 14 },

  // weekly summary
  weekCard:   { marginHorizontal: spacing.lg, borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  weekHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.sm },
  weekTitle:  { fontSize: 16, fontWeight: '900' },
  weekHint:   { fontSize: 12, fontWeight: '600' },
  weekGrid:   { flexDirection: 'row-reverse', flexWrap: 'wrap', rowGap: spacing.sm, marginBottom: spacing.sm },
  weekItem:   { width: '50%', alignItems: 'center' },
  weekValRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  weekIcon:   { fontSize: 14 },
  weekVal:    { fontSize: 18, fontWeight: '900' },
  weekLabel:  { fontSize: 11, marginTop: 2 },
  yearRow:    { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm },
  yearVal:    { fontSize: 16, fontWeight: '900' },
  yearLabel:  { fontSize: 12 },

  // trend card
  trendCard:   { marginHorizontal: spacing.lg, borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  trendHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  trendRight:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  trendTitle:  { fontSize: 13, fontWeight: '700' as const },
  trendKm:     { fontSize: 24, fontWeight: '900' as const },
  trendSub:    { fontSize: 12, fontWeight: '600' as const, marginTop: 2 },

  // tabs
  tabs:    { flexDirection: 'row-reverse', borderRadius: 12, padding: 3, gap: 2, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  tab:     { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  tabTxt:  { fontSize: 13, fontWeight: '900' },

  // empty
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg },
  emptyTxt:  { fontSize: 14, fontWeight: '600' },

  // trophies
  trophyHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  trophyTitle:  { fontSize: 18, fontWeight: '900' },
  trophyCount:  { fontSize: 15, fontWeight: '700' },
  trophyGrid:   { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start', paddingHorizontal: spacing.lg, marginBottom: spacing.md },

  // best performances
  bestCard:   { marginHorizontal: spacing.lg, borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  bestTitle:  { fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },
  bestRow:    { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingVertical: spacing.sm },
  bestLeft:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  bestLabel:  { fontSize: 13, fontWeight: '700' },
  bestVal:    { fontSize: 15, fontWeight: '900' },

  // photos
  photosGrid:  { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 2, paddingHorizontal: spacing.lg },
  photoItem:   { borderRadius: 6, overflow: 'hidden' },
  photo:       { width: '100%', height: '100%' },
  photoOverlay:{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center', gap: 3 },
  photoLikes:  { color: '#fff', fontSize: 11, fontWeight: '800' },
});

const upst = StyleSheet.create({
  infoRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 7, marginTop: spacing.sm },
  infoTxt: { fontSize: 11, fontWeight: '700', flex: 1, textAlign: 'right' },
});
