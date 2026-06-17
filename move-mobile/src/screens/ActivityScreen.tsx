import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { healthSnapshot, runHistory, weeklyProgress, weeklyWorkout } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

const CALORIE_GOAL     = 2000;
const CALORIES_CONSUMED = 1240;
const WATER_GOAL_ML    = 2000;
const WATER_STEP_ML    = 250;
const CUPS_TOTAL       = 8;

let _waterMl   = 1250;
let _weightKg: number | null = 82.4;

// ─── Fade + Slide Entrance ────────────────────────────────────────────────────
function FadeSlide({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const translateY = useSharedValue(24);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 110 }));
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

// ─── Animated Water Cup ───────────────────────────────────────────────────────
function WaterCup({
  filled,
  onPress,
  primaryColor,
}: {
  filled: boolean;
  onPress: () => void;
  primaryColor: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.35, { damping: 6, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }, animStyle]}>
        <Ionicons
          name={filled ? 'water' : 'water-outline'}
          size={16}
          color={filled ? primaryColor : 'rgba(255,255,255,0.25)'}
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Calorie Progress Bar ─────────────────────────────────────────────────────
function CalProgressBar({ pct }: { pct: number }) {
  const { theme: t } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(Math.min(pct, 100), { duration: 900, easing: Easing.out(Easing.ease) }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={bar.track}>
      <Animated.View style={[bar.fillBase, barStyle]}>
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const bar = StyleSheet.create({
  track:    { height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2, overflow: 'hidden', marginTop: spacing.xs },
  fillBase: { height: 4, borderRadius: 2, overflow: 'hidden' },
});

// ─── Activity Screen ──────────────────────────────────────────────────────────
export function ActivityScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const todayWorkout = weeklyWorkout.find((w) => !w.completed) || weeklyWorkout[0];
  const lastRun      = runHistory[0];
  const todaySteps   = weeklyProgress[0];
  const stepsGoalPct = Math.round((todaySteps.steps / todaySteps.stepsGoal) * 100);
  const calPct       = Math.round((CALORIES_CONSUMED / CALORIE_GOAL) * 100);

  const [waterMl,       setWaterMl]       = useState(_waterMl);
  const [weightKg,      setWeightKg]      = useState<number | null>(_weightKg);
  const [weightInput,   setWeightInput]   = useState(_weightKg !== null ? String(_weightKg) : '');
  const [editingWeight, setEditingWeight] = useState(false);

  const cupsFilled = Math.floor(waterMl / WATER_STEP_ML);
  const waterPct   = Math.round((waterMl / WATER_GOAL_ML) * 100);

  const addWater    = () => { const n = Math.min(waterMl + WATER_STEP_ML, WATER_GOAL_ML); _waterMl = n; setWaterMl(n); };
  const removeWater = () => { const n = Math.max(waterMl - WATER_STEP_ML, 0); _waterMl = n; setWaterMl(n); };

  const saveWeight = () => {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) { _weightKg = val; setWeightKg(val); }
    setEditingWeight(false);
  };

  const dayStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.04,
    shadowRadius: 5,
    elevation: 1,
  };

  // Animated water bar
  const waterBarWidth = useSharedValue((waterPct));
  useEffect(() => {
    waterBarWidth.value = withTiming(waterPct, { duration: 600, easing: Easing.out(Easing.ease) });
  }, [waterPct]);
  const waterBarStyle = useAnimatedStyle(() => ({ width: `${waterBarWidth.value}%` as any }));

  // Animated steps stat fills
  const stats = [
    { val: `${todaySteps.steps.toLocaleString()}`, lbl: 'خطوة', pct: stepsGoalPct },
    { val: `${healthSnapshot.sleepHours} س`,       lbl: 'نوم',   pct: Math.round((healthSnapshot.sleepHours / 8) * 100) },
    { val: `${healthSnapshot.heartRate}`,           lbl: 'نبض',   pct: 72 },
  ];

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <FadeSlide delay={0}>
          <View style={st.header}>
            <Text style={[st.date, { color: t.muted }]}>{dayStr}</Text>
            <Text style={[st.title, { color: t.text }]}>النشاط</Text>
          </View>
        </FadeSlide>

        {/* ── WORKOUT TILE ── */}
        <FadeSlide delay={80}>
          <Pressable
            style={[st.workoutTile, { backgroundColor: t.accentSurface, borderColor: t.accentBorder }]}
            onPress={() => navigation.navigate('Workout', { workoutId: todayWorkout.id })}
          >
            <View style={st.tileTopRow}>
              <View style={[st.tileBadge, { backgroundColor: t.primary }]}>
                <Text style={st.tileBadgeText}>{todayWorkout.completed ? 'مكتمل ✓' : 'اليوم'}</Text>
              </View>
              <Text style={[st.tileEyebrow, { color: t.accentMuted }]}>التمرين</Text>
            </View>
            <Text style={[st.workoutName, { color: t.accentText }]}>{todayWorkout.title}</Text>
            <Text style={[st.workoutMeta, { color: t.accentSubtext }]}>
              {todayWorkout.durationMin} دقيقة · {todayWorkout.exercises?.length ?? 0} تمارين · {todayWorkout.coachName}
            </Text>
            <LinearGradient
              colors={todayWorkout.completed ? ['#888', '#666'] : [t.primary, t.primary]}
              style={st.workoutBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={todayWorkout.completed ? 'checkmark-circle' : 'flash'}
                size={14}
                color={todayWorkout.completed ? t.success : '#fff'}
              />
              <Text style={[st.workoutBtnText, todayWorkout.completed && { color: t.muted }]}>
                {todayWorkout.completed ? 'عرض التمرين' : 'ابدأ التمرين'}
              </Text>
            </LinearGradient>
          </Pressable>
        </FadeSlide>

        {/* ── NUTRITION ── */}
        <FadeSlide delay={160}>
          <Pressable
            style={[st.nutritionTile, { backgroundColor: t.accentSurface, borderWidth: 1, borderColor: t.accentBorder }]}
            onPress={() => navigation.navigate('Nutrition')}
          >
            <View style={st.nutritionRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="chevron-back" size={11} color={t.accentMuted} />
                <Text style={[st.dualAction, { color: t.accentMuted }]}>تسجيل وجبة</Text>
              </View>
              <View style={st.nutritionRight}>
                <Text style={[st.dualNumber, { color: t.accentText }]}>{CALORIES_CONSUMED.toLocaleString()}</Text>
                <Text style={[st.nutritionLabel, { color: t.accentMuted }]}>التغذية · / {CALORIE_GOAL.toLocaleString()} سعرة</Text>
              </View>
            </View>
            <CalProgressBar pct={calPct} />
          </Pressable>
        </FadeSlide>

        {/* ── RECOVERY — commented out, focus on athletic community ──
        <FadeSlide delay={160}>
          <Pressable
            style={[st.dualTile, { backgroundColor: t.accentSurface, borderWidth: 1, borderColor: t.accentBorder }]}
            onPress={() => navigation.navigate('Recovery')}
          >
            <Text style={[st.dualEyebrow, { color: t.accentMuted }]}>الاستشفاء</Text>
            <Text style={[st.dualNumber, { color: t.accentText }]}>{readiness}%</Text>
            <Text style={[st.dualUnit, { color: t.accentMuted }]}>جاهزية اليوم</Text>
            <CalProgressBar pct={readiness} />
          </Pressable>
        </FadeSlide>
        ── */}

        {/* ── WATER ── */}
        <FadeSlide delay={240}>
          <View style={[st.waterTile, { backgroundColor: t.accentSurface, borderWidth: 1, borderColor: t.accentBorder }]}>
            <View style={st.waterHeader}>
              <Pressable
                style={[st.waterAdjBtn, { backgroundColor: waterMl <= 0 ? 'rgba(255,255,255,0.1)' : t.primary }]}
                onPress={removeWater}
                disabled={waterMl <= 0}
              >
                <Text style={st.waterAdjText}>−</Text>
              </Pressable>
              <View style={st.waterCenter}>
                <Text style={[st.waterEyebrow, { color: t.accentMuted }]}>المياه</Text>
                <Text style={[st.waterAmount, { color: t.accentText }]}>
                  {waterMl >= 1000 ? `${(waterMl / 1000).toFixed(1)} ل` : `${waterMl} مل`}
                </Text>
                <Text style={[st.waterGoal, { color: t.accentMuted }]}>الهدف {WATER_GOAL_ML / 1000} لتر</Text>
              </View>
              <Pressable
                style={[st.waterAdjBtn, { backgroundColor: waterMl >= WATER_GOAL_ML ? 'rgba(255,255,255,0.1)' : t.primary }]}
                onPress={addWater}
                disabled={waterMl >= WATER_GOAL_ML}
              >
                <Text style={st.waterAdjText}>+</Text>
              </Pressable>
            </View>

            {/* Animated tap cups */}
            <View style={st.cupsRow}>
              {Array.from({ length: CUPS_TOTAL }).map((_, i) => (
                <WaterCup
                  key={i}
                  filled={i < cupsFilled}
                  primaryColor={t.primary}
                  onPress={() => {
                    const next = (i + 1) * WATER_STEP_ML;
                    _waterMl = next;
                    setWaterMl(next);
                  }}
                />
              ))}
            </View>

            {/* Animated water progress bar */}
            <View style={st.waterBarTrack}>
              <Animated.View style={[st.waterBarFill, waterBarStyle, { backgroundColor: t.primary }]} />
            </View>
            <Text style={[st.waterPct, { color: t.accentMuted }]}>{waterPct}% من الهدف اليومي</Text>
          </View>
        </FadeSlide>

        {/* ── WEIGHT ── */}
        <FadeSlide delay={320}>
          <View style={[st.weightTile, { backgroundColor: t.card }, cardShadow]}>
            <View style={st.weightHeader}>
              <Text style={[st.weightEyebrow, { color: t.muted }]}>الوزن</Text>
              {!editingWeight && (
                <Pressable onPress={() => { setWeightInput(weightKg !== null ? String(weightKg) : ''); setEditingWeight(true); }}>
                  <Text style={[st.weightEditBtn, { color: t.primary }]}>تعديل</Text>
                </Pressable>
              )}
            </View>

            {editingWeight ? (
              <View style={st.weightInputRow}>
                <Pressable style={st.weightSaveBtn} onPress={saveWeight}>
                  <Text style={st.weightSaveBtnText}>حفظ</Text>
                </Pressable>
                <TextInput
                  style={[st.weightInput, { backgroundColor: t.cardSoft, color: t.text, borderColor: t.primary }]}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholder="00.0"
                  placeholderTextColor={t.muted}
                  textAlign="center"
                  onSubmitEditing={saveWeight}
                  autoFocus
                />
                <Text style={[st.weightKgLabel, { color: t.muted }]}>كغ</Text>
              </View>
            ) : (
              <View style={st.weightDisplay}>
                {weightKg !== null ? (
                  <>
                    <Text style={[st.weightValue, { color: t.text }]}>{weightKg}</Text>
                    <Text style={[st.weightUnit, { color: t.muted }]}>كغ</Text>
                  </>
                ) : (
                  <Text style={[st.weightEmpty, { color: t.muted }]}>لم يتم التسجيل اليوم</Text>
                )}
              </View>
            )}
            <Text style={[st.weightNote, { color: t.muted }]}>سجّل وزنك يومياً لتتابع تقدمك</Text>
          </View>
        </FadeSlide>

        {/* ── RUN TILE ── */}
        <FadeSlide delay={400}>
          <Pressable style={[st.runTile, { backgroundColor: t.card }, cardShadow]} onPress={() => navigation.navigate('Run')}>
            <View style={st.runLeft}>
              <Text style={[st.tileEyebrowDark, { color: t.muted }]}>الجري</Text>
              {lastRun ? (
                <>
                  <Text style={[st.runDist, { color: t.text }]}>
                    {lastRun.distanceKm} <Text style={st.runDistUnit}>كم</Text>
                  </Text>
                  <Text style={[st.runMeta, { color: t.muted }]}>
                    آخر جري · {Math.floor(lastRun.durationSec / 60)} دقيقة · {lastRun.calories} سعرة
                  </Text>
                </>
              ) : (
                <Text style={[st.runMeta, { color: t.muted }]}>لم تسجل أي جري بعد</Text>
              )}
            </View>
            <View style={[st.runBtn, { backgroundColor: '#111111' }]}>
              <Text style={st.runBtnText}>ابدأ{'\n'}جري</Text>
            </View>
          </Pressable>
        </FadeSlide>

        {/* ── QUICK STATS ── */}
        <FadeSlide delay={480}>
          <Text style={[st.sectionLabel, { color: t.muted }]}>أرقام اليوم</Text>
          <View style={st.statsRow}>
            {stats.map((s, i) => (
              <StatTile key={s.lbl} stat={s} delay={480 + i * 60} t={t} cardShadow={cardShadow} />
            ))}
          </View>
        </FadeSlide>

        {/* ── PROGRESS LINK ── */}
        <FadeSlide delay={600}>
          <Pressable
            style={[st.progressLink, { backgroundColor: t.card }, cardShadow]}
            onPress={() => navigation.navigate('Progress')}
          >
            <Ionicons name="chevron-back" size={16} color={t.primary} />
            <Text style={[st.progressLinkText, { color: t.text }]}>عرض تقرير التقدم التفصيلي</Text>
          </Pressable>
        </FadeSlide>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Tile with animated fill ────────────────────────────────────────────
function StatTile({
  stat,
  delay,
  t,
  cardShadow,
}: {
  stat: { val: string; lbl: string; pct: number };
  delay: number;
  t: any;
  cardShadow: any;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(stat.pct, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={[st.statTile, { backgroundColor: t.card }, cardShadow]}>
      <Text style={[st.statVal, { color: t.text }]}>{stat.val}</Text>
      <Text style={[st.statLbl, { color: t.muted }]}>{stat.lbl}</Text>
      <View style={[st.miniTrack, { backgroundColor: t.line }]}>
        <Animated.View style={[st.miniFill, barStyle, { backgroundColor: t.primary }]} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  header: { alignItems: 'flex-end', marginBottom: spacing.md },
  title:  { fontSize: 32, fontWeight: '900', lineHeight: 36 },
  date:   { fontSize: 11, marginBottom: 4 },

  workoutTile: {
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  tileTopRow:    { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  tileEyebrow:   { fontSize: 12, fontWeight: '600' },
  tileBadge:     { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  tileBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  workoutName:   { fontSize: 22, fontWeight: '900', textAlign: 'right', marginBottom: 6 },
  workoutMeta:   { fontSize: 13, textAlign: 'right', marginBottom: spacing.md },
  workoutBtn:    { borderRadius: 10, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  workoutBtnText:{ color: '#fff', fontSize: 13, fontWeight: '900' },

  dualRow:      { flexDirection: 'row-reverse', gap: spacing.sm, marginBottom: spacing.sm },
  dualTile:     { flex: 1, borderRadius: 20, padding: spacing.md, minHeight: 150 },
  dualEyebrow:  { fontSize: 11, fontWeight: '600', textAlign: 'right', marginBottom: spacing.xs },
  dualNumber:   { fontSize: 32, fontWeight: '900', textAlign: 'right' },
  dualUnit:     { fontSize: 11, textAlign: 'right', marginTop: 2 },
  dualAction:   { fontSize: 12, fontWeight: '600', textAlign: 'right' },
  nutritionTile: { borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm },
  nutritionRow:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.xs },
  nutritionRight:{ alignItems: 'flex-end' },
  nutritionLabel:{ fontSize: 12, marginTop: 2, textAlign: 'right' },

  waterTile:    { borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm },
  waterHeader:  { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  waterCenter:  { alignItems: 'center', flex: 1 },
  waterEyebrow: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  waterAmount:  { fontSize: 28, fontWeight: '900' },
  waterGoal:    { fontSize: 11, marginTop: 1 },
  waterAdjBtn:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  waterAdjText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  cupsRow:      { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: spacing.sm },
  waterBarTrack:{ height: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  waterBarFill: { height: 5, borderRadius: 3 },
  waterPct:     { fontSize: 11, fontWeight: '600', textAlign: 'right' },

  weightTile:      { borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm },
  weightHeader:    { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  weightEyebrow:   { fontSize: 11, fontWeight: '700' },
  weightEditBtn:   { fontSize: 12, fontWeight: '700' },
  weightDisplay:   { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6, marginBottom: spacing.xs },
  weightValue:     { fontSize: 42, fontWeight: '900' },
  weightUnit:      { fontSize: 16, fontWeight: '600' },
  weightEmpty:     { fontSize: 16, fontWeight: '600', paddingVertical: 8 },
  weightInputRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  weightInput:     { flex: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, fontSize: 22, fontWeight: '800', borderWidth: 1.5 },
  weightKgLabel:   { fontSize: 16, fontWeight: '600' },
  weightSaveBtn:   { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  weightSaveBtnText:{ color: '#fff', fontWeight: '800', fontSize: 13 },
  weightNote:      { fontSize: 12, textAlign: 'right' },

  runTile:        { borderRadius: 14, padding: spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  runLeft:        { flex: 1 },
  tileEyebrowDark:{ fontSize: 11, fontWeight: '600', marginBottom: spacing.xs },
  runDist:        { fontSize: 32, fontWeight: '900' },
  runDistUnit:    { fontSize: 16, fontWeight: '700' },
  runMeta:        { fontSize: 12, marginTop: 4 },
  runBtn:         { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, alignItems: 'center' },
  runBtnText:     { color: '#fff', fontSize: 13, fontWeight: '900', textAlign: 'center', lineHeight: 18 },

  sectionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow:  { flexDirection: 'row-reverse', gap: spacing.sm, marginBottom: spacing.sm },
  statTile:  { flex: 1, borderRadius: 16, padding: spacing.sm, alignItems: 'flex-end' },
  statVal:   { fontSize: 18, fontWeight: '900' },
  statLbl:   { fontSize: 10, marginTop: 2 },
  miniTrack: { height: 3, width: '100%', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  miniFill:  { height: 3, borderRadius: 2 },

  progressLink:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 16, padding: spacing.md },
  progressLinkText: { fontWeight: '700', fontSize: 14 },
});
