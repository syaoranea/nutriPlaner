import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MealPlanService } from '../../../core/services/meal-plan.service';
import { NutritionService } from '../../../core/services/nutrition.service';
import { MealPlan } from '../../../core/models/models';
import { DecimalPipe } from '@angular/common';
import { take } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-plan',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="add-page page-enter">
      <div class="page-header">
        <a routerLink="/dashboard/plans" class="back-btn">← Voltar</a>
        <h1>{{ isEditing() ? 'Editar Plano' : 'Novo Plano Alimentar' }}</h1>
        <p>{{ isEditing() ? 'Atualize as informações do seu plano' : 'Configure as refeições do seu plano diário' }}</p>
      </div>

      @if (error()) {
        <div class="alert-error">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="plan-form">
        <!-- Plan Info -->
        <div class="form-section card">
          <h2 class="section-title">Informações do Plano</h2>
          <div class="field-row">
            <div class="form-group">
              <label>Nome do plano *</label>
              <input type="text" formControlName="name" placeholder="Ex: Plano de ganho de massa" />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <span class="field-error">Nome é obrigatório</span>
              }
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" formControlName="description" placeholder="Breve descrição do plano" />
            </div>
          </div>
        </div>

        <!-- Meals -->
        <div class="form-section card">
          <div class="section-header-row">
            <h2 class="section-title">Refeições</h2>
            <button type="button" class="btn-add-meal" (click)="addMeal()">+ Adicionar Refeição</button>
          </div>

          @if (meals.length === 0) {
            <p class="no-meals">Nenhuma refeição adicionada. Clique em "+ Adicionar Refeição".</p>
          }

          <div class="meals-list" formArrayName="meals">
            @for (meal of meals.controls; track $index; let mealIdx = $index) {
              <div class="meal-block" [formGroupName]="mealIdx">
                <div class="meal-block-header">
                  <span class="meal-num">{{ mealIdx + 1 }}</span>
                  <div class="meal-name-time">
                    <input type="text" formControlName="name" placeholder="Nome da refeição (ex: Café da manhã)" />
                    <input type="time" formControlName="time" />
                  </div>
                  <button type="button" class="remove-meal-btn" (click)="removeMeal(mealIdx)">✕</button>
                </div>

                <!-- Foods in this meal -->
                <div class="foods-section">
                  <div class="foods-header">
                    <h4>Alimentos</h4>
                    <button type="button" class="btn-add-food" (click)="addFood(mealIdx)">+ Adicionar Alimento</button>
                  </div>

                  <div class="foods-list" formArrayName="foods">
                    @for (food of getFoods(mealIdx).controls; track $index; let foodIdx = $index) {
                      <div class="food-row" [formGroupName]="foodIdx">
                        <div class="food-main-info">
                          <div class="food-field">
                            <label>Alimento</label>
                            <div class="name-with-ai">
                              <input type="text" formControlName="name" placeholder="Ex: Peito de Frango" class="food-name" />
                              <button type="button" class="btn-ai-calc" (click)="onCalculateMacros(mealIdx, foodIdx)" [disabled]="isCalculating(mealIdx, foodIdx)">
                                @if (isCalculating(mealIdx, foodIdx)) {
                                  <span class="spinner-tiny"></span>
                                } @else {
                                  ✨ Calcular
                                }
                              </button>
                            </div>
                          </div>
                          <div class="food-field amount-field">
                            <label>Qtd (g/ml)</label>
                            <input type="number" formControlName="quantity" placeholder="0" min="0" step="0.01" />
                          </div>
                        </div>
                        
                        <div class="food-macros">
                          <div class="food-input-group">
                            <label>Calorias</label>
                            <input type="number" formControlName="calories" placeholder="0" min="0" step="0.01" />
                          </div>
                          <div class="food-input-group">
                            <label>Proteína</label>
                            <input type="number" formControlName="protein" placeholder="0" min="0" step="0.01" />
                          </div>
                          <div class="food-input-group">
                            <label>Carbos</label>
                            <input type="number" formControlName="carbs" placeholder="0" min="0" step="0.01" />
                          </div>
                          <div class="food-input-group">
                            <label>Gorduras</label>
                            <input type="number" formControlName="fat" placeholder="0" min="0" step="0.01" />
                          </div>
                        </div>
                        <button type="button" class="remove-food-btn" (click)="removeFood(mealIdx, foodIdx)">✕</button>
                      </div>
                    }
                  </div>

                  @if (getFoods(mealIdx).length > 0) {
                    <div class="meal-totals-summary">
                      <span>Total da Refeição:</span>
                      <strong>{{ getMealTotal(mealIdx, 'calories') | number:'1.2-2' }} kcal</strong>
                      <span>•</span>
                      <span>P: {{ getMealTotal(mealIdx, 'protein') | number:'1.2-2' }}g</span>
                      <span>C: {{ getMealTotal(mealIdx, 'carbs') | number:'1.2-2' }}g</span>
                      <span>G: {{ getMealTotal(mealIdx, 'fat') | number:'1.2-2' }}g</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Totals Preview -->
        @if (meals.length > 0) {
          <div class="totals-preview card">
            <h3>Totais Diários do Plano</h3>
            <div class="totals-grid">
              <div class="total-item">
                <span>🔥</span>
                <div>
                  <strong>{{ computedTotalCalories() | number:'1.2-2' }}</strong>
                  <span>kcal</span>
                </div>
              </div>
              <div class="total-item">
                <span>💪</span>
                <div>
                  <strong>{{ computedTotalProtein() | number:'1.2-2' }}g</strong>
                  <span>Proteína</span>
                </div>
              </div>
              <div class="total-item">
                <span>🌾</span>
                <div>
                  <strong>{{ computedTotalCarbs() | number:'1.2-2' }}g</strong>
                  <span>Carbs</span>
                </div>
              </div>
              <div class="total-item">
                <span>🥑</span>
                <div>
                  <strong>{{ computedTotalFat() | number:'1.2-2' }}g</strong>
                  <span>Gorduras</span>
                </div>
              </div>
            </div>
          </div>
        }

        <div class="form-actions">
          <a routerLink="/dashboard/plans" class="btn-cancel">Cancelar</a>
          <button type="submit" class="btn-save" [disabled]="saving()">
            @if (saving()) { <span class="spinner"></span> } @else { {{ isEditing() ? 'Salvar Alterações' : 'Criar Plano' }} }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .add-page { max-width: 1600px; margin: 0 auto; padding-bottom: 40px; }
    .page-header {
      margin-bottom: 28px;
      .back-btn {
        display: inline-block;
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: 12px;
        transition: color var(--transition-fast);
        &:hover { color: var(--primary); }
      }
      h1 { font-size: 1.75rem; margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 0.9rem; }
    }
    .alert-error {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.4);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #fca5a5;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .plan-form { display: flex; flex-direction: column; gap: 20px; }
    .form-section { padding: 24px; }
    .section-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
      input {
        padding: 10px 14px;
        background: var(--bg-surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.9rem;
        font-family: inherit;
        outline: none;
        transition: border-color var(--transition-fast);
        &:focus { border-color: var(--primary); }
        &::placeholder { color: var(--text-muted); }
      }
    }
    .field-error { font-size: 0.78rem; color: #f87171; }
    .btn-add-meal {
      padding: 8px 16px;
      background: var(--primary-glow);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-sm);
      color: var(--primary);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
      &:hover { background: rgba(34,197,94,0.25); }
    }
    .no-meals {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
      padding: 24px;
    }
    .meals-list { display: flex; flex-direction: column; gap: 20px; }
    .meal-block {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .meal-block-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meal-num {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .meal-name-time {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      input {
        padding: 8px 12px;
        background: var(--bg-card);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.875rem;
        font-family: inherit;
        outline: none;
        &:focus { border-color: var(--primary); }
        &::placeholder { color: var(--text-muted); }
      }
    }
    .remove-meal-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      width: 30px; height: 30px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all var(--transition-fast);
      &:hover { border-color: #f87171; color: #f87171; background: rgba(239,68,68,0.1); }
    }

    /* Foods Section */
    .foods-section {
      background: rgba(0,0,0,0.1);
      border-radius: var(--radius-sm);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .foods-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 { font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    }
    .btn-add-food {
      padding: 6px 12px;
      background: rgba(34,197,94,0.1);
      border: 1px dashed var(--primary);
      border-radius: var(--radius-sm);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      &:hover { background: rgba(34,197,94,0.2); }
    }
    .foods-list { display: flex; flex-direction: column; gap: 12px; }
    .food-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      position: relative;
    }
    .food-main-info {
      display: grid;
      grid-template-columns: 1fr 100px;
      gap: 12px;
    }
    .food-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
      input {
        padding: 8px 12px;
        background: var(--bg-surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.85rem;
        outline: none;
        &:focus { border-color: var(--primary); }
      }
    }
    .food-macros {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .food-input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
      input {
        width: 100%;
        padding: 6px 8px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.8rem;
        outline: none;
        &:focus { border-color: var(--primary); }
        &::-webkit-inner-spin-button { display: none; }
      }
    }
    .remove-food-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 24px; height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      &:hover { background: #f87171; color: #fff; border-color: #f87171; }
    }
    .meal-totals-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding-top: 8px;
      border-top: 1px solid var(--border);
      strong { color: var(--primary); }
    }

    .totals-preview {
      padding: 20px;
      border-color: var(--border-accent);
      background: rgba(34,197,94,0.05);
      h3 { font-size: 0.95rem; margin-bottom: 14px; }
    }
    .totals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .total-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      div {
        display: flex;
        flex-direction: column;
        strong { font-size: 1.1rem; color: var(--text-primary); font-weight: 700; }
        span { font-size: 0.75rem; color: var(--text-muted); }
      }
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .btn-cancel {
      padding: 11px 24px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--text-secondary); color: var(--text-primary); }
    }
    .btn-save {
      padding: 11px 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition);
      &:hover:not(:disabled) { box-shadow: 0 6px 20px var(--primary-glow); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .name-with-ai {
      display: flex;
      align-items: center;
      gap: 8px;
      input { flex: 1; }
    }
    .btn-ai-calc {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white; border: none; border-radius: var(--radius-sm);
      padding: 6px 10px; font-size: 0.7rem; font-weight: 600;
      cursor: pointer; white-space: nowrap; height: 34px;
      display: flex; align-items: center; justify-content: center;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    .spinner-tiny {
      width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 700px) {
      .field-row { grid-template-columns: 1fr; }
      .food-row { grid-template-columns: 1fr; gap: 4px; }
      .food-macros { grid-template-columns: repeat(4, 1fr); }
      .totals-grid { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class AddPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private mealPlanService = inject(MealPlanService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private nutritionService = inject(NutritionService);

  isEditing = signal(false);
  editId = signal('');
  saving = signal(false);
  error = signal('');
  calculatingMap = signal<Record<string, boolean>>({});

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    meals: this.fb.array([]),
  });

  get meals() { return this.form.get('meals') as FormArray; }

  getFoods(mealIdx: number) {
    return this.meals.at(mealIdx).get('foods') as FormArray;
  }

  isCalculating(mealIdx: number, foodIdx: number): boolean {
    return this.calculatingMap()[`${mealIdx}-${foodIdx}`] || false;
  }

  // Macro calculations for the whole plan
  computedTotalCalories() {
    return this.meals.controls.reduce((sum, meal) => sum + this.calculateMealTotal(meal, 'calories'), 0);
  }
  computedTotalProtein() {
    return this.meals.controls.reduce((sum, meal) => sum + this.calculateMealTotal(meal, 'protein'), 0);
  }
  computedTotalCarbs() {
    return this.meals.controls.reduce((sum, meal) => sum + this.calculateMealTotal(meal, 'carbs'), 0);
  }
  computedTotalFat() {
    return this.meals.controls.reduce((sum, meal) => sum + this.calculateMealTotal(meal, 'fat'), 0);
  }

  // Helper to calculate totals for a single meal across its foods
  private calculateMealTotal(mealControl: AbstractControl, field: string): number {
    const foods = mealControl.get('foods') as FormArray;
    if (!foods) return 0;
    return foods.controls.reduce((sum, food) => sum + (Number(food.get(field)?.value) || 0), 0);
  }

  // Wrapper for template access
  getMealTotal(mealIdx: number, field: string): number {
    return this.calculateMealTotal(this.meals.at(mealIdx), field);
  }

  ngOnInit() {
    console.log('AddPlanComponent: ngOnInit');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('AddPlanComponent: Modo edição detectado para id:', id);
      this.isEditing.set(true);
      this.editId.set(id);
      this.mealPlanService.getMealPlan(id).pipe(take(1)).subscribe({
        next: (plan) => {
          console.log('AddPlanComponent: Plano carregado:', plan?.name);
          if (!plan) {
            console.warn('AddPlanComponent: Plano não encontrado no Firestore.');
            return;
          }
          this.form.patchValue({ name: plan.name, description: plan.description });
          // Clear existing and rebuild from plan data
          this.meals.clear();
          plan.meals?.forEach((m) => {
            const mealGroup = this.createMealGroup(m);
            this.meals.push(mealGroup);
          });
        },
        error: (err) => console.error('AddPlanComponent: Erro ao carrergar plano:', err)
      });
    } else {
      console.log('AddPlanComponent: Modo criação');
      // Add one default meal for new plans
      this.addMeal();
    }
  }

  addMeal() {
    this.meals.push(this.createMealGroup());
  }

  removeMeal(i: number) {
    this.meals.removeAt(i);
  }

  addFood(mealIdx: number) {
    this.getFoods(mealIdx).push(this.createFoodGroup());
  }

  removeFood(mealIdx: number, foodIdx: number) {
    this.getFoods(mealIdx).removeAt(foodIdx);
  }

  private createMealGroup(data?: any) {
    const group = this.fb.group({
      id: [data?.id || uuidv4()],
      name: [data?.name || '', Validators.required],
      time: [data?.time || '08:00'],
      foods: this.fb.array([]),
    });

    const foodsArray = group.get('foods') as FormArray;
    if (data?.foods && Array.isArray(data.foods)) {
      data.foods.forEach((f: any) => foodsArray.push(this.createFoodGroup(f)));
    } else if (!data) {
      foodsArray.push(this.createFoodGroup());
    }

    return group;
  }

  private createFoodGroup(data?: any) {
    return this.fb.group({
      id: [data?.id || uuidv4()],
      name: [data?.name || '', Validators.required],
      quantity: [data?.quantity || 100],
      unit: [data?.unit || 'g'],
      calories: [data?.calories || 0],
      protein: [data?.protein || 0],
      carbs: [data?.carbs || 0],
      fat: [data?.fat || 0],
    });
  }

  async onCalculateMacros(mealIdx: number, foodIdx: number) {
    const foodGroup = this.getFoods(mealIdx).at(foodIdx);
    const { name, quantity, unit } = foodGroup.value;

    if (!name) {
      this.error.set('Digite o nome do alimento primeiro.');
      return;
    }

    const key = `${mealIdx}-${foodIdx}`;
    this.calculatingMap.update(map => ({ ...map, [key]: true }));
    this.error.set('');

    try {
      const data = await this.nutritionService.calculateMacros(name, quantity, unit);
      foodGroup.patchValue({
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      });
    } catch (e: any) {
      this.error.set(e.message || 'Erro ao calcular macros com AI.');
    } finally {
      this.calculatingMap.update(map => ({ ...map, [key]: false }));
    }
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    try {
      const user = await new Promise<any>((res) =>
        this.authService.currentUser$.pipe(take(1)).subscribe(res),
      );

      const val = this.form.getRawValue();

      // Transform form value to match DB schema (computing meal totals)
      const meals = (val.meals as any[]).map(m => {
        const foodItems = (m.foods || []) as any[];
        return {
          ...m,
          calories: foodItems.reduce((s: number, f: any) => s + (Number(f.calories) || 0), 0),
          protein: foodItems.reduce((s: number, f: any) => s + (Number(f.protein) || 0), 0),
          carbs: foodItems.reduce((s: number, f: any) => s + (Number(f.carbs) || 0), 0),
          fat: foodItems.reduce((s: number, f: any) => s + (Number(f.fat) || 0), 0),
        };
      });

      const planData: Omit<MealPlan, 'id'> = {
        uid: user.uid,
        name: val.name!,
        description: val.description || '',
        createdAt: new Date(),
        meals: meals,
        totalCalories: this.computedTotalCalories(),
        totalProtein: this.computedTotalProtein(),
        totalCarbs: this.computedTotalCarbs(),
        totalFat: this.computedTotalFat(),
      };

      if (this.isEditing()) {
        await this.mealPlanService.updateMealPlan(this.editId(), planData as any);
      } else {
        await this.mealPlanService.createMealPlan(planData);
      }
      this.router.navigate(['/dashboard/plans']);
    } catch (e: any) {
      console.error('Error saving plan:', e);
      this.error.set('Erro ao salvar o plano. Tente novamente.');
    } finally {
      this.saving.set(false);
    }
  }
}
