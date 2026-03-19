import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MealPlanService } from '../../../core/services/meal-plan.service';
import { MealPlan } from '../../../core/models/models';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-meal-plans',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="plans-page page-enter">
      <div class="page-header">
        <div>
          <h1>Planos Alimentares</h1>
          <p>Gerencie todos os seus planos nutricionais</p>
        </div>
        <a routerLink="/dashboard/plans/new" class="btn-new">
          <span>+</span> Novo Plano
        </a>
      </div>
      
      @if (error()) {
        <div class="alert-error">{{ error() }}</div>
      }

      <!-- Custom Delete Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-icon">⚠️</span>
              <h3>Confirmar Exclusão</h3>
            </div>
            <p>Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.</p>
            <div class="modal-actions">
              <button class="btn-cancel-modal" (click)="cancelDelete()">Cancelar</button>
              <button class="btn-confirm-delete" (click)="confirmDelete()">Excluir</button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="loading-center">
          <div class="spinner-lg"></div>
          <p>Carregando planos...</p>
        </div>
      } @else if (plans().length === 0) {
        <div class="empty-page card">
          <span class="empty-icon">📋</span>
          <h2>Nenhum plano criado</h2>
          <p>Crie seu primeiro plano alimentar e comece a controlar sua nutrição</p>
          <a routerLink="/dashboard/plans/new" class="btn-new">Criar primeiro plano</a>
        </div>
      } @else {
        <div class="plans-grid">
          @for (plan of plans(); track plan.id) {
            <div class="plan-card card">
              <div class="plan-card-header">
                <div class="plan-icon">📋</div>
                <div class="plan-actions">
                  <a [routerLink]="['/dashboard/plans/edit', plan.id]" class="action-btn edit-btn" title="Editar">✏️</a>
                  <button class="action-btn delete-btn" (click)="requestDelete(plan.id!)" title="Excluir">🗑️</button>
                </div>
              </div>
              <h3>{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.description || 'Sem descrição' }}</p>
              <div class="plan-stats">
                <div class="plan-stat">
                  <span>🔥</span>
                  <div>
                    <strong>{{ plan.totalCalories | number:'1.2-2' }}</strong>
                    <span>kcal</span>
                  </div>
                </div>
                <div class="plan-stat">
                  <span>💪</span>
                  <div>
                    <strong>{{ plan.totalProtein | number:'1.2-2' }}g</strong>
                    <span>Proteína</span>
                  </div>
                </div>
                <div class="plan-stat">
                  <span>🌾</span>
                  <div>
                    <strong>{{ plan.totalCarbs | number:'1.2-2' }}g</strong>
                    <span>Carbs</span>
                  </div>
                </div>
                <div class="plan-stat">
                  <span>🥑</span>
                  <div>
                    <strong>{{ plan.totalFat | number:'1.2-2' }}g</strong>
                    <span>Gordura</span>
                  </div>
                </div>
              </div>
              <div class="plan-footer">
                <span class="meal-count">{{ plan.meals ? plan.meals.length : 0 }} refeições</span>
                <span class="plan-date">{{ plan.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
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
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 24px;
      width: 90%; max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .modal-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
      .modal-icon { font-size: 1.5rem; }
      h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
    }
    .modal-card p { color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel-modal {
      padding: 10px 18px; background: none; border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-secondary);
      font-weight: 600; cursor: pointer; transition: all 0.2s;
      &:hover { background: var(--bg-surface); color: var(--text-primary); }
    }
    .btn-confirm-delete {
      padding: 10px 22px; background: #ef4444; border: none;
      border-radius: var(--radius-sm); color: #fff;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
      &:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { 
      from { transform: translateY(-20px) scale(0.95); opacity: 0; } 
      to { transform: translateY(0) scale(1.0); opacity: 1; } 
    }
    .btn-new {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.9rem;
      transition: all var(--transition);
      white-space: nowrap;
      &:hover { color: #fff; box-shadow: 0 6px 20px var(--primary-glow); transform: translateY(-1px); }
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px;
      color: var(--text-muted);
    }
    .spinner-lg {
      width: 36px; height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 80px 40px;
      text-align: center;
      .empty-icon { font-size: 3rem; }
      h2 { font-size: 1.3rem; }
      p { color: var(--text-secondary); max-width: 400px; }
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }
    .plan-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
    .plan-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .plan-icon {
      width: 44px; height: 44px;
      border-radius: 10px;
      background: var(--primary-glow);
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .plan-actions { display: flex; gap: 6px; }
    .action-btn {
      width: 32px; height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all var(--transition-fast);
      &:hover { background: var(--bg-surface); transform: scale(1.05); }
    }
    .delete-btn:hover { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.1); }
    h3 { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
    .plan-desc { font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .plan-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 12px;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
    }
    .plan-stat {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8rem;
      div {
        display: flex;
        flex-direction: column;
        strong { color: var(--text-primary); font-size: 0.85rem; }
        span { color: var(--text-muted); font-size: 0.7rem; }
      }
    }
    .plan-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }
    .meal-count {
      padding: 3px 10px;
      background: var(--bg-surface);
      border-radius: 20px;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }
    .plan-date { font-size: 0.78rem; color: var(--text-muted); }

    @media (max-width: 600px) {
      .page-header { flex-direction: column; gap: 12px; }
      .plans-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class MealPlansComponent implements OnInit {
  private authService = inject(AuthService);
  private mealPlanService = inject(MealPlanService);

  plans = signal<MealPlan[]>([]);
  loading = signal(true);
  error = signal('');

  showDeleteModal = signal(false);
  planIdToDelete = signal<string | null>(null);

  ngOnInit() {
    console.log('MealPlansComponent: Iniciando carregamento...');

    // Safety timeout para não ficar travado no loading infinitamente
    const safetyTimeout = setTimeout(() => {
      if (this.loading()) {
        console.warn('MealPlansComponent: Timeout de 10s atingido. Resetando loading.');
        this.loading.set(false);
      }
    }, 10000);

    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        console.log('MealPlansComponent: Usuário logado:', user?.uid);
        if (!user) {
          console.warn('MealPlansComponent: Nenhum usuário encontrado no stream.');
          this.loading.set(false);
          clearTimeout(safetyTimeout);
          return;
        }

        console.log('MealPlansComponent: Solicitando planos do Firestore para o uid:', user.uid);
        this.mealPlanService.getMealPlans(user.uid).subscribe({
          next: (plans) => {
            console.log('MealPlansComponent: Planos recebidos:', plans.length);
            this.plans.set(plans);
            this.loading.set(false);
            clearTimeout(safetyTimeout);
          },
          error: (err) => {
            console.error('MealPlansComponent: Erro ao buscar planos:', err);
            this.error.set('Erro ao carregar planos. Verifique se o banco Firestore foi criado e se os índices foram gerados no console (veja o Console do Navegador).');
            this.loading.set(false);
            clearTimeout(safetyTimeout);
          }
        });
      },
      error: (err) => {
        console.error('MealPlansComponent: Erro no stream de auth:', err);
        this.loading.set(false);
        clearTimeout(safetyTimeout);
      }
    });
  }

  requestDelete(id: string) {
    this.planIdToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.planIdToDelete.set(null);
  }

  async confirmDelete() {
    const id = this.planIdToDelete();
    if (!id) return;

    try {
      await this.mealPlanService.deleteMealPlan(id);
      this.plans.update((p) => p.filter((x) => x.id !== id));
      this.cancelDelete();
    } catch (err) {
      console.error('Erro ao excluir plano:', err);
      this.error.set('Não foi possível excluir o plano. Tente novamente.');
      this.cancelDelete();
    }
  }
}
