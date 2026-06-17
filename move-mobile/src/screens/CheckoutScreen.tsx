import { Ionicons } from '@expo/vector-icons';
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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

type State = 'idle' | 'loading' | 'success';

export function CheckoutScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();
  const planTitle = route?.params?.planTitle ?? 'MOVE Plus';
  const planPrice = route?.params?.planPrice ?? 299;

  const [cardNum, setCardNum] = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvv,     setCvv]     = useState('');
  const [name,    setName]    = useState('');
  const [state,   setState]   = useState<State>('idle');

  const canPay = !!(cardNum && expiry && cvv && name);

  const handlePay = () => {
    if (!canPay) return;
    setState('loading');
    setTimeout(() => setState('success'), 1200);
  };

  if (state === 'success') {
    return (
      <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
        <View style={st.successWrap}>
          <View style={[st.successCircle, { backgroundColor: t.success }]}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={[st.successTitle, { color: t.text }]}>تم الدفع بنجاح</Text>
          <Text style={[st.successSub, { color: t.primary }]}>مرحباً بك في {planTitle}</Text>
          <Text style={[st.successNote, { color: t.muted }]}>
            سيتواصل معك فريقك الصحي خلال 24 ساعة
          </Text>
          <Pressable style={st.successBtn} onPress={() => navigation.replace('MainTabs')}>
            <Text style={st.successBtnText}>ابدأ رحلتك مع MOVE</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={[st.back, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>

          <Text style={[st.title, { color: t.text }]}>إتمام الدفع</Text>

          {/* Plan summary — dark brand card intentional */}
          <View style={st.planCard}>
            <View style={st.planRow}>
              <Text style={[st.planPrice, { color: t.primary }]}>
                {planPrice} <Text style={st.planUnit}>ر.س/شهر</Text>
              </Text>
              <Text style={st.planTitle}>{planTitle}</Text>
            </View>
            <Text style={st.planNote}>يُجدد تلقائياً · إلغاء مجاني في أي وقت</Text>
          </View>

          <Text style={[st.sectionLabel, { color: t.primary }]}>تفاصيل البطاقة</Text>

          <TextInput
            style={[st.input, { backgroundColor: t.cardSoft, color: t.text }]}
            value={cardNum}
            onChangeText={(v) => setCardNum(formatCardNumber(v))}
            placeholder="رقم البطاقة  •••• •••• •••• ••••"
            placeholderTextColor={t.muted}
            keyboardType="numeric"
            textAlign="right"
            maxLength={19}
          />

          <View style={st.twoCol}>
            <TextInput
              style={[st.input, st.inputFlex, { backgroundColor: t.cardSoft, color: t.text }]}
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              placeholder="MM/YY"
              placeholderTextColor={t.muted}
              keyboardType="numeric"
              textAlign="center"
              maxLength={5}
            />
            <TextInput
              style={[st.input, st.inputFlex, { backgroundColor: t.cardSoft, color: t.text }]}
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
              placeholder="CVV"
              placeholderTextColor={t.muted}
              keyboardType="numeric"
              secureTextEntry
              textAlign="center"
              maxLength={4}
            />
          </View>

          <TextInput
            style={[st.input, { backgroundColor: t.cardSoft, color: t.text }]}
            value={name}
            onChangeText={setName}
            placeholder="اسم حامل البطاقة"
            placeholderTextColor={t.muted}
            autoCapitalize="words"
            textAlign="right"
          />

          <Pressable
            style={({ pressed }) => [
              st.payBtn,
              !canPay && st.payBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handlePay}
            disabled={state === 'loading'}
          >
            <Text style={st.payBtnText}>
              {state === 'loading' ? 'جاري المعالجة...' : `ادفع ${planPrice} ر.س`}
            </Text>
          </Pressable>

          <View style={st.secureRow}>
            <Ionicons name="lock-closed-outline" size={13} color={t.muted} />
            <Text style={[st.secureText, { color: t.muted }]}>مدفوعات آمنة ومشفرة · لا نحتفظ ببيانات بطاقتك</Text>
          </View>

          <Pressable style={st.historyLink} onPress={() => navigation.navigate('PaymentHistory')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chevron-back" size={13} color={t.primary} />
              <Text style={[st.historyLinkText, { color: t.primary }]}>عرض سجل المدفوعات</Text>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },

  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },

  title: { fontSize: 28, fontWeight: '900', textAlign: 'right', marginBottom: spacing.lg },

  /* Dark brand card — intentional */
  planCard: { backgroundColor: '#111111', borderRadius: 20, padding: spacing.lg, marginBottom: spacing.xl },
  planRow:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  planTitle:{ color: '#fff', fontSize: 18, fontWeight: '900' },
  planPrice:{ fontSize: 28, fontWeight: '900' },
  planUnit: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  planNote: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'right' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', textAlign: 'right', marginBottom: spacing.sm,
  },

  input:    { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, marginBottom: spacing.sm },
  inputFlex:{ flex: 1 },
  twoCol:   { flexDirection: 'row-reverse', gap: spacing.sm },

  payBtn:         { backgroundColor: '#111111', borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  payBtnDisabled: { backgroundColor: '#CCCCCC' },
  payBtnText:     { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  secureRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: spacing.md },
  secureText: { fontSize: 12, textAlign: 'center' },

  historyLink:     { alignItems: 'center' },
  historyLinkText: { fontSize: 13, fontWeight: '700' },

  successWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  successCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  successTitle:  { fontSize: 28, fontWeight: '900', marginBottom: spacing.xs },
  successSub:    { fontSize: 18, fontWeight: '700', marginBottom: spacing.md },
  successNote:   { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  successBtn:    { backgroundColor: '#111', borderRadius: 12, paddingVertical: 17, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  successBtnText:{ color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
});
