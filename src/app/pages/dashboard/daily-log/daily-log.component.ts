import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DailyIntakeService } from '../../../core/services/daily-intake.service';
import { MealPlanService } from '../../../core/services/meal-plan.service';
import { NutritionService } from '../../../core/services/nutrition.service';
import { DateService } from '../../../core/services/date.service';
import { DailyLog, Meal, Food, UserProfile, MealPlan } from '../../../core/models/models';
import { take } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule, ReactiveFormsModule],
  template: `
    <div class="daily-page page-enter">
      <div class="page-header">
        <div>
          <h1>Menu Diário</h1>
          <p>Registre seu consumo e acompanhe suas metas</p>
        </div>
        <div class="date-nav">
          <button class="nav-btn" (click)="changeDate(-1)">◀</button>
          <div class="current-date">
             <span class="calendar-icon">📅</span>
             {{ selectedDate() | date:'dd/MM/yyyy' }}
          </div>
          <button class="nav-btn" (click)="changeDate(1)">▶</button>
        </div>
      </div>

      <!-- PROGRESS SECTION -->
      <div class="progress-section card">
         <h3>Resumo do dia</h3>
         <div class="macro-progress-grid">
            <div class="progress-item">
               <div class="progress-info">
                  <span>🔥 Calorias</span>
                  <strong>{{ totals().calories | number:'1.2-2' }} / {{ profile()?.goals?.calories || 2000 | number:'1.2-2' }} kcal</strong>
               </div>
               <div class="progress-bar-bg">
                  <div class="progress-fill green" [style.width.%]="calcPercent('calories')"></div>
               </div>
            </div>
            <div class="progress-item">
               <div class="progress-info">
                  <span>💪 Proteínas</span>
                  <strong>{{ totals().protein | number:'1.2-2' }}g / {{ profile()?.goals?.protein || 150 | number:'1.2-2' }}g</strong>
               </div>
               <div class="progress-bar-bg">
                  <div class="progress-fill blue" [style.width.%]="calcPercent('protein')"></div>
               </div>
            </div>
            <div class="progress-item">
               <div class="progress-info">
                  <span>🌾 Carbos</span>
                  <strong>{{ totals().carbs | number:'1.2-2' }}g / {{ profile()?.goals?.carbs || 250 | number:'1.2-2' }}g</strong>
               </div>
               <div class="progress-bar-bg">
                  <div class="progress-fill yellow" [style.width.%]="calcPercent('carbs')"></div>
               </div>
            </div>
            <div class="progress-item">
               <div class="progress-info">
                  <span>🥑 Gorduras</span>
                  <strong>{{ totals().fat | number:'1.2-2' }}g / {{ profile()?.goals?.fat || 65 | number:'1.2-2' }}g</strong>
               </div>
               <div class="progress-bar-bg">
                  <div class="progress-fill purple" [style.width.%]="calcPercent('fat')"></div>
               </div>
            </div>
         </div>
      </div>

      <div class="meals-actions">
        <button class="btn-primary" (click)="showRegisterOptions.set(!showRegisterOptions())">
          <span>+</span> Registrar Refeição
        </button>
        
        @if (showRegisterOptions()) {
          <div class="register-dropdown card">
            <button (click)="openImportModal()">📥 Importar de Plano</button>
            <button (click)="addEmptyMeal()">➕ Criar Personalizada</button>
          </div>
        }

        <!-- IMPORT DROPDOWN (Replaces Modal) -->
        @if (showImportModal()) {
          <div class="dropdown-overlay" (click)="showImportModal.set(false)"></div>
          <div class="import-dropdown card">
            <div class="import-header">
              <h3>Importar de Plano</h3>
              <button class="close-btn" (click)="showImportModal.set(false)">✕</button>
            </div>
            <div class="plans-select-list">
              @if (allPlans().length === 0) {
                <p class="empty-p">Nenhum plano alimentar encontrado.</p>
              } @else {
                @for (plan of allPlans(); track plan.id) {
                  <div class="plan-import-item">
                    <div class="plan-info">
                      <strong>{{ plan.name }}</strong>
                      <span>{{ plan.meals.length }} refeições</span>
                    </div>
                    <div class="plan-meals-options">
                       @for (meal of plan.meals; track meal.id) {
                         <button (click)="importMeal(meal)">Importar {{ meal.name }}</button>
                       }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

        <button class="btn-save-daily" [disabled]="saving()" (click)="saveLog()">
          @if (saving()) { <div class="spinner-sm"></div> } @else { Salvar Alterações }
        </button>
      </div>

      @if (error()) {
        <div class="alert-error">{{ error() }}</div>
      }

      <!-- MEALS LIST -->
      <div class="meals-list">
         @if (loading()) {
            <div class="loading-center">
               <div class="spinner-lg"></div>
               <p>Carregando registros...</p>
            </div>
         } @else if (meals.length === 0) {
            <div class="empty-state card">
               <span class="empty-icon">🍽️</span>
               <p>Nenhuma refeição registrada para este dia.</p>
               <button class="btn-secondary" (click)="addEmptyMeal()">Começar agora</button>
            </div>
         } @else {
            <form [formGroup]="form">
              <div formArrayName="meals" class="meals-container">
                @for (meal of meals.controls; track $index; let mealIdx = $index) {
                  <div [formGroupName]="mealIdx" class="meal-card card">
                    <div class="meal-header">
                      <div class="meal-title-group">
                        <input type="time" formControlName="time" class="time-input">
                        <input type="text" formControlName="name" placeholder="Ex: Café da Manhã" class="meal-name-input">
                      </div>
                      <button type="button" class="btn-remove" (click)="removeMeal(mealIdx)">✕</button>
                    </div>

                    <div formArrayName="foods" class="food-list">
                      @for (food of getFoods(mealIdx).controls; track $index; let foodIdx = $index) {
                        <div [formGroupName]="foodIdx" class="food-row">
                          <div class="food-main">
                            <input type="text" formControlName="name" placeholder="Nome do alimento" class="food-name-input">
                            <div class="food-qty">
                              <input type="number" formControlName="quantity" class="qty-input">
                              <span class="unit-label">g/ml</span>
                            </div>
                            <button type="button" class="ai-btn" (click)="calculateMacros(mealIdx, foodIdx)" [disabled]="calculatingMap()[mealIdx + '-' + foodIdx]">
                              @if (calculatingMap()[mealIdx + '-' + foodIdx]) { ⏳ } @else { ✨ AI }
                            </button>
                          </div>
                          <div class="food-macros-inputs">
                            <div class="macro-in">
                              <label>Kcal</label>
                              <input type="number" formControlName="calories">
                            </div>
                            <div class="macro-in">
                              <label>P</label>
                              <input type="number" formControlName="protein">
                            </div>
                            <div class="macro-in">
                              <label>C</label>
                              <input type="number" formControlName="carbs">
                            </div>
                            <div class="macro-in">
                              <label>G</label>
                              <input type="number" formControlName="fat">
                            </div>
                            <button type="button" class="btn-del-food" (click)="removeFood(mealIdx, foodIdx)">✕</button>
                          </div>
                        </div>
                      }
                      <button type="button" class="add-food-link" (click)="addFood(mealIdx)">+ Adicionar alimento</button>
                    </div>

                    <div class="meal-footer">
                       <span>Total da refeição:</span>
                       <strong>{{ getMealTotal(mealIdx, 'calories') | number:'1.2-2' }} kcal</strong>
                       <span class="dot">·</span>
                       <span>P: {{ getMealTotal(mealIdx, 'protein') | number:'1.2-2' }}g</span>
                       <span class="dot">·</span>
                       <span>C: {{ getMealTotal(mealIdx, 'carbs') | number:'1.2-2' }}g</span>
                       <span class="dot">·</span>
                       <span>G: {{ getMealTotal(mealIdx, 'fat') | number:'1.2-2' }}g</span>
                    </div>
                  </div>
                }
              </div>
            </form>
         }
      </div>

    </div>
  `,
  styles: [`
    .daily-page { max-width: 900px; margin: 0 auto; padding-bottom: 80px; }
    .page-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px;
    }
    .date-nav {
      display: flex; align-items: center; gap: 16px; background: var(--bg-surface);
      padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);
    }
    .nav-btn { background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 1.2rem; }
    .current-date { font-weight: 700; display: flex; align-items: center; gap: 8px; }

    .progress-section { padding: 24px; margin-bottom: 24px; }
    .macro-progress-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 16px; }
    .progress-item { display: flex; flex-direction: column; gap: 6px; }
    .progress-info { display: flex; justify-content: space-between; font-size: 0.8rem; }
    .progress-bar-bg { height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; transition: width 0.3s ease; }
    .progress-fill.green { background: var(--primary); }
    .progress-fill.blue { background: #0ea5e9; }
    .progress-fill.yellow { background: #f59e0b; }
    .progress-fill.purple { background: #a855f7; }

    .meals-actions { position: relative; margin-bottom: 24px; display: flex; gap: 12px; }
    .register-dropdown {
      position: absolute; top: 100%; left: 0; margin-top: 8px; z-index: 10;
      display: flex; flex-direction: column; width: 220px; padding: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      button { 
        padding: 10px; text-align: left; background: none; border: none; 
        color: var(--text-primary); cursor: pointer; border-radius: 4px; font-size: 0.9rem;
        &:hover { background: var(--bg-surface); color: var(--primary); }
      }
    }
    .btn-save-daily {
      margin-left: auto; background: var(--primary); color: #fff; border: none;
      padding: 10px 20px; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .meals-list { display: flex; flex-direction: column; gap: 20px; }
    .meal-card { padding: 20px; }
    .meal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .meal-title-group { display: flex; align-items: center; gap: 12px; flex: 1; }
    .time-input { 
      background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary);
      padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.85rem;
    }
    .meal-name-input {
      background: none; border: none; border-bottom: 1.5px solid transparent; color: var(--text-primary);
      font-size: 1.1rem; font-weight: 700; width: 100%; outline: none;
      &:focus { border-bottom-color: var(--primary); }
    }
    .food-list { display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border); padding: 16px 0; }
    .food-row { 
       display: flex; flex-direction: column; gap: 10px; padding: 12px; background: rgba(255,255,255,0.02);
       border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);
    }
    .food-main { display: flex; gap: 10px; align-items: center; }
    .food-name-input { flex: 1; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; border-radius: 4px; }
    .food-qty { display: flex; align-items: center; gap: 4px; background: var(--bg-surface); border: 1px solid var(--border); padding: 0 8px; border-radius: 4px; }
    .qty-input { width: 60px; background: none; border: none; color: var(--text-primary); padding: 8px 0; outline: none; text-align: center; }
    .unit-label { font-size: 0.75rem; color: var(--text-muted); }
    .ai-btn { background: var(--primary-glow); color: var(--primary); border: none; padding: 8px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    
    .food-macros-inputs { display: grid; grid-template-columns: repeat(4, 1fr) 30px; gap: 8px; }
    .macro-in { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.65rem; color: var(--text-muted); font-weight: 700; } input { width: 100%; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary); padding: 4px; border-radius: 4px; font-size: 0.8rem; } }
    .btn-del-food { background: none; border: none; color: var(--text-muted); cursor: pointer; align-self: flex-end; padding-bottom: 5px; &:hover { color: #f87171; } }

    .add-food-link { background: none; border: none; color: var(--primary); cursor: pointer; align-self: flex-start; font-size: 0.85rem; font-weight: 600; }
    .meal-footer { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); border-top: 1px solid var(--border); padding-top: 12px; strong { color: var(--primary); } .dot { color: var(--border); } }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-content { width: 100%; max-width: 500px; padding: 24px; position: relative; }
    .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; }
    .plans-select-list { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; max-height: 400px; overflow-y: auto; }
    .plan-import-item { padding: 12px; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border); }
    .plan-info { margin-bottom: 12px; strong { display: block; color: var(--primary); } span { font-size: 0.75rem; color: var(--text-muted); } }
    .plan-meals-options { display: flex; flex-wrap: wrap; gap: 8px; button { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; &:hover { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); } } }

    .btn-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; &:hover { color: #f87171; } }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .dropdown-overlay { position: fixed; inset: 0; z-index: 5; }
    .import-dropdown {
      position: absolute; top: 100%; left: 0; margin-top: 8px; z-index: 10;
      width: 400px; padding: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.4);
      animation: slideDown 0.3s ease;
    }
    .import-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; h3 { font-size: 1rem; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DailyLogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dailyIntakeService = inject(DailyIntakeService);
  private mealPlanService = inject(MealPlanService);
  private nutritionService = inject(NutritionService);
  private dateService = inject(DateService);

  profile = signal<UserProfile | null>(null);
  currentUserId = signal<string | null>(null);
  selectedDate = signal(this.dateService.getTodayString());
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  showRegisterOptions = signal(false);
  showImportModal = signal(false);
  allPlans = signal<MealPlan[]>([]);
  calculatingMap = signal<Record<string, boolean>>({});
  formUpdateTrigger = signal(0);

  form: FormGroup = this.fb.group({
    meals: this.fb.array([])
  });

  get meals() { return this.form.get('meals') as FormArray; }

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) return;
      this.currentUserId.set(user.uid);
      this.authService.getUserProfile(user.uid).subscribe(p => {
        this.profile.set(p);
      });
      this.loadDailyLog(user.uid, this.selectedDate());
      this.mealPlanService.getMealPlans(user.uid).subscribe(plans => this.allPlans.set(plans));
    });

    this.form.valueChanges.subscribe(() => {
      this.formUpdateTrigger.update(v => v + 1);
    });
  }

  loadDailyLog(uid: string, date: string) {
    this.loading.set(true);
    this.meals.clear();
    this.dailyIntakeService.getDailyLog(uid, date).pipe(take(1)).subscribe(log => {
      if (log) {
        log.meals.forEach(m => this.meals.push(this.createMealGroup(m)));
      }
      this.loading.set(false);
    });
  }

  createMealGroup(data?: Partial<Meal>) {
    const group = this.fb.group({
      id: [data?.id || uuidv4()],
      time: [data?.time || this.dateService.getTimeString()],
      name: [data?.name || 'Nova Refeição', Validators.required],
      foods: this.fb.array([])
    });
    const foodsArr = group.get('foods') as FormArray;
    if (data?.foods) {
      data.foods.forEach(f => foodsArr.push(this.createFoodGroup(f)));
    } else {
      foodsArr.push(this.createFoodGroup());
    }
    return group;
  }

  createFoodGroup(data?: Partial<Food>) {
    return this.fb.group({
      id: [data?.id || uuidv4()],
      name: [data?.name || '', Validators.required],
      quantity: [data?.quantity || 100],
      unit: [data?.unit || 'g'],
      calories: [data?.calories || 0],
      protein: [data?.protein || 0],
      carbs: [data?.carbs || 0],
      fat: [data?.fat || 0]
    });
  }

  getFoods(mealIdx: number) {
    return this.meals.at(mealIdx).get('foods') as FormArray;
  }

  changeDate(days: number) {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    this.selectedDate.set(newDate);
    const uid = this.currentUserId();
    if (uid) this.loadDailyLog(uid, newDate);
  }

  addEmptyMeal() {
    this.meals.push(this.createMealGroup());
    this.showRegisterOptions.set(false);
  }

  openImportModal() {
    this.showImportModal.set(true);
    this.showRegisterOptions.set(false);
  }

  importMeal(meal: Meal) {
    this.meals.push(this.createMealGroup(meal));
    this.showImportModal.set(false);
  }

  removeMeal(idx: number) {
    this.meals.removeAt(idx);
  }

  addFood(mealIdx: number) {
    this.getFoods(mealIdx).push(this.createFoodGroup());
  }

  removeFood(mealIdx: number, foodIdx: number) {
    this.getFoods(mealIdx).removeAt(foodIdx);
  }

  async calculateMacros(mealIdx: number, foodIdx: number) {
    const foodGroup = this.getFoods(mealIdx).at(foodIdx);
    const { name, quantity, unit } = foodGroup.value;
    if (!name) { this.error.set('Informe o nome do alimento.'); return; }

    const key = `${mealIdx}-${foodIdx}`;
    this.calculatingMap.update(m => ({ ...m, [key]: true }));
    try {
      const data = await this.nutritionService.calculateMacros(name, quantity, unit);
      foodGroup.patchValue(data);
    } catch (e: any) {
      this.error.set('Erro ao calcular macros: ' + e.message);
    } finally {
      this.calculatingMap.update(m => ({ ...m, [key]: false }));
    }
  }

  getMealTotal(mealIdx: number, type: 'calories' | 'protein' | 'carbs' | 'fat'): number {
    const foods = this.getFoods(mealIdx).value as Food[];
    return foods.reduce((acc, f) => acc + (Number(f[type]) || 0), 0);
  }

  totals = computed(() => {
    this.formUpdateTrigger(); // Depend on trigger
    const allMeals = this.form.getRawValue().meals as Meal[];
    return allMeals.reduce((acc, m) => {
      const foods = (m.foods || []) as Food[];
      acc.calories += foods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
      acc.protein += foods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
      acc.carbs += foods.reduce((s, f) => s + (Number(f.carbs) || 0), 0);
      acc.fat += foods.reduce((s, f) => s + (Number(f.fat) || 0), 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  calcPercent(type: 'calories' | 'protein' | 'carbs' | 'fat'): number {
    const goals = this.profile()?.goals;
    if (!goals) return 0;
    const goalValue = (goals as any)[type] || 1;
    return Math.min(100, Math.round((this.totals()[type] / goalValue) * 100));
  }

  async saveLog() {
    const uid = this.currentUserId();
    if (!uid) return;
    this.saving.set(true);
    this.error.set('');
    try {
      const raw = this.form.getRawValue();
      const t = this.totals();
      const log: DailyLog = {
        uid: uid,
        date: this.selectedDate(),
        totalCalories: t.calories,
        totalProtein: t.protein,
        totalCarbs: t.carbs,
        totalFat: t.fat,
        meals: raw.meals
      };
      await this.dailyIntakeService.saveDailyLog(log);
    } catch (e: any) {
      this.error.set('Erro ao salvar: ' + e.message);
    } finally {
      this.saving.set(false);
    }
  }
}
