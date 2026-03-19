import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">🥗</span>
          @if (!sidebarCollapsed()) {
            <span class="brand-name">NutriPlanner</span>
          }
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item" title="Visão Geral">
            <span class="nav-icon">📊</span>
            @if (!sidebarCollapsed()) { <span class="nav-label">Visão Geral</span> }
          </a>
          <a routerLink="/dashboard/daily-log" routerLinkActive="active" class="nav-item" title="Menu Diário">
            <span class="nav-icon">🍽️</span>
            @if (!sidebarCollapsed()) { <span class="nav-label">Menu Diário</span> }
          </a>
          <a routerLink="/dashboard/plans" routerLinkActive="active" class="nav-item" title="Planos Alimentares">
            <span class="nav-icon">📋</span>
            @if (!sidebarCollapsed()) { <span class="nav-label">Planos Alimentares</span> }
          </a>
          <a routerLink="/dashboard/goals" routerLinkActive="active" class="nav-item" title="Minhas Metas">
            <span class="nav-icon">🎯</span>
            @if (!sidebarCollapsed()) { <span class="nav-label">Minhas Metas</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          @if (user$ | async; as user) {
            <div class="user-info" [class.collapsed]="sidebarCollapsed()">
              <div class="user-avatar">{{ getInitial(user.displayName) }}</div>
              @if (!sidebarCollapsed()) {
                <div class="user-details">
                  <strong>{{ user.displayName || 'Usuário' }}</strong>
                  <span>{{ user.email }}</span>
                </div>
              }
            </div>
          }
          <button class="logout-btn" (click)="logout()" title="Sair">
            <span>🚪</span>
            @if (!sidebarCollapsed()) { <span>Sair</span> }
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-wrapper">
        <!-- TOPBAR -->
        <header class="topbar glass">
          <button class="collapse-btn" (click)="toggleSidebar()">
            {{ sidebarCollapsed() ? '☰' : '✕' }}
          </button>
          <div class="topbar-right">
            @if (user$ | async; as user) {
              <div class="topbar-user">
                <div class="topbar-avatar">{{ getInitial(user.displayName) }}</div>
                <span>Olá, <strong>{{ getFirstName(user.displayName) }}</strong></span>
              </div>
            }
          </div>
        </header>

        <!-- CONTENT -->
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-dark);
    }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-width);
      flex-shrink: 0;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; bottom: 0; left: 0;
      z-index: 50;
      transition: width var(--transition);
      overflow: hidden;
    }
    .layout.sidebar-collapsed .sidebar { width: 72px; }

    .sidebar-brand {
      height: var(--topbar-height);
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      font-size: 1.1rem;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
    }
    .brand-icon { font-size: 1.5rem; flex-shrink: 0; }
    .brand-name { color: var(--text-primary); }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      transition: all var(--transition-fast);
      &:hover {
        background: var(--bg-card);
        color: var(--text-primary);
      }
      &.active {
        background: var(--primary-glow);
        color: var(--primary);
        border-left: 2px solid var(--primary);
      }
    }
    .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
    .nav-label { flex: 1; }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      overflow: hidden;
      &.collapsed { justify-content: center; padding: 8px; }
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-details {
      overflow: hidden;
      strong { display: block; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      span { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    }
    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 12px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
      &:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; }
    }

    /* TOPBAR */
    .main-wrapper {
      flex: 1;
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left var(--transition);
    }
    .layout.sidebar-collapsed .main-wrapper { margin-left: 72px; }
    .topbar {
      height: var(--topbar-height);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
      border-bottom: 1px solid var(--border);
    }
    .collapse-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 1rem;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--primary); color: var(--primary); }
    }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .topbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-secondary);
      font-size: 0.9rem;
      strong { color: var(--text-primary); }
    }
    .topbar-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-content {
      flex: 1;
      padding: 32px;
      animation: pageEnter 0.3s ease forwards;
    }

    @media (max-width: 768px) {
      .sidebar { width: 72px; }
      .main-wrapper { margin-left: 72px; }
      .layout:not(.sidebar-collapsed) .sidebar { width: var(--sidebar-width); position: fixed; z-index: 200; }
      .main-content { padding: 20px 16px; }
      .topbar { padding: 0 16px; }
    }
  `],
})
export class DashboardLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user$ = this.authService.currentUser$;
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  getInitial(name: string | null | undefined): string {
    return (name || 'U').charAt(0).toUpperCase();
  }

  getFirstName(name: string | null | undefined): string {
    if (!name) return 'Usuário';
    return name.split(' ')[0];
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
