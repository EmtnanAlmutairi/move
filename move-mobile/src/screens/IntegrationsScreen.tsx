import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listHealthDevices, ConnectedDevice } from '../services/healthDeviceService';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';

export function IntegrationsScreen() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);

  useEffect(() => {
    listHealthDevices().then(setDevices);
  }, []);

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={screenStyles.container}>
        <Text style={styles.kicker}>الأجهزة</Text>
        <Text style={screenStyles.title}>ربط أجهزة التتبع</Text>
        <Text style={screenStyles.subtitle}>قراءة البيانات الصحية من التطبيقات والأساور الذكية</Text>

        {devices.map((device) => (
          <View key={device.id} style={screenStyles.card}>
            <View style={styles.rowBetween}>
              <Text style={[styles.state, device.connected && styles.stateConnected]}>
                {device.connected ? 'متصل' : 'غير متصل'}
              </Text>
              <Text style={styles.name}>{device.name}</Text>
            </View>
          </View>
        ))}

        <View style={screenStyles.card}>
          <Text style={styles.noteTitle}>ملاحظة تقنية</Text>
          <Text style={styles.noteBody}>
            يدعم التطبيق ربط HealthKit / Google Fit / Garmin عبر طبقة تكامل. يتم تحويل
            البيانات إلى لوحة الصحة بشكل يومي.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  kicker: {
    textAlign: 'right',
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '700'
  },
  rowBetween: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  state: {
    color: colors.warning,
    fontWeight: '700'
  },
  stateConnected: {
    color: colors.success
  },
  name: {
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 18,
    color: colors.text
  },
  noteTitle: {
    textAlign: 'right',
    fontWeight: '800',
    color: colors.text,
    fontSize: 18
  },
  noteBody: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 24
  }
});
