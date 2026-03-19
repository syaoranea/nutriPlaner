export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: Date;
    goals: NutritionalGoals;
}

export interface NutritionalGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
}

export interface MealPlan {
    id?: string;
    uid: string;
    name: string;
    description: string;
    createdAt: Date;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: Meal[];
}

export interface Meal {
    id: string;
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: Food[];
}

export interface Food {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface DailyLog {
    id?: string;
    uid: string;
    date: string; // ISO format: YYYY-MM-DD
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: Meal[];
}
