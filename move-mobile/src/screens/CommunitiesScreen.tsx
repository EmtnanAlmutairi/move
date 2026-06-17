import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { communities, leaderboard } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';
import { Community } from '../types';

type Tab = 'discover' | 'joined' | 'leaderboard';

const CATEGORY_LABELS: Record<string, string> = {
  strength: '💪 قوة',
  running: '🏃 جري',
  nutrition: '🥗 تغذية',
  wellness: '🌿 صحة',
  mixed: '⚡ متنوع'
};

function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <LinearGradient
        colors={community.coverGradient}
        style={styles.cardCover}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardCoverRow}>
          <View style={styles.coachAvatarSmall}>
            <Text style={styles.coachAvatarSmallText}>{community.coachInitials}</Text>
          </View>
          <Text style={styles.categoryTag}>{CATEGORY_LABELS[community.category]}</Text>
        </View>
        <Text style={styles.cardName}>{community.name}</Text>
        {community.isJoined ? (
          <View style={styles.joinedBadge}><Text style={styles.joinedBadgeText}>✓ منضم</Text></View>
        ) : community.isFree ? (
          <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>مجاني</Text></View>
        ) : (
          <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{community.priceMonthly} ر.س/شهر</Text></View>
        )}
      </LinearGradient>
      <View style={styles.cardBody}>
        <View style={styles.cardStats}>
          <Text style={styles.cardStat}>👥 {community.membersCount.toLocaleString()} عضو</Text>
          <Text style={styles.cardStat}>💬 {community.postsCount.toLocaleString()} منشور</Text>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{community.description}</Text>
        <View style={styles.latestPost}>
          <Text style={styles.latestPostTime}>{community.latestPostTime}</Text>
          <Text style={styles.latestPostText} numberOfLines={1}>{community.latestPost}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

export function CommunitiesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const joinedCommunities = communities.filter((c) => c.isJoined);
  const discoverCommunities = communities;

  const list = activeTab === 'joined' ? joinedCommunities : discoverCommunities;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.createBtn} onPress={() => {}}>
            <Text style={styles.createBtnText}>+ إنشاء</Text>
          </Pressable>
          <Text style={styles.title}>المجتمعات</Text>
        </View>

        <View style={styles.tabRow}>
          {(['discover', 'joined', 'leaderboard'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'discover' ? 'اكتشف' : tab === 'joined' ? `منضم (${joinedCommunities.length})` : '🏆'}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab !== 'leaderboard' && list.map((c) => (
          <CommunityCard
            key={c.id}
            community={c}
            onPress={() => navigation.navigate('CommunityDetail', { communityId: c.id })}
          />
        ))}

        {activeTab === 'leaderboard' && (
          <>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.leaderHero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.leaderTitle}>🏆 لوحة المتصدرين</Text>
              <Text style={styles.leaderSub}>هذا الأسبوع • {leaderboard.length} متسابق</Text>
            </LinearGradient>

            {leaderboard.map((entry) => (
              <View key={entry.rank} style={[styles.leaderRow, entry.isMe && styles.leaderRowMe]}>
                <RankBadge rank={entry.rank} />
                <View style={styles.leaderAvatar}>
                  <Text style={styles.leaderAvatarText}>{entry.avatar}</Text>
                </View>
                <View style={styles.leaderInfo}>
                  <Text style={styles.leaderName}>{entry.name}{entry.isMe ? ' ← أنت' : ''}</Text>
                  <Text style={styles.leaderStreak}>🔥 {entry.streak} يوم</Text>
                </View>
                <View>
                  <Text style={styles.leaderPts}>{entry.weeklyPoints.toLocaleString()}</Text>
                  <Text style={styles.leaderPtsLabel}>نقطة</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 9
  },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  tabRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center'
  },
  tabBtnActive: { borderColor: colors.primary, backgroundColor: colors.cardSoft },
  tabText: { fontWeight: '700', color: colors.muted, fontSize: 13 },
  tabTextActive: { color: colors.primary },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  cardCover: { padding: spacing.md, minHeight: 110 },
  cardCoverRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  coachAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coachAvatarSmallText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  cardName: { color: '#fff', fontWeight: '800', fontSize: 18, textAlign: 'right', marginBottom: spacing.sm },
  joinedBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  joinedBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  freeBadge: { alignSelf: 'flex-end', backgroundColor: '#30B36A88', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  freeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  priceBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  priceBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardBody: { padding: spacing.md },
  cardStats: { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.xs },
  cardStat: { color: colors.muted, fontSize: 12 },
  cardDesc: { color: colors.text, fontSize: 13, textAlign: 'right', lineHeight: 20, marginBottom: spacing.sm },
  latestPost: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.xs },
  latestPostText: { color: colors.muted, fontSize: 12, textAlign: 'right' },
  latestPostTime: { color: colors.muted, fontSize: 10, textAlign: 'right', marginBottom: 2 },
  leaderHero: { borderRadius: 20, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  leaderTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  leaderSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  leaderRow: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm
  },
  leaderRowMe: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.cardSoft },
  rankEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  rankNum: { fontSize: 18, fontWeight: '800', color: colors.muted, width: 32, textAlign: 'center' },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center'
  },
  leaderAvatarText: { fontWeight: '800', color: colors.text },
  leaderInfo: { flex: 1, alignItems: 'flex-end' },
  leaderName: { fontWeight: '700', color: colors.text },
  leaderStreak: { color: colors.muted, fontSize: 12, marginTop: 2 },
  leaderPts: { fontSize: 18, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  leaderPtsLabel: { color: colors.muted, fontSize: 11, textAlign: 'center' }
});
