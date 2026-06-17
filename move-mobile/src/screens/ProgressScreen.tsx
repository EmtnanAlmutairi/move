import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bodyMeasurements, runHistory, weeklyProgress, weeklyWorkout } from '../data/mockData';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';

type Period = 'week' | 'month';

function BarChart({
  data,
  maxVal,
  color,
  goalLine
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  maxVal: number;
  color: string;
  goalLine?: number;
}) {
  return (
    <View style={barStyles.container}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        const goalPct = goalLine && maxVal > 0 ? (goalLine / maxVal) * 100 : null;
        return (
          <View key={i} style={barStyles.col}>
            <View style={barStyles.barWrap}>
              {goalPct !== null && (
                <View style={[barStyles.goalMark, { bottom: `${goalPct}%` as any }]} />
              )}
              <View
                style={[
                  barStyles.bar,
                  {
                    height: `${pct}%` as any,
                    backgroundColor: item.highlight ? colors.primary : color
                  }
                ]}
              />
            </View>
            <Text style={barStyles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    height: 100,
    gap: 6,
    marginTop: spacing.sm
  },
  col: {
    flex: 1,
    alignItems: 'center'
  },
  barWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  bar: {
    width: '100%',
    borderRadius: 6
  },
  goalMark: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.warning,
    zIndex: 1,
    borderRadius: 1
  },
  label: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center'
  }
});

export function ProgressScreen() {
  const [period, setPeriod] = useState<Period>('week');

  const totalWeekSteps = weeklyProgress.reduce((s, d) => s + d.steps, 0);
  const totalWeekKm = weeklyProgress.reduce((s, d) => s + (d.runKm ?? 0), 0);
  const completedWorkouts = weeklyWorkout.filter((w) => w.completed).length;
  const totalCalories = weeklyProgress.reduce((s, d) => s + d.caloriesBurned, 0);

  const stepsData = weeklyProgress.map((d) => ({
    label: d.dayShort,
    value: d.steps,
    highlight: d.steps >= d.stepsGoal
  }));

  const caloriesData = weeklyProgress.map((d) => ({
    label: d.dayShort,
    value: d.caloriesBurned,
    highlight: d.caloriesBurned >= 500
  }));

  const weightData = bodyMeasurements.map((m) => ({
    label: m.date,
    value: m.weightKg
  }));

  const latestWeight = bodyMeasurements[bodyMeasurements.length - 1];
  const firstWeight = bodyMeasurements[0];
  const weightChange = (latestWeight.weightKg - firstWeight.weightKg).toFixed(1);

  const totalRunKm = runHistory.reduce((s, r) => s + r.distanceKm, 0);

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>تقدمي</Text>

        <View style={styles.periodRow}>
          {(['week', 'month'] as Period[]).map((p) => (
            <Pressable
              key={p}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}
              </Text>
            </Pressable>
          ))}
        </View>

        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroLabel}>ملخص {period === 'week' ? 'الأسبوع' : 'الشهر'}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{completedWorkouts}/{weeklyWorkout.length}</Text>
              <Text style={styles.heroStatLabel}>تمرينات</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalWeekKm.toFixed(1)}</Text>
              <Text style={styles.heroStatLabel}>كم جري</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{(totalWeekSteps / 1000).toFixed(1)}k</Text>
              <Text style={styles.heroStatLabel}>خطوات</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalCalories}</Text>
              <Text style={styles.heroStatLabel}>سعرة</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>الخطوات اليومية</Text>
          <Text style={styles.cardSub}>الهدف: 10,000 خطوة (الخط البرتقالي)</Text>
          <BarChart
            data={stepsData}
            maxVal={12000}
            color="#C8E6FF"
            goalLine={10000}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>السعرات المحروقة</Text>
          <Text style={styles.cardSub}>مجموع الأسبوع: {totalCalories} سعرة</Text>
          <BarChart
            data={caloriesData}
            maxVal={700}
            color={`${colors.primary}44`}
            goalLine={500}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>تطور الوزن</Text>
          <View style={styles.weightRow}>
            <View>
              <Text style={styles.weightCurrent}>{latestWeight.weightKg} كغ</Text>
              <Text style={styles.weightChange}>
                {parseFloat(weightChange) < 0 ? weightChange : `+${weightChange}`} كغ
              </Text>
            </View>
            <View style={styles.weightRight}>
              <Text style={styles.weightRightLabel}>دهون الجسم</Text>
              <Text style={styles.weightRightVal}>{latestWeight.bodyFatPct}%</Text>
            </View>
          </View>
          <BarChart
            data={weightData}
            maxVal={90}
            color={colors.success + '88'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>إحصائيات الجري</Text>
          <View style={styles.runStatsGrid}>
            <View style={styles.runStatItem}>
              <Text style={styles.runStatVal}>{totalRunKm.toFixed(1)}</Text>
              <Text style={styles.runStatLabel}>إجمالي الكيلومترات</Text>
            </View>
            <View style={styles.runStatItem}>
              <Text style={styles.runStatVal}>{runHistory.length}</Text>
              <Text style={styles.runStatLabel}>جلسات جري</Text>
            </View>
            <View style={styles.runStatItem}>
              <Text style={styles.runStatVal}>
                {Math.round(runHistory.reduce((s, r) => s + r.durationSec, 0) / 60)} د
              </Text>
              <Text style={styles.runStatLabel}>إجمالي الوقت</Text>
            </View>
            <View style={styles.runStatItem}>
              <Text style={styles.runStatVal}>
                {runHistory.reduce((s, r) => s + r.calories, 0)}
              </Text>
              <Text style={styles.runStatLabel}>سعرة محروقة</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>أيام النشاط هذا الأسبوع</Text>
          <View style={styles.activityDots}>
            {weeklyProgress.map((d, i) => (
              <View key={i} style={styles.activityDotWrap}>
                <View
                  style={[
                    styles.activityDot,
                    d.workoutDone && styles.activityDotDone
                  ]}
                />
                {d.runKm && d.runKm > 0 ? (
                  <View style={styles.runBadge}>
                    <Text style={styles.runBadgeText}>🏃</Text>
                  </View>
                ) : null}
                <Text style={styles.activityDotLabel}>{d.dayShort}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🔥</Text>
            <Text style={styles.badgeTitle}>6 أيام</Text>
            <Text style={styles.badgeLabel}>Streak</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🏃</Text>
            <Text style={styles.badgeTitle}>{totalRunKm.toFixed(0)} كم</Text>
            <Text style={styles.badgeLabel}>إجمالي الجري</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>💪</Text>
            <Text style={styles.badgeTitle}>42%</Text>
            <Text style={styles.badgeLabel}>تحدي الشهر</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100
  },
  title: {
    textAlign: 'right',
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md
  },
  periodRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  periodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSoft
  },
  periodText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 13
  },
  periodTextActive: {
    color: colors.primary
  },
  heroCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.md
  },
  heroStats: {
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  heroStat: {
    flex: 1,
    alignItems: 'center'
  },
  heroStatVal: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800'
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  cardTitle: {
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
    marginBottom: 2
  },
  cardSub: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 12
  },
  weightRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  weightCurrent: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right'
  },
  weightChange: {
    color: colors.success,
    fontWeight: '700',
    textAlign: 'right'
  },
  weightRight: {
    alignItems: 'center'
  },
  weightRightLabel: {
    color: colors.muted,
    fontSize: 12
  },
  weightRightVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary
  },
  runStatsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 1
  },
  runStatItem: {
    width: '50%',
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  runStatVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary
  },
  runStatLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  activityDots: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: spacing.md
  },
  activityDotWrap: {
    alignItems: 'center',
    position: 'relative'
  },
  activityDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.line,
    marginBottom: 4
  },
  activityDotDone: {
    backgroundColor: colors.primary
  },
  runBadge: {
    position: 'absolute',
    top: -4,
    left: -4
  },
  runBadgeText: {
    fontSize: 12
  },
  activityDotLabel: {
    color: colors.muted,
    fontSize: 11
  },
  badgesRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md
  },
  badge: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4
  },
  badgeEmoji: {
    fontSize: 24
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  badgeLabel: {
    color: colors.muted,
    fontSize: 11
  }
});
