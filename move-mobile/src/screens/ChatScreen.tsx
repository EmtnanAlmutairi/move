import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chats } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const ROLE_LABEL: Record<string, string> = {
  coach:        'مدرب بدني',
  nutritionist: 'أخصائية تغذية',
  physio:       'مستشار أداء',
  team:         'فريقك الرياضي',
};

export function ChatScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.25 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <View style={st.header}>
          <Pressable
            style={[st.iconBtn, { backgroundColor: t.card }, cardShadow]}
            onPress={() => navigation.navigate('TeamSelection')}
          >
            <Ionicons name="people-outline" size={19} color={t.text} />
          </Pressable>
          <Text style={[st.title, { color: t.text }]}>الرسائل</Text>
        </View>

        {chats.map((chat) => (
          <Pressable
            key={chat.id}
            style={[
              st.card,
              {
                backgroundColor: t.card,
                borderColor: chat.unreadCount > 0 ? t.primary : t.line,
                borderWidth: chat.unreadCount > 0 ? 2 : 1,
              },
              cardShadow,
            ]}
            onPress={() => navigation.navigate('ChatRoom', { threadId: chat.id })}
          >
            <View style={st.row}>
              <View style={st.rightCol}>
                {chat.unreadCount > 0 && (
                  <View style={[st.unreadBadge, { backgroundColor: t.primary }]}>
                    <Text style={st.unreadTxt}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={[st.timeLabel, { color: t.muted }]}>{chat.timeLabel}</Text>
              </View>
              <View style={st.info}>
                <Text style={[st.chatName, { color: t.text }]}>{chat.name}</Text>
                <Text style={[st.roleLabel, { color: t.primary }]}>{ROLE_LABEL[chat.role]}</Text>
                <Text style={[st.lastMsg, { color: t.muted }]} numberOfLines={1}>{chat.lastMessage}</Text>
              </View>
              <View style={[st.avatar, { backgroundColor: chat.avatarColor + '18', borderColor: chat.avatarColor + '55' }]}>
                <Text style={[st.avatarTxt, { color: chat.avatarColor }]}>
                  {chat.name.slice(0, 1)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={[st.teamBtn, { backgroundColor: t.cardSoft, borderColor: t.line }]}
          onPress={() => navigation.navigate('TeamSelection')}
        >
          <Ionicons name="people-outline" size={20} color={t.text} />
          <Text style={[st.teamBtnTxt, { color: t.text }]}>تغيير فريقك الرياضي</Text>
          <Ionicons name="chevron-back" size={18} color={t.primary} />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:    { flex: 1 },
  scroll:  { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },
  header:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.lg },
  title:   { textAlign: 'right', fontSize: 32, fontWeight: '900', lineHeight: 36 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  card:      { borderRadius: 18, padding: spacing.md, marginBottom: spacing.sm },
  row:       { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  avatar:    { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTxt: { fontWeight: '800', fontSize: 18 },
  info:      { flex: 1, alignItems: 'flex-end' },
  chatName:  { fontWeight: '800', fontSize: 17 },
  roleLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  lastMsg:   { fontSize: 13, marginTop: 4, textAlign: 'right' },
  rightCol:  { alignItems: 'center', gap: 6 },
  unreadBadge:{ borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  timeLabel: { fontSize: 11 },

  teamBtn:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 16, borderWidth: 1, padding: spacing.md, marginTop: spacing.sm },
  teamBtnTxt:  { flex: 1, textAlign: 'right', fontWeight: '700' },
  teamBtnArrow:{ fontWeight: '700' },
});
