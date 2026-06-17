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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('MainTabs');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBlock}>
            <Image source={require('../../logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>

          <Text style={styles.heading}>مرحباً بعودتك</Text>
          <Text style={styles.subheading}>سجّل دخولك للمتابعة</Text>

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
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </Pressable>

          <Pressable onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.loginBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginBtnText}>{loading ? 'جاري الدخول...' : 'دخول'}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.signupRow} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>
              ليس لديك حساب؟ <Text style={styles.signupLink}>إنشاء حساب جديد</Text>
            </Text>
          </Pressable>

          <Pressable style={styles.skipRow} onPress={() => navigation.navigate('Onboarding')}>
            <Text style={styles.skipText}>متابعة كزائر ←</Text>
          </Pressable>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl
  },
  logoBlock: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm
  },
  logoImage: {
    width: 250,
    height: 110
  },
  heading: {
    textAlign: 'right',
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subheading: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 16,
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
  forgotRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl
  },
  forgotText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14
  },
  loginBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18
  },
  dividerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line
  },
  dividerText: {
    color: colors.muted,
    fontSize: 14
  },
  signupRow: {
    alignItems: 'center',
    marginBottom: spacing.md
  },
  signupText: {
    color: colors.muted,
    fontSize: 15
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '700'
  },
  skipRow: {
    alignItems: 'center',
    marginTop: spacing.sm
  },
  skipText: {
    color: colors.muted,
    fontSize: 14
  }
});
