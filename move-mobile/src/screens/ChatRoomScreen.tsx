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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatMessages, chats } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';
import { ChatMessage } from '../types';

const ROLE_LABEL: Record<string, string> = {
  coach: 'مدرب بدني',
  nutritionist: 'أخصائية تغذية',
  physio: 'معالج طبيعي',
  team: 'فريق متكامل'
};

export function ChatRoomScreen({ route, navigation }: any) {
  const { threadId } = route.params;
  const thread = chats.find((c) => c.id === threadId)!;
  const initialMessages = chatMessages[threadId] || [];
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderName: 'أنا',
      isMe: true,
      text: text.trim(),
      timeLabel: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgRow, item.isMe ? styles.msgRowMe : styles.msgRowOther]}>
      {!item.isMe && (
        <View style={[styles.msgAvatar, { backgroundColor: thread.avatarColor + '33', borderColor: thread.avatarColor }]}>
          <Text style={[styles.msgAvatarText, { color: thread.avatarColor }]}>
            {item.senderName.slice(0, 1)}
          </Text>
        </View>
      )}
      <View style={styles.msgBubbleWrap}>
        {!item.isMe && (
          <Text style={styles.msgSender}>{item.senderName}</Text>
        )}
        <View style={[styles.bubble, item.isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, item.isMe && styles.bubbleTextMe]}>{item.text}</Text>
        </View>
        <Text style={[styles.msgTime, item.isMe && styles.msgTimeMe]}>{item.timeLabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>→</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{thread.name}</Text>
          <Text style={styles.headerRole}>{ROLE_LABEL[thread.role]}</Text>
        </View>
        <View style={[styles.headerAvatar, { backgroundColor: thread.avatarColor + '22', borderColor: thread.avatarColor }]}>
          <Text style={[styles.headerAvatarText, { color: thread.avatarColor }]}>
            {thread.name.slice(0, 1)}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>لا توجد رسائل بعد. ابدأ المحادثة!</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.chatDateSep}>
              <Text style={styles.chatDateText}>اليوم</Text>
            </View>
          }
        />

        <View style={styles.inputBar}>
          <Pressable onPress={send} disabled={!text.trim()}>
            <LinearGradient
              colors={text.trim() ? [colors.gradientStart, colors.gradientEnd] : ['#ddd', '#ccc']}
              style={styles.sendBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </Pressable>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={colors.muted}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.sm
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSoft,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backText: { fontSize: 18, color: colors.primary },
  headerInfo: { flex: 1, alignItems: 'flex-end' },
  headerName: { fontWeight: '800', fontSize: 16, color: colors.text },
  headerRole: { color: colors.muted, fontSize: 12, marginTop: 2 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerAvatarText: { fontWeight: '800', fontSize: 16 },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl
  },
  chatDateSep: {
    alignItems: 'center',
    marginBottom: spacing.md
  },
  chatDateText: {
    backgroundColor: colors.line,
    color: colors.muted,
    fontSize: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 99
  },
  msgRow: {
    flexDirection: 'row-reverse',
    marginBottom: spacing.sm,
    gap: 8,
    alignItems: 'flex-end'
  },
  msgRowMe: { justifyContent: 'flex-start' },
  msgRowOther: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  msgAvatarText: { fontSize: 13, fontWeight: '800' },
  msgBubbleWrap: { maxWidth: '72%' },
  msgSender: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 11,
    marginBottom: 3,
    fontWeight: '600'
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  bubbleOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 4
  },
  bubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right'
  },
  bubbleTextMe: { color: '#fff' },
  msgTime: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'right'
  },
  msgTimeMe: { textAlign: 'left' },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.muted },
  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: spacing.sm
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '800' }
});
