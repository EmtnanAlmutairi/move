import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

function Row({
  icon,
  label,
  sub,
  right,
}: {
  icon: string;
  label: string;
  sub?: string;
  right: React.ReactNode;
}) {
  const { theme: t } = useTheme();
  return (
    <View style={st.row}>
      <View style={st.rowRight}>{right}</View>
      <View style={st.rowInfo}>
        <Text style={[st.rowLabel, { color: t.text }]}>{label}</Text>
        {sub && <Text style={[st.rowSub, { color: t.muted }]}>{sub}</Text>}
      </View>
      <View style={[st.rowIcon, { backgroundColor: t.cardSoft }]}>
        <Ionicons name={icon as any} size={18} color={t.muted} />
      </View>
    </View>
  );
}

export function TweaksScreen({ navigation }: any) {
  const { theme: t, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        <View style={st.header}>
          <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
          <Text style={[st.title, { color: t.text }]}>الإعدادات</Text>
        </View>

        {/* Appearance */}
        <Text style={[st.sectionLabel, { color: t.muted }]}>المظهر</Text>

        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
          <Row
            icon="contrast-outline"
            label="المظهر الداكن"
            sub={isDark ? 'MOVE Dark — أسود + برتقالي' : 'MOVE Light — كريمي + ليموني'}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: t.line, true: t.primary + '55' }}
                thumbColor={isDark ? t.primary : '#FFFFFF'}
              />
            }
          />
        </View>

        {/* Theme preview chips */}
        <View style={st.themePreviewRow}>
          <Pressable
            style={[
              st.themeChip,
              { backgroundColor: t.cardSoft, borderColor: !isDark ? t.primary : t.line },
            ]}
            onPress={() => { if (isDark) toggleTheme(); }}
          >
            <View style={st.themeChipDot} />
            <Text style={[st.themeChipTxt, { color: !isDark ? t.primary : t.muted }]}>Light Brand</Text>
          </Pressable>
          <Pressable
            style={[
              st.themeChip,
              { backgroundColor: '#1C1C1C', borderColor: isDark ? '#FF4500' : 'rgba(255,255,255,0.1)' },
            ]}
            onPress={() => { if (!isDark) toggleTheme(); }}
          >
            <View style={[st.themeChipDot, { backgroundColor: '#FF4500' }]} />
            <Text style={[st.themeChipTxt, { color: isDark ? '#FF4500' : 'rgba(255,255,255,0.45)' }]}>Dark MOVE</Text>
          </Pressable>
        </View>

        {/* Privacy */}
        <Text style={[st.sectionLabel, { color: t.muted }]}>الخصوصية</Text>
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
          <Row
            icon="map-outline"
            label="الظهور على الخريطة"
            sub="إظهار موقعك بتشويش 200م"
            right={<Switch value={true} trackColor={{ false: t.line, true: t.primary + '55' }} thumbColor={t.primary} />}
          />
          <View style={[st.cardDivider, { backgroundColor: t.line }]} />
          <Row
            icon="person-outline"
            label="الملف الشخصي عام"
            sub="يمكن للجميع رؤية منشوراتك"
            right={<Switch value={true} trackColor={{ false: t.line, true: t.primary + '55' }} thumbColor={t.primary} />}
          />
        </View>

        {/* Notifications */}
        <Text style={[st.sectionLabel, { color: t.muted }]}>الإشعارات</Text>
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
          <Row
            icon="notifications-outline"
            label="إشعارات التمارين"
            right={<Switch value={true} trackColor={{ false: t.line, true: t.primary + '55' }} thumbColor={t.primary} />}
          />
          <View style={[st.cardDivider, { backgroundColor: t.line }]} />
          <Row
            icon="people-outline"
            label="متابعة جديدة"
            right={<Switch value={true} trackColor={{ false: t.line, true: t.primary + '55' }} thumbColor={t.primary} />}
          />
          <View style={[st.cardDivider, { backgroundColor: t.line }]} />
          <Row
            icon="trophy-outline"
            label="أرقام قياسية"
            right={<Switch value={true} trackColor={{ false: t.line, true: t.primary + '55' }} thumbColor={t.primary} />}
          />
        </View>

        {/* Account */}
        <Text style={[st.sectionLabel, { color: t.muted }]}>الحساب</Text>
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }]}>
          <Pressable style={st.row} onPress={() => navigation.navigate('Subscription')}>
            <Ionicons name="chevron-back" size={16} color={t.muted} />
            <View style={st.rowInfo}>
              <Text style={[st.rowLabel, { color: t.text }]}>إدارة الاشتراك</Text>
            </View>
            <View style={[st.rowIcon, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="card-outline" size={18} color={t.muted} />
            </View>
          </Pressable>
          <View style={[st.cardDivider, { backgroundColor: t.line }]} />
          <Pressable style={st.row} onPress={() => navigation.navigate('PaymentHistory')}>
            <Ionicons name="chevron-back" size={16} color={t.muted} />
            <View style={st.rowInfo}>
              <Text style={[st.rowLabel, { color: t.text }]}>سجل المدفوعات</Text>
            </View>
            <View style={[st.rowIcon, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="receipt-outline" size={18} color={t.muted} />
            </View>
          </Pressable>
          <View style={[st.cardDivider, { backgroundColor: t.line }]} />
          <Pressable style={st.row} onPress={() => navigation.replace('Login')}>
            <Ionicons name="chevron-back" size={16} color="#FF4444" />
            <View style={st.rowInfo}>
              <Text style={[st.rowLabel, { color: '#FF4444' }]}>تسجيل الخروج</Text>
            </View>
            <View style={[st.rowIcon, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="log-out-outline" size={18} color="#FF4444" />
            </View>
          </Pressable>
        </View>

        <Text style={[st.version, { color: t.muted }]}>MOVE v2.1.0 · بيئة اجتماعية رياضية</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 60 },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center',
    gap: spacing.sm, paddingVertical: spacing.md, marginBottom: spacing.sm,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 28, fontWeight: '900' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'right',
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  card:        { borderRadius: 18, borderWidth: 1 },
  cardDivider: { height: 1, marginHorizontal: spacing.md },

  row: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1, alignItems: 'flex-end' },
  rowLabel: { fontWeight: '700', fontSize: 15 },
  rowSub:   { fontSize: 12, marginTop: 2, textAlign: 'right' },
  rowRight: { flexShrink: 0 },

  themePreviewRow: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  themeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: 14, borderWidth: 1.5,
  },
  themeChipDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#B5FF45' },
  themeChipTxt: { fontSize: 13, fontWeight: '700' },

  version: { fontSize: 11, textAlign: 'center', marginTop: spacing.xl },
});
