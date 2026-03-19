import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>
      <div class="auth-card glass">
        <div class="auth-brand">
          <span>🥗</span>
          <span>NutriPlanner</span>
        </div>
        <h1>Bem-vindo de volta</h1>
        <p class="auth-sub">Faça login para acessar seus planos alimentares</p>

        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" type="email" formControlName="email" placeholder="seu@email.com" autocomplete="email" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="field-error">E-mail inválido</span>
            }
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
            <button type="button" class="toggle-pw" (click)="togglePassword()">
              {{ showPassword() ? '🙈' : '👁️' }}
            </button>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Mínimo 6 caracteres</span>
            }
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> } @else { Entrar }
          </button>
        </form>

        <div class="divider"><span>ou</span></div>

        <button class="btn-google" (click)="loginWithGoogle()" [disabled]="loading()">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          Entrar com Google
        </button>

        <p class="auth-footer">
          Não tem uma conta? <a routerLink="/register">Criar conta</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--bg-dark);
    }
    .auth-bg {
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, rgba(14,165,233,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    .auth-card {
      position: relative;
      width: 100%;
      max-width: 440px;
      margin: 24px;
      padding: 40px;
      border-radius: var(--radius-lg);
      animation: pageEnter 0.4s ease forwards;
    }
    .auth-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 28px;
      span:first-child { font-size: 1.6rem; }
    }
    h1 { font-size: 1.75rem; margin-bottom: 6px; }
    .auth-sub { color: var(--text-secondary); margin-bottom: 28px; font-size: 0.95rem; }
    .alert-error {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.4);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #fca5a5;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .auth-form { display: flex; flex-direction: column; gap: 18px; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      label { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); }
      input {
        width: 100%;
        padding: 11px 16px;
        background: var(--bg-surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color var(--transition-fast);
        outline: none;
        &:focus { border-color: var(--primary); }
        &::placeholder { color: var(--text-muted); }
      }
    }
    .toggle-pw {
      position: absolute;
      right: 12px;
      bottom: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    .field-error { font-size: 0.78rem; color: #f87171; }
    .btn-submit {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      &:hover:not(:disabled) {
        box-shadow: 0 8px 25px var(--primary-glow);
        transform: translateY(-1px);
      }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      color: var(--text-muted);
      font-size: 0.85rem;
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border);
      }
    }
    .btn-google {
      width: 100%;
      padding: 12px;
      background: var(--bg-surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: inherit;
      transition: all var(--transition-fast);
      &:hover:not(:disabled) { border-color: #4285F4; background: rgba(66,133,244,0.08); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = this.authService.loading;
  showPassword = signal(false);
  error = signal('');

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.getErrorMessage(err.code));
      },
    });
  }

  loginWithGoogle() {
    this.error.set('');
    this.authService.loginWithGoogle().subscribe({
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.getErrorMessage(err.code));
      },
    });
  }

  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/popup-closed-by-user': 'Login cancelado.',
    };
    return messages[code] || 'Ocorreu um erro. Tente novamente.';
  }
}
