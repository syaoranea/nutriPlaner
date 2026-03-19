import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-landing',
    imports: [RouterLink, AsyncPipe],
    template: `
    <!-- NAV -->
    <nav class="nav glass">
      <div class="nav-brand">
        <span class="brand-icon">🥗</span>
        <span class="brand-name">NutriPlanner</span>
      </div>
      <div class="nav-links">
        <a href="#features">Funcionalidades</a>
        <a href="#how">Como funciona</a>
        @if (user$ | async) {
          <a routerLink="/dashboard" class="btn-nav btn-nav-primary">Dashboard</a>
        } @else {
          <a routerLink="/login" class="btn-nav">Entrar</a>
          <a routerLink="/register" class="btn-nav btn-nav-primary">Começar grátis</a>
        }
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">✨ Planejamento nutricional inteligente</div>
        <h1>
          Controle sua<br />
          <span class="gradient-text">alimentação</span><br />
          com precisão
        </h1>
        <p>
          Crie planos alimentares personalizados, acompanhe suas metas nutricionais e alcance
          seus objetivos de saúde de forma simples e eficaz.
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="cta-btn">Começar gratuitamente →</a>
          <a href="#features" class="cta-btn-ghost">Ver funcionalidades</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>10k+</strong><span>Usuários</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>50k+</strong><span>Planos criados</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>98%</strong><span>Satisfação</span></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-card card">
          <div class="hc-header">
            <span class="hc-icon">📊</span>
            <div>
              <p class="hc-title">Resumo do dia</p>
              <p class="hc-sub">Segunda-feira</p>
            </div>
          </div>
          <div class="macro-grid">
            <div class="macro-item">
              <div class="macro-ring calories">
                <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" stroke="#1e293b" stroke-width="3" fill="none"/><circle cx="18" cy="18" r="15.9" stroke="#22c55e" stroke-width="3" fill="none" stroke-dasharray="72 28" stroke-dashoffset="25"/></svg>
                <span>72%</span>
              </div>
              <p>Calorias</p>
              <strong>1.440 / 2.000</strong>
            </div>
            <div class="macro-item">
              <div class="macro-ring protein">
                <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" stroke="#1e293b" stroke-width="3" fill="none"/><circle cx="18" cy="18" r="15.9" stroke="#0ea5e9" stroke-width="3" fill="none" stroke-dasharray="85 15" stroke-dashoffset="25"/></svg>
                <span>85%</span>
              </div>
              <p>Proteína</p>
              <strong>128g / 150g</strong>
            </div>
            <div class="macro-item">
              <div class="macro-ring carbs">
                <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" stroke="#1e293b" stroke-width="3" fill="none"/><circle cx="18" cy="18" r="15.9" stroke="#f59e0b" stroke-width="3" fill="none" stroke-dasharray="60 40" stroke-dashoffset="25"/></svg>
                <span>60%</span>
              </div>
              <p>Carboidratos</p>
              <strong>150g / 250g</strong>
            </div>
          </div>
          <div class="meals-preview">
            <p class="meals-title">Refeições de hoje</p>
            <div class="meal-row"><span>🍳 Café da manhã</span><span>380 kcal</span></div>
            <div class="meal-row"><span>🥗 Almoço</span><span>680 kcal</span></div>
            <div class="meal-row"><span>🍎 Lanche</span><span>180 kcal</span></div>
            <div class="meal-row muted"><span>🍽️ Jantar</span><span>— kcal</span></div>
          </div>
        </div>
        <div class="floating-badge badge-1">
          <span>🔥</span>
          <div><strong>Sequência de 14 dias!</strong><p>Continue assim</p></div>
        </div>
        <div class="floating-badge badge-2">
          <span>💧</span>
          <div><strong>2.1L</strong><p>de água hoje</p></div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="section-header">
        <span class="section-tag">Funcionalidades</span>
        <h2>Tudo que você precisa para uma alimentação saudável</h2>
        <p>Ferramentas poderosas para planejar, acompanhar e otimizar sua nutrição diária</p>
      </div>
      <div class="features-grid">
        @for (feat of features; track feat.title) {
          <div class="feature-card card">
            <div class="feature-icon" [style.background]="feat.bg">{{ feat.icon }}</div>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        }
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section section-alt" id="how">
      <div class="section-header">
        <span class="section-tag">Como funciona</span>
        <h2>Simples como 1, 2, 3</h2>
        <p>Configure seu perfil e comece a planejar em menos de 5 minutos</p>
      </div>
      <div class="steps-grid">
        @for (step of steps; track step.num) {
          <div class="step-card">
            <div class="step-number">{{ step.num }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Pronto para transformar sua alimentação?</h2>
        <p>Junte-se a milhares de pessoas que já mudaram seus hábitos com o NutriPlanner</p>
        <a routerLink="/register" class="cta-btn">Criar conta grátis →</a>
      </div>
      <div class="cta-glow"></div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-brand">
        <span>🥗</span>
        <span class="brand-name">NutriPlanner</span>
      </div>
      <p>© 2025 NutriPlanner. Todos os direitos reservados.</p>
    </footer>
  `,
    styles: [`
    /* NAV */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      z-index: 100;
      border-bottom: 1px solid var(--border);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 800;
    }
    .brand-icon { font-size: 1.6rem; }
    .brand-name { color: var(--text-primary); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-links a {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: color var(--transition-fast);
      &:hover { color: var(--text-primary); }
    }
    .btn-nav {
      padding: 8px 20px !important;
      border-radius: var(--radius-sm) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-primary) !important;
      &:hover { border-color: var(--primary) !important; }
    }
    .btn-nav-primary {
      background: var(--primary) !important;
      border-color: var(--primary) !important;
      color: #fff !important;
      &:hover {
        background: var(--primary-dark) !important;
        box-shadow: 0 4px 15px var(--primary-glow) !important;
      }
    }

    /* HERO */
    .hero {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 60px;
      padding: 120px 80px 80px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .hero-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      background: var(--primary-glow);
      border: 1px solid var(--border-accent);
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .hero-content h1 {
      font-size: clamp(2.5rem, 5vw, 4rem);
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero-content p {
      font-size: 1.1rem;
      margin-bottom: 36px;
      max-width: 480px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    .cta-btn {
      padding: 14px 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 1rem;
      transition: all var(--transition);
      &:hover {
        color: #fff;
        box-shadow: 0 8px 30px var(--primary-glow);
        transform: translateY(-2px);
      }
    }
    .cta-btn-ghost {
      padding: 14px 28px;
      color: var(--text-secondary);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 1rem;
      transition: all var(--transition);
      &:hover {
        color: var(--text-primary);
        border-color: var(--text-secondary);
      }
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      strong { font-size: 1.4rem; color: var(--text-primary); }
      span { font-size: 0.8rem; color: var(--text-muted); }
    }
    .stat-divider { width: 1px; height: 36px; background: var(--border); }

    /* HERO VISUAL */
    .hero-visual {
      position: relative;
    }
    .hero-card {
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-xl), var(--shadow-glow);
      border-color: var(--border-accent);
    }
    .hc-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .hc-icon { font-size: 1.8rem; }
    .hc-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .hc-sub { font-size: 0.8rem; color: var(--text-muted); }
    .macro-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .macro-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      p { font-size: 0.75rem; color: var(--text-muted); }
      strong { font-size: 0.75rem; color: var(--text-primary); text-align: center; }
    }
    .macro-ring {
      position: relative;
      width: 60px;
      height: 60px;
      svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      span {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
    .meals-preview { border-top: 1px solid var(--border); padding-top: 16px; }
    .meals-title { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; }
    .meal-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      padding: 6px 0;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
      &.muted { color: var(--text-muted); }
    }
    .floating-badge {
      position: absolute;
      background: var(--bg-surface);
      border: 1px solid var(--border-accent);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      box-shadow: var(--shadow-md);
      div strong { display: block; font-size: 0.85rem; color: var(--text-primary); }
      div p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
      &.badge-1 { bottom: -20px; left: -30px; animation: float 3s ease-in-out infinite; }
      &.badge-2 { top: 30px; right: -30px; animation: float 3s ease-in-out infinite 1.5s; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* SECTIONS */
    .section {
      padding: 100px 80px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .section-alt {
      max-width: 100%;
      background: var(--bg-surface);
      padding: 100px 80px;
    }
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .section-tag {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      background: var(--primary-glow);
      border: 1px solid var(--border-accent);
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .section-header h2 {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      margin-bottom: 12px;
    }
    .section-header p { font-size: 1.05rem; }

    /* FEATURES GRID */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .feature-card {
      display: flex;
      flex-direction: column;
      gap: 14px;
      h3 { font-size: 1.1rem; }
      p { font-size: 0.9rem; }
    }
    .feature-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    /* STEPS */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 32px;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
    .step-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      h3 { font-size: 1.05rem; }
      p { font-size: 0.9rem; }
    }
    .step-number {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-icon { font-size: 2.2rem; }

    /* CTA banner */
    .cta-section {
      position: relative;
      text-align: center;
      padding: 100px 48px;
      background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(14,165,233,0.08));
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }
    .cta-content {
      position: relative;
      z-index: 1;
      h2 { font-size: clamp(1.8rem, 3vw, 2.5rem); margin-bottom: 12px; }
      p { font-size: 1.05rem; margin-bottom: 32px; }
    }
    .cta-glow {
      position: absolute;
      inset: -50%;
      background: radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    /* FOOTER */
    .footer {
      padding: 40px 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
    }
    .footer p { font-size: 0.85rem; color: var(--text-muted); }

    /* RESPONSIVE */
    @media (max-width: 900px) {
      .hero {
        grid-template-columns: 1fr;
        padding: 120px 24px 60px;
        text-align: center;
      }
      .hero-visual { display: none; }
      .hero-actions { justify-content: center; }
      .hero-stats { justify-content: center; }
      .section, .section-alt { padding: 60px 24px; }
      .nav { padding: 0 24px; }
      .nav-links a:not(.btn-nav) { display: none; }
      .footer { flex-direction: column; gap: 12px; padding: 32px 24px; }
    }
  `],
})
export class LandingComponent {
    authService = inject(AuthService);
    user$ = this.authService.currentUser$;

    features = [
        {
            icon: '📋',
            title: 'Planos Personalizados',
            desc: 'Crie planos alimentares adaptados às suas necessidades calóricas e preferências.',
            bg: 'rgba(34,197,94,0.15)',
        },
        {
            icon: '📊',
            title: 'Acompanhamento Nutricional',
            desc: 'Monitore calorias, proteínas, carboidratos e gorduras em tempo real.',
            bg: 'rgba(14,165,233,0.15)',
        },
        {
            icon: '🎯',
            title: 'Metas Inteligentes',
            desc: 'Defina objetivos de saúde e receba feedback sobre seu progresso.',
            bg: 'rgba(245,158,11,0.15)',
        },
        {
            icon: '🔔',
            title: 'Lembretes de Refeição',
            desc: 'Nunca perca uma refeição com lembretes personalizados ao longo do dia.',
            bg: 'rgba(168,85,247,0.15)',
        },
        {
            icon: '💧',
            title: 'Controle de Hidratação',
            desc: 'Acompanhe sua ingestão diária de água e mantenha-se sempre hidratado.',
            bg: 'rgba(6,182,212,0.15)',
        },
        {
            icon: '📈',
            title: 'Relatórios e Gráficos',
            desc: 'Visualize sua evolução com gráficos detalhados e relatórios semanais.',
            bg: 'rgba(34,197,94,0.15)',
        },
    ];

    steps = [
        {
            num: '1',
            icon: '👤',
            title: 'Crie seu perfil',
            desc: 'Cadastre-se e informe seus dados como peso, altura e objetivo.',
        },
        {
            num: '2',
            icon: '🎯',
            title: 'Defina suas metas',
            desc: 'Configure suas metas nutricionais diárias baseadas em seus objetivos.',
        },
        {
            num: '3',
            icon: '📋',
            title: 'Monte seu plano',
            desc: 'Adicione refeições e alimentos ao seu plano alimentar personalizado.',
        },
        {
            num: '4',
            icon: '📊',
            title: 'Acompanhe o progresso',
            desc: 'Monitore sua evolução diária e ajuste conforme necessário.',
        },
    ];
}
