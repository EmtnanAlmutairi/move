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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { UserGoal } from '../types';

const GOALS: { id: UserGoal; label: string; emoji: string }[] = [
  { id: 'muscle-gain', label: 'بناء العضلات', emoji: '💪' },
  { id: 'weight-loss', label: 'خسارة الوزن', emoji: '🔥' },
  { id: 'fitness', label: 'اللياقة العامة', emoji: '⚡' }
];

export function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim() && email.trim() && password.length >= 6 && goal;

  const handleSignup = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Subscription', { goalId: goal });
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>→ رجوع</Text>
          </Pressable>

          <Text style={styles.heading}>إنشاء حساب جديد</Text>
          <Text style={styles.subheading}>انضم إلى آلاف المتدربين في MOVE</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>الاسم</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="اكتب اسمك"
              placeholderTextColor={colors.muted}
              textAlign="right"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="6 أحرف على الأقل"
              placeholderTextColor={colors.muted}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <Text style={styles.label}>هدفك الرياضي</Text>
          <View style={styles.goalsRow}>
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                style={[styles.goalCard, goal === g.id && styles.goalCardActive]}
                onPress={() => setGoal(g.id)}
              >
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <Text style={[styles.goalLabel, goal === g.id && styles.goalLabelActive]}>
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={handleSignup} disabled={!canSubmit || loading}>
            <LinearGradient
              colors={canSubmit ? [colors.gradientStart, colors.gradientEnd] : ['#ccc', '#bbb']}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب →'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.termsNote}>
            بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl
  },
  back: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg
  },
  backText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15
  },
  heading: {
    textAlign: 'right',
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subheading: {
    textAlign: 'right',
    color: colors.muted,
    marginBottom: spacing.xl
  },
  fieldGroup: {
    marginBottom: spacing.md
  },
  label: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 14
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text
  },
  goalsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: spacing.sm,
    marginBottom: spacing.xl
  },
  goalCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 6
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSoft
  },
  goalEmoji: {
    fontSize: 24
  },
  goalLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted
  },
  goalLabelActive: {
    color: colors.primary
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18
  },
  termsNote: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  }
});
