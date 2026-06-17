import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chats, communities, leaderboard } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

type Tab = 'chats' | 'leaderboard';

function roleLabel(role: string) {
  if (role === 'coach') return 'مدرب بدني';
  if (role === 'nutritionist') return 'تغذية';
  if (role === 'physio') return 'علاج طبيعي';
  return 'فريق متكامل';
}

function RankBadge({ rank }: { rank: number }) {
  const { theme: t } = useTheme();
  if (rank === 1) return <Text style={st.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={st.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={st.rankEmoji}>🥉</Text>;
  return <Text style={[st.rankNum, { color: t.muted }]}>{rank}</Text>;
}

export function CommunityScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('chats');

  const unreadTotal = useMemo(() => chats.reduce((sum, c) => sum + c.unreadCount, 0), []);
  const joinedCount = useMemo(() => communities.filter((c) => c.isJoined).length, []);

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.container} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[t.primary, t.primary]}
          style={st.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={st.heroKicker}>التواصل</Text>
          <Text style={st.heroTitle}>مجتمعك وفريقك في مكان واحد</Text>
          <Text style={st.heroSubtitle}>
            ادخل مباشرة على محادثات الفريق، المجتمعات المشتركة، وتحديثات المتصدرين.
          </Text>
          <View style={st.heroStats}>
            {[
              { val: chats.length,   lbl: 'محادثات' },
              { val: unreadTotal,    lbl: 'غير مقروءة' },
              { val: joinedCount,    lbl: 'مجتمعاتك' },
            ].map((s) => (
              <View key={s.lbl} style={st.heroStat}>
                <Text style={st.heroStatValue}>{s.val}</Text>
                <Text style={st.heroStatLabel}>{s.lbl}</Text>
              </View>
            ))}
          </View>
          <View style={st.heroActions}>
            <Pressable style={st.heroGhostBtn} onPress={() => navigation.navigate('Communities')}>
              <Text style={st.heroGhostBtnText}>استكشاف المجتمعات</Text>
            </Pressable>
            <Pressable style={st.heroPrimaryBtn} onPress={() => navigation.navigate('TeamSelection')}>
              <Text style={[st.heroPrimaryBtnText, { color: t.primary }]}>إدارة الفريق</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={st.tabRow}>
          {(['chats', 'leaderboard'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                st.tabBtn,
                { borderColor: activeTab === tab ? t.primary : t.line, backgroundColor: activeTab === tab ? t.cardSoft : t.card },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[st.tabText, { color: activeTab === tab ? t.primary : t.muted }]}>
                {tab === 'chats' ? 'المحادثات' : 'المتصدرون'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── CHATS ── */}
        {activeTab === 'chats' && (
          <>
            <View style={st.sectionHeader}>
              <Text style={[st.sectionTitle, { color: t.text }]}>فريقك الصحي</Text>
              <Text style={[st.sectionHint, { color: t.muted }]}>ادخل مباشرة للمحادثة</Text>
            </View>

            {chats.map((chat) => (
              <Pressable
                key={chat.id}
                style={[
                  st.chatCard,
                  { backgroundColor: t.card, borderColor: chat.unreadCount > 0 ? t.primary : t.line },
                  chat.unreadCount > 0 && { borderWidth: 2 },
                ]}
                onPress={() => navigation.navigate('ChatRoom', { threadId: chat.id })}
              >
                <View style={st.chatRow}>
                  <View style={[st.avatar, { backgroundColor: t.primary + '22', borderColor: t.primary }]}>
                    <Text style={[st.avatarText, { color: t.primary }]}>{chat.name.slice(0, 1)}</Text>
                  </View>
                  <View style={st.chatMeta}>
                    <View style={st.chatTopRow}>
                      {chat.unreadCount > 0 && (
                        <View style={[st.unreadBadge, { backgroundColor: t.primary }]}>
                          <Text style={st.unreadText}>{chat.unreadCount}</Text>
                        </View>
                      )}
                      <Text style={[st.chatTime, { color: t.muted }]}>{chat.timeLabel}</Text>
                    </View>
                    <Text style={[st.chatName, { color: t.text }]}>{chat.name}</Text>
                    <Text style={[st.chatRole, { color: t.primary }]}>{roleLabel(chat.role)}</Text>
                    <Text style={[st.chatLast, { color: t.muted }]} numberOfLines={1}>{chat.lastMessage}</Text>
                  </View>
                </View>
              </Pressable>
            ))}

            <View style={st.linkRow}>
              <Pressable
                style={[st.secondaryLink, { backgroundColor: t.card, borderColor: t.line }]}
                onPress={() => navigation.navigate('Chat')}
              >
                <Text style={[st.secondaryLinkText, { color: t.text }]}>عرض كل المحادثات</Text>
              </Pressable>
              <Pressable
                style={[st.secondaryLink, { backgroundColor: t.card, borderColor: t.line }]}
                onPress={() => navigation.navigate('Communities')}
              >
                <Text style={[st.secondaryLinkText, { color: t.text }]}>المجتمعات المشتركة</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ── LEADERBOARD ── */}
        {activeTab === 'leaderboard' && (
          <>
            <LinearGradient
              colors={[t.primary, t.primary]}
              style={st.leaderHero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={st.leaderHeroTitle}>لوحة المتصدرين</Text>
              <Text style={st.leaderHeroSub}>هذا الأسبوع</Text>
            </LinearGradient>

            {leaderboard.map((entry) => (
              <View
                key={entry.rank}
                style={[
                  st.leaderRow,
                  { backgroundColor: entry.isMe ? t.cardSoft : t.card, borderColor: entry.isMe ? t.primary : t.line },
                  entry.isMe && { borderWidth: 2 },
                ]}
              >
                <View style={st.leaderRankWrap}>
                  <RankBadge rank={entry.rank} />
                </View>
                <View style={[st.leaderAvatar, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                  <Text style={[st.leaderAvatarText, { color: t.text }]}>{entry.avatar}</Text>
                </View>
                <View style={st.leaderInfo}>
                  <Text style={[st.leaderName, { color: t.text }]}>
                    {entry.name}{entry.isMe ? ' (أنا)' : ''}
                  </Text>
                  <Text style={[st.leaderStreak, { color: t.muted }]}>🔥 {entry.streak} أيام</Text>
                </View>
                <View style={st.leaderPoints}>
                  <Text style={[st.leaderPointsVal, { color: t.primary }]}>{entry.weeklyPoints.toLocaleString()}</Text>
                  <Text style={[st.leaderPointsLabel, { color: t.muted }]}>نقطة</Text>
                </View>
              </View>
            ))}

            <View style={[st.pointsInfo, { backgroundColor: t.card, borderColor: t.line }]}>
              <Text style={[st.pointsInfoTitle, { color: t.text }]}>كيف تكسب النقاط؟</Text>
              {[
                'تمرين مكتمل: 150 نقطة',
                'كل كيلومتر جري: 50 نقطة',
                '10,000 خطوة: 100 نقطة',
                'يوم Streak: 20 نقطة',
              ].map((item) => (
                <Text key={item} style={[st.pointsInfoItem, { color: t.muted }]}>{item}</Text>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:      { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  hero:           { borderRadius: 14, padding: spacing.lg, marginBottom: spacing.md },
  heroKicker:     { textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  heroTitle:      { textAlign: 'right', fontSize: 24, fontWeight: '900', color: '#fff', marginTop: spacing.xs },
  heroSubtitle:   { textAlign: 'right', color: 'rgba(255,255,255,0.86)', marginTop: spacing.xs, lineHeight: 21 },
  heroStats:      { flexDirection: 'row-reverse', gap: 8, marginTop: spacing.md },
  heroStat:       { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 10, paddingVertical: 12 },
  heroStatValue:  { textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '900' },
  heroStatLabel:  { textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 3 },
  heroActions:    { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.md },
  heroPrimaryBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  heroPrimaryBtnText: { fontWeight: '800' },
  heroGhostBtn:   { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', paddingVertical: 13, alignItems: 'center' },
  heroGhostBtnText: { color: '#fff', fontWeight: '700' },

  tabRow:    { flexDirection: 'row-reverse', gap: 10, marginBottom: spacing.md },
  tabBtn:    { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  tabText:   { fontWeight: '700', fontSize: 14 },

  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle:  { fontWeight: '800', fontSize: 18 },
  sectionHint:   { fontSize: 12 },

  chatCard:    { borderRadius: 14, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  chatRow:     { flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center' },
  avatar:      { width: 48, height: 48, borderRadius: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 20, fontWeight: '800' },
  chatMeta:    { flex: 1, alignItems: 'flex-end' },
  chatTopRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 2 },
  chatTime:    { fontSize: 12 },
  unreadBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  unreadText:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  chatName:    { fontWeight: '800', fontSize: 16, textAlign: 'right' },
  chatRole:    { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  chatLast:    { fontSize: 13, textAlign: 'right' },

  linkRow:          { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.sm },
  secondaryLink:    { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  secondaryLinkText:{ fontWeight: '700' },

  leaderHero:      { borderRadius: 20, paddingVertical: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  leaderHeroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  leaderHeroSub:   { color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  leaderRow:        { borderRadius: 16, borderWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', padding: spacing.md, marginBottom: spacing.xs, gap: spacing.sm },
  leaderRankWrap:   { width: 32, alignItems: 'center' },
  rankEmoji:        { fontSize: 22 },
  rankNum:          { fontSize: 18, fontWeight: '800' },
  leaderAvatar:     { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  leaderAvatarText: { fontWeight: '800' },
  leaderInfo:       { flex: 1, alignItems: 'flex-end' },
  leaderName:       { fontWeight: '700', textAlign: 'right' },
  leaderStreak:     { fontSize: 12, marginTop: 2 },
  leaderPoints:     { alignItems: 'center' },
  leaderPointsVal:  { fontSize: 18, fontWeight: '800' },
  leaderPointsLabel:{ fontSize: 11 },

  pointsInfo:      { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginTop: spacing.sm },
  pointsInfoTitle: { textAlign: 'right', fontWeight: '800', fontSize: 15, marginBottom: spacing.sm },
  pointsInfoItem:  { textAlign: 'right', fontSize: 14, marginBottom: 6 },
});
