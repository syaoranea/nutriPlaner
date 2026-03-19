import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Firestore, doc, updateDoc, setDoc } from '@angular/fire/firestore';
import { NutritionalGoals, UserProfile } from '../../../core/models/models';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-goals',
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="goals-page page-enter">
      <div class="page-header">
        <h1>Minhas Metas</h1>
        <p>Configure suas metas nutricionais diárias</p>
      </div>

      @if (successMsg()) {
        <div class="alert-success">✅ {{ successMsg() }}</div>
      }
      @if (error()) {
        <div class="alert-error">{{ error() }}</div>
      }

      <div class="goals-layout">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="goals-form">
          <div class="form-section card">
            <h2 class="section-title">🔥 Calorias diárias</h2>
            <p class="section-desc">Meta de calorias totais por dia</p>
            <div class="input-with-unit">
              <input type="number" formControlName="calories" min="500" max="10000" placeholder="2000" />
              <span>kcal / dia</span>
            </div>
            @if (form.get('calories')?.invalid && form.get('calories')?.touched) {
              <span class="field-error">Entre 500 e 10.000 kcal</span>
            }
          </div>

          <div class="form-section card">
            <h2 class="section-title">💪 Proteínas</h2>
            <p class="section-desc">Meta de proteína por dia (recomendado: 1.6–2.2g por kg de peso)</p>
            <div class="input-with-unit">
              <input type="number" formControlName="protein" min="0" max="500" placeholder="150" />
              <span>g / dia</span>
            </div>
            @if (form.get('protein')?.invalid && form.get('protein')?.touched) {
              <span class="field-error">Valor obrigatório (mín 0)</span>
            }
          </div>

          <div class="form-section card">
            <h2 class="section-title">🌾 Carboidratos</h2>
            <p class="section-desc">Meta de carboidratos por dia</p>
            <div class="input-with-unit">
              <input type="number" formControlName="carbs" min="0" max="1000" placeholder="250" />
              <span>g / dia</span>
            </div>
            @if (form.get('carbs')?.invalid && form.get('carbs')?.touched) {
              <span class="field-error">Valor obrigatório (mín 0)</span>
            }
          </div>

          <div class="form-section card">
            <h2 class="section-title">🥑 Gorduras</h2>
            <p class="section-desc">Meta de gorduras por dia (recomendado: 20–35% do total calórico)</p>
            <div class="input-with-unit">
              <input type="number" formControlName="fat" min="0" max="500" placeholder="65" />
              <span>g / dia</span>
            </div>
            @if (form.get('fat')?.invalid && form.get('fat')?.touched) {
              <span class="field-error">Valor obrigatório (mín 0)</span>
            }
          </div>

          <div class="form-section card">
            <h2 class="section-title">💧 Água</h2>
            <p class="section-desc">Meta de hidratação diária</p>
            <div class="input-with-unit">
              <input type="number" formControlName="water" min="500" max="10000" placeholder="2500" />
              <span>ml / dia</span>
            </div>
            @if (form.get('water')?.invalid && form.get('water')?.touched) {
              <span class="field-error">Valor obrigatório (mín 500)</span>
            }
          </div>

          <button type="submit" class="btn-save" [disabled]="saving()">
            @if (saving()) { <span class="spinner"></span> } @else { Salvar Metas }
          </button>
        </form>

        <!-- Preview card -->
        <div class="preview-panel">
          <div class="preview-card card">
            <h3>Visão geral das metas</h3>
            <div class="preview-stats">
              <div class="preview-row">
                <span>🔥 Calorias</span>
                <strong>{{ (form.get('calories')?.value || 0) | number:'1.2-2' }} kcal</strong>
              </div>
              <div class="preview-row">
                <span>💪 Proteínas</span>
                <strong>{{ (form.get('protein')?.value || 0) | number:'1.2-2' }}g</strong>
              </div>
              <div class="preview-row">
                <span>🌾 Carboidratos</span>
                <strong>{{ (form.get('carbs')?.value || 0) | number:'1.2-2' }}g</strong>
              </div>
              <div class="preview-row">
                <span>🥑 Gorduras</span>
                <strong>{{ (form.get('fat')?.value || 0) | number:'1.2-2' }}g</strong>
              </div>
              <div class="preview-row">
                <span>💧 Água</span>
                <strong>{{ form.get('water')?.value || 0 }}ml</strong>
              </div>
            </div>
            <div class="macro-pct">
              <p class="macro-pct-label">Distribuição calórica</p>
              <div class="macro-bar-stack">
                <div class="macro-seg protein-seg" [style.width.%]="proteinPct()"></div>
                <div class="macro-seg carb-seg" [style.width.%]="carbPct()"></div>
                <div class="macro-seg fat-seg" [style.width.%]="fatPct()"></div>
              </div>
              <div class="macro-legend-row">
                <span><i class="dot blue"></i> Prot. {{ proteinPct() }}%</span>
                <span><i class="dot yellow"></i> Carb. {{ carbPct() }}%</span>
                <span><i class="dot purple"></i> Gord. {{ fatPct() }}%</span>
              </div>
            </div>
          </div>
          <div class="tip-card card">
            <h4>💡 Dica nutricional</h4>
            <p>Para o ganho de massa muscular, mire em <strong>1.6 a 2.2g de proteína por kg</strong> de peso corporal e um superávit calórico de 200–300 kcal diários.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 28px;
      h1 { font-size: 1.75rem; margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 0.9rem; }
    }
    .alert-success {
      background: rgba(34,197,94,0.15);
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--primary);
      font-size: 0.875rem;
      margin-bottom: 16px;
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
    .goals-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    .goals-form { display: flex; flex-direction: column; gap: 16px; }
    .form-section { padding: 22px; }
    .section-title { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .section-desc { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px; }
    .input-with-unit {
      display: flex;
      align-items: center;
      gap: 10px;
      input {
        flex: 1;
        max-width: 180px;
        padding: 10px 14px;
        background: var(--bg-surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 1rem;
        font-family: inherit;
        outline: none;
        font-weight: 600;
        &:focus { border-color: var(--primary); }
      }
      span { color: var(--text-secondary); font-size: 0.875rem; }
    }
    .field-error { font-size: 0.78rem; color: #f87171; display: block; margin-top: 4px; }
    .btn-save {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all var(--transition);
      &:hover:not(:disabled) { box-shadow: 0 8px 25px var(--primary-glow); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* PREVIEW */
    .preview-panel { display: flex; flex-direction: column; gap: 16px; position: sticky; top: calc(var(--topbar-height) + 20px); }
    .preview-card h3 { font-size: 0.95rem; margin-bottom: 16px; }
    .preview-stats { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .preview-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      color: var(--text-secondary);
      &:last-child { border: none; }
      strong { color: var(--text-primary); font-size: 0.9rem; }
    }
    .macro-pct { border-top: 1px solid var(--border); padding-top: 14px; }
    .macro-pct-label { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px; }
    .macro-bar-stack {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      margin-bottom: 8px;
      background: var(--bg-surface);
    }
    .macro-seg { height: 100%; transition: width 0.4s ease; }
    .protein-seg { background: #0ea5e9; }
    .carb-seg { background: #f59e0b; }
    .fat-seg { background: #a855f7; }
    .macro-legend-row {
      display: flex;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 4px;
      &.blue { background: #0ea5e9; }
      &.yellow { background: #f59e0b; }
      &.purple { background: #a855f7; }
    }
    .tip-card { padding: 18px; }
    .tip-card h4 { font-size: 0.9rem; margin-bottom: 8px; }
    .tip-card p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; }
    .tip-card strong { color: var(--primary); }

    @media (max-width: 900px) {
      .goals-layout { grid-template-columns: 1fr; }
      .preview-panel { position: static; }
    }
  `],
})
export class GoalsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private firestore = inject(Firestore);

  saving = signal(false);
  error = signal('');
  successMsg = signal('');
  uid = signal('');

  form = this.fb.group({
    calories: [2000, [Validators.required, Validators.min(500), Validators.max(10000)]],
    protein: [150, [Validators.required, Validators.min(0)]],
    carbs: [250, [Validators.required, Validators.min(0)]],
    fat: [65, [Validators.required, Validators.min(0)]],
    water: [2500, [Validators.required, Validators.min(0)]],
  });

  proteinPct = signal(30);
  carbPct = signal(50);
  fatPct = signal(20);

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (!user) return;
        this.uid.set(user.uid);
        this.authService.getUserProfile(user.uid).subscribe({
          next: (profile) => {
            if (profile?.goals) {
              this.form.patchValue(profile.goals);
              this.updatePct(profile.goals);
            }
          },
          error: (err) => {
            console.error('Erro ao carregar perfil/metas:', err);
            this.error.set('Não foi possível carregar suas metas. Verifique se o Firestore está configurado.');
          }
        });
      },
      error: (err) => console.error('Erro de autenticação:', err)
    });
    this.form.valueChanges.subscribe((v) => {
      this.updatePct(v as any);
    });
  }

  private updatePct(g: NutritionalGoals) {
    const p = (g.protein || 0) * 4;
    const c = (g.carbs || 0) * 4;
    const f = (g.fat || 0) * 9;
    const total = p + c + f || 1;
    this.proteinPct.set(Math.round(p / total * 100));
    this.carbPct.set(Math.round(c / total * 100));
    this.fatPct.set(Math.round(f / total * 100));
  }

  async onSubmit() {
    console.log('onSubmit chamado. Form invalid:', this.form.invalid, 'Errors:', this.form.errors, 'Values:', this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Iniciando salvamento de metas...');
    this.saving.set(true);
    this.error.set('');
    this.successMsg.set('');

    // Safety timeout de 10 segundos para resetar o loading se o Firebase travar (ex: offline)
    const safetyTimeout = setTimeout(() => {
      if (this.saving()) {
        console.warn('Salvamento demorando demais... resetando loading.');
        this.saving.set(false);
        this.error.set('A resposta do servidor está demorando. Verifique sua conexão ou configuração do Firebase.');
      }
    }, 10000);

    try {
      if (!this.uid()) {
        throw new Error('Usuário não identificado. Tente fazer login novamente.');
      }

      console.log('Enviando para Firestore uid:', this.uid());
      const ref = doc(this.firestore, `users/${this.uid()}`);

      await setDoc(ref, { goals: this.form.value }, { merge: true });

      console.log('Metas salvas com sucesso no Firestore.');
      clearTimeout(safetyTimeout);
      this.successMsg.set('Metas salvas com sucesso!');
      setTimeout(() => this.successMsg.set(''), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar metas:', err);
      clearTimeout(safetyTimeout);

      if (err.message && err.message.includes('offline')) {
        this.error.set('Erro: O Firebase está acusando "offline". Forçamos uma conexão via Long-Polling agora. Se o erro persistir, verifique: 1) Se criou o banco Firestore no Console, 2) Se as Regras permitem escrita, 3) Se a API Key é a real do seu projeto.');
      } else {
        this.error.set('Erro ao salvar as metas. Verifique se o banco Firestore foi criado no console do Firebase.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}
