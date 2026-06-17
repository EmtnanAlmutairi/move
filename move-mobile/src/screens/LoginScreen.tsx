import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
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

const STATS = [
  { val: '18,400+', lbl: 'عضو نشط' },
  { val: '98%',     lbl: 'معدل الرضا' },
  { val: '500+',    lbl: 'مدرب محترف' },
];

export function LoginScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('MainTabs');
    }, 700);
  };

  return (
    <View style={st.root}>
      {/* ── FULL DARK HERO ──────────────────────────── */}
      <View style={st.hero}>
        {/* Glow orbs */}
        <View style={[st.glow1, { backgroundColor: '#FF4500' }]} />
        <View style={[st.glow2, { backgroundColor: '#FF9A00' }]} />

        {/* Grid dots pattern */}
        <View style={st.dotsGrid} pointerEvents="none">
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={i} style={st.dot} />
          ))}
        </View>

        <SafeAreaView style={st.heroInner} edges={['top']}>
          {/* Logo */}
          <Image
            source={require('../../logo.png')}
            style={st.logo}
            resizeMode="contain"
          />

          {/* Brand label */}
          <Text style={st.tagline}>بيئتك الرياضية الذكية</Text>

          {/* Stats row */}
          <View style={st.statsRow}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.lbl}>
                {i > 0 && <View style={st.statDiv} />}
                <View style={st.statItem}>
                  <Text style={st.statVal}>{s.val}</Text>
                  <Text style={st.statLbl}>{s.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>
      </View>

      {/* ── FORM SHEET ──────────────────────────────── */}
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
            <Text style={[st.heading, { color: t.text }]}>مرحباً بعودتك</Text>
            <Text style={[st.sub, { color: t.muted }]}>سجّل دخولك للمتابعة</Text>

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
                placeholder="كلمة المرور"
                placeholderTextColor={t.muted}
                secureTextEntry={!showPw}
                textAlign="right"
              />
              <Ionicons name="lock-closed-outline" size={18} color={t.muted} style={st.inputIcon} />
            </View>

            <Pressable style={st.forgotRow}>
              <Text style={[st.forgotTxt, { color: t.primary }]}>نسيت كلمة المرور؟</Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={loading ? ['#888', '#666'] : ['#FF4500', '#FF6800', '#FF9A00']}
                style={st.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading
                  ? <Text style={st.loginBtnTxt}>جاري الدخول...</Text>
                  : <>
                      <Ionicons name="flash" size={16} color="#fff" />
                      <Text style={st.loginBtnTxt}>دخول</Text>
                    </>}
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={st.divider}>
              <View style={[st.divLine, { backgroundColor: t.line }]} />
              <Text style={[st.divTxt, { color: t.muted }]}>أو</Text>
              <View style={[st.divLine, { backgroundColor: t.line }]} />
            </View>

            {/* Signup */}
            <Pressable
              style={[st.outlineBtn, { borderColor: t.line, backgroundColor: t.cardSoft }]}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={[st.outlineBtnTxt, { color: t.text }]}>إنشاء حساب جديد</Text>
            </Pressable>

            {/* Guest */}
            <Pressable
              style={st.guestRow}
              onPress={() => navigation.navigate('Onboarding')}
            >
              <Text style={[st.guestTxt, { color: t.muted }]}>متابعة كزائر</Text>
            </Pressable>
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
    height: 280,
    backgroundColor: '#111111',
    overflow: 'hidden',
    position: 'relative',
  },
  glow1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    top: -120, right: -60, opacity: 0.18,
  },
  glow2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    top: -40, left: -80, opacity: 0.12,
  },
  dotsGrid: {
    position: 'absolute', inset: 0,
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, paddingVertical: 20, gap: 28,
    opacity: 0.12,
  },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#FF7A18' },

  heroInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  logo:      { width: 140, height: 52 },
  tagline:   { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },

  statsRow:  { flexDirection: 'row', alignItems: 'center', gap: 0 },
  statDiv:   { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 16 },
  statItem:  { alignItems: 'center' },
  statVal:   { color: '#FF7A18', fontSize: 16, fontWeight: '900' },
  statLbl:   { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 },

  /* ── sheet ── */
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 48,
  },
  heading: { fontSize: 28, fontWeight: '900', textAlign: 'right', marginBottom: 4 },
  sub:     { fontSize: 15, textAlign: 'right', marginBottom: spacing.xl },

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

  forgotRow: { alignItems: 'flex-start', marginBottom: spacing.lg, marginTop: 4 },
  forgotTxt: { fontSize: 14, fontWeight: '600' },

  loginBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  loginBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  divider: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  divLine: { flex: 1, height: 1 },
  divTxt:  { fontSize: 13 },

  outlineBtn:    { borderWidth: 1.5, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: spacing.sm },
  outlineBtnTxt: { fontSize: 15, fontWeight: '700' },

  guestRow: { alignItems: 'center', marginTop: spacing.sm },
  guestTxt: { fontSize: 13 },
});
