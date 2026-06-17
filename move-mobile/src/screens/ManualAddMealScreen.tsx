import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPopularFoods, searchFood } from '../services/nutritionService';
import { useNutrition } from '../store/nutritionContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { FoodItem, MealType } from '../types';

const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'إفطار',   icon: '☀️' },
  { key: 'lunch',     label: 'غداء',    icon: '🌤️' },
  { key: 'dinner',    label: 'عشاء',    icon: '🌙' },
  { key: 'snack',     label: 'خفيفة',  icon: '🍎' },
];

type AddMode = 'search' | 'custom';

function FoodSearchCard({ food, t, onPress }: { food: FoodItem; t: any; onPress: () => void }) {
  return (
    <Pressable style={[fc.wrap, { backgroundColor: t.card, borderColor: t.line }]} onPress={onPress}>
      <View style={fc.right}>
        <Text style={[fc.nameAr, { color: t.text }]}>{food.nameAr}</Text>
        <Text style={[fc.nameEn, { color: t.muted }]}>{food.name}</Text>
        <View style={fc.macros}>
          <Text style={[fc.macro, { color: '#16A34A' }]}>{food.protein}ج ب</Text>
          <Text style={[fc.macro, { color: '#F59E0B' }]}>{food.carbs}ج ك</Text>
          <Text style={[fc.macro, { color: '#EF4444' }]}>{food.fat}ج د</Text>
        </View>
      </View>
      <View style={fc.left}>
        <Text style={[fc.cal, { color: t.primary }]}>{food.calories}</Text>
        <Text style={[fc.calLabel, { color: t.muted }]}>سعرة</Text>
        <Text style={[fc.portion, { color: t.muted }]}>{food.portionLabel}</Text>
      </View>
    </Pressable>
  );
}
const fc = StyleSheet.create({
  wrap:     { flexDirection: 'row-reverse', borderRadius: 14, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.xs, alignItems: 'center' },
  right:    { flex: 1, alignItems: 'flex-end' },
  left:     { alignItems: 'center', minWidth: 60 },
  nameAr:   { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  nameEn:   { fontSize: 11, textAlign: 'right', marginTop: 1 },
  macros:   { flexDirection: 'row-reverse', gap: 8, marginTop: 4 },
  macro:    { fontSize: 11, fontWeight: '700' },
  cal:      { fontSize: 22, fontWeight: '900' },
  calLabel: { fontSize: 10, fontWeight: '700' },
  portion:  { fontSize: 9, marginTop: 2 },
});

export function ManualAddMealScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const { addMeal } = useNutrition();

  const [mode, setMode]             = useState<AddMode>('search');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<FoodItem[]>([]);
  const [popular, setPopular]       = useState<FoodItem[]>([]);
  const [searching, setSearching]   = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [mealType, setMealType]     = useState<MealType>('lunch');
  const [portionMult, setPortionMult] = useState(1);

  // Custom entry fields
  const [customName,  setCustomName]  = useState('');
  const [customCal,   setCustomCal]   = useState('');
  const [customProt,  setCustomProt]  = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat,   setCustomFat]   = useState('');
  const [customGrams, setCustomGrams] = useState('100');

  useEffect(() => {
    setPopular(getPopularFoods());
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchFood(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function handleSelectFood(food: FoodItem) {
    setSelectedFood(food);
    Keyboard.dismiss();
  }

  function handleSaveSearch() {
    if (!selectedFood) return;
    addMeal(selectedFood, mealType, portionMult);
    navigation.goBack();
  }

  function handleSaveCustom() {
    if (!customName.trim() || !customCal) return;
    const food: FoodItem = {
      id:           `manual-${Date.now()}`,
      name:         customName,
      nameAr:       customName,
      calories:     parseInt(customCal)  || 0,
      protein:      parseInt(customProt) || 0,
      carbs:        parseInt(customCarbs) || 0,
      fat:          parseInt(customFat)  || 0,
      portionGrams: parseInt(customGrams) || 100,
      portionLabel: `${customGrams}ج`,
      category:     'arabic',
      source:       'manual',
    };
    addMeal(food, mealType, 1);
    navigation.goBack();
  }

  const scaledFood = selectedFood ? {
    calories: Math.round(selectedFood.calories * portionMult),
    protein:  Math.round(selectedFood.protein  * portionMult),
    carbs:    Math.round(selectedFood.carbs    * portionMult),
    fat:      Math.round(selectedFood.fat      * portionMult),
  } : null;

  const cardShadow = { shadowColor: '#111', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={st.header}>
            <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-forward" size={20} color={t.muted} />
            </Pressable>
            <Text style={[st.headerTitle, { color: t.text }]}>إضافة وجبة يدوياً</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Meal type selector */}
          <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
            <Text style={[st.cardTitle, { color: t.text }]}>نوع الوجبة</Text>
            <View style={st.mealTypeRow}>
              {MEAL_TYPES.map((mt) => (
                <Pressable
                  key={mt.key}
                  style={[st.mealChip, {
                    backgroundColor: mealType === mt.key ? t.primary + '14' : t.cardSoft,
                    borderColor:     mealType === mt.key ? t.primary : t.line,
                  }]}
                  onPress={() => setMealType(mt.key)}
                >
                  <Text style={st.mealChipIcon}>{mt.icon}</Text>
                  <Text style={[st.mealChipTxt, { color: mealType === mt.key ? t.primary : t.muted }]}>{mt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Mode toggle */}
          <View style={[st.modeToggle, { backgroundColor: t.cardSoft }]}>
            <Pressable style={[st.modeBtn, mode === 'search' && { backgroundColor: t.card }]} onPress={() => setMode('search')}>
              <Text style={[st.modeTxt, { color: mode === 'search' ? t.primary : t.muted }]}>بحث في قاعدة البيانات</Text>
            </Pressable>
            <Pressable style={[st.modeBtn, mode === 'custom' && { backgroundColor: t.card }]} onPress={() => setMode('custom')}>
              <Text style={[st.modeTxt, { color: mode === 'custom' ? t.primary : t.muted }]}>إدخال يدوي</Text>
            </Pressable>
          </View>

          {/* ── SEARCH MODE ── */}
          {mode === 'search' && (
            <>
              {/* Search bar */}
              <View style={[st.searchBar, { backgroundColor: t.card, borderColor: selectedFood ? t.primary : t.line }]}>
                <Ionicons name={searching ? 'hourglass-outline' : 'search-outline'} size={18} color={t.muted} />
                <TextInput
                  style={[st.searchInput, { color: t.text }]}
                  placeholder="ابحث عن طعام... (كبسة، دجاج، تمر)"
                  placeholderTextColor={t.muted}
                  value={query}
                  onChangeText={setQuery}
                  textAlign="right"
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable onPress={() => { setQuery(''); setResults([]); setSelectedFood(null); }}>
                    <Ionicons name="close-circle" size={18} color={t.muted} />
                  </Pressable>
                )}
              </View>

              {/* Selected food preview */}
              {selectedFood && (
                <LinearGradient
                  colors={['#FF7A18', '#FF5C00']}
                  style={st.selectedCard}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <View style={st.selectedTop}>
                    <Text style={st.selectedCal}>{scaledFood!.calories} سعرة</Text>
                    <View>
                      <Text style={st.selectedNameAr}>{selectedFood.nameAr}</Text>
                      <Text style={st.selectedNameEn}>{selectedFood.name}</Text>
                    </View>
                  </View>
                  <View style={st.selectedMacros}>
                    {[
                      { v: scaledFood!.protein, l: 'بروتين', c: '#A7F3D0' },
                      { v: scaledFood!.carbs,   l: 'كارب',   c: '#FDE68A' },
                      { v: scaledFood!.fat,     l: 'دهون',   c: '#FECACA' },
                    ].map(m => (
                      <View key={m.l} style={st.selectedMacro}>
                        <Text style={[st.selectedMacroVal, { color: m.c }]}>{m.v}ج</Text>
                        <Text style={st.selectedMacroLbl}>{m.l}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Portion multiplier */}
                  <View style={st.multRow}>
                    <View style={st.multBtns}>
                      <Pressable style={st.multBtn} onPress={() => setPortionMult(v => Math.max(0.5, parseFloat((v - 0.5).toFixed(1))))}>
                        <Ionicons name="remove" size={16} color="#fff" />
                      </Pressable>
                      <Text style={st.multVal}>{portionMult}×</Text>
                      <Pressable style={st.multBtn} onPress={() => setPortionMult(v => Math.min(5, parseFloat((v + 0.5).toFixed(1))))}>
                        <Ionicons name="add" size={16} color="#fff" />
                      </Pressable>
                    </View>
                    <Text style={st.multLabel}>حصص</Text>
                  </View>
                </LinearGradient>
              )}

              {/* Search results */}
              {results.length > 0 && (
                <View>
                  <Text style={[st.sectionLabel, { color: t.muted }]}>نتائج البحث ({results.length})</Text>
                  {results.map(f => (
                    <FoodSearchCard key={f.id} food={f} t={t} onPress={() => handleSelectFood(f)} />
                  ))}
                </View>
              )}

              {/* Popular foods (when no query) */}
              {!query && (
                <View>
                  <Text style={[st.sectionLabel, { color: t.muted }]}>الأكثر تسجيلاً</Text>
                  {popular.map(f => (
                    <FoodSearchCard key={f.id} food={f} t={t} onPress={() => handleSelectFood(f)} />
                  ))}
                </View>
              )}

              {/* Save button */}
              {selectedFood && (
                <Pressable onPress={handleSaveSearch}>
                  <LinearGradient
                    colors={['#FF7A18', '#FF5C00']}
                    style={st.saveBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={st.saveBtnTxt}>حفظ في {MEAL_TYPES.find(m => m.key === mealType)?.label} — {scaledFood!.calories} سعرة</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </>
          )}

          {/* ── CUSTOM MODE ── */}
          {mode === 'custom' && (
            <View style={[st.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
              <Text style={[st.cardTitle, { color: t.text }]}>أدخل تفاصيل الوجبة</Text>

              {/* Food name */}
              <Text style={[st.fieldLabel, { color: t.muted }]}>اسم الوجبة *</Text>
              <TextInput
                style={[st.field, { backgroundColor: t.cardSoft, color: t.text, borderColor: t.line }]}
                placeholder="مثال: كبسة دجاج منزلية"
                placeholderTextColor={t.muted}
                value={customName}
                onChangeText={setCustomName}
                textAlign="right"
              />

              {/* Calories */}
              <Text style={[st.fieldLabel, { color: t.muted }]}>السعرات الحرارية (سعرة) *</Text>
              <TextInput
                style={[st.field, { backgroundColor: t.cardSoft, color: t.text, borderColor: t.line }]}
                placeholder="450"
                placeholderTextColor={t.muted}
                value={customCal}
                onChangeText={setCustomCal}
                keyboardType="numeric"
                textAlign="right"
              />

              {/* Macros row */}
              <Text style={[st.fieldLabel, { color: t.muted }]}>المغذيات الكبرى (جرام)</Text>
              <View style={st.macroInputRow}>
                <View style={st.macroInput}>
                  <Text style={[st.macroInputLabel, { color: '#16A34A' }]}>بروتين</Text>
                  <TextInput
                    style={[st.macroInputField, { backgroundColor: t.cardSoft, color: t.text, borderColor: '#16A34A44' }]}
                    placeholder="0"
                    placeholderTextColor={t.muted}
                    value={customProt}
                    onChangeText={setCustomProt}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </View>
                <View style={st.macroInput}>
                  <Text style={[st.macroInputLabel, { color: '#F59E0B' }]}>كارب</Text>
                  <TextInput
                    style={[st.macroInputField, { backgroundColor: t.cardSoft, color: t.text, borderColor: '#F59E0B44' }]}
                    placeholder="0"
                    placeholderTextColor={t.muted}
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </View>
                <View style={st.macroInput}>
                  <Text style={[st.macroInputLabel, { color: '#EF4444' }]}>دهون</Text>
                  <TextInput
                    style={[st.macroInputField, { backgroundColor: t.cardSoft, color: t.text, borderColor: '#EF444444' }]}
                    placeholder="0"
                    placeholderTextColor={t.muted}
                    value={customFat}
                    onChangeText={setCustomFat}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </View>
              </View>

              {/* Portion */}
              <Text style={[st.fieldLabel, { color: t.muted }]}>حجم الحصة (جرام)</Text>
              <TextInput
                style={[st.field, { backgroundColor: t.cardSoft, color: t.text, borderColor: t.line }]}
                placeholder="100"
                placeholderTextColor={t.muted}
                value={customGrams}
                onChangeText={setCustomGrams}
                keyboardType="numeric"
                textAlign="right"
              />

              <Pressable
                onPress={handleSaveCustom}
                style={{ opacity: customName && customCal ? 1 : 0.5 }}
                disabled={!customName || !customCal}
              >
                <LinearGradient
                  colors={['#FF7A18', '#FF5C00']}
                  style={st.saveBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={st.saveBtnTxt}>حفظ الوجبة المخصصة</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 60 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  backBtn:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  card:      { borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '900', textAlign: 'right', marginBottom: spacing.sm },

  mealTypeRow:  { flexDirection: 'row-reverse', gap: 8 },
  mealChip:     { flex: 1, borderRadius: 12, borderWidth: 1.5, paddingVertical: 10, alignItems: 'center', gap: 4 },
  mealChipIcon: { fontSize: 16 },
  mealChipTxt:  { fontSize: 12, fontWeight: '800' },

  modeToggle: { flexDirection: 'row-reverse', borderRadius: 12, padding: 3, gap: 2, marginBottom: spacing.sm },
  modeBtn:    { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  modeTxt:    { fontSize: 12, fontWeight: '800' },

  searchBar:   { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: spacing.sm, paddingVertical: 12, marginBottom: spacing.sm },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },

  selectedCard:  { borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm },
  selectedTop:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  selectedNameAr:{ color: '#fff', fontSize: 17, fontWeight: '900', textAlign: 'right' },
  selectedNameEn:{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right' },
  selectedCal:   { color: '#fff', fontSize: 36, fontWeight: '900' },
  selectedMacros:{ flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.sm },
  selectedMacro: { alignItems: 'center' },
  selectedMacroVal: { fontSize: 16, fontWeight: '900' },
  selectedMacroLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' },
  multRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  multBtns: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 6 },
  multBtn:  { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  multVal:  { color: '#fff', fontSize: 18, fontWeight: '900', minWidth: 36, textAlign: 'center' },
  multLabel:{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 12, fontWeight: '700', textAlign: 'right', marginBottom: 8, marginTop: 4 },

  // Custom mode
  fieldLabel:     { fontSize: 13, fontWeight: '700', textAlign: 'right', marginBottom: 6, marginTop: spacing.sm },
  field:          { borderRadius: 12, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 13, fontSize: 15, fontWeight: '600' },
  macroInputRow:  { flexDirection: 'row-reverse', gap: spacing.xs },
  macroInput:     { flex: 1, alignItems: 'center', gap: 6 },
  macroInputLabel:{ fontSize: 12, fontWeight: '800' },
  macroInputField:{ width: '100%', borderRadius: 10, borderWidth: 1.5, paddingVertical: 10, fontSize: 16, fontWeight: '800' },

  saveBtn:    { borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.md },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
