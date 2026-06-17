import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDemoBarcodes, getFoodByBarcode } from '../services/barcodeService';
import { useNutrition } from '../store/nutritionContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { BarcodeResult, FoodItem, MealType } from '../types';

// TODO: Install expo-barcode-scanner for real scanning:
//   npx expo install expo-barcode-scanner
//   or via expo-camera (includes barcode scanning):
//   import { CameraView, useCameraPermissions } from 'expo-camera';
//   <CameraView onBarcodeScanned={({ data }) => handleScan(data)} barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a'] }} />

type BarcodeState = 'scanner' | 'loading' | 'result' | 'notfound';

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'الإفطار' },
  { key: 'lunch',     label: 'الغداء'  },
  { key: 'dinner',    label: 'العشاء'  },
  { key: 'snack',     label: 'خفيفة'  },
];

const DEMO_BARCODES = getDemoBarcodes();

export function BarcodeScanScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const { addMeal } = useNutrition();

  const [barcodeState, setBarcodeState] = useState<BarcodeState>('scanner');
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('snack');
  const [scanning, setScanning] = useState(false);

  async function handleScan(barcode: string) {
    if (scanning) return;
    setScanning(true);
    setBarcodeState('loading');
    const result = await getFoodByBarcode(barcode);
    setBarcodeResult(result);
    setBarcodeState(result.found ? 'result' : 'notfound');
    setScanning(false);
  }

  function handleSave() {
    if (!barcodeResult?.foodItem) return;
    addMeal(barcodeResult.foodItem, selectedMeal, portionMultiplier);
    navigation.goBack();
  }

  const food = barcodeResult?.foodItem;
  const scaled = food ? {
    calories: Math.round(food.calories * portionMultiplier),
    protein:  Math.round(food.protein  * portionMultiplier),
    carbs:    Math.round(food.carbs    * portionMultiplier),
    fat:      Math.round(food.fat      * portionMultiplier),
  } : null;

  // ── SCANNER STATE ───────────────────────────────────────────────────────────
  if (barcodeState === 'scanner') {
    return (
      <View style={[s.full, { backgroundColor: '#0A0A0A' }]}>
        {/* Mock scanner viewfinder */}
        <LinearGradient colors={['#111', '#0A0A0A', '#0F0F0F']} style={StyleSheet.absoluteFill} />

        {/* Header */}
        <SafeAreaView style={s.headerSafe}>
          <View style={s.header}>
            <Pressable style={s.closeBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>مسح الباركود</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>

        {/* Barcode frame */}
        <View style={s.frameWrap} pointerEvents="none">
          <View style={s.frameBox}>
            <View style={[s.corner, s.cTL, { borderColor: '#FF7A18' }]} />
            <View style={[s.corner, s.cTR, { borderColor: '#FF7A18' }]} />
            <View style={[s.corner, s.cBL, { borderColor: '#FF7A18' }]} />
            <View style={[s.corner, s.cBR, { borderColor: '#FF7A18' }]} />
            {/* Barcode lines decoration */}
            <View style={s.barcodeDecor}>
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={i} style={[s.barLine, { width: i % 3 === 0 ? 3 : 1.5, opacity: i % 5 === 0 ? 0.7 : 0.3 }]} />
              ))}
            </View>
          </View>
          <Text style={s.frameHint}>وجّه الكاميرا نحو الباركود</Text>
        </View>

        {/* Demo buttons */}
        <SafeAreaView style={s.bottomSafe} edges={['bottom']}>
          <View style={s.bottom}>
            <Text style={s.demoLabel}>جرّب مسح منتج تجريبي:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.demoScroll}>
              {DEMO_BARCODES.map((bc) => (
                <Pressable
                  key={bc}
                  style={s.demoChip}
                  onPress={() => handleScan(bc)}
                >
                  <Ionicons name="barcode-outline" size={14} color="#FF7A18" />
                  <Text style={s.demoChipTxt}>{bc.slice(-6)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {/* TODO: Real scan button — remove in production when CameraView is active */}
            <Pressable style={s.mockScanBtn} onPress={() => handleScan(DEMO_BARCODES[0])}>
              <LinearGradient colors={['#FF7A18', '#FF5C00']} style={s.mockScanGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <MaterialCommunityIcons name="barcode-scan" size={22} color="#fff" />
                <Text style={s.mockScanTxt}>مسح تجريبي</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── LOADING STATE ───────────────────────────────────────────────────────────
  if (barcodeState === 'loading') {
    return (
      <View style={[s.full, { backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF7A18" />
        <Text style={{ color: '#fff', marginTop: spacing.md, fontSize: 16, fontWeight: '700' }}>
          جاري البحث عن المنتج...
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 6, fontSize: 12 }}>
          {/* TODO: "Checking local cache → OpenFoodFacts → USDA" */}
          يتم الاستعلام عن قاعدة البيانات
        </Text>
      </View>
    );
  }

  // ── NOT FOUND STATE ─────────────────────────────────────────────────────────
  if (barcodeState === 'notfound') {
    return (
      <SafeAreaView style={[s.full, { backgroundColor: t.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }]}>
        <MaterialCommunityIcons name="barcode-off" size={60} color={t.muted} />
        <Text style={[{ color: t.text, fontSize: 20, fontWeight: '900', marginTop: spacing.md }]}>لم يُعثر على المنتج</Text>
        <Text style={[{ color: t.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }]}>
          هذا الباركود غير موجود في قاعدة البيانات حالياً
        </Text>
        <Pressable style={[s.tryAgainBtn, { backgroundColor: t.primary }]} onPress={() => setBarcodeState('scanner')}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>مسح باركود آخر</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── RESULT STATE ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.full, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={r.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={r.header}>
          <Pressable style={[r.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => setBarcodeState('scanner')}>
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
          <Text style={[r.headerTitle, { color: t.text }]}>تفاصيل المنتج</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Product card */}
        <View style={[r.productCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <View style={r.productTop}>
            <View style={[r.barcodeIcon, { backgroundColor: t.cardSoft }]}>
              <Ionicons name="barcode-outline" size={28} color={t.primary} />
            </View>
            <View style={r.productInfo}>
              <Text style={[r.productNameAr, { color: t.text }]}>{food!.nameAr}</Text>
              <Text style={[r.productNameEn, { color: t.muted }]}>{food!.name}</Text>
              <View style={[r.sourceBadge, { backgroundColor: '#16A34A18', borderColor: '#16A34A44' }]}>
                <Text style={r.sourceTxt}>OpenFoodFacts ✓</Text>
              </View>
            </View>
          </View>

          <View style={[r.divider, { backgroundColor: t.line }]} />

          {/* Nutrition per portion */}
          <Text style={[r.perPortion, { color: t.muted }]}>لكل {food!.portionLabel}</Text>
          <View style={r.nutritionRow}>
            {[
              { val: scaled!.calories, label: 'سعرة', color: t.primary },
              { val: scaled!.protein,  label: 'بروتين', color: '#16A34A' },
              { val: scaled!.carbs,    label: 'كارب',   color: '#F59E0B' },
              { val: scaled!.fat,      label: 'دهون',   color: '#EF4444' },
            ].map((n, i) => (
              <View key={i} style={r.nutritionCell}>
                <Text style={[r.nutritionVal, { color: n.color }]}>{n.val}</Text>
                <Text style={[r.nutritionLbl, { color: t.muted }]}>{n.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portion multiplier */}
        <View style={[r.portionCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[r.portionTitle, { color: t.text }]}>عدد الحصص</Text>
          <View style={r.portionRow}>
            <Pressable
              style={[r.portionBtn, { backgroundColor: t.primary }]}
              onPress={() => setPortionMultiplier(v => Math.max(0.5, v - 0.5))}
            >
              <Ionicons name="remove" size={18} color="#fff" />
            </Pressable>
            <Text style={[r.portionVal, { color: t.text }]}>{portionMultiplier}×</Text>
            <Pressable
              style={[r.portionBtn, { backgroundColor: t.primary }]}
              onPress={() => setPortionMultiplier(v => Math.min(5, v + 0.5))}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </Pressable>
          </View>
          <Text style={[r.portionSub, { color: t.muted }]}>
            {portionMultiplier} × {food!.portionGrams}ج = {Math.round(food!.portionGrams * portionMultiplier)}ج
          </Text>
        </View>

        {/* Meal type */}
        <View style={[r.mealCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[r.mealTitle, { color: t.text }]}>أضف إلى</Text>
          <View style={r.mealRow}>
            {MEAL_TYPES.map((mt) => (
              <Pressable
                key={mt.key}
                style={[r.mealChip, {
                  backgroundColor: selectedMeal === mt.key ? t.primary : t.cardSoft,
                  borderColor:     selectedMeal === mt.key ? t.primary : t.line,
                }]}
                onPress={() => setSelectedMeal(mt.key)}
              >
                <Text style={[r.mealChipTxt, { color: selectedMeal === mt.key ? '#fff' : t.muted }]}>
                  {mt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={handleSave}>
          <LinearGradient
            colors={['#FF7A18', '#FF5C00']}
            style={r.saveBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={r.saveBtnTxt}>حفظ — {scaled!.calories} سعرة</Text>
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  full:       { flex: 1 },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle:{ color: '#fff', fontSize: 18, fontWeight: '900' },
  closeBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  frameWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameBox:    { width: 280, height: 140, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  corner:      { position: 'absolute', width: 28, height: 28, borderWidth: 3 },
  cTL:         { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cTR:         { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cBL:         { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cBR:         { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  barcodeDecor:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  barLine:     { height: 60, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 1 },
  frameHint:   { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },

  bottomSafe:  { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottom:      { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  demoLabel:   { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'right', marginBottom: 8 },
  demoScroll:  { gap: 8, paddingBottom: 12 },
  demoChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,122,24,0.15)', borderRadius: 99, borderWidth: 1, borderColor: '#FF7A1844', paddingHorizontal: 12, paddingVertical: 6 },
  demoChipTxt: { color: '#FF7A18', fontSize: 12, fontWeight: '700' },
  mockScanBtn: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  mockScanGrad:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  mockScanTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },

  tryAgainBtn: { marginTop: spacing.lg, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
});

const r = StyleSheet.create({
  scroll:  { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 40 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  productCard: { borderRadius: 18, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  productTop:  { flexDirection: 'row-reverse', gap: spacing.sm, marginBottom: spacing.md },
  barcodeIcon: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, alignItems: 'flex-end' },
  productNameAr: { fontSize: 17, fontWeight: '900', textAlign: 'right' },
  productNameEn: { fontSize: 12, marginTop: 2, textAlign: 'right' },
  sourceBadge:   { flexDirection: 'row', borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  sourceTxt:     { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  divider:       { height: 1, marginVertical: spacing.sm },
  perPortion:    { fontSize: 12, textAlign: 'right', marginBottom: spacing.sm },
  nutritionRow:  { flexDirection: 'row-reverse' },
  nutritionCell: { flex: 1, alignItems: 'center' },
  nutritionVal:  { fontSize: 20, fontWeight: '900' },
  nutritionLbl:  { fontSize: 10, fontWeight: '700', marginTop: 2 },

  portionCard:  { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  portionTitle: { fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },
  portionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  portionBtn:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portionVal:   { fontSize: 28, fontWeight: '900', minWidth: 60, textAlign: 'center' },
  portionSub:   { fontSize: 12, textAlign: 'center', marginTop: 8 },

  mealCard:    { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  mealTitle:   { fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },
  mealRow:     { flexDirection: 'row-reverse', gap: spacing.xs },
  mealChip:    { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  mealChipTxt: { fontSize: 12, fontWeight: '800' },

  saveBtn:    { borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
