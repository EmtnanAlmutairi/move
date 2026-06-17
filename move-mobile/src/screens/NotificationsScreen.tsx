import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

type NotifType = 'workout' | 'message' | 'achievement' | 'streak' | 'community' | 'tip';

type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  actionLabel?: string;
  xp?: number;
};

const MOCK: Notif[] = [
  {
    id: 'n1', type: 'workout', isRead: false,
    title: 'حان وقت تمرينك! 💪',
    body: 'تمرين الصدر والترايسبس ينتظرك — 60 دقيقة مع كابتن خالد',
    time: 'منذ 5 دقائق',
    actionLabel: 'ابدأ الآن',
  },
  {
    id: 'n2', type: 'message', isRead: false,
    title: 'رسالة جديدة من سارة منير',
    body: 'راجعت خطة تغذيتك هذا الأسبوع — نسبة البروتين ممتازة!',
    time: 'منذ 18 دقيقة',
    actionLabel: 'رد',
  },
  {
    id: 'n3', type: 'achievement', isRead: false,
    title: 'إنجاز جديد مفتوح! 🏆',
    body: 'حققت "أسبوع كامل" — أكملت 7 أيام متواصلة من التمارين',
    time: 'منذ 1 ساعة',
    xp: 200,
  },
  {
    id: 'n4', type: 'streak', isRead: true,
    title: 'سلسلة 6 أيام 🔥',
    body: 'رائع! 6 أيام متواصلة. غداً ستكمل أسبوعاً كاملاً',
    time: 'منذ 3 ساعات',
    xp: 30,
  },
  {
    id: 'n5', type: 'community', isRead: true,
    title: 'نشاط في مجتمعك',
    body: 'كابتن خالد نشر تمرين جديد في "تحدي بناء العضلات 90 يوم"',
    time: 'منذ 4 ساعات',
    actionLabel: 'عرض',
  },
  {
    id: 'n6', type: 'message', isRead: true,
    title: 'رسالة من د. يثنى الحربي',
    body: 'كيف حال أسفل الظهر اليوم؟ تذكر تمارين الإطالة صباحاً',
    time: 'أمس',
  },
  {
    id: 'n7', type: 'tip', isRead: true,
    title: 'نصيحة اليوم 💡',
    body: 'شرب 500 مل ماء قبل التمرين بـ 30 دقيقة يحسّن الأداء بنسبة 20%',
    time: 'أمس',
  },
  {
    id: 'n8', type: 'workout', isRead: true,
    title: 'مراجعة التمرين الأمس',
    body: 'أتممت تمرين الظهر والبايسبس — ممتاز! حرقت 480 سعرة',
    time: 'أمس',
    xp: 80,
  },
];

const TYPE_META: Record<NotifType, { icon: string; lib: 'ion' | 'mci'; color: string }> = {
  workout:     { icon: 'flash',           lib: 'ion', color: '#FF4500' },
  message:     { icon: 'chatbubble',      lib: 'ion', color: '#1A9ECC' },
  achievement: { icon: 'trophy',          lib: 'ion', color: '#B5FF45' },
  streak:      { icon: 'flame',           lib: 'ion', color: '#EF4444' },
  community:   { icon: 'people',          lib: 'ion', color: '#7C5CBF' },
  tip:         { icon: 'bulb',            lib: 'ion', color: '#F59E0B' },
};

function NotifIcon({ type }: { type: NotifType }) {
  const meta = TYPE_META[type];
  const s = 20;
  if (meta.lib === 'mci') return <MaterialCommunityIcons name={meta.icon as any} size={s} color={meta.color} />;
  return <Ionicons name={meta.icon as any} size={s} color={meta.color} />;
}

export function NotificationsScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [notifs, setNotifs] = useState(MOCK);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[st.header, { borderBottomColor: t.line }]}>
        <Pressable
          style={[st.markAllBtn, { backgroundColor: t.cardSoft }]}
          onPress={markAllRead}
        >
          <Ionicons name="checkmark-done-outline" size={15} color={t.primary} />
          <Text style={[st.markAllTxt, { color: t.primary }]}>قراءة الكل</Text>
        </Pressable>
        <View style={st.titleWrap}>
          {unreadCount > 0 && (
            <View style={[st.unreadBadge, { backgroundColor: t.primary }]}>
              <Text style={st.unreadBadgeTxt}>{unreadCount}</Text>
            </View>
          )}
          <Text style={[st.title, { color: t.text }]}>الإشعارات</Text>
        </View>
        <Pressable
          style={[st.backBtn, { backgroundColor: t.cardSoft }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* Unread section */}
        {unreadCount > 0 && (
          <Text style={[st.sectionLabel, { color: t.muted }]}>جديد</Text>
        )}

        {notifs.map((n, i) => {
          const meta = TYPE_META[n.type];
          const isFirst = i === 0 || (notifs[i - 1].isRead !== n.isRead);
          if (n.isRead && notifs[i - 1] && !notifs[i - 1].isRead) {
            // Insert "earlier" label
          }
          return (
            <React.Fragment key={n.id}>
              {n.isRead && i > 0 && !notifs[i - 1].isRead && (
                <Text style={[st.sectionLabel, { color: t.muted, marginTop: spacing.md }]}>سابقاً</Text>
              )}
              <Pressable onPress={() => markRead(n.id)}>
                <View
                  style={[
                    st.card,
                    { backgroundColor: n.isRead ? t.card : t.card, borderColor: n.isRead ? t.line : meta.color + '30' },
                    !n.isRead && { backgroundColor: meta.color + '08' },
                    cardShadow,
                  ]}
                >
                  {/* Unread accent */}
                  {!n.isRead && (
                    <View style={[st.unreadAccent, { backgroundColor: meta.color }]} />
                  )}

                  <View style={st.cardInner}>
                    {/* Icon */}
                    <View style={[st.iconCircle, { backgroundColor: meta.color + '18' }]}>
                      <NotifIcon type={n.type} />
                    </View>

                    {/* Content */}
                    <View style={st.content}>
                      <View style={st.contentTop}>
                        <Text style={[st.time, { color: t.muted }]}>{n.time}</Text>
                        {n.xp && (
                          <LinearGradient
                            colors={['#B5FF45', '#FF7A18']}
                            style={st.xpBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <Text style={st.xpTxt}>+{n.xp} XP</Text>
                          </LinearGradient>
                        )}
                      </View>
                      <Text style={[st.notifTitle, { color: t.text }]}>{n.title}</Text>
                      <Text style={[st.notifBody, { color: t.muted }]} numberOfLines={2}>{n.body}</Text>
                      {n.actionLabel && (
                        <View style={[st.actionPill, { backgroundColor: meta.color + '18', borderColor: meta.color + '40' }]}>
                          <Text style={[st.actionTxt, { color: meta.color }]}>{n.actionLabel}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            </React.Fragment>
          );
        })}

        {/* Empty state */}
        {notifs.length === 0 && (
          <View style={st.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={t.muted} />
            <Text style={[st.emptyTxt, { color: t.muted }]}>لا توجد إشعارات</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'right' },
  unreadBadge: { borderRadius: 99, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  markAllTxt: { fontSize: 12, fontWeight: '700' },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'right',
    marginBottom: spacing.xs, marginTop: spacing.xs,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  unreadAccent: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },
  cardInner: { flexDirection: 'row-reverse', gap: spacing.sm, padding: spacing.sm },

  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  content: { flex: 1, alignItems: 'flex-end' },
  contentTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 4 },
  time: { fontSize: 11 },

  xpBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  xpTxt: { color: '#111', fontSize: 10, fontWeight: '900' },

  notifTitle: { fontWeight: '800', fontSize: 14, textAlign: 'right', marginBottom: 3 },
  notifBody: { fontSize: 13, textAlign: 'right', lineHeight: 18 },

  actionPill: { marginTop: 8, borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-end' },
  actionTxt: { fontSize: 12, fontWeight: '800' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: spacing.md },
  emptyTxt: { fontSize: 15, fontWeight: '600' },
});
