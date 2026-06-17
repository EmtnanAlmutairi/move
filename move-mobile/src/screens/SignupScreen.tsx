import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { UserGoal } from '../types';

const GOALS: { id: UserGoal; label: string; emoji: string; desc: string }[] = [
  { id: 'muscle-gain', label: 'بناء العضلات', emoji: '💪', desc: 'برامج مقاومة وبروتين' },
  { id: 'weight-loss', label: 'خسارة الوزن',  emoji: '🔥', desc: 'حرق دهون وكارديو' },
  { id: 'fitness',     label: 'اللياقة العامة', emoji: '⚡', desc: 'توازن وصحة شاملة' },
];

export function SignupScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const [step,     setStep]     = useState<1 | 2>(1);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [goal,     setGoal]     = useState<UserGoal | null>(null);
  const [referral, setReferral] = useState('');
  const [loading,  setLoading]  = useState(false);

  const step1Valid = name.trim().length > 0 && email.includes('@') && password.length >= 6;
  const step2Valid = goal !== null;

  const goStep2 = () => { if (step1Valid) setStep(2); };

  const handleSignup = () => {
    if (!step2Valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Subscription', { goalId: goal });
    }, 900);
  };

  return (
    <View style={st.root}>
      {/* ── HERO HEADER ──────────────────────────────── */}
      <View style={st.hero}>
        <View style={[st.glow1, { backgroundColor: '#FF4500' }]} />
        <View style={[st.glow2, { backgroundColor: '#FF9A00' }]} />

        <SafeAreaView edges={['top']} style={st.heroInner}>
          {/* Back */}
          <Pressable
            style={st.backBtn}
            onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
          >
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Step indicator */}
          <View style={st.stepRow}>
            <View style={[st.stepPill, st.stepPillActive]} />
            <View style={[st.stepPill, step === 2 && st.stepPillActive]} />
          </View>

          <Text style={st.heroTitle}>
            {step === 1 ? 'إنشاء حساب' : 'اختر هدفك'}
          </Text>
          <Text style={st.heroSub}>
            {step === 1
              ? 'انضم إلى أكثر من 18,000 رياضي في MOVE'
              : 'سنبني لك خطة مخصصة حسب هدفك'}
          </Text>
        </SafeAreaView>
      </View>

      {/* ── FORM SHEET ───────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[st.sheet, { backgroundColor: t.background }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={st.sheetContent}
          >
            {step === 1 ? (
              <>
                {/* Name */}
                <View style={[st.inputWrap, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                  <TextInput
                    style={[st.input, { color: t.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="اسمك الكامل"
                    placeholderTextColor={t.muted}
                    textAlign="right"
                    returnKeyType="next"
                  />
                  <Ionicons name="person-outline" size={18} color={t.muted} style={st.inputIcon} />
                </View>

                {/* Email */}
                <View style={[st.inputWrap, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                  <TextInput
                    style={[st.input, { color: t.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="البريد الإلكتروني"
                    placeholderTextColor={t.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="right"
                    returnKeyType="next"
                  />
                  <Ionicons name="mail-outline" size={18} color={t.muted} style={st.inputIcon} />
                </View>

                {/* Password */}
                <View style={[st.inputWrap, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                  <Pressable onPress={() => setShowPw(v => !v)} style={st.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={t.muted} />
                  </Pressable>
                  <TextInput
                    style={[st.input, { color: t.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="كلمة المرور (6 أحرف+)"
                    placeholderTextColor={t.muted}
                    secureTextEntry={!showPw}
                    textAlign="right"
                  />
                  <Ionicons name="lock-closed-outline" size={18} color={t.muted} style={st.inputIcon} />
                </View>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <View style={st.strengthRow}>
                    {[0, 1, 2, 3].map(i => {
                      const filled = password.length >= [1, 4, 7, 10][i];
                      const color = password.length >= 10 ? '#22C55E' : password.length >= 7 ? '#FF9A00' : '#FF4500';
                      return (
                        <View
                          key={i}
                          style={[
                            st.strengthBar,
                            { backgroundColor: filled ? color : t.line },
                          ]}
                        />
                      );
                    })}
                    <Text style={[st.strengthTxt, { color: t.muted }]}>
                      {password.length < 4 ? 'ضعيفة' : password.length < 7 ? 'متوسطة' : password.length < 10 ? 'قوية' : 'ممتازة'}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={goStep2}
                  disabled={!step1Valid}
                  style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={step1Valid ? ['#FF4500', '#FF6800', '#FF9A00'] : ['#888', '#666']}
                    style={st.primaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={st.primaryBtnTxt}>التالي</Text>
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                  </LinearGradient>
                </Pressable>

                <Pressable style={st.loginLink} onPress={() => navigation.goBack()}>
                  <Text style={[st.loginLinkTxt, { color: t.muted }]}>
                    لديك حساب؟{' '}
                    <Text style={{ color: t.primary, fontWeight: '800' }}>تسجيل الدخول</Text>
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Goal cards */}
                <View style={st.goalGrid}>
                  {GOALS.map((g) => {
                    const active = goal === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        style={[
                          st.goalCard,
                          {
                            backgroundColor: active ? t.primary + '14' : t.cardSoft,
                            borderColor: active ? t.primary : t.line,
                          },
                        ]}
                        onPress={() => setGoal(g.id)}
                      >
                        {active && (
                          <View style={st.goalCheck}>
                            <Ionicons name="checkmark" size={11} color="#fff" />
                          </View>
                        )}
                        <Text style={st.goalEmoji}>{g.emoji}</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={[st.goalLabel, { color: active ? t.primary : t.text }]}>{g.label}</Text>
                          <Text style={[st.goalDesc, { color: t.muted }]}>{g.desc}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Referral code */}
                <Text style={[st.refLabel, { color: t.muted }]}>كود الإحالة (اختياري)</Text>
                <View style={[st.inputWrap, { backgroundColor: t.cardSoft, borderColor: referral ? t.primary + '60' : t.line }]}>
                  <TextInput
                    style={[st.input, { color: t.text }]}
                    value={referral}
                    onChangeText={v => setReferral(v.toUpperCase())}
                    placeholder="مثال: MOVE-XXXX"
                    placeholderTextColor={t.muted}
                    autoCapitalize="characters"
                    textAlign="right"
                  />
                  <Ionicons name="gift-outline" size={18} color={referral ? t.primary : t.muted} style={st.inputIcon} />
                </View>

                {/* Submit */}
                <Pressable
                  onPress={handleSignup}
                  disabled={!step2Valid || loading}
                  style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={step2Valid ? ['#FF4500', '#FF6800', '#FF9A00'] : ['#888', '#666']}
                    style={st.primaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <Text style={st.primaryBtnTxt}>جاري الإنشاء...</Text>
                    ) : (
                      <>
                        <Ionicons name="flash" size={16} color="#fff" />
                        <Text style={st.primaryBtnTxt}>إنشاء الحساب</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <Text style={[st.termsNote, { color: t.muted }]}>
                  بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111111' },

  /* ── hero ── */
  hero: {
    backgroundColor: '#111111',
    overflow: 'hidden',
    position: 'relative',
  },
  glow1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    top: -100, right: -40, opacity: 0.16,
  },
  glow2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    top: -50, left: -60, opacity: 0.10,
  },
  heroInner:  { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  stepRow:    { flexDirection: 'row', gap: 6, marginBottom: spacing.sm },
  stepPill:   { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepPillActive: { backgroundColor: '#FF7A18' },
  heroTitle:  { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'right' },
  heroSub:    { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'right' },

  /* ── sheet ── */
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 48,
  },

  /* ── inputs ── */
  inputWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  inputIcon: { marginLeft: 8 },
  eyeBtn:    { marginRight: 8 },
  input:     { flex: 1, fontSize: 16, textAlign: 'right', paddingVertical: 12 },

  /* ── strength ── */
  strengthRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginBottom: spacing.md, marginTop: -4 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthTxt: { fontSize: 11, fontWeight: '600', minWidth: 36, textAlign: 'left' },

  /* ── buttons ── */
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.md,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  loginLink:    { alignItems: 'center', marginTop: spacing.xs },
  loginLinkTxt: { fontSize: 14 },

  /* ── goal grid ── */
  goalGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  goalCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  goalCheck: {
    position: 'absolute', top: 10, left: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FF7A18',
    alignItems: 'center', justifyContent: 'center',
  },
  goalEmoji: { fontSize: 28 },
  goalLabel: { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  goalDesc:  { fontSize: 12, textAlign: 'right', marginTop: 2 },

  /* ── referral ── */
  refLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'right', marginBottom: spacing.xs },

  termsNote: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: spacing.xs },
});
