import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectedDevice, listHealthDevices } from '../services/healthDeviceService';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

export function IntegrationsScreen() {
  const { theme: t } = useTheme();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);

  useEffect(() => { listHealthDevices().then(setDevices); }, []);

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[st.kicker, { color: t.primary }]}>الأجهزة</Text>
        <Text style={[st.title, { color: t.text }]}>ربط أجهزة التتبع</Text>
        <Text style={[st.subtitle, { color: t.muted }]}>قراءة البيانات الصحية من التطبيقات والأساور الذكية</Text>

        {devices.map((device) => (
          <View key={device.id} style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
            <View style={st.rowBetween}>
              <Text style={[st.state, { color: device.connected ? t.success : t.muted }]}>
                {device.connected ? 'متصل' : 'غير متصل'}
              </Text>
              <Text style={[st.name, { color: t.text }]}>{device.name}</Text>
            </View>
          </View>
        ))}

        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.noteTitle, { color: t.text }]}>ملاحظة تقنية</Text>
          <Text style={[st.noteBody, { color: t.muted }]}>
            يدعم التطبيق ربط HealthKit / Google Fit / Garmin عبر طبقة تكامل. يتم تحويل
            البيانات إلى لوحة الصحة بشكل يومي.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:  { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 90,
  },

  kicker:   { textAlign: 'right', marginBottom: spacing.xs, fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  title:    { fontSize: 32, fontWeight: '900', lineHeight: 36, textAlign: 'right' },
  subtitle: { marginTop: spacing.xs, textAlign: 'right', fontSize: 15, marginBottom: spacing.lg },

  card: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  rowBetween: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  state:     { fontWeight: '700', fontSize: 13 },
  name:      { textAlign: 'right', fontWeight: '800', fontSize: 18 },
  noteTitle: { textAlign: 'right', fontWeight: '800', fontSize: 18 },
  noteBody:  { textAlign: 'right', marginTop: spacing.xs, lineHeight: 24 },

  xxl: {},
});
