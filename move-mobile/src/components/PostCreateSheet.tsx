import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const COMMUNITIES = [
  { id: 'all', label: 'عام' },
  { id: 'c1',  label: 'ركاب الفجر' },
  { id: 'c2',  label: 'فريق الحديد' },
  { id: 'c3',  label: 'تحدي رمضان' },
];

interface PostCreateSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PostCreateSheet({ visible, onClose }: PostCreateSheetProps) {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [hasPhoto, setHasPhoto] = useState(false);

  const canPost = text.trim().length > 0;

  const handleClose = () => {
    setText('');
    setSelectedCommunity('all');
    setHasPhoto(false);
    onClose();
  };

  const handlePost = () => {
    if (!canPost) return;
    handleClose();
    Alert.alert('تم النشر!', 'ظهر منشورك في المجتمع.');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={st.backdrop} onPress={handleClose} />

      <View style={[st.sheet, { backgroundColor: t.background, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Drag handle */}
        <View style={[st.handle, { backgroundColor: t.line }]} />

        {/* Header row */}
        <View style={st.headerRow}>
          <Pressable onPress={handleClose} style={[st.cancelBtn, { backgroundColor: t.cardSoft }]}>
            <Text style={[st.cancelTxt, { color: t.muted }]}>إلغاء</Text>
          </Pressable>

          <Text style={[st.title, { color: t.text }]}>منشور جديد</Text>

          <Pressable onPress={handlePost} disabled={!canPost}>
            <LinearGradient
              colors={canPost ? [t.gradientStart, t.gradientEnd] : ['#ccc', '#aaa']}
              style={st.postBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={st.postBtnTxt}>نشر</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[st.input, { color: t.text }]}
          placeholder="شارك فكرة، نصيحة، أو إنجاز..."
          placeholderTextColor={t.muted}
          multiline
          autoFocus
          value={text}
          onChangeText={setText}
          textAlign="right"
          maxLength={500}
        />

        {/* Photo placeholder pill */}
        {hasPhoto && (
          <View style={[st.photoPill, { backgroundColor: t.cardSoft }]}>
            <Ionicons name="image" size={16} color={t.primary} />
            <Text style={[st.photoPillTxt, { color: t.text }]}>صورة مرفقة</Text>
            <Pressable onPress={() => setHasPhoto(false)}>
              <Ionicons name="close-circle" size={18} color={t.muted} />
            </Pressable>
          </View>
        )}

        {/* Community selector */}
        <Text style={[st.communityLabel, { color: t.muted }]}>انشر في</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.communityRow}>
          {COMMUNITIES.map((c) => {
            const active = selectedCommunity === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCommunity(c.id)}
                style={[
                  st.chip,
                  { borderColor: active ? t.primary : t.line, backgroundColor: active ? t.primary + '18' : t.card },
                ]}
              >
                <Text style={[st.chipTxt, { color: active ? t.primary : t.muted }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bottom toolbar */}
        <View style={[st.toolbar, { borderTopColor: t.line }]}>
          <Pressable style={st.toolBtn} onPress={() => setHasPhoto(true)}>
            <Ionicons name="image-outline" size={24} color={t.muted} />
            <Text style={[st.toolTxt, { color: t.muted }]}>صورة</Text>
          </Pressable>

          <Pressable style={st.toolBtn}>
            <Ionicons name="happy-outline" size={24} color={t.muted} />
            <Text style={[st.toolTxt, { color: t.muted }]}>إيموجي</Text>
          </Pressable>

          <Text style={[st.charCount, { color: text.length > 450 ? '#F44' : t.muted }]}>
            {text.length}/500
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: spacing.md,
  },

  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cancelBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  cancelTxt: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '900' },
  postBtn: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  postBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  input: {
    minHeight: 110,
    fontSize: 17,
    lineHeight: 26,
    textAlignVertical: 'top',
    paddingTop: 4,
    marginBottom: spacing.md,
  },

  photoPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  photoPillTxt: { fontSize: 13, fontWeight: '600' },

  communityLabel: { fontSize: 12, fontWeight: '700', textAlign: 'right', marginBottom: 8 },
  communityRow: { marginBottom: spacing.md },
  chip: {
    borderRadius: 20, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 6,
    marginLeft: 8,
  },
  chipTxt: { fontSize: 13, fontWeight: '700' },

  toolbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  toolBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  toolTxt: { fontSize: 13, fontWeight: '600' },
  charCount: { marginRight: 'auto', fontSize: 12, fontWeight: '600' },
});
