import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userProfile } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { UserGoal } from '../types';

const GOALS: { id: UserGoal; label: string; emoji: string }[] = [
  { id: 'muscle-gain', label: 'بناء العضلات', emoji: '💪' },
  { id: 'weight-loss', label: 'خسارة الوزن',  emoji: '🔥' },
  { id: 'fitness',     label: 'اللياقة العامة', emoji: '⚡' },
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  t,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  t: any;
}) {
  return (
    <View style={field.wrap}>
      <Text style={[field.label, { color: t.muted }]}>{label}</Text>
      <TextInput
        style={[field.input, { backgroundColor: t.cardSoft, color: t.text, borderColor: t.line }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        textAlign="right"
      />
    </View>
  );
}
const field = StyleSheet.create({
  wrap:  { marginBottom: spacing.sm },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'right', marginBottom: 6 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16 },
});

type State = 'idle' | 'saving' | 'saved';

export function EditProfileScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const [name,       setName]       = useState(userProfile.name);
  const [email,      setEmail]      = useState(userProfile.email);
  const [goal,       setGoal]       = useState<UserGoal>(userProfile.goal);
  const [height,     setHeight]     = useState(String(userProfile.height));
  const [weight,     setWeight]     = useState(String(userProfile.currentWeight));
  const [targetWt,   setTargetWt]   = useState(String(userProfile.targetWeight));
  const [age,        setAge]        = useState(String(userProfile.age));
  const [state,      setState]      = useState<State>('idle');

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('تنبيه', 'الاسم مطلوب'); return; }
    setState('saving');
    setTimeout(() => { setState('saved'); setTimeout(() => setState('idle'), 1500); }, 800);
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={[st.header, { borderBottomColor: t.line }]}>
          <Pressable
            style={({ pressed }) => [st.saveBtn, pressed && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={state === 'saving'}
          >
            {state === 'saved' ? (
              <LinearGradient colors={['#16A34A', '#22C55E']} style={st.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={st.saveBtnTxt}>تم الحفظ</Text>
              </LinearGradient>
            ) : (
              <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.saveBtnGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
                <Text style={st.saveBtnTxt}>{state === 'saving' ? 'جاري...' : 'حفظ'}</Text>
              </LinearGradient>
            )}
          </Pressable>
          <Text style={[st.title, { color: t.text }]}>تعديل الملف</Text>
          <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar section */}
          <View style={st.avatarSection}>
            <Pressable style={st.avatarEdit}>
              <Ionicons name="camera-outline" size={18} color="#fff" />
            </Pressable>
            <LinearGradient colors={[t.gradientStart, '#FF6800', t.gradientEnd]} style={st.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={st.avatarTxt}>{userProfile.avatarInitials}</Text>
            </LinearGradient>
          </View>

          {/* Personal info */}
          <Text style={[st.section, { color: t.muted }]}>المعلومات الشخصية</Text>
          <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
            <Field label="الاسم"             value={name}   onChangeText={setName}   placeholder="اسمك الكامل"        t={t} />
            <Field label="البريد الإلكتروني" value={email}  onChangeText={setEmail}  placeholder="example@mail.com"   t={t} keyboardType="email-address" />
            <Field label="العمر"              value={age}    onChangeText={setAge}    placeholder="العمر بالسنوات"     t={t} keyboardType="number-pad" />
          </View>

          {/* Body metrics */}
          <Text style={[st.section, { color: t.muted }]}>القياسات الجسمانية</Text>
          <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
            <View style={st.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="الطول (سم)"        value={height}   onChangeText={setHeight}   placeholder="170"  t={t} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="الوزن الحالي (كغ)"  value={weight}   onChangeText={setWeight}   placeholder="80"   t={t} keyboardType="decimal-pad" />
              </View>
            </View>
            <Field label="الوزن المستهدف (كغ)" value={targetWt} onChangeText={setTargetWt} placeholder="75" t={t} keyboardType="decimal-pad" />
          </View>

          {/* Goal */}
          <Text style={[st.section, { color: t.muted }]}>الهدف الرياضي</Text>
          <View style={st.goalRow}>
            {GOALS.map((g) => {
              const active = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  style={[
                    st.goalCard,
                    { backgroundColor: active ? t.primary + '14' : t.cardSoft, borderColor: active ? t.primary : t.line },
                  ]}
                  onPress={() => setGoal(g.id)}
                >
                  <Text style={st.goalEmoji}>{g.emoji}</Text>
                  <Text style={[st.goalLabel, { color: active ? t.primary : t.muted }]}>{g.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={t.primary} style={{ marginTop: 2 }} />}
                </Pressable>
              );
            })}
          </View>

          {/* Danger zone */}
          <Text style={[st.section, { color: t.muted }]}>منطقة خطر</Text>
          <Pressable
            style={[st.dangerBtn, { backgroundColor: t.card, borderColor: '#EF4444' + '40' }]}
            onPress={() => Alert.alert('حذف الحساب', 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.', [
              { text: 'إلغاء', style: 'cancel' },
              { text: 'حذف', style: 'destructive' },
            ])}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={st.dangerTxt}>حذف الحساب</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title:       { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'right' },
  saveBtn:     { overflow: 'hidden', borderRadius: 99 },
  saveBtnGrad: { paddingHorizontal: 18, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  saveBtnTxt:  { color: '#fff', fontSize: 13, fontWeight: '800' },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 60 },

  avatarSection: { alignItems: 'center', marginBottom: spacing.xl, position: 'relative' },
  avatar:        { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { color: '#fff', fontSize: 32, fontWeight: '900' },
  avatarEdit:    {
    position: 'absolute', bottom: 0, right: '35%',
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#111', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', zIndex: 1,
  },

  section: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'right',
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  card:   { borderRadius: 18, borderWidth: 1, padding: spacing.md, gap: 2 },
  twoCol: { flexDirection: 'row-reverse', gap: spacing.sm },

  goalRow:  { flexDirection: 'row-reverse', gap: spacing.xs },
  goalCard: { flex: 1, borderWidth: 1.5, borderRadius: 16, paddingVertical: spacing.sm, alignItems: 'center', gap: 4 },
  goalEmoji:{ fontSize: 22 },
  goalLabel:{ fontSize: 11, fontWeight: '700', textAlign: 'center' },

  dangerBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 16, borderWidth: 1, padding: spacing.md, marginTop: spacing.sm },
  dangerTxt: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});
