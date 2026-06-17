import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chats, communities, leaderboard } from '../data/mockData';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';

type Tab = 'chats' | 'leaderboard';

function roleLabel(role: string) {
  if (role === 'coach') return 'مدرب بدني';
  if (role === 'nutritionist') return 'تغذية';
  if (role === 'physio') return 'علاج طبيعي';
  return 'فريق متكامل';
}

function roleColor(role: string) {
  if (role === 'coach') return colors.primary;
  if (role === 'nutritionist') return colors.success;
  if (role === 'physio') return '#7C5CBF';
  return '#1A9ECC';
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

export function CommunityScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('chats');

  const unreadTotal = useMemo(
    () => chats.reduce((sum, chat) => sum + chat.unreadCount, 0),
    []
  );

  const joinedCount = useMemo(
    () => communities.filter((community) => community.isJoined).length,
    []
  );

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroKicker}>التواصل</Text>
          <Text style={styles.heroTitle}>مجتمعك وفريقك في مكان واحد</Text>
          <Text style={styles.heroSubtitle}>
            ادخل مباشرة على محادثات الفريق، المجتمعات المشتركة، وتحديثات المتصدرين.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{chats.length}</Text>
              <Text style={styles.heroStatLabel}>محادثات</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{unreadTotal}</Text>
              <Text style={styles.heroStatLabel}>غير مقروءة</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{joinedCount}</Text>
              <Text style={styles.heroStatLabel}>مجتمعاتك</Text>
            </View>
          </View>
          <View style={styles.heroActions}>
            <Pressable style={styles.heroGhostBtn} onPress={() => navigation.navigate('Communities')}>
              <Text style={styles.heroGhostBtnText}>استكشاف المجتمعات</Text>
            </Pressable>
            <Pressable style={styles.heroPrimaryBtn} onPress={() => navigation.navigate('TeamSelection')}>
              <Text style={styles.heroPrimaryBtnText}>إدارة الفريق</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.tabRow}>
          {(['chats', 'leaderboard'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'chats' ? 'المحادثات' : 'المتصدرون'}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'chats' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>فريقك الصحي</Text>
              <Text style={styles.sectionHint}>ادخل مباشرة للمحادثة</Text>
            </View>

            {chats.map((chat) => (
              <Pressable
                key={chat.id}
                style={[styles.chatCard, chat.unreadCount > 0 && styles.chatCardUnread]}
                onPress={() => navigation.navigate('ChatRoom', { threadId: chat.id })}
              >
                <View style={styles.chatRow}>
                  <View style={[styles.avatar, { backgroundColor: roleColor(chat.role) + '22', borderColor: roleColor(chat.role) }]}>
                    <Text style={[styles.avatarText, { color: roleColor(chat.role) }]}>{chat.name.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.chatMeta}>
                    <View style={styles.chatTopRow}>
                      {chat.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                        </View>
                      )}
                      <Text style={styles.chatTime}>{chat.timeLabel}</Text>
                    </View>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatRole}>{roleLabel(chat.role)}</Text>
                    <Text style={styles.chatLast} numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            <View style={styles.linkRow}>
              <Pressable style={styles.secondaryLink} onPress={() => navigation.navigate('Chat')}>
                <Text style={styles.secondaryLinkText}>عرض كل المحادثات</Text>
              </Pressable>
              <Pressable style={styles.secondaryLink} onPress={() => navigation.navigate('Communities')}>
                <Text style={styles.secondaryLinkText}>المجتمعات المشتركة</Text>
              </Pressable>
            </View>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            <LinearGradient
              colors={['#231713', '#553125', colors.primary]}
              style={styles.leaderHero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.leaderHeroTitle}>لوحة المتصدرين</Text>
              <Text style={styles.leaderHeroSub}>هذا الأسبوع</Text>
            </LinearGradient>

            {leaderboard.map((entry) => (
              <View key={entry.rank} style={[styles.leaderRow, entry.isMe && styles.leaderRowMe]}>
                <View style={styles.leaderRankWrap}>
                  <RankBadge rank={entry.rank} />
                </View>
                <View style={styles.leaderAvatar}>
                  <Text style={styles.leaderAvatarText}>{entry.avatar}</Text>
                </View>
                <View style={styles.leaderInfo}>
                  <Text style={styles.leaderName}>
                    {entry.name}
                    {entry.isMe ? ' (أنا)' : ''}
                  </Text>
                  <Text style={styles.leaderStreak}>🔥 {entry.streak} أيام</Text>
                </View>
                <View style={styles.leaderPoints}>
                  <Text style={styles.leaderPointsVal}>{entry.weeklyPoints.toLocaleString()}</Text>
                  <Text style={styles.leaderPointsLabel}>نقطة</Text>
                </View>
              </View>
            ))}

            <View style={styles.pointsInfo}>
              <Text style={styles.pointsInfoTitle}>كيف تكسب النقاط؟</Text>
              <Text style={styles.pointsInfoItem}>تمرين مكتمل: 150 نقطة</Text>
              <Text style={styles.pointsInfoItem}>كل كيلومتر جري: 50 نقطة</Text>
              <Text style={styles.pointsInfoItem}>10,000 خطوة: 100 نقطة</Text>
              <Text style={styles.pointsInfoItem}>يوم Streak: 20 نقطة</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110
  },
  hero: {
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  heroKicker: {
    textAlign: 'right',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700'
  },
  heroTitle: {
    textAlign: 'right',
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: spacing.xs
  },
  heroSubtitle: {
    textAlign: 'right',
    color: 'rgba(255,255,255,0.86)',
    marginTop: spacing.xs,
    lineHeight: 21
  },
  heroStats: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: spacing.md
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    paddingVertical: 12
  },
  heroStatValue: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '900'
  },
  heroStatLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 3
  },
  heroActions: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: spacing.md
  },
  heroPrimaryBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center'
  },
  heroPrimaryBtnText: {
    color: colors.primary,
    fontWeight: '800'
  },
  heroGhostBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingVertical: 13,
    alignItems: 'center'
  },
  heroGhostBtnText: {
    color: '#fff',
    fontWeight: '700'
  },
  tabRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center'
  },
  tabBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSoft
  },
  tabText: {
    fontWeight: '700',
    color: colors.muted,
    fontSize: 14
  },
  tabTextActive: {
    color: colors.primary
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 18,
    color: colors.text
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 12
  },
  chatCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  chatCardUnread: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  chatRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800'
  },
  chatMeta: {
    flex: 1,
    alignItems: 'flex-end'
  },
  chatTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  chatTime: {
    color: colors.muted,
    fontSize: 12
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800'
  },
  chatName: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
    textAlign: 'right'
  },
  chatRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2
  },
  chatLast: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'right'
  },
  linkRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: spacing.sm
  },
  secondaryLink: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: 'center'
  },
  secondaryLinkText: {
    color: colors.text,
    fontWeight: '700'
  },
  leaderHero: {
    borderRadius: 20,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  leaderHeroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800'
  },
  leaderHeroSub: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4
  },
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
  leaderRowMe: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.cardSoft
  },
  leaderRankWrap: {
    width: 32,
    alignItems: 'center'
  },
  rankEmoji: {
    fontSize: 22
  },
  rankNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.muted
  },
  leaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center'
  },
  leaderAvatarText: {
    fontWeight: '800',
    color: colors.text
  },
  leaderInfo: {
    flex: 1,
    alignItems: 'flex-end'
  },
  leaderName: {
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right'
  },
  leaderStreak: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  leaderPoints: {
    alignItems: 'center'
  },
  leaderPointsVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  leaderPointsLabel: {
    color: colors.muted,
    fontSize: 11
  },
  pointsInfo: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginTop: spacing.sm
  },
  pointsInfoTitle: {
    textAlign: 'right',
    fontWeight: '800',
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm
  },
  pointsInfoItem: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 14,
    marginBottom: 6
  }
});
