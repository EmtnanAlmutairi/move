import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { communities, communityPosts } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { CommunityPost } from '../types';

type DetailTab = 'posts' | 'challenges' | 'leaderboard';

// ─── Mock: community challenges ───────────────────────────────────────────────
const COMM_CHALLENGES = [
  { id: 'cc1', title: 'تحدي 30 يوم تدريب متواصل', icon: 'dumbbell',    color: '#FF7A18', progress: 0.45, daysLeft: 16, participants: 48, maxPts: 500, isJoined: true  },
  { id: 'cc2', title: 'أكثر كيلو جري في الأسبوع',  icon: 'run',         color: '#30B36A', progress: 0,    daysLeft: 5,  participants: 22, maxPts: 300, isJoined: false },
  { id: 'cc3', title: 'تحدي الوزن الشهري',           icon: 'scale',       color: '#5E81F4', progress: 0.80, daysLeft: 2,  participants: 67, maxPts: 400, isJoined: true  },
  { id: 'cc4', title: 'ثلاث جلسات في الأسبوع',       icon: 'flash',       color: '#8E5CF5', progress: 0,    daysLeft: 7,  participants: 31, maxPts: 250, isJoined: false },
];

// ─── Mock: community leaderboard ──────────────────────────────────────────────
const COMM_LEADERS = [
  { rank: 1, name: 'محمد العتيبي',   initials: 'مع', color: '#FF7A18', points: 1840, streak: 22, isMe: false },
  { rank: 2, name: 'أنت',             initials: 'أن', color: '#30B36A', points: 1620, streak: 14, isMe: true  },
  { rank: 3, name: 'سعود الحارثي',   initials: 'سح', color: '#8E5CF5', points: 1410, streak: 18, isMe: false },
  { rank: 4, name: 'نور الرشيد',      initials: 'نر', color: '#5E81F4', points: 1280, streak: 9,  isMe: false },
  { rank: 5, name: 'فهد الدوسري',    initials: 'فد', color: '#FF4500', points: 1100, streak: 11, isMe: false },
  { rank: 6, name: 'رشيد القحطاني', initials: 'رق', color: '#22C55E', points: 990,  streak: 7,  isMe: false },
  { rank: 7, name: 'خالد الغامدي',   initials: 'خغ', color: '#F59E0B', points: 870,  streak: 5,  isMe: false },
];

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, isLiked, onLike }: { post: CommunityPost; isLiked: boolean; onLike: () => void }) {
  const { theme: t } = useTheme();
  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.04,
    shadowRadius: 5, elevation: 1,
  };
  return (
    <View style={[pc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      <View style={pc.headerRow}>
        <View style={pc.meta}>
          <Text style={[pc.time, { color: t.muted }]}>{post.timeLabel}</Text>
          {post.isCoach && (
            <View style={[pc.coachBadge, { backgroundColor: t.primary + '22' }]}>
              <Text style={[pc.coachBadgeTxt, { color: t.primary }]}>مدرب</Text>
            </View>
          )}
        </View>
        <View style={pc.authorRow}>
          <View style={[pc.avatar, { backgroundColor: post.authorColor + '22', borderColor: post.authorColor }]}>
            <Text style={[pc.avatarTxt, { color: post.authorColor }]}>{post.authorInitials}</Text>
          </View>
          <Text style={[pc.authorName, { color: t.text }]}>{post.authorName}</Text>
        </View>
      </View>
      <Text style={[pc.text, { color: t.text }]}>{post.text}</Text>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={pc.image} />}
      <View style={pc.actionsRow}>
        <Pressable style={pc.action}>
          <Ionicons name="chatbubble-outline" size={14} color={t.muted} />
          <Text style={[pc.actionTxt, { color: t.muted }]}>{post.commentsCount}</Text>
        </Pressable>
        <Pressable style={pc.action} onPress={onLike}>
          <Ionicons name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'} size={14} color={isLiked ? t.primary : t.muted} />
          <Text style={[pc.actionTxt, { color: isLiked ? t.primary : t.muted }]}>
            {post.likesCount + (isLiked && !post.isLiked ? 1 : 0)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const pc = StyleSheet.create({
  card:       { borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  headerRow:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  authorRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  avatar:     { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:  { fontWeight: '800', fontSize: 13 },
  authorName: { fontWeight: '700', fontSize: 14 },
  meta:       { alignItems: 'flex-start', gap: 4 },
  time:       { fontSize: 11 },
  coachBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  coachBadgeTxt: { fontSize: 10, fontWeight: '700' },
  text:       { textAlign: 'right', lineHeight: 22, marginBottom: spacing.sm },
  image:      { width: '100%', height: 180, borderRadius: 10, marginBottom: spacing.sm },
  actionsRow: { flexDirection: 'row-reverse', gap: spacing.md },
  action:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  actionTxt:  { fontSize: 14 },
});

// ─── Challenge Card ───────────────────────────────────────────────────────────
function ChallengeCard({ ch, onToggle }: { ch: typeof COMM_CHALLENGES[0]; onToggle: () => void }) {
  const { theme: t } = useTheme();
  const pct = Math.round(ch.progress * 100);
  return (
    <View style={[chc.card, { backgroundColor: t.card, borderColor: ch.isJoined ? ch.color + '50' : t.line }]}>
      <View style={chc.top}>
        <View style={chc.topLeft}>
          {ch.isJoined && (
            <View style={[chc.joinedBadge, { backgroundColor: ch.color + '18' }]}>
              <Ionicons name="checkmark-circle" size={12} color={ch.color} />
              <Text style={[chc.joinedTxt, { color: ch.color }]}>منضم</Text>
            </View>
          )}
          <View style={[chc.timePill, { backgroundColor: t.cardSoft }]}>
            <Ionicons name="time-outline" size={10} color={t.muted} />
            <Text style={[chc.timeTxt, { color: t.muted }]}>{ch.daysLeft} يوم متبقي</Text>
          </View>
        </View>
        <View style={chc.topRight}>
          <View style={[chc.iconWrap, { backgroundColor: ch.color + '18' }]}>
            <MaterialCommunityIcons name={ch.icon as any} size={18} color={ch.color} />
          </View>
          <Text style={[chc.title, { color: t.text }]}>{ch.title}</Text>
        </View>
      </View>
      {ch.isJoined && (
        <View style={chc.progressRow}>
          <Text style={[chc.pctTxt, { color: ch.color }]}>{pct}%</Text>
          <View style={[chc.track, { backgroundColor: t.cardSoft, flex: 1 }]}>
            <View style={[chc.fill, { width: `${pct}%` as any, backgroundColor: ch.color }]} />
          </View>
        </View>
      )}
      <View style={chc.bottom}>
        <Pressable
          style={[chc.joinBtn, { backgroundColor: ch.isJoined ? t.cardSoft : ch.color, borderColor: ch.isJoined ? t.line : ch.color }]}
          onPress={onToggle}
        >
          <Text style={[chc.joinBtnTxt, { color: ch.isJoined ? t.muted : '#fff' }]}>
            {ch.isJoined ? 'إلغاء الانضمام' : 'انضم للتحدي'}
          </Text>
        </Pressable>
        <View style={chc.metaRow}>
          <View style={[chc.statPill, { backgroundColor: t.cardSoft }]}>
            <Ionicons name="people-outline" size={11} color={t.muted} />
            <Text style={[chc.statTxt, { color: t.muted }]}>{ch.participants}</Text>
          </View>
          <View style={[chc.statPill, { backgroundColor: t.cardSoft }]}>
            <MaterialCommunityIcons name="star-four-points" size={11} color={t.muted} />
            <Text style={[chc.statTxt, { color: t.muted }]}>{ch.maxPts} نقطة</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
const chc = StyleSheet.create({
  card:       { borderRadius: 16, borderWidth: 1.5, padding: spacing.md, marginBottom: spacing.sm },
  top:        { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  topRight:   { flex: 1, alignItems: 'flex-end', gap: 4 },
  topLeft:    { alignItems: 'flex-start', gap: 5 },
  iconWrap:   { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title:      { fontWeight: '800', fontSize: 15, textAlign: 'right', lineHeight: 22 },
  joinedBadge:{ flexDirection: 'row-reverse', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  joinedTxt:  { fontSize: 11, fontWeight: '700' },
  timePill:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  timeTxt:    { fontSize: 10, fontWeight: '600' },
  progressRow:{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  pctTxt:     { fontSize: 12, fontWeight: '800', minWidth: 34, textAlign: 'right' },
  track:      { height: 7, borderRadius: 4, overflow: 'hidden' },
  fill:       { height: 7, borderRadius: 4 },
  bottom:     { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  joinBtn:    { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: 9, flex: 1 },
  joinBtnTxt: { fontWeight: '800', fontSize: 13, textAlign: 'center' },
  metaRow:    { flexDirection: 'row-reverse', gap: 5 },
  statPill:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5 },
  statTxt:    { fontSize: 10, fontWeight: '700' },
});

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderRow({ entry, t, cardShadow }: { entry: typeof COMM_LEADERS[0]; t: any; cardShadow: any }) {
  return (
    <View style={[lr.row, {
      backgroundColor: entry.isMe ? t.primary + '10' : t.card,
      borderColor: entry.isMe ? t.primary : t.line,
      borderWidth: entry.isMe ? 2 : 1,
    }, cardShadow]}>
      {entry.rank <= 3 ? (
        <MaterialCommunityIcons
          name="medal"
          size={24}
          color={entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#B0B0B0' : '#CD7F32'}
          style={lr.rankIcon}
        />
      ) : (
        <Text style={[lr.rankNum, { color: t.muted }]}>{entry.rank}</Text>
      )}
      <View style={[lr.avatar, { backgroundColor: entry.color + '22', borderColor: entry.color }]}>
        <Text style={[lr.avatarTxt, { color: entry.color }]}>{entry.initials}</Text>
      </View>
      <View style={lr.info}>
        <Text style={[lr.name, { color: t.text }]}>{entry.name}{entry.isMe ? ' ← أنت' : ''}</Text>
        <View style={lr.streakRow}>
          <Ionicons name="flame" size={13} color={t.primary} />
          <Text style={[lr.streakTxt, { color: t.muted }]}>{entry.streak} يوم</Text>
        </View>
      </View>
      <View>
        <Text style={[lr.pts, { color: t.primary }]}>{entry.points.toLocaleString()}</Text>
        <Text style={[lr.ptsLbl, { color: t.muted }]}>نقطة</Text>
      </View>
    </View>
  );
}
const lr = StyleSheet.create({
  row:      { borderRadius: 16, flexDirection: 'row-reverse', alignItems: 'center', padding: spacing.md, marginBottom: spacing.xs, gap: spacing.sm },
  rankIcon: { width: 32, textAlign: 'center' },
  rankNum:  { fontSize: 18, fontWeight: '800', width: 32, textAlign: 'center' },
  avatar:   { width: 40, height: 40, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:{ fontWeight: '800' },
  info:     { flex: 1, alignItems: 'flex-end' },
  name:     { fontWeight: '700' },
  streakRow:{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  streakTxt:{ fontSize: 12 },
  pts:      { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  ptsLbl:   { fontSize: 11, textAlign: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function CommunityDetailScreen({ route, navigation }: any) {
  const { theme: t } = useTheme();
  const { communityId } = route.params;
  const community = communities.find((c) => c.id === communityId)!;
  const posts = communityPosts[communityId] || [];
  const [joined, setJoined] = useState(community.isJoined);
  const [activeTab, setActiveTab] = useState<DetailTab>('posts');
  const [likes, setLikes] = useState<Record<string, boolean>>(
    Object.fromEntries(posts.map((p) => [p.id, p.isLiked ?? false]))
  );
  const [challenges, setChallenges] = useState(COMM_CHALLENGES);

  const toggleLike = (postId: string) =>
    setLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const toggleChallenge = (id: string) =>
    setChallenges(prev => prev.map(ch => ch.id === id ? { ...ch, isJoined: !ch.isJoined } : ch));

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.04,
    shadowRadius: 5, elevation: 1,
  };

  const TAB_ITEMS: { id: DetailTab; label: string; icon: string }[] = [
    { id: 'posts',       label: 'منشورات', icon: 'chatbubble-outline'  },
    { id: 'challenges',  label: 'تحديات',   icon: 'trophy-outline'      },
    { id: 'leaderboard', label: 'الترتيب',  icon: 'podium-outline'      },
  ];

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.container} showsVerticalScrollIndicator={false}>

        <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>

        {/* Hero */}
        <LinearGradient colors={[t.primary, t.primary]} style={st.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={st.heroCoachRow}>
            <View style={st.coachAvatar}>
              <Text style={st.coachAvatarTxt}>{community.coachInitials}</Text>
            </View>
            <View>
              <Text style={st.coachRole}>المدرب</Text>
              <Text style={st.coachName}>{community.coachName}</Text>
            </View>
          </View>
          <Text style={st.heroName}>{community.name}</Text>
          <Text style={st.heroDesc}>{community.description}</Text>
          <View style={st.heroStats}>
            {[
              { icon: 'people-outline', val: community.membersCount.toLocaleString() },
              { icon: 'chatbubble-outline', val: community.postsCount.toLocaleString() },
              ...(!community.isFree ? [{ icon: 'card-outline', val: `${community.priceMonthly} ر.س/شهر` }] : []),
            ].map((s, i) => (
              <View key={i} style={st.heroStatRow}>
                <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.9)" />
                <Text style={st.heroStat}>{s.val}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Join / Joined */}
        {!joined ? (
          <Pressable onPress={() => setJoined(true)}>
            <LinearGradient colors={[t.primary, t.primary]} style={st.joinBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={st.joinBtnInner}>
                {community.isFree && <Ionicons name="checkmark" size={16} color="#fff" />}
                <Text style={st.joinBtnTxt}>
                  {community.isFree ? 'انضم مجاناً' : `انضم مقابل ${community.priceMonthly} ر.س/شهر`}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[st.joinedBar, { backgroundColor: t.success + '18', borderColor: t.success }]}>
            <Ionicons name="checkmark-circle" size={16} color={t.success} />
            <Text style={[st.joinedBarTxt, { color: t.success }]}>أنت عضو في هذا المجتمع</Text>
          </View>
        )}

        {/* Tab Bar */}
        <View style={[st.tabBar, { backgroundColor: t.cardSoft }]}>
          {TAB_ITEMS.map(tab => {
            const on = activeTab === tab.id;
            return (
              <Pressable key={tab.id} style={[st.tabBtn, on && { backgroundColor: t.card }]} onPress={() => setActiveTab(tab.id)}>
                <Ionicons name={tab.icon as any} size={15} color={on ? t.primary : t.muted} />
                <Text style={[st.tabBtnTxt, { color: on ? t.primary : t.muted }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ══════ POSTS ══════ */}
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <View style={st.emptyPosts}>
                <Text style={[st.emptyTxt, { color: t.muted }]}>لا يوجد منشورات بعد. كن أول من ينشر!</Text>
              </View>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} isLiked={likes[post.id] ?? false} onLike={() => toggleLike(post.id)} />
              ))
            )}
          </>
        )}

        {/* ══════ CHALLENGES ══════ */}
        {activeTab === 'challenges' && (
          <>
            {/* Create challenge CTA */}
            {joined && (
              <Pressable style={[st.createChallenge, { borderColor: t.primary }]}>
                <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.createChallengeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={st.createChallengeTxt}>إنشاء تحدي جديد</Text>
                </LinearGradient>
              </Pressable>
            )}
            {challenges.map(ch => (
              <ChallengeCard key={ch.id} ch={ch} onToggle={() => toggleChallenge(ch.id)} />
            ))}
          </>
        )}

        {/* ══════ LEADERBOARD ══════ */}
        {activeTab === 'leaderboard' && (
          <>
            <LinearGradient colors={[t.primary, t.primary]} style={st.leaderHero} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
              <View style={st.leaderTitleRow}>
                <Ionicons name="trophy" size={22} color="#fff" />
                <Text style={st.leaderTitle}>لوحة متصدري المجتمع</Text>
              </View>
              <Text style={st.leaderSub}>{community.name} · {COMM_LEADERS.length} متنافس</Text>
            </LinearGradient>
            {COMM_LEADERS.map(entry => (
              <LeaderRow key={entry.rank} entry={entry} t={t} cardShadow={cardShadow} />
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:       { flex: 1 },
  container:  { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 110 },
  backBtn:    { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },

  hero:         { borderRadius: 14, padding: spacing.lg, marginBottom: spacing.md },
  heroCoachRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  coachAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  coachAvatarTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  coachRole:    { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  coachName:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroName:     { color: '#fff', fontWeight: '800', fontSize: 22, textAlign: 'right', marginBottom: spacing.xs },
  heroDesc:     { color: 'rgba(255,255,255,0.85)', textAlign: 'right', fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
  heroStats:    { flexDirection: 'row-reverse', gap: spacing.md },
  heroStatRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStat:     { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },

  joinBtn:      { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: spacing.md },
  joinBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  joinBtnTxt:   { color: '#fff', fontWeight: '800', fontSize: 17 },
  joinedBar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, borderWidth: 1, paddingVertical: 12, marginBottom: spacing.md },
  joinedBarTxt: { fontWeight: '700' },

  tabBar:    { flexDirection: 'row-reverse', borderRadius: 12, padding: 3, gap: 2, marginBottom: spacing.md },
  tabBtn:    { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, paddingVertical: 10 },
  tabBtnTxt: { fontSize: 12, fontWeight: '800' },

  createChallenge:     { borderRadius: 14, overflow: 'hidden', marginBottom: spacing.sm, borderWidth: 0 },
  createChallengeGrad: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  createChallengeTxt:  { color: '#fff', fontWeight: '800', fontSize: 15 },

  leaderHero:     { borderRadius: 14, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  leaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  leaderTitle:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  leaderSub:      { color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  emptyPosts: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTxt:   { fontSize: 14 },
});
