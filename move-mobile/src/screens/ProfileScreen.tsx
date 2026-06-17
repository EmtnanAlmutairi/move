import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  bodyMeasurements,
  healthSnapshot,
  injuries,
  runHistory,
  userProfile,
  weeklyProgress,
  weeklyWorkout
} from '../data/mockData';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const GOAL_LABELS: Record<string, string> = {
  'muscle-gain': 'بناء عضلات',
  'weight-loss': 'خفض وزن',
  fitness: 'لياقة عامة'
};

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🏃', title: '5 كم أول', desc: 'أكملت أول جري 5 كم', earned: true },
  { id: 'a2', icon: '🔥', title: 'أسبوع كامل', desc: '7 أيام تمارين متواصلة', earned: true },
  { id: 'a3', icon: '💪', title: 'بناء العضلات', desc: 'رفعت وزن جديد', earned: true },
  { id: 'a4', icon: '🥗', title: 'التغذية السليمة', desc: '30 يوم على الخطة', earned: false },
  { id: 'a5', icon: '🏆', title: 'المتصدر', desc: 'صدارة الليدربورد', earned: false },
  { id: 'a6', icon: '⚡', title: 'سرعة الضوء', desc: 'أفضل إيقاع جري', earned: false }
];

function MiniBarChart() {
  const maxWeight = Math.max(...bodyMeasurements.map((m) => m.weightKg));
  const minWeight = Math.min(...bodyMeasurements.map((m) => m.weightKg));
  const range = maxWeight - minWeight || 1;

  return (
    <View style={chart.wrap}>
      {bodyMeasurements.map((m, i) => {
        const pct = 0.3 + ((m.weightKg - minWeight) / range) * 0.7;
        const isLatest = i === bodyMeasurements.length - 1;
        return (
          <View key={m.date} style={chart.col}>
            <Text style={chart.val}>{m.weightKg}</Text>
            <View style={chart.barTrack}>
              <LinearGradient
                colors={isLatest ? [colors.gradientStart, colors.gradientEnd] : ['#DDD5CC', '#C8BDB4']}
                style={[chart.bar, { height: `${pct * 100}%` }]}
              />
            </View>
            <Text style={chart.lbl}>{m.date}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ProfileScreen({ navigation }: any) {
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');

  const completedWorkouts = weeklyWorkout.filter((w) => w.completed).length;
  const weeklySteps = weeklyProgress.reduce((s, d) => s + d.steps, 0);
  const totalRunKm = runHistory.reduce((s, r) => s + r.distanceKm, 0);
  const latestBodyFat = bodyMeasurements[bodyMeasurements.length - 1]?.bodyFatPct ?? 0;
  const weightDiff = Math.abs(userProfile.currentWeight - userProfile.targetWeight).toFixed(1);
  const weightProgress = Math.min(
    ((bodyMeasurements[0].weightKg - userProfile.currentWeight) / (bodyMeasurements[0].weightKg - userProfile.targetWeight)) * 100,
    100
  );

  const totalCaloriesBurned = weeklyProgress.reduce((s, d) => s + d.caloriesBurned, 0);
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={[colors.text, '#34241C', colors.primary]} style={styles.hero} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{userProfile.avatarInitials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{userProfile.name}</Text>
              <Text style={styles.heroEmail}>{userProfile.email}</Text>
              <View style={styles.heroGoalPill}>
                <Text style={styles.heroGoalTxt}>🎯 {GOAL_LABELS[userProfile.goal] ?? userProfile.goal}</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroStats}>
            {[
              { val: `${healthSnapshot.readinessPercent}%`, lbl: 'الجاهزية' },
              { val: `${completedWorkouts}/${weeklyWorkout.length}`, lbl: 'تمارين' },
              { val: `${(weeklySteps / 1000).toFixed(1)}k`, lbl: 'خطوة' },
              { val: `${earnedCount}`, lbl: 'إنجاز' }
            ].map((s) => (
              <View key={s.lbl} style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{s.val}</Text>
                <Text style={styles.heroStatLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Weight goal progress */}
        <View style={styles.weightCard}>
          <View style={styles.weightTopRow}>
            <Text style={styles.weightTarget}>{userProfile.targetWeight} كغ</Text>
            <View style={styles.weightRight}>
              <Text style={styles.weightLabel}>تقدم الوزن</Text>
              <Text style={styles.weightCurrent}>{userProfile.currentWeight} كغ حالياً</Text>
            </View>
          </View>
          <View style={styles.weightBarTrack}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[styles.weightBarFill, { width: `${Math.max(weightProgress, 5)}%` }]}
            />
          </View>
          <View style={styles.weightBottomRow}>
            <Text style={styles.weightPct}>{weightProgress.toFixed(0)}% من الهدف</Text>
            <Text style={styles.weightRemain}>متبقي {weightDiff} كغ</Text>
          </View>
        </View>

        {/* Report period toggle + stats */}
        <View style={styles.sectionHeader}>
          <View style={styles.periodToggle}>
            <Pressable
              style={[styles.periodBtn, reportPeriod === 'month' && styles.periodBtnActive]}
              onPress={() => setReportPeriod('month')}
            >
              <Text style={[styles.periodBtnTxt, reportPeriod === 'month' && styles.periodBtnTxtActive]}>شهر</Text>
            </Pressable>
            <Pressable
              style={[styles.periodBtn, reportPeriod === 'week' && styles.periodBtnActive]}
              onPress={() => setReportPeriod('week')}
            >
              <Text style={[styles.periodBtnTxt, reportPeriod === 'week' && styles.periodBtnTxtActive]}>أسبوع</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionTitle}>ملخص التقرير</Text>
        </View>

        <View style={styles.reportGrid}>
          {[
            { val: `${userProfile.currentWeight}`, unit: 'كغ', lbl: 'الوزن الحالي', hint: `الهدف ${userProfile.targetWeight}`, color: colors.primary },
            { val: `${latestBodyFat}`, unit: '%', lbl: 'دهون الجسم', hint: 'آخر قياس', color: '#7C5CBF' },
            { val: `${totalRunKm.toFixed(1)}`, unit: 'كم', lbl: 'إجمالي الجري', hint: `${runHistory.length} رحلة`, color: '#1A9ECC' },
            { val: `${totalCaloriesBurned}`, unit: 'سعرة', lbl: 'سعرات محروقة', hint: 'هذا الأسبوع', color: colors.warning }
          ].map((r) => (
            <View key={r.lbl} style={styles.reportCard}>
              <View style={styles.reportTopRow}>
                <Text style={[styles.reportUnit, { color: r.color }]}>{r.unit}</Text>
                <Text style={[styles.reportVal, { color: r.color }]}>{r.val}</Text>
              </View>
              <Text style={styles.reportLbl}>{r.lbl}</Text>
              <Text style={styles.reportHint}>{r.hint}</Text>
            </View>
          ))}
        </View>

        {/* Body weight mini chart */}
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartHint}>كغ</Text>
            <Text style={styles.sectionTitle}>تطور الوزن</Text>
          </View>
          <MiniBarChart />
        </View>

        {/* Health summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryHealth}>{healthSnapshot.readinessPercent}%</Text>
            <Text style={styles.summaryHealthLbl}>جاهزية</Text>
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryTitle}>الحالة الصحية</Text>
            <Text style={styles.summaryTxt}>
              نوم {healthSnapshot.sleepHours} ساعة • نبض {healthSnapshot.heartRate} نبضة/دقيقة
            </Text>
            <Text style={styles.summaryTxt}>
              {injuries.length > 0 ? `${injuries.length} تنبيه صحي نشط` : 'لا توجد إصابات نشطة ✓'}
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>الإنجازات</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.id} style={[styles.achieveCard, !a.earned && styles.achieveCardLocked]}>
              <Text style={styles.achieveIcon}>{a.icon}</Text>
              <Text style={[styles.achieveTitle, !a.earned && styles.achieveTextLocked]}>{a.title}</Text>
              <Text style={[styles.achieveDesc, !a.earned && styles.achieveTextLocked]}>{a.desc}</Text>
              {a.earned && (
                <View style={styles.achieveEarnedBadge}>
                  <Text style={styles.achieveEarnedTxt}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>الإجراءات السريعة</Text>
        {[
          { title: 'إدارة الفريق الصحي', sub: 'اختر مدربك وأخصائيي التغذية والعلاج', route: 'TeamSelection', color: colors.primary },
          { title: 'التقدم التفصيلي', sub: 'الوزن، الخطوات، الجري والتمارين', route: 'Progress', color: '#1A9ECC' },
          { title: 'ملف الاستشفاء', sub: 'الإصابات والملاحظات الطبية', route: 'Recovery', color: '#7C5CBF' }
        ].map((action) => (
          <Pressable key={action.route} style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]} onPress={() => navigation.navigate(action.route)}>
            <Text style={[styles.actionArrow, { color: action.color }]}>←</Text>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSub}>{action.sub}</Text>
            </View>
            <View style={[styles.actionDot, { backgroundColor: action.color }]} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const chart = StyleSheet.create({
  wrap: { flexDirection: 'row-reverse', gap: 8, height: 120, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: '70%', height: 80, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  val: { color: colors.text, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  lbl: { color: colors.muted, fontSize: 9, marginTop: 4, textAlign: 'center' }
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },

  hero: { borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.lg },
  heroTopRow: { flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroInfo: { flex: 1, alignItems: 'flex-end' },
  heroName: { color: '#fff', ...typography.h1 },
  heroEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 },
  heroGoalPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  heroGoalTxt: { color: '#FFD3B8', fontSize: 12, fontWeight: '700' },
  heroStats: { flexDirection: 'row-reverse', gap: 6 },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, paddingVertical: 10 },
  heroStatVal: { color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: 16 },
  heroStatLbl: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 10, marginTop: 2 },

  weightCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  weightTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
  weightRight: { alignItems: 'flex-end' },
  weightLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  weightCurrent: { color: colors.text, fontSize: 18, fontWeight: '900' },
  weightTarget: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  weightBarTrack: { height: 10, backgroundColor: colors.line, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  weightBarFill: { height: 10, borderRadius: 5 },
  weightBottomRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  weightPct: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  weightRemain: { color: colors.muted, fontSize: 12 },

  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right' },
  periodToggle: { flexDirection: 'row-reverse', backgroundColor: colors.line, borderRadius: radius.pill, padding: 3 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill },
  periodBtnActive: { backgroundColor: colors.card, ...shadows.sm },
  periodBtnTxt: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  periodBtnTxtActive: { color: colors.text },

  reportGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginBottom: spacing.sm },
  reportCard: { width: '48%', backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: spacing.md, ...shadows.sm },
  reportTopRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 },
  reportVal: { fontSize: 26, fontWeight: '900' },
  reportUnit: { fontSize: 12, fontWeight: '700' },
  reportLbl: { color: colors.text, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  reportHint: { color: colors.muted, fontSize: 11, textAlign: 'right', marginTop: 2 },

  chartCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  chartHint: { color: colors.muted, fontSize: 12 },

  summaryCard: { backgroundColor: '#FFF7F2', borderRadius: radius.xl, borderWidth: 1, borderColor: '#FFE1D6', padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center' },
  summaryLeft: { alignItems: 'center' },
  summaryHealth: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  summaryHealthLbl: { color: colors.muted, fontSize: 10 },
  summaryBody: { flex: 1, alignItems: 'flex-end' },
  summaryTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  summaryTxt: { color: colors.muted, fontSize: 12, textAlign: 'right', marginTop: 3, lineHeight: 18 },

  achievementsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginTop: spacing.sm, marginBottom: spacing.sm },
  achieveCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
    position: 'relative'
  },
  achieveCardLocked: { backgroundColor: '#F5F5F5', borderColor: '#E8E8E8', opacity: 0.65 },
  achieveIcon: { fontSize: 24, marginBottom: 6 },
  achieveTitle: { color: colors.text, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  achieveDesc: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: 3, lineHeight: 13 },
  achieveTextLocked: { color: '#B0B0B0' },
  achieveEarnedBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center'
  },
  achieveEarnedTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },

  actionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm
  },
  actionArrow: { fontSize: 18, fontWeight: '800' },
  actionBody: { flex: 1, alignItems: 'flex-end' },
  actionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'right' },
  actionSub: { color: colors.muted, fontSize: 12, textAlign: 'right', marginTop: 3, lineHeight: 18 },
  actionDot: { width: 8, height: 8, borderRadius: 4 }
});
