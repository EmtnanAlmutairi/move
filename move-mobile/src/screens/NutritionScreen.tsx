import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { professionals, todayMeals, userProfile } from '../data/mockData';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const CALORIE_GOAL = 2200;
const PROTEIN_GOAL = 160;
const CARBS_GOAL = 220;
const FAT_GOAL = 70;
const WATER_GOAL = 8;

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'الإفطار',
  lunch: 'الغداء',
  dinner: 'العشاء',
  snack: 'وجبة خفيفة'
};

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / goal, 1);
  return (
    <View style={bar.wrap}>
      <View style={bar.labelRow}>
        <Text style={bar.value}>{value}ج</Text>
        <Text style={bar.label}>{label}</Text>
      </View>
      <View style={bar.track}>
        <LinearGradient
          colors={[color, color + 'AA']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={[bar.fill, { width: `${pct * 100}%` }]}
        />
      </View>
      <Text style={bar.goal}>من {goal}ج</Text>
    </View>
  );
}

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const pct = Math.min(consumed / goal, 1);
  const remaining = Math.max(goal - consumed, 0);
  const SIZE = 140;
  const STROKE = 12;
  const INNER = SIZE - STROKE * 2;
  const ARC_DEGREES = pct * 360;

  return (
    <View style={[ring.wrap, { width: SIZE, height: SIZE }]}>
      <View style={[ring.outer, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
        <View style={[ring.track, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]} />
        {pct > 0 && (
          <View style={[ring.fillWrap, { width: SIZE, height: SIZE }]}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={[
                ring.fillArc,
                {
                  width: SIZE,
                  height: SIZE,
                  borderRadius: SIZE / 2,
                  opacity: 1
                }
              ]}
            />
            {pct < 1 && (
              <View
                style={[
                  ring.mask,
                  {
                    width: SIZE,
                    height: SIZE,
                    borderRadius: SIZE / 2,
                    transform: [{ rotate: `${ARC_DEGREES}deg` }]
                  }
                ]}
              />
            )}
          </View>
        )}
        <View style={[ring.inner, { width: INNER, height: INNER, borderRadius: INNER / 2 }]}>
          <Text style={ring.consumed}>{consumed}</Text>
          <Text style={ring.unit}>سعرة</Text>
          <Text style={ring.remain}>باقي {remaining}</Text>
        </View>
      </View>
    </View>
  );
}

export function NutritionScreen({ navigation }: any) {
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set(['m1']));
  const [waterCups, setWaterCups] = useState(3);

  const nutritionist = professionals.find((p) => p.id === userProfile.selectedNutritionistId);

  const consumedCalories = todayMeals
    .filter((m) => completedMeals.has(m.id))
    .reduce((sum, m) => sum + m.calories, 0);

  const consumed = {
    protein: todayMeals.filter((m) => completedMeals.has(m.id)).reduce((s, m) => s + (m.protein ?? 0), 0),
    carbs: todayMeals.filter((m) => completedMeals.has(m.id)).reduce((s, m) => s + (m.carbs ?? 0), 0),
    fat: todayMeals.filter((m) => completedMeals.has(m.id)).reduce((s, m) => s + (m.fat ?? 0), 0)
  };

  const toggleMeal = (id: string) => {
    setCompletedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation?.goBack?.()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>التغذية</Text>
            <Text style={styles.title}>خطة اليوم</Text>
          </View>
        </View>

        {/* Calorie summary card */}
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.summaryCard} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
          <View style={styles.summaryInner}>
            <CalorieRing consumed={consumedCalories} goal={CALORIE_GOAL} />
            <View style={styles.macrosBars}>
              <MacroBar label="بروتين" value={consumed.protein} goal={PROTEIN_GOAL} color="#fff" />
              <MacroBar label="كربوهيدرات" value={consumed.carbs} goal={CARBS_GOAL} color="#FFE0A3" />
              <MacroBar label="دهون" value={consumed.fat} goal={FAT_GOAL} color="#FFB3A7" />
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>{CALORIE_GOAL}</Text>
              <Text style={styles.kpiLbl}>الهدف</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>{consumedCalories}</Text>
              <Text style={styles.kpiLbl}>مستهلك</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>{Math.max(CALORIE_GOAL - consumedCalories, 0)}</Text>
              <Text style={styles.kpiLbl}>متبقي</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Water tracker */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Text style={styles.waterPct}>{waterCups}/{WATER_GOAL} كوب</Text>
            <Text style={styles.sectionTitle}>شرب الماء 💧</Text>
          </View>
          <View style={styles.waterCups}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <Pressable key={i} onPress={() => setWaterCups(i < waterCups ? i : i + 1)}>
                <Text style={[styles.cup, i < waterCups && styles.cupFilled]}>
                  {i < waterCups ? '💧' : '○'}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.waterBarTrack}>
            <LinearGradient
              colors={['#56CCF2', '#1A9ECC']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[styles.waterBarFill, { width: `${(waterCups / WATER_GOAL) * 100}%` }]}
            />
          </View>
        </View>

        {/* Nutritionist tip */}
        {nutritionist && (
          <View style={styles.tipCard}>
            <View style={styles.tipLeft}>
              <View style={[styles.tipAvatar, { backgroundColor: nutritionist.avatarColor + '22' }]}>
                <Text style={[styles.tipAvatarText, { color: nutritionist.avatarColor }]}>{nutritionist.avatarInitials}</Text>
              </View>
            </View>
            <View style={styles.tipBody}>
              <Text style={styles.tipName}>{nutritionist.name}</Text>
              <Text style={styles.tipRole}>أخصائية التغذية</Text>
              <Text style={styles.tipText}>احرص على تناول وجبة غنية بالبروتين خلال 30 دقيقة بعد التمرين لتسريع الاستشفاء العضلي.</Text>
            </View>
            <View style={[styles.tipAccent, { backgroundColor: nutritionist.avatarColor }]} />
          </View>
        )}

        {/* Meals section */}
        <View style={styles.mealsHeader}>
          <Pressable style={styles.addMealBtn}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.addMealGrad}>
              <Text style={styles.addMealText}>+ إضافة وجبة</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.sectionTitle}>وجبات اليوم</Text>
        </View>

        {todayMeals.map((meal) => {
          const done = completedMeals.has(meal.id);
          return (
            <Pressable key={meal.id} onPress={() => toggleMeal(meal.id)}>
              <View style={[styles.mealCard, done && styles.mealCardDone]}>
                <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
                  {done && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Image source={{ uri: meal.image }} style={[styles.mealImg, done && styles.mealImgDone]} />
                <View style={styles.mealBody}>
                  <View style={styles.mealTopRow}>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                    <Text style={styles.mealTypeTag}>{MEAL_TYPE_LABELS[meal.mealType] ?? meal.mealType}</Text>
                  </View>
                  <Text style={[styles.mealTitle, done && styles.mealTitleDone]}>{meal.title}</Text>
                  <View style={styles.mealMacros}>
                    <View style={styles.macroTag}>
                      <Text style={[styles.macroTagText, { color: '#E74424' }]}>{meal.fat ?? 0}ج د</Text>
                    </View>
                    <View style={styles.macroTag}>
                      <Text style={[styles.macroTagText, { color: '#F79A3E' }]}>{meal.carbs ?? 0}ج ك</Text>
                    </View>
                    <View style={styles.macroTag}>
                      <Text style={[styles.macroTagText, { color: '#30B36A' }]}>{meal.protein ?? 0}ج ب</Text>
                    </View>
                    <Text style={styles.mealCal}>{meal.calories} سعرة</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Daily plan summary */}
        <View style={styles.planSummary}>
          <Text style={styles.planSummaryTitle}>ملخص الخطة اليومية</Text>
          <View style={styles.planRow}>
            <Text style={styles.planVal}>{PROTEIN_GOAL}ج</Text>
            <Text style={styles.planKey}>بروتين مستهدف</Text>
          </View>
          <View style={styles.planRow}>
            <Text style={styles.planVal}>{CARBS_GOAL}ج</Text>
            <Text style={styles.planKey}>كربوهيدرات مستهدفة</Text>
          </View>
          <View style={styles.planRow}>
            <Text style={styles.planVal}>{FAT_GOAL}ج</Text>
            <Text style={styles.planKey}>دهون مستهدفة</Text>
          </View>
          <View style={[styles.planRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.planVal}>{CALORIE_GOAL}</Text>
            <Text style={styles.planKey}>سعرات إجمالية</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 10 },
  labelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  value: { color: '#fff', fontSize: 12, fontWeight: '800' },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  goal: { color: 'rgba(255,255,255,0.55)', fontSize: 10, textAlign: 'right', marginTop: 2 }
});

const ring = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  outer: { alignItems: 'center', justifyContent: 'center' },
  track: {
    position: 'absolute',
    borderWidth: 12,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  fillWrap: { position: 'absolute', overflow: 'hidden' },
  fillArc: { position: 'absolute' },
  mask: {
    position: 'absolute',
    backgroundColor: colors.gradientStart,
    top: 0,
    right: 0,
    width: '50%',
    height: '100%'
  },
  inner: {
    backgroundColor: colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0
  },
  consumed: { color: '#fff', fontSize: 26, fontWeight: '900' },
  unit: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  remain: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2 }
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 100 },

  headerRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', marginBottom: spacing.md },
  back: { fontSize: 22, color: colors.primary, paddingLeft: spacing.sm },
  headerText: { flex: 1, alignItems: 'flex-end' },
  kicker: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  title: { ...typography.h1, color: colors.text },

  summaryCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md
  },
  summaryInner: { flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  macrosBars: { flex: 1 },
  kpiRow: { flexDirection: 'row-reverse', justifyContent: 'space-around' },
  kpi: { alignItems: 'center' },
  kpiVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  kpiLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  kpiDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 30, alignSelf: 'center' },

  waterCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  waterHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  waterPct: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  waterCups: { flexDirection: 'row-reverse', gap: 4, marginBottom: spacing.sm, flexWrap: 'wrap' },
  cup: { fontSize: 22, color: colors.line },
  cupFilled: { color: '#1A9ECC' },
  waterBarTrack: { height: 6, backgroundColor: colors.line, borderRadius: 3, overflow: 'hidden' },
  waterBarFill: { height: 6, borderRadius: 3 },

  tipCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    ...shadows.sm,
    overflow: 'hidden'
  },
  tipAccent: { width: 4, borderRadius: 2, position: 'absolute', left: 0, top: 0, bottom: 0 },
  tipLeft: {},
  tipAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tipAvatarText: { fontWeight: '800', fontSize: 15 },
  tipBody: { flex: 1, alignItems: 'flex-end' },
  tipName: { color: colors.text, fontWeight: '800', fontSize: 14 },
  tipRole: { color: colors.primary, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  tipText: { color: colors.muted, fontSize: 13, textAlign: 'right', lineHeight: 19 },

  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right' },
  mealsHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  addMealBtn: { borderRadius: radius.pill, overflow: 'hidden' },
  addMealGrad: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  addMealText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  mealCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'center',
    ...shadows.sm
  },
  mealCardDone: { backgroundColor: '#F4FCF7', borderColor: '#B8EDD0' },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkCircleDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '900' },
  mealImg: { width: 72, height: 72, borderRadius: radius.md },
  mealImgDone: { opacity: 0.65 },
  mealBody: { flex: 1, alignItems: 'flex-end' },
  mealTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', width: '100%', marginBottom: 3 },
  mealTypeTag: { backgroundColor: colors.cardSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, color: colors.primary, fontSize: 10, fontWeight: '700' },
  mealTime: { color: colors.muted, fontSize: 11 },
  mealTitle: { color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'right' },
  mealTitleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  mealCal: { color: colors.text, fontSize: 13, fontWeight: '800' },
  mealMacros: { flexDirection: 'row-reverse', gap: 6, marginTop: 5, alignItems: 'center' },
  macroTag: { backgroundColor: '#F7F4EF', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  macroTagText: { fontSize: 10, fontWeight: '700' },

  planSummary: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm
  },
  planSummaryTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: spacing.sm },
  planRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  planKey: { color: colors.muted, fontSize: 14 },
  planVal: { color: colors.text, fontSize: 14, fontWeight: '800' }
});
