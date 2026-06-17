import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedPosts, leaderboard } from '../data/mockData';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { FeedPost, SportType } from '../types';

// ─── Sport Metadata ───────────────────────────────────────────────────────────
const SPORT_ICON: Record<SportType, string>  = { run: 'run', lift: 'dumbbell', yoga: 'yoga', cycle: 'bike' };
const SPORT_LABEL: Record<SportType, string> = { run: 'جري', lift: 'رفع أثقال', yoga: 'يوغا', cycle: 'دراجة' };

// Sport-specific metric rows (Strava-style: three cells each with value + label)
function getMetrics(post: FeedPost): { val: string; label: string }[] {
  const base: { val: string; label: string }[] = [];
  if (post.metric) base.push({ val: post.metric, label: post.metricLabel ?? '' });
  if (post.pointsEarned) base.push({ val: `+${post.pointsEarned}`, label: 'نقطة' });
  if (post.sport === 'run' && post.metric) base.push({ val: '4:52 /كم', label: 'إيقاع' });
  else if (post.sport === 'lift')          base.push({ val: '8,400 كغ', label: 'حجم' });
  else if (post.sport === 'cycle')         base.push({ val: '22 كم/س', label: 'سرعة' });
  return base.slice(0, 3);
}

// ─── Sport Filter Bar ─────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',   label: 'الكل',   icon: null        },
  { id: 'run',   label: 'جري',    icon: 'run'       },
  { id: 'lift',  label: 'رفع',    icon: 'dumbbell'  },
  { id: 'yoga',  label: 'يوغا',   icon: 'yoga'      },
  { id: 'cycle', label: 'دراجة',  icon: 'bike'      },
] as const;

function SportFilterBar({ active, onChange, t }: { active: string; onChange: (id: string) => void; t: ThemeTokens }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sf.strip}>
      {FILTERS.map(f => {
        const on = active === f.id;
        return (
          <Pressable
            key={f.id}
            style={[sf.chip, { backgroundColor: on ? t.primary : t.card, borderColor: on ? t.primary : t.line }]}
            onPress={() => onChange(f.id)}
          >
            {f.icon && <MaterialCommunityIcons name={f.icon as any} size={12} color={on ? '#fff' : t.muted} />}
            <Text style={[sf.txt, { color: on ? '#fff' : t.muted }]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const sf = StyleSheet.create({
  strip: { paddingHorizontal: spacing.lg, paddingVertical: 2, gap: 8, flexDirection: 'row-reverse' },
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  txt:   { fontWeight: '700', fontSize: 12 },
});

// ─── Active Now Strip ─────────────────────────────────────────────────────────
function MotivationStrip({ t }: { t: ThemeTokens }) {
  const me = leaderboard.find((entry) => entry.isMe);
  return (
    <View style={[ms.card, { backgroundColor: t.card, borderColor: t.line }]}>
      <View style={ms.item}>
        <Text style={[ms.value, { color: t.text }]}>31/50</Text>
        <Text style={[ms.label, { color: t.muted }]}>كم التحدي</Text>
      </View>
      <View style={[ms.divider, { backgroundColor: t.line }]} />
      <View style={ms.item}>
        <Text style={[ms.value, { color: t.text }]}>{me?.streak ?? 6}</Text>
        <Text style={[ms.label, { color: t.muted }]}>أيام متتالية</Text>
      </View>
      <View style={[ms.divider, { backgroundColor: t.line }]} />
      <View style={ms.item}>
        <Text style={[ms.value, { color: t.text }]}>#{me?.rank ?? 3}</Text>
        <Text style={[ms.label, { color: t.muted }]}>ترتيبك</Text>
      </View>
    </View>
  );
}
const ms = StyleSheet.create({
  card:    { flexDirection: 'row-reverse', borderRadius: 14, borderWidth: 1, marginBottom: spacing.md, paddingVertical: spacing.md },
  item:    { flex: 1, alignItems: 'center', gap: 2 },
  value:   { fontSize: 18, fontWeight: '900' },
  label:   { fontSize: 11, fontWeight: '600' },
  divider: { width: 1 },
});

// ─── Feed Card — Strava-Inspired ──────────────────────────────────────────────
function FeedCard({ post, t, cardShadow, onUserPress }: {
  post: FeedPost; t: ThemeTokens; cardShadow: object; onUserPress: () => void;
}) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const likeCount = post.likesCount + (liked && !post.isLiked ? 1 : 0) - (!liked && post.isLiked ? 1 : 0);
  const metrics = getMetrics(post);

  return (
    <View style={[fc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>

      <View style={fc.body}>
        <Pressable style={fc.userRow} onPress={onUserPress}>
          <Text style={[fc.timeStr, { color: t.muted }]}>{post.timeLabel}</Text>
          <View style={fc.userRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[fc.userName, { color: t.text }]}>{post.userName}</Text>
              <View style={[fc.sportChip, { backgroundColor: t.cardSoft }]}>
                <MaterialCommunityIcons name={SPORT_ICON[post.sport] as any} size={10} color={t.muted} />
                <Text style={[fc.sportChipTxt, { color: t.muted }]}>{SPORT_LABEL[post.sport]}</Text>
              </View>
            </View>
            <View style={[fc.avatar, { backgroundColor: post.userColor + '18', borderColor: post.userColor + '55' }]}>
              <Text style={[fc.avatarTxt, { color: post.userColor }]}>{post.userInitials}</Text>
            </View>
          </View>
        </Pressable>

        <View style={fc.activityHeader}>
          {post.isPR && (
            <View style={[fc.prTag, { backgroundColor: t.primary + '12', borderColor: t.primary + '30' }]}>
              <MaterialCommunityIcons name="trophy" size={11} color={t.primary} />
              <Text style={[fc.prTagTxt, { color: t.primary }]}>رقم قياسي</Text>
            </View>
          )}
          <Text style={[fc.activityType, { color: t.primary }]}>{SPORT_LABEL[post.sport]}</Text>
        </View>
        <Text style={[fc.title, { color: t.text }]}>{post.headline}</Text>
        {post.subtext && <Text style={[fc.desc, { color: t.muted }]}>{post.subtext}</Text>}

        {/* ── METRICS GRID — Strava-style ── */}
        {metrics.length > 0 && (
          <View style={[fc.metricsBox, { borderColor: t.line }]}>
            {metrics.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[fc.metricDiv, { backgroundColor: t.line }]} />}
                <View style={fc.metricItem}>
                  <Text style={[fc.metricVal, { color: t.text }]}>{m.val}</Text>
                  <Text style={[fc.metricLbl, { color: t.muted }]}>{m.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={fc.thumb} resizeMode="cover" />
        )}

        <View style={fc.footer}>
          <View style={fc.actions}>
            <Pressable style={fc.action}>
              <Ionicons name="chatbubble-outline" size={15} color={t.muted} />
              <Text style={[fc.actionN, { color: t.muted }]}>{post.commentsCount} تعليق</Text>
            </Pressable>
            <Pressable
              style={[fc.action, liked && { backgroundColor: t.primary + '14', borderRadius: 99 }]}
              onPress={() => setLiked(v => !v)}
            >
              <Ionicons name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={15} color={liked ? t.primary : t.muted} />
              <Text style={[fc.actionN, { color: liked ? t.primary : t.muted }]}>{likeCount} كودوس</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const fc = StyleSheet.create({
  card:        { borderRadius: 14, borderWidth: 1, marginBottom: spacing.md, overflow: 'hidden' },
  prTag:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  prTagTxt:    { fontWeight: '800', fontSize: 10 },
  body:        { padding: spacing.md },
  userRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  timeStr:     { fontSize: 11, marginTop: 4 },
  userRight:   { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  avatar:      { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:   { fontWeight: '800', fontSize: 15 },
  userName:    { fontWeight: '800', fontSize: 15, textAlign: 'right' },
  sportChip:   { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end', marginTop: 3 },
  sportChipTxt:{ fontSize: 10, fontWeight: '700' },
  activityHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  activityType: { fontSize: 12, fontWeight: '800' },
  title:       { fontSize: 18, fontWeight: '900', textAlign: 'right', marginBottom: 4, lineHeight: 24 },
  desc:        { fontSize: 13, textAlign: 'right', lineHeight: 18, marginBottom: spacing.sm },
  metricsBox:  { flexDirection: 'row-reverse', borderRadius: 10, borderWidth: 1, marginBottom: spacing.sm, overflow: 'hidden' },
  metricItem:  { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  metricVal:   { fontSize: 22, fontWeight: '900', letterSpacing: 0 },
  metricLbl:   { fontSize: 10, fontWeight: '600', marginTop: 2 },
  metricDiv:   { width: 1 },
  thumb:       { width: 72, height: 72, borderRadius: 10, alignSelf: 'flex-end', marginBottom: spacing.xs },
  footer:      { flexDirection: 'row-reverse', justifyContent: 'flex-end', alignItems: 'center', paddingTop: spacing.xs },

  actions:     { flexDirection: 'row-reverse', gap: 4 },
  action:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7 },
  actionN:     { fontSize: 13, fontWeight: '700' },
});

// ─── Feed Screen ──────────────────────────────────────────────────────────────
export function FeedScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [sportFilter, setSportFilter] = useState('all');

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.04,
    shadowRadius: 5,
    elevation: 1,
  };

  const filtered = sportFilter === 'all'
    ? feedPosts
    : feedPosts.filter(p => p.sport === sportFilter);

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={st.header}>
          <Pressable
            style={[st.mapBtn, { backgroundColor: t.cardSoft, borderColor: t.line }]}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map-outline" size={20} color={t.text} />
          </Pressable>
          <View>
            <Text style={[st.title, { color: t.text }]}>النشاط</Text>
          </View>
        </View>

        <MotivationStrip t={t} />

        {/* ── SPORT FILTER TABS (Strava-style) ── */}
        <View style={st.filterWrap}>
          <SportFilterBar active={sportFilter} onChange={setSportFilter} t={t} />
        </View>

        {/* ── FEED CARDS ── */}
        {filtered.length === 0 ? (
          <View style={[st.emptyCard, { backgroundColor: t.card, borderColor: t.line }]}>
            <MaterialCommunityIcons name={(SPORT_ICON[sportFilter as SportType] ?? 'run') as any} size={32} color={t.muted} />
            <Text style={[st.emptyTxt, { color: t.muted }]}>لا توجد أنشطة في هذه الرياضة</Text>
          </View>
        ) : (
          filtered.map(post => (
            <FeedCard
              key={post.id}
              post={post}
              t={t}
              cardShadow={cardShadow}
              onUserPress={() => navigation.navigate('UserProfile', { userId: post.userId, userName: post.userName })}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  header:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  kicker:  { fontSize: 11, fontWeight: '700', textAlign: 'right' },
  title:   { fontSize: 32, fontWeight: '900', lineHeight: 36, textAlign: 'right' },
  mapBtn:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 8 },

  rankChip:  { borderRadius: 18, marginBottom: spacing.md },
  rankInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  rankSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right' },
  rankMain:  { color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'right' },

  filterWrap: { marginHorizontal: -spacing.lg, marginBottom: spacing.md },

  emptyCard: { borderRadius: 20, borderWidth: 1, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTxt:  { fontSize: 14, fontWeight: '600' },
});
