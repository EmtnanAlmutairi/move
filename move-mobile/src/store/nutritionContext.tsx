import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { FoodItem, MacroTarget, MealLog, MealType, NutritionSummary } from '../types';

// ─── Default Targets ──────────────────────────────────────────────────────────
export const DEFAULT_TARGETS: MacroTarget = {
  calorieGoal: 2200,
  proteinGoal: 160,
  carbsGoal:   220,
  fatGoal:     70,
  waterGoal:   8,
};

// ─── State ────────────────────────────────────────────────────────────────────
type NutritionState = {
  meals: MealLog[];
  waterCups: number;
  targets: MacroTarget;
  todayDate: string;
};

const todayKey = () => new Date().toISOString().split('T')[0];

const INITIAL_STATE: NutritionState = {
  meals: [
    // Seed with the existing mock meals so screen is not empty on first load
    {
      id: 'seed-1',
      foodItem: {
        id: 'fi-seed-1', name: 'Avocado Toast & Eggs', nameAr: 'توست أفوكادو وبيض',
        calories: 320, protein: 18, carbs: 28, fat: 14,
        portionGrams: 200, portionLabel: 'طبق', category: 'western', source: 'custom',
        imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
      },
      mealType: 'breakfast',
      portionMultiplier: 1,
      loggedAt: '08:00',
      date: todayKey(),
    },
    {
      id: 'seed-2',
      foodItem: {
        id: 'fi-seed-2', name: 'Grilled Salmon Salad', nameAr: 'سلطة سلمون مشوي',
        calories: 450, protein: 38, carbs: 22, fat: 18,
        portionGrams: 300, portionLabel: 'وجبة', category: 'western', source: 'custom',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      },
      mealType: 'lunch',
      portionMultiplier: 1,
      loggedAt: '13:00',
      date: todayKey(),
    },
    {
      id: 'seed-3',
      foodItem: {
        id: 'fi-seed-3', name: 'Greek Yogurt & Berries', nameAr: 'زبادي يوناني وتوت',
        calories: 180, protein: 12, carbs: 20, fat: 4,
        portionGrams: 200, portionLabel: 'كوب', category: 'snack', source: 'custom',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      },
      mealType: 'snack',
      portionMultiplier: 1,
      loggedAt: '16:00',
      date: todayKey(),
    },
  ],
  waterCups: 3,
  targets: DEFAULT_TARGETS,
  todayDate: todayKey(),
};

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_MEAL';    payload: { foodItem: FoodItem; mealType: MealType; portionMultiplier: number } }
  | { type: 'REMOVE_MEAL'; payload: { id: string } }
  | { type: 'UPDATE_MEAL'; payload: { id: string; portionMultiplier: number } }
  | { type: 'SET_WATER';   payload: { cups: number } }
  | { type: 'SET_TARGETS'; payload: MacroTarget };

function reducer(state: NutritionState, action: Action): NutritionState {
  switch (action.type) {
    case 'ADD_MEAL': {
      const now = new Date();
      const log: MealLog = {
        id: `ml-${Date.now()}`,
        foodItem: action.payload.foodItem,
        mealType: action.payload.mealType,
        portionMultiplier: action.payload.portionMultiplier,
        loggedAt: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
        date: todayKey(),
      };
      return { ...state, meals: [...state.meals, log] };
    }
    case 'REMOVE_MEAL':
      return { ...state, meals: state.meals.filter(m => m.id !== action.payload.id) };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(m =>
          m.id === action.payload.id ? { ...m, portionMultiplier: action.payload.portionMultiplier } : m
        ),
      };
    case 'SET_WATER':
      return { ...state, waterCups: action.payload.cups };
    case 'SET_TARGETS':
      return { ...state, targets: action.payload };
    default:
      return state;
  }
}

// ─── Derived selectors ────────────────────────────────────────────────────────
export function computeSummary(meals: MealLog[], waterCups: number, targets: MacroTarget): NutritionSummary {
  const todayMeals = meals.filter(m => m.date === todayKey());

  const totalCalories = Math.round(todayMeals.reduce((s, m) =>
    s + m.foodItem.calories * m.portionMultiplier, 0));
  const totalProtein  = Math.round(todayMeals.reduce((s, m) =>
    s + m.foodItem.protein  * m.portionMultiplier, 0));
  const totalCarbs    = Math.round(todayMeals.reduce((s, m) =>
    s + m.foodItem.carbs    * m.portionMultiplier, 0));
  const totalFat      = Math.round(todayMeals.reduce((s, m) =>
    s + m.foodItem.fat      * m.portionMultiplier, 0));

  // Score: weighted avg of macro adherence (0-100)
  const calScore  = Math.min(totalCalories / targets.calorieGoal, 1) * 40;
  const proScore  = Math.min(totalProtein  / targets.proteinGoal, 1) * 30;
  const carbScore = Math.min(totalCarbs    / targets.carbsGoal,   1) * 15;
  const fatScore  = Math.min(totalFat      / targets.fatGoal,     1) * 15;
  const nutritionScore = Math.round(calScore + proScore + carbScore + fatScore);

  return {
    date: todayKey(),
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    waterCups,
    mealsLogged: todayMeals.length,
    nutritionScore,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
type NutritionCtx = {
  state: NutritionState;
  summary: NutritionSummary;
  todayMeals: MealLog[];
  addMeal:    (foodItem: FoodItem, mealType: MealType, portionMultiplier?: number) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, portionMultiplier: number) => void;
  setWater:   (cups: number) => void;
  setTargets: (targets: MacroTarget) => void;
};

const Ctx = createContext<NutritionCtx | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const summary    = computeSummary(state.meals, state.waterCups, state.targets);
  const todayMeals = state.meals.filter(m => m.date === todayKey());

  const addMeal = useCallback((foodItem: FoodItem, mealType: MealType, portionMultiplier = 1) => {
    dispatch({ type: 'ADD_MEAL', payload: { foodItem, mealType, portionMultiplier } });
  }, []);

  const removeMeal = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MEAL', payload: { id } });
  }, []);

  const updateMeal = useCallback((id: string, portionMultiplier: number) => {
    dispatch({ type: 'UPDATE_MEAL', payload: { id, portionMultiplier } });
  }, []);

  const setWater = useCallback((cups: number) => {
    dispatch({ type: 'SET_WATER', payload: { cups } });
  }, []);

  const setTargets = useCallback((targets: MacroTarget) => {
    dispatch({ type: 'SET_TARGETS', payload: targets });
  }, []);

  return (
    <Ctx.Provider value={{ state, summary, todayMeals, addMeal, removeMeal, updateMeal, setWater, setTargets }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNutrition() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNutrition must be used inside NutritionProvider');
  return ctx;
}
