import { FoodItem } from '../types';

// ─── Arabic & International Food Database ─────────────────────────────────────
// TODO: Replace with real backend search
// Endpoint: GET /api/v1/food/search?q={query}&lang=ar&limit=20
// Sources (in priority order):
//   1. MOVE custom Arabic food DB (5,000+ dishes, nutritionist-verified)
//   2. Arabic Food Composition DB (MyFood24 — Saudi + Kuwait)
//   3. OpenFoodFacts community DB
//   4. USDA FoodData Central (Western reference)
// Future: pgvector semantic search for "شيء خفيف" → light meal suggestions

const FOOD_DB: FoodItem[] = [
  // ── Arabic / Saudi ────────────────────────────────────────────────────────
  {
    id: 'f-001', name: 'Kabsa Chicken', nameAr: 'كبسة دجاج',
    calories: 620, protein: 38, carbs: 72, fat: 18,
    portionGrams: 350, portionLabel: 'طبق متوسط',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-002', name: 'Hummus', nameAr: 'حمص',
    calories: 166, protein: 7.9, carbs: 14, fat: 9.6,
    portionGrams: 100, portionLabel: '100ج',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-003', name: 'Shawarma Chicken Wrap', nameAr: 'شاورما دجاج',
    calories: 480, protein: 28, carbs: 52, fat: 16,
    portionGrams: 280, portionLabel: 'ساندويش',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-004', name: 'Mansaf (Lamb & Rice)', nameAr: 'منسف',
    calories: 580, protein: 35, carbs: 60, fat: 22,
    portionGrams: 400, portionLabel: 'طبق',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-005', name: 'Falafel (3 pieces)', nameAr: 'فلافل',
    calories: 330, protein: 13, carbs: 31, fat: 18,
    portionGrams: 150, portionLabel: '3 حبات',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-006', name: 'Tabbouleh Salad', nameAr: 'سلطة تبولة',
    calories: 150, protein: 4, carbs: 18, fat: 8,
    portionGrams: 180, portionLabel: 'طبق',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-007', name: 'Dates (5 pieces)', nameAr: 'تمر',
    calories: 141, protein: 1, carbs: 37.5, fat: 0,
    portionGrams: 50, portionLabel: '5 حبات',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-008', name: 'Jareesh', nameAr: 'جريش',
    calories: 390, protein: 14, carbs: 65, fat: 9,
    portionGrams: 300, portionLabel: 'طبق',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-009', name: 'Harees', nameAr: 'هريس',
    calories: 280, protein: 18, carbs: 38, fat: 6,
    portionGrams: 250, portionLabel: 'طبق',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-010', name: 'Arabic Bread (1 loaf)', nameAr: 'خبز عربي',
    calories: 150, protein: 5, carbs: 30, fat: 1.5,
    portionGrams: 60, portionLabel: 'رغيف',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-011', name: 'Lentil Soup', nameAr: 'شوربة عدس',
    calories: 180, protein: 11, carbs: 28, fat: 3,
    portionGrams: 300, portionLabel: 'وعاء',
    category: 'arabic', source: 'custom',
  },
  {
    id: 'f-012', name: 'Mutton Machboos', nameAr: 'مجبوس لحم',
    calories: 680, protein: 42, carbs: 68, fat: 24,
    portionGrams: 400, portionLabel: 'طبق',
    category: 'arabic', source: 'custom',
  },
  // ── High-Protein / Fitness ────────────────────────────────────────────────
  {
    id: 'f-101', name: 'Grilled Chicken Breast', nameAr: 'صدر دجاج مشوي',
    calories: 165, protein: 31, carbs: 0, fat: 4,
    portionGrams: 150, portionLabel: 'قطعة 150ج',
    category: 'western', source: 'usda',
  },
  {
    id: 'f-102', name: 'Boiled Eggs (2)', nameAr: 'بيض مسلوق',
    calories: 156, protein: 12, carbs: 1, fat: 10,
    portionGrams: 100, portionLabel: 'بيضتان',
    category: 'western', source: 'usda',
  },
  {
    id: 'f-103', name: 'Greek Yogurt', nameAr: 'زبادي يوناني',
    calories: 100, protein: 17, carbs: 6, fat: 0.7,
    portionGrams: 170, portionLabel: 'وعاء 170ج',
    category: 'western', source: 'usda',
  },
  {
    id: 'f-104', name: 'Oats (cooked)', nameAr: 'شوفان مطبوخ',
    calories: 158, protein: 5.5, carbs: 27, fat: 3.2,
    portionGrams: 240, portionLabel: 'كوب',
    category: 'western', source: 'usda',
  },
  {
    id: 'f-105', name: 'Banana', nameAr: 'موز',
    calories: 105, protein: 1.3, carbs: 27, fat: 0.4,
    portionGrams: 120, portionLabel: 'حبة',
    category: 'snack', source: 'usda',
  },
  {
    id: 'f-106', name: 'Almonds (30g)', nameAr: 'لوز',
    calories: 174, protein: 6, carbs: 5, fat: 15,
    portionGrams: 30, portionLabel: 'حفنة 30ج',
    category: 'snack', source: 'usda',
  },
  {
    id: 'f-107', name: 'Brown Rice (cooked)', nameAr: 'أرز بني مطبوخ',
    calories: 218, protein: 4.5, carbs: 46, fat: 1.6,
    portionGrams: 200, portionLabel: 'كوب',
    category: 'western', source: 'usda',
  },
  {
    id: 'f-108', name: 'Grilled Salmon', nameAr: 'سمك سلمون مشوي',
    calories: 208, protein: 28, carbs: 0, fat: 10,
    portionGrams: 150, portionLabel: 'قطعة',
    category: 'western', source: 'usda',
  },
];

export async function searchFood(query: string): Promise<FoodItem[]> {
  await new Promise(r => setTimeout(r, 300));
  if (!query.trim()) return FOOD_DB.slice(0, 12);
  const q = query.toLowerCase().trim();
  return FOOD_DB.filter(f =>
    f.nameAr.includes(query) ||
    f.name.toLowerCase().includes(q)
  );
}

export async function getFoodById(id: string): Promise<FoodItem | null> {
  return FOOD_DB.find(f => f.id === id) ?? null;
}

export function getPopularFoods(): FoodItem[] {
  return FOOD_DB.slice(0, 8);
}

export function getHighProteinFoods(): FoodItem[] {
  return FOOD_DB.filter(f => f.protein >= 20).slice(0, 6);
}
