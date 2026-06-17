import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bodyMeasurements, runHistory, weeklyProgress, weeklyWorkout } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { ThemeTokens } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

type Period = 'week' | 'month';

function BarChart({
  data,
  maxVal,
  color,
  goalLine,
  t,
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  maxVal: number;
  color: string;
  goalLine?: number;
  t: ThemeTokens;
}) {
  return (
    <View style={bc.container}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        const goalPct = goalLine && maxVal > 0 ? (goalLine / maxVal) * 100 : null;
        return (
          <View key={i} style={bc.col}>
            <View style={bc.barWrap}>
              {goalPct !== null && (
                <View style={[bc.goalMark, { bottom: `${goalPct}%` as any, backgroundColor: t.warning }]} />
              )}
              {item.highlight ? (
                <LinearGradient
                  colors={[t.gradientEnd, t.gradientStart]}
                  style={[bc.bar, { height: `${pct}%` as any }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ) : (
                <View style={[bc.bar, { height: `${pct}%` as any, backgroundColor: color }]} />
              )}
            </View>
            <Text style={[bc.label, { color: t.muted }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const bc = StyleSheet.create({
  container: { flexDirection: 'row-reverse', alignItems: 'flex-end', height: 130, gap: 5, marginTop: spacing.sm },
  col:       { flex: 1, alignItems: 'center' },
  barWrap:   { flex: 1, width: '100%', justifyContent: 'flex-end', position: 'relative' },
  bar:       { width: '100%', borderRadius: 6, minHeight: 4 },
  goalMark:  { position: 'absolute', left: 0, right: 0, height: 2, zIndex: 1, borderRadius: 1 },
  label:     { fontSize: 10, marginTop: 5, textAlign: 'center' },
});

function ActivityCalendar({ t }: { t: ThemeTokens }) {
  return (
    <View style={cal.row}>
      {weeklyProgress.map((d, i) => {
        const filled = d.workoutDone || (d.runKm ?? 0) > 0;
        return (
          <View key={i} style={cal.col}>
            <View style={[cal.ring, { backgroundColor: filled ? t.primary : t.cardSoft }]}>
              {d.workoutDone
                ? <Ionicons name="checkmark" size={17} color="#fff" />
                : (d.runKm ?? 0) > 0
                ? <Ionicons name="walk-outline" size={15} color="#fff" />
                : null}
            </View>
            {(d.runKm ?? 0) > 0 && (
              <Text style={[cal.km, { color: t.success }]}>{d.runKm?.toFixed(1)}</Text>
            )}
            <Text style={[cal.label, { color: t.muted }]}>{d.dayShort}</Text>
          </View>
        );
      })}
    </View>
  );
}

const cal = StyleSheet.create({
  row:   { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: spacing.md },
  col:   { alignItems: 'center', gap: 4 },
  ring:  { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  km:    { fontSize: 9, fontWeight: '700' },
  label: { fontSize: 10, marginTop: 1 },
});

export function ProgressScreen() {
  const { theme: t } = useTheme();
  const [period, setPeriod] = useState<Period>('week');

  const totalWeekSteps   = weeklyProgress.reduce((s, d) => s + d.steps, 0);
  const totalWeekKm      = weeklyProgress.reduce((s, d) => s + (d.runKm ?? 0), 0);
  const completedWorkouts = weeklyWorkout.filter((w) => w.completed).length;
  const totalCalories    = weeklyProgress.reduce((s, d) => s + d.caloriesBurned, 0);
  const totalRunKm       = runHistory.reduce((s, r) => s + r.distanceKm, 0);

  const stepsData    = weeklyProgress.map((d) => ({ label: d.dayShort, value: d.steps,          highlight: d.steps >= d.stepsGoal }));
  const caloriesData = weeklyProgress.map((d) => ({ label: d.dayShort, value: d.caloriesBurned, highlight: d.caloriesBurned >= 500 }));
  const weightData   = bodyMeasurements.map((m)  => ({ label: m.date,  value: m.weightKg }));

  const latestWeight = bodyMeasurements[bodyMeasurements.length - 1];
  const firstWeight  = bodyMeasurements[0];
  const weightChange = (latestWeight.weightKg - firstWeight.weightKg).toFixed(1);
  const weightDown   = parseFloat(weightChange) < 0;

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#8A7060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TITLE ───────────────────────────────── */}
        <Text style={[st.pageTitle, { color: t.text }]}>تقدمي</Text>

        {/* ── PERIOD SWITCHER ─────────────────────── */}
        <View style={st.periodRow}>
          {(['week', 'month'] as Period[]).map((p) => (
            <Pressable
              key={p}
              style={[
                st.periodChip,
                { backgroundColor: period === p ? t.primary + '14' : t.card, borderColor: period === p ? t.primary : t.line },
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[st.periodTxt, { color: period === p ? t.primary : t.muted }]}>
                {p === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── HERO: ORANGE GRADIENT ───────────────── */}
        <LinearGradient
          colors={[t.gradientStart, '#FF6800', t.gradientEnd]}
          style={st.hero}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={st.heroLabel}>ملخص {period === 'week' ? 'الأسبوع' : 'الشهر'}</Text>
          <View style={st.heroStats}>
            {[
              { val: `${completedWorkouts}/${weeklyWorkout.length}`, lbl: 'تمرينات' },
              { val: totalWeekKm.toFixed(1),                        lbl: 'كم جري'  },
              { val: `${(totalWeekSteps / 1000).toFixed(1)}k`,      lbl: 'خطوات'   },
              { val: String(totalCalories),                         lbl: 'سعرة'    },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <View style={st.heroStat}>
                  <Text style={st.heroStatVal}>{item.val}</Text>
                  <Text style={st.heroStatLbl}>{item.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={st.heroDiv} />}
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* ── STEPS CHART ─────────────────────────── */}
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.cardTitle, { color: t.text }]}>الخطوات اليومية</Text>
          <Text style={[st.cardSub, { color: t.muted }]}>الهدف: 10,000 خطوة</Text>
          <BarChart data={stepsData} maxVal={12000} color={t.primary + '30'} goalLine={10000} t={t} />
        </View>

        {/* ── CALORIES CHART ──────────────────────── */}
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.cardTitle, { color: t.text }]}>السعرات المحروقة</Text>
          <Text style={[st.cardSub, { color: t.muted }]}>الهدف: 500 سعرة</Text>
          <BarChart data={caloriesData} maxVal={700} color={t.primary + '28'} goalLine={500} t={t} />
        </View>

        {/* ── WEIGHT CARD ─────────────────────────── */}
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.cardTitle, { color: t.text }]}>تطور الوزن</Text>
          <View style={st.weightRow}>
            <View style={st.weightRight}>
              <Text style={[st.weightRightLbl, { color: t.muted }]}>دهون الجسم</Text>
              <Text style={[st.weightRightVal, { color: t.primary }]}>{latestWeight.bodyFatPct}%</Text>
            </View>
            <View>
              <Text style={[st.weightCurrent, { color: t.text }]}>
                {latestWeight.weightKg} <Text style={st.weightUnit}>كغ</Text>
              </Text>
              <View style={st.weightChangeRow}>
                <Ionicons
                  name={weightDown ? 'trending-down' : 'trending-up'}
                  size={14}
                  color={weightDown ? t.success : t.primary}
                />
                <Text style={[st.weightChangeTxt, { color: weightDown ? t.success : t.primary }]}>
                  {parseFloat(weightChange) < 0 ? weightChange : `+${weightChange}`} كغ
                </Text>
              </View>
            </View>
          </View>
          <BarChart data={weightData} maxVal={90} color={t.success + '55'} t={t} />
        </View>

        {/* ── RUNNING STATS ───────────────────────── */}
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.cardTitle, { color: t.text }]}>إحصائيات الجري</Text>
          <View style={st.runGrid}>
            {[
              { val: totalRunKm.toFixed(1), lbl: 'إجمالي الكيلومترات' },
              { val: runHistory.length,     lbl: 'جلسات جري' },
              { val: `${Math.round(runHistory.reduce((s, r) => s + r.durationSec, 0) / 60)} د`, lbl: 'إجمالي الوقت' },
              { val: runHistory.reduce((s, r) => s + r.calories, 0), lbl: 'سعرة محروقة' },
            ].map((item, i) => (
              <View key={i} style={st.runStatItem}>
                <Text style={[st.runStatVal, { color: t.primary }]}>{item.val}</Text>
                <Text style={[st.runStatLbl, { color: t.muted }]}>{item.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ACTIVITY CALENDAR ───────────────────── */}
        <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
          <Text style={[st.cardTitle, { color: t.text }]}>أيام النشاط</Text>
          <ActivityCalendar t={t} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  pageTitle: { textAlign: 'right', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36, marginBottom: spacing.md },

  periodRow:  { flexDirection: 'row-reverse', gap: 10, marginBottom: spacing.md },
  periodChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  periodTxt:  { fontWeight: '700', fontSize: 13 },

  // Hero
  hero:        { borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md },
  heroLabel:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'right', marginBottom: spacing.md },
  heroStats:   { flexDirection: 'row-reverse', alignItems: 'center' },
  heroStat:    { flex: 1, alignItems: 'center' },
  heroStatVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroStatLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 3 },
  heroDiv:     { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  card:      { borderRadius: 20, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { textAlign: 'right', fontWeight: '800', fontSize: 16 },
  cardSub:   { textAlign: 'right', fontSize: 12, marginTop: 2 },

  weightRow:       { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.xs },
  weightCurrent:   { fontSize: 40, fontWeight: '900', textAlign: 'right', letterSpacing: -1 },
  weightUnit:      { fontSize: 20, fontWeight: '700' },
  weightChangeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 3 },
  weightChangeTxt: { fontWeight: '700', fontSize: 14 },
  weightRight:     { alignItems: 'center' },
  weightRightLbl:  { fontSize: 12, marginBottom: 2 },
  weightRightVal:  { fontSize: 24, fontWeight: '900' },

  runGrid:     { flexDirection: 'row-reverse', flexWrap: 'wrap', marginTop: spacing.sm },
  runStatItem: { width: '50%', paddingVertical: spacing.sm, alignItems: 'center' },
  runStatVal:  { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  runStatLbl:  { fontSize: 12, marginTop: 2 },
});
