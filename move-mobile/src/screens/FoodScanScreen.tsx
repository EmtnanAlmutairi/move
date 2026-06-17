import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeFoodImage, aiResultToFoodItem } from '../services/aiFoodService';
import { useNutrition } from '../store/nutritionContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { AIAnalysisResult, MealType } from '../types';

// TODO: Install expo-camera for real camera integration:
//   npx expo install expo-camera
//   import { CameraView, useCameraPermissions } from 'expo-camera';
//   Replace the mock viewfinder below with <CameraView style={StyleSheet.absoluteFill} />

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const VIEWFINDER_SIZE = SCREEN_W * 0.72;

type ScanState = 'camera' | 'analyzing' | 'result';

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'الإفطار' },
  { key: 'lunch',     label: 'الغداء'  },
  { key: 'dinner',    label: 'العشاء'  },
  { key: 'snack',     label: 'خفيفة'  },
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 85 ? '#16A34A' : pct >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <View style={[badge.wrap, { backgroundColor: color + '18', borderColor: color + '44' }]}>
      <View style={[badge.dot, { backgroundColor: color }]} />
      <Text style={[badge.txt, { color }]}>{pct}% دقة</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  txt:  { fontSize: 12, fontWeight: '800' },
});

function MacroChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={[chip.wrap, { backgroundColor: color + '14' }]}>
      <Text style={[chip.val, { color }]}>{value}ج</Text>
      <Text style={[chip.lbl, { color: color + 'AA' }]}>{label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: { alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flex: 1 },
  val:  { fontSize: 18, fontWeight: '900' },
  lbl:  { fontSize: 11, fontWeight: '700', marginTop: 2 },
});

export function FoodScanScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const { addMeal } = useNutrition();

  const [scanState, setScanState]     = useState<ScanState>('camera');
  const [result, setResult]           = useState<AIAnalysisResult | null>(null);
  const [portionGrams, setPortionGrams] = useState(350);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');

  // Pulse animation for analyzing state
  const pulse  = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanState !== 'analyzing') return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [scanState]);

  const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Real-time macro calculation based on portion
  const scaledResult = result ? {
    calories: Math.round((result.calories / result.portionGrams) * portionGrams),
    protein:  Math.round((result.protein  / result.portionGrams) * portionGrams),
    carbs:    Math.round((result.carbs    / result.portionGrams) * portionGrams),
    fat:      Math.round((result.fat      / result.portionGrams) * portionGrams),
  } : null;

  async function handleCapture() {
    setScanState('analyzing');
    try {
      // TODO: pass real imageUri from CameraView capture
      const data = await analyzeFoodImage('mock://food.jpg');
      setResult(data);
      setPortionGrams(data.portionGrams);
      setScanState('result');
    } catch {
      setScanState('camera');
    }
  }

  function handleSave() {
    if (!result) return;
    const foodItem = aiResultToFoodItem(result, portionGrams);
    addMeal(foodItem, selectedMeal, 1);
    navigation.goBack();
  }

  // ── CAMERA STATE ────────────────────────────────────────────────────────────
  if (scanState === 'camera') {
    return (
      <View style={[cam.full, { backgroundColor: '#0A0A0A' }]}>
        {/* TODO: Replace this mock viewfinder with actual CameraView from expo-camera */}
        <View style={cam.mockCamera}>
          {/* Simulated camera scene */}
          <LinearGradient
            colors={['#1A1A1A', '#0A0A0A', '#151515']}
            style={StyleSheet.absoluteFill}
          />
          <MaterialCommunityIcons name="food-variant" size={64} color="rgba(255,255,255,0.08)" style={cam.camFoodIcon} />
          <Text style={cam.camHint}>ضع الطعام في الإطار</Text>
        </View>

        {/* Viewfinder frame */}
        <View style={cam.frameContainer} pointerEvents="none">
          {/* Top-left */}
          <View style={[cam.corner, cam.cornerTL, { borderColor: '#FF7A18' }]} />
          {/* Top-right */}
          <View style={[cam.corner, cam.cornerTR, { borderColor: '#FF7A18' }]} />
          {/* Bottom-left */}
          <View style={[cam.corner, cam.cornerBL, { borderColor: '#FF7A18' }]} />
          {/* Bottom-right */}
          <View style={[cam.corner, cam.cornerBR, { borderColor: '#FF7A18' }]} />
          {/* Scan line */}
          <View style={cam.scanLine} />
        </View>

        {/* Header */}
        <SafeAreaView style={cam.headerSafe}>
          <View style={cam.header}>
            <Pressable style={cam.closeBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
            <Text style={cam.headerTitle}>مسح الوجبة</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>

        {/* Bottom controls */}
        <View style={cam.bottom}>
          <Text style={cam.tip}>وجّه الكاميرا نحو الطعام وانتظر للتحليل الآلي</Text>
          <Pressable style={cam.captureBtn} onPress={handleCapture}>
            <View style={cam.captureOuter}>
              <LinearGradient colors={['#FF7A18', '#FF5C00']} style={cam.captureInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="camera" size={28} color="#fff" />
              </LinearGradient>
            </View>
          </Pressable>
          <Text style={cam.captureLabel}>التقاط</Text>
        </View>
      </View>
    );
  }

  // ── ANALYZING STATE ─────────────────────────────────────────────────────────
  if (scanState === 'analyzing') {
    return (
      <View style={[cam.full, { backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }]}>
        <Animated.View style={[cam.pulseRing, { transform: [{ scale: pulse }], borderColor: '#FF7A18' }]} />
        <Animated.View style={[cam.spinnerRing, { transform: [{ rotate: rotateInterp }], borderTopColor: '#FF7A18' }]} />
        <View style={cam.analyzeIcon}>
          <MaterialCommunityIcons name="brain" size={36} color="#FF7A18" />
        </View>
        <Text style={cam.analyzeTitle}>يتم التحليل...</Text>
        <Text style={cam.analyzeSub}>الذكاء الاصطناعي يحدد الطعام والسعرات</Text>
        {/* TODO: Show on-device EfficientNetB0 progress, then backend PaliGemma progress */}
      </View>
    );
  }

  // ── RESULT STATE ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[res.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={res.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={res.header}>
          <Pressable style={[res.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => setScanState('camera')}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
          <Text style={[res.headerTitle, { color: t.text }]}>نتيجة التحليل</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Food result card */}
        <LinearGradient
          colors={['#FF7A18', '#FF5C00']}
          style={res.heroCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={res.heroTop}>
            <ConfidenceBadge confidence={result!.confidence} />
            <View style={res.foodIcon}>
              <MaterialCommunityIcons name="food-variant" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <Text style={res.foodAr}>{result!.arabicName}</Text>
          <Text style={res.foodEn}>{result!.foodName}</Text>
          <View style={res.calRow}>
            <Text style={res.calNum}>{scaledResult!.calories}</Text>
            <Text style={res.calUnit}>سعرة حرارية</Text>
          </View>
        </LinearGradient>

        {/* Macro breakdown */}
        <View style={[res.macrosCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[res.macrosTitle, { color: t.text }]}>المغذيات الكبرى</Text>
          <View style={res.macrosRow}>
            <MacroChip value={scaledResult!.protein} label="بروتين" color="#16A34A" />
            <MacroChip value={scaledResult!.carbs}   label="كارب"   color="#F59E0B" />
            <MacroChip value={scaledResult!.fat}     label="دهون"  color="#EF4444" />
          </View>
        </View>

        {/* Portion slider */}
        <View style={[res.portionCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <View style={res.portionHeader}>
            <Text style={[res.portionGramsVal, { color: t.primary }]}>{portionGrams}ج</Text>
            <Text style={[res.portionTitle, { color: t.text }]}>حجم الحصة</Text>
          </View>
          <View style={res.sliderRow}>
            <Text style={[res.sliderBound, { color: t.muted }]}>600ج</Text>
            {/* Custom slider using pressable steps */}
            <View style={[res.sliderTrack, { backgroundColor: t.cardSoft }]}>
              <LinearGradient
                colors={[t.primary, t.primary + 'AA']}
                style={[res.sliderFill, { width: `${((portionGrams - 50) / 550) * 100}%` as any }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[res.sliderBound, { color: t.muted }]}>50ج</Text>
          </View>
          <View style={res.portionSteps}>
            {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600].map((g) => (
              <Pressable
                key={g}
                style={[res.stepBtn, portionGrams === g && { backgroundColor: t.primary }]}
                onPress={() => setPortionGrams(g)}
              >
                <Text style={[res.stepTxt, { color: portionGrams === g ? '#fff' : t.muted }]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Alternatives */}
        {result!.alternatives && result!.alternatives.length > 0 && (
          <View style={[res.altCard, { backgroundColor: t.card, borderColor: t.line }]}>
            <Text style={[res.altTitle, { color: t.text }]}>احتمالات أخرى</Text>
            {result!.alternatives.map((alt, i) => (
              <Pressable
                key={i}
                style={[res.altRow, { borderTopColor: t.line, borderTopWidth: i > 0 ? 1 : 0 }]}
                onPress={() => setResult({ ...result!, foodName: alt.foodName, arabicName: alt.arabicName })}
              >
                <Text style={[res.altConf, { color: t.muted }]}>{Math.round(alt.confidence * 100)}%</Text>
                <Text style={[res.altName, { color: t.text }]}>{alt.arabicName}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Meal type selector */}
        <View style={[res.mealTypeCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[res.mealTypeTitle, { color: t.text }]}>وجبة</Text>
          <View style={res.mealTypeRow}>
            {MEAL_TYPES.map((mt) => (
              <Pressable
                key={mt.key}
                style={[res.mealTypeChip, {
                  backgroundColor: selectedMeal === mt.key ? t.primary : t.cardSoft,
                  borderColor:     selectedMeal === mt.key ? t.primary : t.line,
                }]}
                onPress={() => setSelectedMeal(mt.key)}
              >
                <Text style={[res.mealTypeChipTxt, { color: selectedMeal === mt.key ? '#fff' : t.muted }]}>
                  {mt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Actions */}
        <Pressable onPress={handleSave}>
          <LinearGradient
            colors={['#FF7A18', '#FF5C00']}
            style={res.saveBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={res.saveBtnTxt}>حفظ في السجل — {scaledResult!.calories} سعرة</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={[res.rescanBtn, { borderColor: t.line }]} onPress={() => setScanState('camera')}>
          <Ionicons name="camera-outline" size={18} color={t.muted} />
          <Text style={[res.rescanTxt, { color: t.muted }]}>إعادة المسح</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Camera styles ─────────────────────────────────────────────────────────────
const cam = StyleSheet.create({
  full:         { flex: 1 },
  mockCamera:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  camFoodIcon:  { marginBottom: 12 },
  camHint:      { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '600' },

  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle:{ color: '#fff', fontSize: 18, fontWeight: '900' },
  closeBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  frameContainer: { position: 'absolute', top: '50%', left: '50%', width: VIEWFINDER_SIZE, height: VIEWFINDER_SIZE, marginTop: -VIEWFINDER_SIZE / 2, marginLeft: -VIEWFINDER_SIZE / 2 },
  corner:       { position: 'absolute', width: 32, height: 32, borderWidth: 3 },
  cornerTL:     { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  cornerTR:     { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
  cornerBL:     { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
  cornerBR:     { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
  scanLine:     { position: 'absolute', top: '50%', left: 8, right: 8, height: 1.5, backgroundColor: 'rgba(255,122,24,0.5)' },

  bottom:       { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 48, paddingTop: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  tip:          { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 20, textAlign: 'center', paddingHorizontal: spacing.lg },
  captureBtn:   { marginBottom: 8 },
  captureOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  captureLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },

  // Analyzing state
  pulseRing:    { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2.5, opacity: 0.4 },
  spinnerRing:  { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#FF7A18', marginBottom: 24 },
  analyzeIcon:  { position: 'absolute' },
  analyzeTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  analyzeSub:   { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});

// ── Result styles ─────────────────────────────────────────────────────────────
const res = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 40 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  backBtn:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  heroCard: { borderRadius: 20, padding: spacing.lg, marginBottom: spacing.sm },
  heroTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  foodIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  foodAr:   { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'right', marginBottom: 2 },
  foodEn:   { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'right', marginBottom: spacing.sm },
  calRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  calNum:   { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  calUnit:  { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '700' },

  macrosCard:  { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  macrosTitle: { fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },
  macrosRow:   { flexDirection: 'row-reverse', gap: spacing.xs },

  portionCard:   { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  portionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  portionTitle:  { fontSize: 15, fontWeight: '900' },
  portionGramsVal: { fontSize: 24, fontWeight: '900' },
  sliderRow:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  sliderBound:   { fontSize: 10, fontWeight: '700', width: 32, textAlign: 'center' },
  sliderTrack:   { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  sliderFill:    { height: 6, borderRadius: 3 },
  portionSteps:  { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  stepBtn:       { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'transparent' },
  stepTxt:       { fontSize: 12, fontWeight: '700' },

  altCard:  { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  altTitle: { fontSize: 14, fontWeight: '900', textAlign: 'right', marginBottom: spacing.xs },
  altRow:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  altName:  { fontSize: 14, fontWeight: '700' },
  altConf:  { fontSize: 12 },

  mealTypeCard:    { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  mealTypeTitle:   { fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },
  mealTypeRow:     { flexDirection: 'row-reverse', gap: spacing.xs },
  mealTypeChip:    { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  mealTypeChipTxt: { fontSize: 12, fontWeight: '800' },

  saveBtn:    { borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.sm },
  saveBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '900' },
  rescanBtn:  { borderRadius: 14, borderWidth: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rescanTxt:  { fontSize: 14, fontWeight: '700' },
});
