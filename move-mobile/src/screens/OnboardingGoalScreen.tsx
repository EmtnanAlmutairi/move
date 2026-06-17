import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme/tokens';
import { screenStyles } from '../theme/screenStyles';
import { UserGoal } from '../types';

const goals: { id: UserGoal; title: string; subtitle: string }[] = [
  { id: 'muscle-gain', title: 'بناء العضلات', subtitle: 'زيادة القوة والكتلة العضلية' },
  { id: 'weight-loss', title: 'خسارة الوزن', subtitle: 'حرق الدهون والحصول على جسم رشيق' },
  { id: 'fitness', title: 'الحفاظ على اللياقة', subtitle: 'الحفاظ على الصحة والطاقة' }
];

export function OnboardingGoalScreen({ navigation }: any) {
  const [selected, setSelected] = useState<UserGoal>('muscle-gain');

  const selectedGoal = useMemo(() => goals.find((goal) => goal.id === selected), [selected]);

  return (
    <SafeAreaView style={screenStyles.safe}>
      <View style={screenStyles.container}>
        <Text style={styles.kicker}>تخصيص</Text>
        <Text style={screenStyles.title}>ما هو هدفك الرئيسي؟</Text>
        <Text style={screenStyles.subtitle}>اختر واحدا لتخصيص خطتك</Text>

        <View style={styles.list}>
          {goals.map((goal) => {
            const active = goal.id === selected;
            return (
              <Pressable
                key={goal.id}
                style={[styles.goalCard, active && styles.goalCardActive]}
                onPress={() => setSelected(goal.id)}
              >
                <View>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                </View>
                <View style={[styles.circle, active && styles.circleActive]} />
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label="متابعة"
          onPress={() =>
            navigation.replace('Subscription', {
              goalId: selectedGoal?.id
            })
          }
        />
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
    marginTop: spacing.xl,
    gap: spacing.md
  },
  goalCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: spacing.lg,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF2EE'
  },
  goalTitle: {
    textAlign: 'right',
    fontWeight: '800',
    color: colors.text,
    fontSize: 24
  },
  goalSubtitle: {
    marginTop: 4,
    color: colors.muted,
    textAlign: 'right'
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFE9E2'
  },
  circleActive: {
    backgroundColor: colors.primary
  }
});
