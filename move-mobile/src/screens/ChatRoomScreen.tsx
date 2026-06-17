import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatMessages, chats } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { ChatMessage } from '../types';

const ROLE_LABEL: Record<string, string> = {
  coach:        'مدرب بدني',
  nutritionist: 'أخصائية تغذية',
  physio:       'معالج طبيعي',
  team:         'فريق متكامل',
};

export function ChatRoomScreen({ route, navigation }: any) {
  const { theme: t } = useTheme();
  const { threadId } = route.params;
  const thread = chats.find((c) => c.id === threadId)!;
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages[threadId] || []);
  const [text, setText]         = useState('');
  const listRef                  = useRef<FlatList>(null);

  const send = () => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderName: 'أنا',
      isMe:       true,
      text:       text.trim(),
      timeLabel:  new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type:       'text',
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[st.msgRow, item.isMe ? st.msgRowMe : st.msgRowOther]}>
      {!item.isMe && (
        <View style={[st.msgAvt, { backgroundColor: thread.avatarColor + '22', borderColor: thread.avatarColor + '55' }]}>
          <Text style={[st.msgAvtTxt, { color: thread.avatarColor }]}>
            {item.senderName.slice(0, 1)}
          </Text>
        </View>
      )}
      <View style={st.bubbleWrap}>
        {!item.isMe && (
          <Text style={[st.msgSender, { color: t.muted }]}>{item.senderName}</Text>
        )}
        {item.isMe ? (
          <LinearGradient
            colors={[t.gradientStart, t.gradientEnd]}
            style={[st.bubble, st.bubbleMe]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Text style={[st.bubbleTxt, { color: '#fff' }]}>{item.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[st.bubble, st.bubbleOther, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
            <Text style={[st.bubbleTxt, { color: t.text }]}>{item.text}</Text>
          </View>
        )}
        <Text style={[st.msgTime, { color: t.muted }, item.isMe && st.msgTimeMe]}>{item.timeLabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]} edges={['top']}>

      {/* ── HEADER ────────────────────────────── */}
      <View style={[st.header, { backgroundColor: t.card, borderBottomColor: t.line }]}>
        <Pressable
          style={[st.backBtn, { backgroundColor: t.cardSoft }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>
        <View style={st.headerInfo}>
          <Text style={[st.headerName, { color: t.text }]}>{thread.name}</Text>
          <View style={st.statusRow}>
            <View style={[st.onlineDot, { backgroundColor: t.success }]} />
            <Text style={[st.headerRole, { color: t.muted }]}>{ROLE_LABEL[thread.role]}</Text>
          </View>
        </View>
        <View style={[st.headerAvt, { backgroundColor: thread.avatarColor + '18', borderColor: thread.avatarColor + '55' }]}>
          <Text style={[st.headerAvtTxt, { color: thread.avatarColor }]}>
            {thread.name.slice(0, 1)}
          </Text>
          <View style={[st.avOnlineDot, { backgroundColor: t.success, borderColor: t.card }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={st.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={st.msgList}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Text style={[st.emptyTxt, { color: t.muted }]}>لا توجد رسائل بعد. ابدأ المحادثة!</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={st.dateSep}>
              <Text style={[st.dateTxt, { backgroundColor: t.line, color: t.muted }]}>اليوم</Text>
            </View>
          }
        />

        {/* ── INPUT BAR ─────────────────────────── */}
        <View style={[st.inputBar, { backgroundColor: t.card, borderTopColor: t.line }]}>
          <Pressable onPress={send} disabled={!text.trim()}>
            <LinearGradient
              colors={text.trim() ? [t.gradientStart, t.gradientEnd] : [t.cardSoft, t.cardSoft]}
              style={st.sendBtn}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Ionicons name="arrow-up" size={20} color={text.trim() ? '#fff' : t.muted} />
            </LinearGradient>
          </Pressable>
          <TextInput
            style={[st.input, { backgroundColor: t.background, borderColor: t.line, color: t.text }]}
            value={text}
            onChangeText={setText}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={t.muted}
            multiline
            maxLength={500}
            textAlign="right"
            onSubmitEditing={send}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:  { flex: 1 },
  flex:  { flex: 1 },

  header:     { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, gap: spacing.sm },
  backBtn:    { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, alignItems: 'flex-end' },
  headerName: { fontWeight: '800', fontSize: 16 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:  { width: 7, height: 7, borderRadius: 4 },
  headerRole: { fontSize: 12 },
  headerAvt:  { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  headerAvtTxt:{ fontWeight: '800', fontSize: 16 },
  avOnlineDot: { position: 'absolute', bottom: 0, left: 0, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },

  msgList: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  dateSep: { alignItems: 'center', marginBottom: spacing.md },
  dateTxt: { fontSize: 12, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 99 },

  msgRow:      { flexDirection: 'row-reverse', marginBottom: spacing.sm, gap: 8, alignItems: 'flex-end' },
  msgRowMe:    { justifyContent: 'flex-start' },
  msgRowOther: { justifyContent: 'flex-end' },
  msgAvt:      { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  msgAvtTxt:   { fontSize: 13, fontWeight: '800' },
  bubbleWrap:  { maxWidth: '72%' },
  msgSender:   { textAlign: 'right', fontSize: 11, marginBottom: 3, fontWeight: '600' },
  bubble:      { borderRadius: 18, paddingHorizontal: spacing.md, paddingVertical: 10 },
  bubbleMe:    { borderBottomRightRadius: 4 },
  bubbleOther: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleTxt:   { fontSize: 15, lineHeight: 22, textAlign: 'right' },
  msgTime:     { fontSize: 10, marginTop: 3, textAlign: 'right' },
  msgTimeMe:   { textAlign: 'left' },
  emptyWrap:   { alignItems: 'center', paddingTop: 60 },
  emptyTxt:    {},

  inputBar: { flexDirection: 'row-reverse', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: 24, borderTopWidth: 1, gap: spacing.sm },
  input:    { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn:  { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
