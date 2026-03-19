import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MealPlanService } from '../../../core/services/meal-plan.service';
import { DailyIntakeService } from '../../../core/services/daily-intake.service';
import { DateService } from '../../../core/services/date.service';
import { switchMap, take } from 'rxjs/operators';
import { MealPlan, UserProfile, DailyLog } from '../../../core/models/models';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="overview page-enter">
      <div class="page-header">
        <div>
          <h1>Visão Geral</h1>
          <p>Aqui está o resumo do seu plano nutricional</p>
        </div>
        <a routerLink="/dashboard/plans/new" class="btn-new">
          <span>+</span> Novo Plano
        </a>
      </div>

      <!-- STATS CARDS -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(34,197,94,0.15);">🔥</div>
          <div class="stat-info">
            <span class="stat-label">Calorias hoje</span>
            <strong class="stat-value">{{ todayCalories() | number:'1.2-2' }}</strong>
            <span class="stat-sub">/ {{ profile()?.goals?.calories || 2000 | number:'1.2-2' }} kcal</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill green" [style.width.%]="caloriePercent()"></div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(14,165,233,0.15);">💪</div>
          <div class="stat-info">
            <span class="stat-label">Proteínas</span>
            <strong class="stat-value">{{ todayProtein() | number:'1.2-2' }}g</strong>
            <span class="stat-sub">/ {{ profile()?.goals?.protein || 150 | number:'1.2-2' }}g</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill blue" [style.width.%]="proteinPercent()"></div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(245,158,11,0.15);">🌾</div>
          <div class="stat-info">
            <span class="stat-label">Carboidratos</span>
            <strong class="stat-value">{{ todayCarbs() | number:'1.2-2' }}g</strong>
            <span class="stat-sub">/ {{ profile()?.goals?.carbs || 250 | number:'1.2-2' }}g</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill yellow" [style.width.%]="carbPercent()"></div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(168,85,247,0.15);">🥑</div>
          <div class="stat-info">
            <span class="stat-label">Gorduras</span>
            <strong class="stat-value">{{ todayFat() | number:'1.2-2' }}g</strong>
            <span class="stat-sub">/ {{ profile()?.goals?.fat || 65 | number:'1.2-2' }}g</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill purple" [style.width.%]="fatPercent()"></div>
          </div>
        </div>
      </div>

      <!-- BOTTOM SECTION -->
      <div class="bottom-grid">
        <!-- RECENT PLANS -->
        <div class="panel card">
          <div class="panel-header">
            <h2>Planos recentes</h2>
            <a routerLink="/dashboard/plans">Ver todos →</a>
          </div>
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-sm"></div>
              <span>Carregando...</span>
            </div>
          } @else if (plans().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📋</span>
              <p>Nenhum plano criado ainda</p>
              <a routerLink="/dashboard/plans/new" class="btn-sm-primary">Criar primeiro plano</a>
            </div>
          } @else {
            <div class="plans-list">
              @for (plan of plans().slice(0, 4); track plan.id) {
                <div class="plan-row">
                  <div class="plan-row-info">
                    <strong>{{ plan.name }}</strong>
                    <span>{{ plan.createdAt | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="plan-row-stats">
                    <span class="badge-cal">{{ plan.totalCalories | number:'1.2-2' }} kcal</span>
                    <a [routerLink]="['/dashboard/plans/edit', plan.id]" class="btn-edit">✏️</a>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- MACRO BREAKDOWN -->
        <div class="panel card">
          <div class="panel-header">
            <h2>Distribuição de macros</h2>
            <a routerLink="/dashboard/goals">Editar metas →</a>
          </div>
          <div class="macro-chart">
            <div class="pie-wrapper">
              <svg viewBox="0 0 36 36" class="pie">
                <!-- Background circle (Fat color to ensure no gaps) -->
                <circle cx="18" cy="18" r="15.915" stroke="#a855f7" stroke-width="32" fill="none"/>
                <!-- Protein -->
                <circle cx="18" cy="18" r="15.915" stroke="#0ea5e9" stroke-width="32" fill="none"
                  [attr.stroke-dasharray]="proteinDash() + ' 100'" stroke-dashoffset="0"/>
                <!-- Carbs -->
                <circle cx="18" cy="18" r="15.915" stroke="#f59e0b" stroke-width="32" fill="none"
                  [attr.stroke-dasharray]="carbDash() + ' 100'" [attr.stroke-dashoffset]="100 - proteinDash()"/>
              </svg>
            </div>
            <div class="macro-legend">
              <div class="legend-item">
                <span class="legend-dot blue"></span>
                <div>
                  <strong>Proteínas</strong>
                  <span>{{ profile()?.goals?.protein || 150 | number:'1.0-2' }}g · {{ proteinDash() }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <span class="legend-dot yellow"></span>
                <div>
                  <strong>Carboidratos</strong>
                  <span>{{ profile()?.goals?.carbs || 250 | number:'1.0-2' }}g · {{ carbDash() }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <span class="legend-dot purple"></span>
                <div>
                  <strong>Gorduras</strong>
                  <span>{{ profile()?.goals?.fat || 65 | number:'1.0-2' }}g · {{ fatDash() }}%</span>
                </div>
              </div>
            </div>
          </div>
          <p class="macro-info">
            Este gráfico representa a distribuição calórica ideal entre os macronutrientes (Proteínas, Carboidratos e Gorduras) de acordo com suas metas nutricionais atuais.
          </p>
        </div>
      </div>

      <!-- ACHIEVEMENTS SECTION -->
      <div class="achievements-section card">
        <div class="panel-header">
          <h2>Conquistas</h2>
        </div>
        <div class="achievements-grid">
          <div class="streak-card">
            <div class="streak-header">
              <span class="streak-icon">🔥</span>
              <strong>Sequência de Dias</strong>
            </div>
            <div class="streak-body">
              <div class="streak-item">
                <span class="streak-value">{{ currentStreak() }}</span>
                <span class="streak-label">Sequência atual</span>
              </div>
              <div class="streak-divider"></div>
              <div class="streak-item">
                <span class="streak-value">{{ bestStreak() }}</span>
                <span class="streak-label">Melhor sequência</span>
              </div>
            </div>
          </div>

          <div class="streak-card goals-streak">
            <div class="streak-header">
              <span class="streak-icon">🎯</span>
              <strong>Sequência de Metas</strong>
            </div>
            <div class="streak-body">
              <div class="streak-item">
                <span class="streak-value">{{ currentGoalStreak() }}</span>
                <span class="streak-label">Sequência atual</span>
              </div>
              <div class="streak-divider"></div>
              <div class="streak-item">
                <span class="streak-value">{{ bestGoalStreak() }}</span>
                <span class="streak-label">Melhor sequência</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .stat-sub { font-size: 0.8rem; color: var(--text-secondary); }
    .stat-bar {
      height: 5px;
      background: var(--bg-surface);
      border-radius: 3px;
      overflow: hidden;
    }
    .stat-bar-fill {
      height: 100%;
      border-radius: 3px;
      max-width: 100%;
      transition: width 0.6s ease;
      &.green { background: linear-gradient(90deg, var(--primary), var(--primary-dark)); }
      &.blue { background: linear-gradient(90deg, #0ea5e9, #0284c7); }
      &.yellow { background: linear-gradient(90deg, #f59e0b, #d97706); }
      &.purple { background: linear-gradient(90deg, #a855f7, #9333ea); }
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      h2 { font-size: 1rem; font-weight: 700; }
      a { font-size: 0.8rem; color: var(--primary); &:hover { color: var(--primary-light); } }
    }
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 32px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 32px;
      text-align: center;
      color: var(--text-muted);
      .empty-icon { font-size: 2.5rem; }
      p { font-size: 0.9rem; }
    }
    .btn-sm-primary {
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all var(--transition);
      &:hover { color: #fff; box-shadow: 0 4px 15px var(--primary-glow); }
    }
    .plans-list { display: flex; flex-direction: column; gap: 8px; }
    .plan-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-card-hover); }
    }
    .plan-row-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      strong { font-size: 0.875rem; color: var(--text-primary); }
      span { font-size: 0.75rem; color: var(--text-muted); }
    }
    .plan-row-stats {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-cal {
      padding: 3px 10px;
      background: var(--primary-glow);
      color: var(--primary);
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .btn-edit {
      font-size: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      transition: transform var(--transition-fast);
      &:hover { transform: scale(1.2); }
    }

    /* PIE CHART */
    .macro-chart {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .pie-wrapper {
      position: relative;
      width: 130px;
      height: 130px;
      flex-shrink: 0;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }
    .pie { width: 100%; height: 100%; transform: rotate(-90deg); }
    .macro-info {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
      line-height: 1.4;
    }
    .macro-legend { display: flex; flex-direction: column; gap: 14px; flex: 1; }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      strong { display: block; font-size: 0.85rem; color: var(--text-primary); }
      span { font-size: 0.75rem; color: var(--text-muted); }
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      &.blue { background: #0ea5e9; }
      &.yellow { background: #f59e0b; }
      &.purple { background: #a855f7; }
    }

    /* ACHIEVEMENTS */
    .achievements-section {
      margin-top: 24px;
      padding: 24px;
    }
    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .streak-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .streak-header {
      display: flex;
      align-items: center;
      gap: 10px;
      .streak-icon { font-size: 1.5rem; }
      strong { font-size: 0.95rem; color: var(--text-primary); }
    }
    .streak-body {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .streak-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .streak-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      text-shadow: 0 0 20px var(--primary-glow);
    }
    .streak-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .streak-divider {
      width: 1px;
      height: 40px;
      background: var(--border);
    }

    @media (max-width: 900px) {
      .bottom-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `],
})
export class OverviewComponent implements OnInit {
  Math = Math;
  private authService = inject(AuthService);
  private mealPlanService = inject(MealPlanService);
  private dailyIntakeService = inject(DailyIntakeService);
  private dateService = inject(DateService);

  profile = signal<UserProfile | null>(null);
  plans = signal<MealPlan[]>([]);
  loading = signal(true);

  // Today's stats
  todayCalories = signal(0);
  todayProtein = signal(0);
  todayCarbs = signal(0);
  todayFat = signal(0);

  caloriePercent = computed(() => {
    const goal = this.profile()?.goals?.calories || 2000;
    return Math.min(100, Math.round(this.todayCalories() / goal * 100));
  });
  proteinPercent = computed(() => {
    const goal = this.profile()?.goals?.protein || 150;
    return Math.min(100, Math.round(this.todayProtein() / goal * 100));
  });
  carbPercent = computed(() => {
    const goal = this.profile()?.goals?.carbs || 250;
    return Math.min(100, Math.round(this.todayCarbs() / goal * 100));
  });
  fatPercent = computed(() => {
    const goal = this.profile()?.goals?.fat || 65;
    return Math.min(100, Math.round(this.todayFat() / goal * 100));
  });

  proteinDash = signal(0);
  carbDash = signal(0);
  fatDash = signal(0);
  totalMacroCalories = signal(0);
  totalGoalCalories = signal(2000);

  currentStreak = signal(0);
  bestStreak = signal(0);
  currentGoalStreak = signal(0);
  bestGoalStreak = signal(0);

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user) => {
      if (!user) return;
      this.authService.getUserProfile(user.uid).subscribe((profile) => {
        this.profile.set(profile);
        this.computeGoalStats(profile);
      });
      this.mealPlanService.getMealPlans(user.uid).subscribe((plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      });

      // Get today's real intake (Brazil Timezone)
      const today = this.dateService.getTodayString();
      this.dailyIntakeService.getDailyLog(user.uid, today).subscribe((log: DailyLog | null) => {
        if (log) {
          this.updateTodayStats(log);
        } else {
          // Reset to 0 if no log for today
          this.todayCalories.set(0);
          this.todayProtein.set(0);
          this.todayCarbs.set(0);
          this.todayFat.set(0);
        }
      });

      // Get all logs for streak calculation
      this.dailyIntakeService.getAllLogs(user.uid).subscribe((logs: DailyLog[]) => {
        this.calculateStreaks(logs);
      });
    });
  }

  private calculateStreaks(logs: DailyLog[]) {
    if (logs.length === 0) {
      this.currentStreak.set(0);
      this.bestStreak.set(0);
      this.currentGoalStreak.set(0);
      this.bestGoalStreak.set(0);
      return;
    }

    const goals = this.profile()?.goals;
    const goalCal = goals?.calories || 2000;
    // Hit a goal = calories within 5% of target
    const isGoalHit = (log: DailyLog) => {
      const margin = goalCal * 0.05;
      return log.totalCalories >= (goalCal - margin) && log.totalCalories <= (goalCal + margin);
    };

    // Group logs by date to avoid duplicates from Firestore query if any
    const uniqueLogsMap = new Map<string, DailyLog>();
    logs.forEach(l => {
      if (!uniqueLogsMap.has(l.date)) uniqueLogsMap.set(l.date, l);
    });

    const sortedDates = Array.from(uniqueLogsMap.keys()).sort((a, b) => b.localeCompare(a));
    const sortedLogs = sortedDates.map(d => uniqueLogsMap.get(d)!);

    const today = this.dateService.getTodayString();
    const yesterdayDate = new Date();
    // Use DateService properly for yesterday to avoid timezone issues
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = this.dateService.toLocaleDateString(yesterdayDate);

    // 1. LOGGING STREAK
    let logCurrent = 0;
    let logBest = 1;
    let logTemp = 1;

    // Current sequence (today or yesterday start)
    if (sortedDates[0] === today || sortedDates[0] === yesterdayStr) {
      logCurrent = 1;
      for (let i = 1; i < sortedLogs.length; i++) {
        const d1 = new Date(sortedLogs[i - 1].date);
        const d2 = new Date(sortedLogs[i].date);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) logCurrent++; else break;
      }
    }

    // Best sequence
    for (let i = 1; i < sortedLogs.length; i++) {
      const d1 = new Date(sortedLogs[i - 1].date);
      const d2 = new Date(sortedLogs[i].date);
      const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) logTemp++; else logTemp = 1;
      if (logTemp > logBest) logBest = logTemp;
    }

    this.currentStreak.set(logCurrent);
    this.bestStreak.set(logBest);

    // 2. GOAL STREAK
    let goalCurrent = 0;
    let goalBest = 0;
    let goalTemp = 0;

    // Filter only logs where goal was hit
    const goalHits = sortedLogs.filter(l => isGoalHit(l));

    if (goalHits.length > 0) {
      // Current sequence
      if (goalHits[0].date === today || goalHits[0].date === yesterdayStr) {
        goalCurrent = 1;
        for (let i = 1; i < goalHits.length; i++) {
          const d1 = new Date(goalHits[i - 1].date);
          const d2 = new Date(goalHits[i].date);
          const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
          if (diff === 1) goalCurrent++; else break;
        }
      }

      // Best sequence
      goalTemp = 1;
      goalBest = 1;
      for (let i = 1; i < goalHits.length; i++) {
        const d1 = new Date(goalHits[i - 1].date);
        const d2 = new Date(goalHits[i].date);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) goalTemp++; else goalTemp = 1;
        if (goalTemp > goalBest) goalBest = goalTemp;
      }
    }

    this.currentGoalStreak.set(goalCurrent);
    this.bestGoalStreak.set(goalBest);
  }

  private updateTodayStats(log: DailyLog) {
    this.todayCalories.set(log.totalCalories);
    this.todayProtein.set(log.totalProtein);
    this.todayCarbs.set(log.totalCarbs);
    this.todayFat.set(log.totalFat);
  }

  private computeGoalStats(profile: UserProfile | null) {
    const g = profile?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65, water: 2500 };
    const pCal = g.protein * 4;
    const cCal = g.carbs * 4;
    const fCal = g.fat * 9;
    const total = pCal + cCal + fCal;
    this.totalGoalCalories.set(total);
    this.totalMacroCalories.set(total);

    // Ensure total is 100 to avoid gaps in pie chart
    const pPct = Math.round(pCal / total * 100);
    const cPct = Math.round(cCal / total * 100);
    const fPct = 100 - pPct - cPct;

    this.proteinDash.set(pPct);
    this.carbDash.set(cPct);
    this.fatDash.set(fPct);
  }
}
