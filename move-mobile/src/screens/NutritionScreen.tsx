import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNutrition } from '../store/nutritionContext';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { radius, shadows, spacing, typography } from '../theme/tokens';
import { MealLog, MealType } from '../types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'الإفطار',
  lunch:     'الغداء',
  dinner:    'العشاء',
  snack:     'وجبة خفيفة',
};

const CATEGORY_ICONS: Record<string, string> = {
  arabic:     'restaurant',
  western:    'leaf',
  snack:      'nutrition',
  drink:      'water',
  supplement: 'medical',
};

// ── Circular Macro Ring (two-half-circle, no SVG) ─────────────────────────────
function MacroRing({ value, goal, color, label, size = 74, thick = 7 }: {
  value: number; goal: number; color: string; label: string; size?: number; thick?: number;
}) {
  const pct      = Math.min(value / goal, 1);
  const half     = size / 2;
  const rightDeg = pct <= 0.5 ? pct * 360 - 180 : 0;
  const leftDeg  = pct > 0.5 ? (pct - 0.5) * 360 - 180 : -180;

  const base: any = {
    position: 'absolute', width: size, height: size,
    borderRadius: half, borderWidth: thick,
  };

  return (
    <View style={{ width: size, height: size }}>
      <View style={[base, { borderColor: 'rgba(255,255,255,0.15)' }]} />

      {/* right half (0% → 50%) */}
      <View style={{ position: 'absolute', width: half, height: size, right: 0, overflow: 'hidden' }}>
        <View style={[base, {
          borderColor: color, borderLeftColor: 'transparent',
          right: 0, transform: [{ rotate: `${rightDeg}deg` }],
        }]} />
      </View>

      {/* left half (50% → 100%) */}
      <View style={{ position: 'absolute', width: half, height: size, left: 0, overflow: 'hidden' }}>
        <View style={[base, {
          borderColor: pct > 0.5 ? color : 'transparent',
          borderRightColor: 'transparent',
          left: 0, transform: [{ rotate: `${leftDeg}deg` }],
        }]} />
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{value}ج</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 1 }}>{label}</Text>
      </View>
    </View>
  );
}

// ── Calorie strip inside hero ─────────────────────────────────────────────────
function CalorieStrip({ consumed, goal, t }: { consumed: number; goal: number; t: ThemeTokens }) {
  const pct       = Math.min(consumed / goal, 1);
  const remaining = Math.max(goal - consumed, 0);
  return (
    <View style={cs.wrap}>
      <View style={cs.row}>
        <View style={cs.stat}><Text style={cs.val}>{remaining}</Text><Text style={cs.lbl}>متبقي</Text></View>
        <View style={cs.stat}><Text style={[cs.val, cs.valMain]}>{consumed}</Text><Text style={cs.lbl}>مستهلك</Text></View>
        <View style={cs.stat}><Text style={cs.val}>{goal}</Text><Text style={cs.lbl}>الهدف</Text></View>
      </View>
      <View style={cs.track}>
        <LinearGradient colors={[t.gradientStart, t.gradientEnd]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={[cs.fill, { width: `${pct * 100}%` as any }]} />
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  wrap:    { marginBottom: spacing.md },
  row:     { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: spacing.sm },
  stat:    { alignItems: 'center' },
  val:     { color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: '800' },
  valMain: { color: '#fff', fontSize: 30 },
  lbl:     { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  track:   { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  fill:    { height: 6, borderRadius: 3 },
});

// ── Meal card ─────────────────────────────────────────────────────────────────
function MealCard({ meal, t, onRemove, cardShadow }: {
  meal: MealLog; t: ThemeTokens; onRemove: () => void; cardShadow: object;
}) {
  const cal     = Math.round(meal.foodItem.calories * meal.portionMultiplier);
  const protein = Math.round(meal.foodItem.protein  * meal.portionMultiplier);
  const carbs   = Math.round(meal.foodItem.carbs    * meal.portionMultiplier);
  const fat     = Math.round(meal.foodItem.fat      * meal.portionMultiplier);
  const iconName = CATEGORY_ICONS[meal.foodItem.category] ?? 'restaurant';

  return (
    <View style={[mc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      {/* image or icon */}
      {meal.foodItem.imageUrl ? (
        <Image source={{ uri: meal.foodItem.imageUrl }} style={mc.img} />
      ) : (
        <View style={[mc.imgPlaceholder, { backgroundColor: t.primary + '20' }]}>
          <Ionicons name={iconName as any} size={26} color={t.primary} />
        </View>
      )}

      <View style={mc.body}>
        <View style={mc.topRow}>
          <Text style={[mc.time, { color: t.muted }]}>{meal.loggedAt}</Text>
          <View style={[mc.tag, { backgroundColor: t.cardSoft }]}>
            <Text style={[mc.tagTxt, { color: t.primary }]}>{MEAL_LABELS[meal.mealType]}</Text>
          </View>
        </View>
        <Text style={[mc.name, { color: t.text }]} numberOfLines={1}>{meal.foodItem.nameAr}</Text>
        <View style={mc.macros}>
          <View style={[mc.macroTag, { backgroundColor: t.cardSoft }]}><Text style={[mc.macroTxt, { color: '#E74424' }]}>{fat}ج د</Text></View>
          <View style={[mc.macroTag, { backgroundColor: t.cardSoft }]}><Text style={[mc.macroTxt, { color: '#F79A3E' }]}>{carbs}ج ك</Text></View>
          <View style={[mc.macroTag, { backgroundColor: t.cardSoft }]}><Text style={[mc.macroTxt, { color: '#30B36A' }]}>{protein}ج ب</Text></View>
          <Text style={[mc.cal, { color: t.text }]}>{cal} سعرة</Text>
        </View>
      </View>

      <Pressable style={mc.removeBtn} onPress={onRemove} hitSlop={8}>
        <Ionicons name="close-circle" size={20} color={t.muted} />
      </Pressable>
    </View>
  );
}

const mc = StyleSheet.create({
  card:          { borderRadius: radius.xl, borderWidth: 1.5, padding: spacing.sm, marginBottom: spacing.sm, flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center' },
  img:           { width: 70, height: 70, borderRadius: radius.md },
  imgPlaceholder:{ width: 70, height: 70, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  body:          { flex: 1, alignItems: 'flex-end' },
  topRow:        { flexDirection: 'row-reverse', justifyContent: 'space-between', width: '100%', marginBottom: 3 },
  tag:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  tagTxt:        { fontSize: 10, fontWeight: '700' },
  time:          { fontSize: 11 },
  name:          { fontSize: 14, fontWeight: '800', textAlign: 'right' },
  macros:        { flexDirection: 'row-reverse', gap: 5, marginTop: 5, alignItems: 'center' },
  macroTag:      { borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  macroTxt:      { fontSize: 10, fontWeight: '700' },
  cal:           { fontSize: 13, fontWeight: '800' },
  removeBtn:     { padding: 2 },
});

// ── Nutrition Score card ──────────────────────────────────────────────────────
function ScoreCard({ score, t, cardShadow }: { score: number; t: ThemeTokens; cardShadow: object }) {
  const { color, emoji, label } = score >= 80
    ? { color: '#30B36A', emoji: '🏆', label: 'ممتاز' }
    : score >= 60
    ? { color: '#F79A3E', emoji: '💪', label: 'جيد' }
    : { color: '#E74424', emoji: '⚡', label: 'يحتاج تحسين' };

  return (
    <View style={[sc.wrap, { backgroundColor: t.card }, cardShadow]}>
      <View style={[sc.badge, { backgroundColor: color + '18' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text style={[sc.scoreNum, { color }]}>{score}</Text>
        <Text style={[sc.scoreMax, { color: t.muted }]}>/100</Text>
      </View>
      <View style={sc.info}>
        <Text style={[sc.title, { color: t.text }]}>نقاط التغذية اليوم</Text>
        <View style={[sc.labelPill, { backgroundColor: color + '22' }]}>
          <Text style={[sc.labelTxt, { color }]}>{label}</Text>
        </View>
        <Text style={[sc.hint, { color: t.muted }]}>
          بناءً على السعرات والبروتين والكربوهيدرات والدهون
        </Text>
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap:      { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center' },
  badge:     { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  scoreNum:  { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  scoreMax:  { fontSize: 10, fontWeight: '600' },
  info:      { flex: 1, alignItems: 'flex-end', gap: 5 },
  title:     { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  labelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  labelTxt:  { fontSize: 12, fontWeight: '800' },
  hint:      { fontSize: 11, textAlign: 'right', lineHeight: 16 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export function NutritionScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const { summary, todayMeals, removeMeal, state, setWater } = useNutrition();

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#8A7060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  const targets = state.targets;
  const waterCups = summary.waterCups;
  const WATER_GOAL = targets.waterGoal;

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ──────────────────────────────── */}
        <View style={st.header}>
          <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
          <Text style={[st.pageTitle, { color: t.text }]}>التغذية</Text>
        </View>

        {/* ── HERO: CALORIES + MACRO RINGS ─────────── */}
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          style={st.heroCard}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <CalorieStrip consumed={summary.totalCalories} goal={targets.calorieGoal} t={t} />
          <View style={st.ringsRow}>
            <MacroRing value={summary.totalProtein} goal={targets.proteinGoal} color="#fff"    label="بروتين"      />
            <MacroRing value={summary.totalCarbs}   goal={targets.carbsGoal}   color="#FFE0A3" label="كربوهيدرات" />
            <MacroRing value={summary.totalFat}     goal={targets.fatGoal}     color="#FFB3A7" label="دهون"        />
          </View>
        </LinearGradient>

        {/* ── SCAN CTAs ───────────────────────────── */}
        <View style={st.ctaRow}>
          <Pressable style={[st.ctaBtn, { backgroundColor: t.card, borderColor: t.line }, cardShadow]} onPress={() => navigation?.navigate('FoodScan')}>
            <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.ctaIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="camera" size={18} color="#fff" />
            </LinearGradient>
            <Text style={[st.ctaLabel, { color: t.text }]}>ذكاء اصطناعي</Text>
            <Text style={[st.ctaSub, { color: t.muted }]}>مسح الصورة</Text>
          </Pressable>

          <Pressable style={[st.ctaBtn, { backgroundColor: t.card, borderColor: t.line }, cardShadow]} onPress={() => navigation?.navigate('BarcodeScan')}>
            <LinearGradient colors={['#7C3AED', '#A855F7']} style={st.ctaIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="barcode-outline" size={18} color="#fff" />
            </LinearGradient>
            <Text style={[st.ctaLabel, { color: t.text }]}>باركود</Text>
            <Text style={[st.ctaSub, { color: t.muted }]}>مسح المنتج</Text>
          </Pressable>

          <Pressable style={[st.ctaBtn, { backgroundColor: t.card, borderColor: t.line }, cardShadow]} onPress={() => navigation?.navigate('ManualAddMeal')}>
            <LinearGradient colors={['#059669', '#10B981']} style={st.ctaIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </LinearGradient>
            <Text style={[st.ctaLabel, { color: t.text }]}>يدوي</Text>
            <Text style={[st.ctaSub, { color: t.muted }]}>إضافة وجبة</Text>
          </Pressable>
        </View>

        {/* ── NUTRITION SCORE ─────────────────────── */}
        <ScoreCard score={summary.nutritionScore} t={t} cardShadow={cardShadow} />

        {/* ── WATER TRACKER ───────────────────────── */}
        <View style={[st.waterCard, { backgroundColor: t.card }, cardShadow]}>
          <View style={st.waterHeader}>
            <Text style={[st.waterPct, { color: t.muted }]}>{waterCups}/{WATER_GOAL} كوب</Text>
            <View style={st.waterTitleRow}>
              <Ionicons name="water-outline" size={18} color={t.primary} />
              <Text style={[st.sectionTitle, { color: t.text }]}>شرب الماء</Text>
            </View>
          </View>
          <View style={st.waterCups}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <Pressable key={i} onPress={() => setWater(i < waterCups ? i : i + 1)}>
                <Ionicons
                  name={i < waterCups ? 'water' : 'water-outline'}
                  size={22}
                  color={i < waterCups ? t.primary : t.line}
                />
              </Pressable>
            ))}
          </View>
          <View style={[st.waterTrack, { backgroundColor: t.line }]}>
            <LinearGradient
              colors={[t.gradientEnd, t.gradientStart]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[st.waterFill, { width: `${(waterCups / WATER_GOAL) * 100}%` as any }]}
            />
          </View>
        </View>

        {/* ── AI COACH CARD ───────────────────────── */}
        <View style={[st.coachCard, { backgroundColor: t.card }, cardShadow]}>
          <View style={[st.coachAccent, { backgroundColor: t.gradientStart }]} />
          <View style={[st.coachAvt, { backgroundColor: t.primary + '22' }]}>
            <Ionicons name="sparkles" size={22} color={t.primary} />
          </View>
          <View style={st.coachBody}>
            <View style={st.coachTitleRow}>
              <View style={[st.aiBadge, { backgroundColor: t.primary + '18' }]}>
                <Text style={[st.aiBadgeTxt, { color: t.primary }]}>AI</Text>
              </View>
              <Text style={[st.coachName, { color: t.text }]}>مدربك الغذائي</Text>
            </View>
            <Text style={[st.coachTip, { color: t.muted }]}>
              {summary.totalProtein < targets.proteinGoal * 0.5
                ? `أنت بحاجة إلى ${targets.proteinGoal - summary.totalProtein}ج بروتين إضافي. جرّب صدر دجاج مشوي أو زبادي يوناني.`
                : summary.totalCalories < targets.calorieGoal * 0.4
                ? 'لا تنسَ تناول وجبة متوازنة — جسمك يحتاج الطاقة للتمرين.'
                : 'أداء ممتاز! استمر في الحفاظ على توازن الماكرو طوال اليوم.'}
            </Text>
          </View>
        </View>

        {/* ── MEALS LIST ──────────────────────────── */}
        <View style={st.mealsHeader}>
          <Pressable style={st.addMealBtn} onPress={() => navigation?.navigate('ManualAddMeal')}>
            <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.addMealGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
              <Text style={st.addMealTxt}>+ إضافة وجبة</Text>
            </LinearGradient>
          </Pressable>
          <Text style={[st.sectionTitle, { color: t.text }]}>وجبات اليوم</Text>
        </View>

        {todayMeals.length === 0 ? (
          <View style={[st.emptyCard, { backgroundColor: t.card, borderColor: t.line }]}>
            <Ionicons name="restaurant-outline" size={32} color={t.muted} />
            <Text style={[st.emptyTxt, { color: t.muted }]}>لا توجد وجبات مسجّلة اليوم</Text>
            <Text style={[st.emptySub, { color: t.muted }]}>استخدم المسح بالكاميرا أو أضف يدوياً</Text>
          </View>
        ) : (
          todayMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              t={t}
              cardShadow={cardShadow}
              onRemove={() => removeMeal(meal.id)}
            />
          ))
        )}

        {/* ── DAILY PLAN SUMMARY ──────────────────── */}
        <View style={[st.planSummary, { backgroundColor: t.card }, cardShadow]}>
          <Text style={[st.planTitle, { color: t.text }]}>أهداف الماكرو اليومية</Text>
          {[
            { key: 'بروتين',       val: `${targets.proteinGoal}ج`,  done: summary.totalProtein,  goal: targets.proteinGoal,  color: '#30B36A' },
            { key: 'كربوهيدرات', val: `${targets.carbsGoal}ج`,    done: summary.totalCarbs,    goal: targets.carbsGoal,    color: '#F79A3E' },
            { key: 'دهون',         val: `${targets.fatGoal}ج`,      done: summary.totalFat,      goal: targets.fatGoal,      color: '#E74424' },
            { key: 'سعرات',        val: `${targets.calorieGoal}`,   done: summary.totalCalories, goal: targets.calorieGoal,  color: t.primary },
          ].map((item, i, arr) => (
            <View key={i} style={[st.planRow, { borderBottomColor: t.line, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
              <View style={st.planRight}>
                <Text style={[st.planVal, { color: t.text }]}>{item.val}</Text>
                <Text style={[st.planKey, { color: t.muted }]}>{item.key}</Text>
              </View>
              <View style={st.planBarWrap}>
                <View style={[st.planBarTrack, { backgroundColor: t.line }]}>
                  <View style={[st.planBarFill, { backgroundColor: item.color, width: `${Math.min(item.done / item.goal, 1) * 100}%` as any }]} />
                </View>
                <Text style={[st.planDone, { color: t.muted }]}>{item.done}/{item.goal}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 110 },

  header:    { flexDirection: 'row-reverse', alignItems: 'flex-end', marginBottom: spacing.md },
  backBtn:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { ...typography.h1 },

  heroCard: { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  ringsRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginTop: spacing.sm },

  ctaRow: { flexDirection: 'row-reverse', gap: spacing.sm, marginBottom: spacing.md },
  ctaBtn: { flex: 1, borderRadius: radius.xl, borderWidth: 1.5, padding: spacing.sm, alignItems: 'center', gap: 5 },
  ctaIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  ctaLabel: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  ctaSub:   { fontSize: 10, textAlign: 'center' },

  waterCard:     { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md },
  waterHeader:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  waterTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  waterPct:      { fontSize: 13, fontWeight: '700' },
  waterCups:     { flexDirection: 'row-reverse', gap: 6, marginBottom: spacing.sm, flexWrap: 'wrap' },
  waterTrack:    { height: 6, borderRadius: 3, overflow: 'hidden' },
  waterFill:     { height: 6, borderRadius: 3 },

  sectionTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right' },

  coachCard:     { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row-reverse', gap: spacing.sm, overflow: 'hidden' },
  coachAccent:   { width: 4, borderRadius: 2, position: 'absolute', left: 0, top: 0, bottom: 0 },
  coachAvt:      { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  coachBody:     { flex: 1, alignItems: 'flex-end', gap: 5 },
  coachTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  aiBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  aiBadgeTxt:    { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  coachName:     { fontWeight: '800', fontSize: 14 },
  coachTip:      { fontSize: 13, textAlign: 'right', lineHeight: 19 },

  mealsHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  addMealBtn:  { borderRadius: radius.pill, overflow: 'hidden' },
  addMealGrad: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  addMealTxt:  { color: '#fff', fontWeight: '800', fontSize: 13 },

  emptyCard: { borderRadius: radius.xl, borderWidth: 1.5, borderStyle: 'dashed', padding: spacing.xl, alignItems: 'center', gap: 6, marginBottom: spacing.md },
  emptyTxt:  { fontSize: 14, fontWeight: '700' },
  emptySub:  { fontSize: 12 },

  planSummary: { borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm },
  planTitle:   { fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: spacing.sm },
  planRow:     { paddingVertical: 10 },
  planRight:   { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 6 },
  planKey:     { fontSize: 13 },
  planVal:     { fontSize: 13, fontWeight: '800' },
  planBarWrap: { gap: 4 },
  planBarTrack:{ height: 5, borderRadius: 3, overflow: 'hidden' },
  planBarFill: { height: 5, borderRadius: 3 },
  planDone:    { fontSize: 10, textAlign: 'right' },
});
