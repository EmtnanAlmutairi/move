import { AIAnalysisResult, FoodItem } from '../types';

// ─── Mock AI Results ──────────────────────────────────────────────────────────
// TODO: Replace with real backend call
// Architecture:
//   Device (fast path):  EfficientNetB0 TFLite (~40ms, 5MB model) via react-native-fast-tflite
//                        YOLOv8n TFLite (~20ms, 3MB) for multi-food localization
//   Backend (slow path): POST /api/v1/food/analyze — PaliGemma 3B (Arabic fine-tuned)
//                        FoodSAM for segmentation + portion volume estimation
//   Decision logic:      confidence >= 0.85 → use on-device result
//                        confidence < 0.85  → send to backend

const MOCK_AI_RESPONSES: AIAnalysisResult[] = [
  {
    foodName:   'Kabsa Chicken',
    arabicName: 'كبسة دجاج',
    calories:   620,
    protein:    38,
    carbs:      72,
    fat:        18,
    confidence: 0.87,
    portionGrams: 350,
    alternatives: [
      { foodName: 'Machboos',        arabicName: 'مجبوس',      confidence: 0.08 },
      { foodName: 'Rice & Chicken',  arabicName: 'أرز بالدجاج', confidence: 0.05 },
    ],
  },
  {
    foodName:   'Grilled Chicken Breast',
    arabicName: 'صدر دجاج مشوي',
    calories:   165,
    protein:    31,
    carbs:      0,
    fat:        4,
    confidence: 0.94,
    portionGrams: 150,
    alternatives: [
      { foodName: 'Grilled Fish', arabicName: 'سمك مشوي', confidence: 0.04 },
    ],
  },
  {
    foodName:   'Hummus with Bread',
    arabicName: 'حمص بالخبز',
    calories:   290,
    protein:    11,
    carbs:      38,
    fat:        12,
    confidence: 0.91,
    portionGrams: 200,
    alternatives: [
      { foodName: 'Mutabbal', arabicName: 'متبل',       confidence: 0.06 },
      { foodName: 'Foul',     arabicName: 'فول مدمس',   confidence: 0.03 },
    ],
  },
  {
    foodName:   'Tabbouleh Salad',
    arabicName: 'سلطة تبولة',
    calories:   150,
    protein:    4,
    carbs:      18,
    fat:        8,
    confidence: 0.83,
    portionGrams: 180,
    alternatives: [
      { foodName: 'Fattoush',    arabicName: 'فتوش',       confidence: 0.11 },
      { foodName: 'Green Salad', arabicName: 'سلطة خضراء', confidence: 0.06 },
    ],
  },
  {
    foodName:   'Dates',
    arabicName: 'تمر',
    calories:   282,
    protein:    2,
    carbs:      75,
    fat:        0,
    confidence: 0.96,
    portionGrams: 100,
    alternatives: [],
  },
  {
    foodName:   'Shawarma Wrap',
    arabicName: 'شاورما دجاج',
    calories:   480,
    protein:    28,
    carbs:      52,
    fat:        16,
    confidence: 0.89,
    portionGrams: 280,
    alternatives: [
      { foodName: 'Falafel Wrap', arabicName: 'فلافل ساندويش', confidence: 0.08 },
    ],
  },
];

let _mockIndex = 0;

export async function analyzeFoodImage(_imageUri: string): Promise<AIAnalysisResult> {
  // TODO: Real implementation steps:
  // 1. Compress image to 200KB max
  // 2. Try on-device EfficientNetB0 first (fast path, no internet needed)
  // 3. If confidence < 0.85, send to backend PaliGemma
  //
  // const form = new FormData();
  // form.append('image', { uri: _imageUri, type: 'image/jpeg', name: 'food.jpg' } as any);
  // const res = await fetch('https://api.move.ai/v1/food/analyze', {
  //   method: 'POST', body: form,
  //   headers: { Authorization: `Bearer ${authToken}` },
  // });
  // return res.json() as AIAnalysisResult;

  await new Promise(r => setTimeout(r, 1800)); // simulate inference time
  const result = MOCK_AI_RESPONSES[_mockIndex % MOCK_AI_RESPONSES.length];
  _mockIndex++;
  return result;
}

// Convert AIAnalysisResult → FoodItem (for storing in meal log)
export function aiResultToFoodItem(result: AIAnalysisResult, portionGrams: number): FoodItem {
  const ratio = portionGrams / result.portionGrams;
  return {
    id:           `ai-${Date.now()}`,
    name:         result.foodName,
    nameAr:       result.arabicName,
    calories:     Math.round(result.calories * ratio),
    protein:      Math.round(result.protein  * ratio),
    carbs:        Math.round(result.carbs    * ratio),
    fat:          Math.round(result.fat      * ratio),
    portionGrams,
    portionLabel: `${portionGrams}ج`,
    category:     'arabic',
    source:       'ai',
  };
}
