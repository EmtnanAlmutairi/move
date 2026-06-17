import { BarcodeResult, FoodItem } from '../types';

// ─── Mock Barcode Database ────────────────────────────────────────────────────
// TODO: Replace with real OpenFoodFacts API
// Endpoint: https://world.openfoodfacts.org/api/v0/product/{barcode}.json
// Also query: https://world.openfoodfacts.org/cgi/search.pl?code={barcode}
// Cache results in Redis (TTL 7 days) — barcode data rarely changes
// Offline cache: store top-1000 Saudi products in local SQLite

const MOCK_BARCODE_DB: Record<string, FoodItem> = {
  '6281003001007': {
    id: 'bc-001',
    name: 'Almarai Full Fat Laban',
    nameAr: 'لبن المراعي كامل الدسم',
    calories: 62,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.5,
    portionGrams: 100,
    portionLabel: '100مل',
    category: 'drink',
    source: 'barcode',
    barcode: '6281003001007',
  },
  '6281087001119': {
    id: 'bc-002',
    name: 'Almarai Yogurt Plain',
    nameAr: 'زبادي المراعي سادة',
    calories: 56,
    protein: 4.8,
    carbs: 5.0,
    fat: 1.7,
    portionGrams: 150,
    portionLabel: 'وعاء 150ج',
    category: 'snack',
    source: 'barcode',
    barcode: '6281087001119',
  },
  '6294003521015': {
    id: 'bc-003',
    name: 'ÜLKER Petit Beurre',
    nameAr: 'بتي بور أولكر',
    calories: 432,
    protein: 7,
    carbs: 69,
    fat: 13,
    portionGrams: 100,
    portionLabel: '100ج',
    category: 'snack',
    source: 'barcode',
    barcode: '6294003521015',
  },
  '5449000000996': {
    id: 'bc-004',
    name: 'Coca-Cola Classic 330ml',
    nameAr: 'كوكا كولا كلاسيك 330مل',
    calories: 139,
    protein: 0,
    carbs: 35,
    fat: 0,
    portionGrams: 330,
    portionLabel: 'علبة 330مل',
    category: 'drink',
    source: 'barcode',
    barcode: '5449000000996',
  },
  '6221037300007': {
    id: 'bc-005',
    name: 'Nadec Milk Full Fat',
    nameAr: 'حليب نادك كامل الدسم',
    calories: 63,
    protein: 3.4,
    carbs: 4.7,
    fat: 3.5,
    portionGrams: 200,
    portionLabel: 'كوب 200مل',
    category: 'drink',
    source: 'barcode',
    barcode: '6221037300007',
  },
};

// Simulate the mock demo barcode (cycles through DB)
const DEMO_BARCODES = Object.keys(MOCK_BARCODE_DB);
let _demoIndex = 0;

export async function getFoodByBarcode(barcode: string): Promise<BarcodeResult> {
  // TODO: Real implementation:
  // 1. Check local SQLite cache first (~50MB, top Saudi products)
  // 2. Query OpenFoodFacts API if not in cache
  // 3. Fallback to USDA FoodData Central for Western products
  // 4. Cache result in Redis (7d TTL)
  //
  // const cachedResult = await localDB.get(`barcode:${barcode}`);
  // if (cachedResult) return { barcode, foodItem: cachedResult, found: true };
  //
  // const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  // const data = await res.json();
  // if (data.status === 1) {
  //   const item = openFoodFactsToFoodItem(data.product);
  //   await localDB.set(`barcode:${barcode}`, item, { ttl: 604800 });
  //   return { barcode, foodItem: item, found: true };
  // }
  // return { barcode, foodItem: null, found: false };

  await new Promise(r => setTimeout(r, 900));

  // For demo: look up real barcode OR return next demo result
  const found = MOCK_BARCODE_DB[barcode];
  if (found) return { barcode, foodItem: found, found: true };

  // Demo mode: cycle through mock DB
  const demoItem = MOCK_BARCODE_DB[DEMO_BARCODES[_demoIndex % DEMO_BARCODES.length]];
  _demoIndex++;
  return { barcode, foodItem: demoItem, found: true };
}

export function getDemoBarcodes(): string[] {
  return DEMO_BARCODES;
}
