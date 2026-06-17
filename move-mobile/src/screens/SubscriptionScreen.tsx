import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme/tokens';
import { screenStyles } from '../theme/screenStyles';
import { SubscriptionPlan } from '../types';
import { activateSubscription, getSubscriptionPlans } from '../services/subscriptionService';

export function SubscriptionScreen({ navigation }: any) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('move-plus');

  useEffect(() => {
    getSubscriptionPlans().then(setPlans);
  }, []);

  async function handleSubscribe() {
    const result = await activateSubscription(selectedPlan);
    if (result.success) {
      Alert.alert('تم التفعيل', 'تم تفعيل الاشتراك بنجاح');
      navigation.replace('MainTabs');
    }
  }

  return (
    <SafeAreaView style={screenStyles.safe}>
      <View style={screenStyles.container}>
        <Text style={styles.kicker}>الاشتراك</Text>
        <Text style={screenStyles.title}>اختر خطة MOVE</Text>
        <Text style={screenStyles.subtitle}>فريق صحي متكامل: مدرب + تغذية + علاج طبيعي</Text>

        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = item.id === selectedPlan;
            return (
              <View style={[styles.planCard, active && styles.planCardActive]}>
                <Text style={styles.planTitle}>{item.title}</Text>
                <Text style={styles.planPrice}>{item.priceSarMonthly} ر.س / شهر</Text>
                <Text style={styles.planDescription}>{item.description}</Text>
                {item.features.map((feature) => (
                  <Text key={feature} style={styles.featureText}>
                    • {feature}
                  </Text>
                ))}
                <PrimaryButton label={active ? 'مختارة' : 'اختيار الخطة'} onPress={() => setSelectedPlan(item.id)} />
              </View>
            );
          }}
        />

        <PrimaryButton label="تفعيل الاشتراك" onPress={handleSubscribe} />
      </View>
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
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md
  },
  planCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: spacing.lg
  },
  planCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5F1'
  },
  planTitle: {
    textAlign: 'right',
    fontSize: 22,
    fontWeight: '800'
  },
  planPrice: {
    textAlign: 'right',
    color: colors.primaryDark,
    fontWeight: '800',
    marginTop: spacing.xs
  },
  planDescription: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  featureText: {
    textAlign: 'right',
    color: colors.text,
    marginBottom: 4
  }
});
