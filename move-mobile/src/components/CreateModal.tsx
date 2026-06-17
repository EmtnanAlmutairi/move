import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const OPTIONS = [
  {
    id: 'activity',
    icon: 'flash',
    lib: 'I',
    label: 'سجّل نشاطاً',
    sub: 'جري · تمرين · دراجة',
    colors: ['#FF4500', '#FF9A00'] as [string, string],
    route: 'Workout',
  },
  {
    id: 'photo',
    icon: 'camera',
    lib: 'I',
    label: 'ارفع صورة',
    sub: 'شارك لحظة رياضية',
    colors: ['#8E5CF5', '#5E81F4'] as [string, string],
    route: null,
  },
  {
    id: 'achievement',
    icon: 'trophy',
    lib: 'I',
    label: 'شارك إنجازاً',
    sub: 'رقم قياسي · وصلت لهدف',
    colors: ['#FFD700', '#FF7A18'] as [string, string],
    route: null,
  },
  {
    id: 'post',
    icon: 'create',
    lib: 'I',
    label: 'انشر تدوينة',
    sub: 'نصيحة · تحفيز · تجربة',
    colors: ['#30B36A', '#1A9ECC'] as [string, string],
    route: null,
  },
] as const;

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export function CreateModal({ visible, onClose, navigation }: CreateModalProps) {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();

  const handle = (route: string | null) => {
    onClose();
    if (route) setTimeout(() => navigation.navigate(route), 120);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={st.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={[st.sheet, { backgroundColor: t.background, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Drag handle */}
        <View style={[st.handle, { backgroundColor: t.line }]} />

        {/* Header */}
        <View style={st.header}>
          <Pressable style={[st.closeBtn, { backgroundColor: t.cardSoft }]} onPress={onClose}>
            <Ionicons name="close" size={18} color={t.muted} />
          </Pressable>
          <Text style={[st.title, { color: t.text }]}>ماذا تريد أن تشارك؟</Text>
        </View>

        {/* Options */}
        <View style={st.options}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [st.row, { backgroundColor: t.card, borderColor: t.line }, pressed && { opacity: 0.82 }]}
              onPress={() => handle(opt.route)}
            >
              <Ionicons name="chevron-back" size={16} color={t.line} />
              <View style={st.rowBody}>
                <Text style={[st.rowLabel, { color: t.text }]}>{opt.label}</Text>
                <Text style={[st.rowSub, { color: t.muted }]}>{opt.sub}</Text>
              </View>
              <LinearGradient colors={opt.colors} style={st.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={opt.icon as any} size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  header: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: spacing.lg },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'right' },

  options: { gap: spacing.xs },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  iconCircle: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowBody: { flex: 1, alignItems: 'flex-end' },
  rowLabel: { fontSize: 16, fontWeight: '800' },
  rowSub: { fontSize: 12, marginTop: 2 },
});
