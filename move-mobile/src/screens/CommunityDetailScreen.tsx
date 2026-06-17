import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { communities, communityPosts } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';
import { CommunityPost } from '../types';

export function CommunityDetailScreen({ route, navigation }: any) {
  const { communityId } = route.params;
  const community = communities.find((c) => c.id === communityId)!;
  const posts = communityPosts[communityId] || [];
  const [joined, setJoined] = useState(community.isJoined);
  const [likes, setLikes] = useState<Record<string, boolean>>(
    Object.fromEntries(posts.map((p) => [p.id, p.isLiked ?? false]))
  );

  const toggleLike = (postId: string) =>
    setLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>→ رجوع</Text>
        </Pressable>

        <LinearGradient
          colors={community.coverGradient}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroCoachRow}>
            <View style={[styles.coachAvatar, { borderColor: 'rgba(255,255,255,0.5)' }]}>
              <Text style={styles.coachAvatarText}>{community.coachInitials}</Text>
            </View>
            <View>
              <Text style={styles.coachRole}>المدرب</Text>
              <Text style={styles.coachName}>{community.coachName}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{community.name}</Text>
          <Text style={styles.heroDesc}>{community.description}</Text>
          <View style={styles.heroStats}>
            <Text style={styles.heroStat}>👥 {community.membersCount.toLocaleString()}</Text>
            <Text style={styles.heroStat}>💬 {community.postsCount.toLocaleString()}</Text>
            {!community.isFree && <Text style={styles.heroStat}>💳 {community.priceMonthly} ر.س/شهر</Text>}
          </View>
        </LinearGradient>

        {!joined ? (
          <Pressable onPress={() => setJoined(true)}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.joinBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.joinBtnText}>
                {community.isFree ? '✓ انضم مجاناً' : `انضم مقابل ${community.priceMonthly} ر.س/شهر`}
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.joinedBar}>
            <Text style={styles.joinedBarText}>✓ أنت عضو في هذا المجتمع</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>المنشورات</Text>

        {posts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>لا يوجد منشورات بعد. كن أول من ينشر!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likes[post.id] ?? false}
              onLike={() => toggleLike(post.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({
  post,
  isLiked,
  onLike
}: {
  post: CommunityPost;
  isLiked: boolean;
  onLike: () => void;
}) {
  return (
    <View style={postStyles.card}>
      <View style={postStyles.headerRow}>
        <View style={postStyles.meta}>
          <Text style={postStyles.time}>{post.timeLabel}</Text>
          {post.isCoach && (
            <View style={postStyles.coachBadge}>
              <Text style={postStyles.coachBadgeText}>مدرب</Text>
            </View>
          )}
        </View>
        <View style={postStyles.authorRow}>
          <View style={[postStyles.avatar, { backgroundColor: post.authorColor + '22', borderColor: post.authorColor }]}>
            <Text style={[postStyles.avatarText, { color: post.authorColor }]}>{post.authorInitials}</Text>
          </View>
          <Text style={postStyles.authorName}>{post.authorName}</Text>
        </View>
      </View>

      <Text style={postStyles.text}>{post.text}</Text>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={postStyles.image} />
      )}

      <View style={postStyles.actionsRow}>
        <Pressable style={postStyles.action}>
          <Text style={postStyles.actionText}>💬 {post.commentsCount}</Text>
        </Pressable>
        <Pressable style={postStyles.action} onPress={onLike}>
          <Text style={postStyles.actionText}>
            {isLiked ? '❤️' : '🤍'} {post.likesCount + (isLiked && !post.isLiked ? 1 : 0)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const postStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  authorRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '800', fontSize: 13 },
  authorName: { fontWeight: '700', color: colors.text, fontSize: 14 },
  meta: { alignItems: 'flex-start', gap: 4 },
  time: { color: colors.muted, fontSize: 11 },
  coachBadge: { backgroundColor: colors.primary + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  coachBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  text: { color: colors.text, textAlign: 'right', lineHeight: 22, marginBottom: spacing.sm },
  image: { width: '100%', height: 180, borderRadius: 14, marginBottom: spacing.sm },
  actionsRow: { flexDirection: 'row-reverse', gap: spacing.md },
  action: { paddingVertical: 4 },
  actionText: { color: colors.muted, fontSize: 14 }
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 100 },
  backBtn: { alignItems: 'flex-end', marginBottom: spacing.sm },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  hero: { borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md },
  heroCoachRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  coachAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  coachAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  coachRole: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  coachName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroName: { color: '#fff', fontWeight: '800', fontSize: 22, textAlign: 'right', marginBottom: spacing.xs },
  heroDesc: { color: 'rgba(255,255,255,0.85)', textAlign: 'right', fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
  heroStats: { flexDirection: 'row-reverse', gap: spacing.md },
  heroStat: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  joinBtn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: spacing.md },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  joinedBar: {
    backgroundColor: colors.success + '22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  joinedBarText: { color: colors.success, fontWeight: '700' },
  sectionTitle: { textAlign: 'right', fontWeight: '800', fontSize: 18, color: colors.text, marginBottom: spacing.sm },
  emptyPosts: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyPostsText: { color: colors.muted }
});
