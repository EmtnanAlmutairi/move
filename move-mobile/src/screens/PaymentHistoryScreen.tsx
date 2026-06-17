import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const INVOICES = [
  { id: 'inv1', date: 'مايو 2025',   plan: 'MOVE Pro Team', amount: 499, status: 'مدفوع' },
  { id: 'inv2', date: 'أبريل 2025',  plan: 'MOVE Pro Team', amount: 499, status: 'مدفوع' },
  { id: 'inv3', date: 'مارس 2025',   plan: 'MOVE Plus',     amount: 299, status: 'مدفوع' },
  { id: 'inv4', date: 'فبراير 2025', plan: 'MOVE Plus',     amount: 299, status: 'مدفوع' },
];

export function PaymentHistoryScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <Pressable style={[st.back, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>

        <Text style={[st.title, { color: t.text }]}>سجل المدفوعات</Text>

        {/* Active plan — dark brand card intentional */}
        <View style={st.activePlan}>
          <View>
            <Text style={st.activePlanLabel}>الاشتراك الحالي</Text>
            <Text style={st.activePlanName}>MOVE Pro Team</Text>
            <Text style={st.activePlanDate}>يتجدد في 1 يونيو 2025</Text>
          </View>
          <View style={[st.activeBadge, { backgroundColor: t.success }]}>
            <Text style={st.activeBadgeText}>نشط</Text>
          </View>
        </View>

        <Text style={[st.sectionLabel, { color: t.primary }]}>الفواتير</Text>

        {INVOICES.map((inv, i) => (
          <View
            key={inv.id}
            style={[st.row, i > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}
          >
            <View style={[st.statusBadge, { backgroundColor: t.success + '14', borderColor: t.success + '40' }]}>
              <Text style={[st.statusText, { color: t.success }]}>{inv.status}</Text>
            </View>
            <View style={st.rowBody}>
              <Text style={[st.rowAmount, { color: t.text }]}>{inv.amount} ر.س</Text>
              <Text style={[st.rowPlan, { color: t.muted }]}>{inv.plan}</Text>
              <Text style={[st.rowDate, { color: t.muted }]}>{inv.date}</Text>
            </View>
          </View>
        ))}

        <Pressable style={st.cancelLink}>
          <Text style={[st.cancelText, { color: t.muted }]}>إلغاء الاشتراك</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },

  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },

  title: { fontSize: 28, fontWeight: '900', textAlign: 'right', marginBottom: spacing.lg },

  /* Dark brand card — intentional */
  activePlan: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activePlanLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'right', marginBottom: 4 },
  activePlanName:  { color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  activePlanDate:  { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'right', marginTop: 3 },
  activeBadge:     { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  activeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', textAlign: 'right', marginBottom: spacing.sm,
  },

  row:         { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  rowBody:     { flex: 1, alignItems: 'flex-end' },
  rowAmount:   { fontSize: 18, fontWeight: '900' },
  rowPlan:     { fontSize: 13, marginTop: 2 },
  rowDate:     { fontSize: 12, marginTop: 1 },

  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText:  { fontSize: 11, fontWeight: '700' },

  cancelLink: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontSize: 14, textDecorationLine: 'underline' },
});
