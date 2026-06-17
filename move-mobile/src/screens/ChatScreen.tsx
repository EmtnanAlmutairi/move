import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chats } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';

const ROLE_LABEL: Record<string, string> = {
  coach: 'مدرب بدني',
  nutritionist: 'أخصائية تغذية',
  physio: 'معالج طبيعي',
  team: 'فريق صحي متكامل'
};

export function ChatScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>الرسائل</Text>
        <Text style={styles.subtitle}>فريقك الصحي الشخصي</Text>

        {chats.map((chat) => (
          <Pressable
            key={chat.id}
            style={[styles.card, chat.unreadCount > 0 && styles.cardUnread]}
            onPress={() => navigation.navigate('ChatRoom', { threadId: chat.id })}
          >
            <View style={styles.row}>
              <View style={styles.rightCol}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={styles.timeLabel}>{chat.timeLabel}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.roleLabel}>{ROLE_LABEL[chat.role]}</Text>
                <Text style={styles.lastMsg} numberOfLines={1}>{chat.lastMessage}</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: chat.avatarColor + '22', borderColor: chat.avatarColor }]}>
                <Text style={[styles.avatarText, { color: chat.avatarColor }]}>
                  {chat.name.slice(0, 1)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={styles.teamBtn}
          onPress={() => navigation.navigate('TeamSelection')}
        >
          <Text style={styles.teamBtnIcon}>👥</Text>
          <Text style={styles.teamBtnText}>تغيير فريقك الصحي</Text>
          <Text style={styles.teamBtnArrow}>←</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  title: { textAlign: 'right', fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 2 },
  subtitle: { textAlign: 'right', color: colors.muted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  cardUnread: { borderColor: colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  avatarText: { fontWeight: '800', fontSize: 18 },
  info: { flex: 1, alignItems: 'flex-end' },
  chatName: { fontWeight: '800', fontSize: 17, color: colors.text },
  roleLabel: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  lastMsg: { color: colors.muted, fontSize: 13, marginTop: 4, textAlign: 'right' },
  rightCol: { alignItems: 'center', gap: 6 },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  timeLabel: { color: colors.muted, fontSize: 11 },
  teamBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginTop: spacing.sm
  },
  teamBtnIcon: { fontSize: 20 },
  teamBtnText: { flex: 1, textAlign: 'right', fontWeight: '700', color: colors.text },
  teamBtnArrow: { color: colors.primary, fontWeight: '700' }
});
