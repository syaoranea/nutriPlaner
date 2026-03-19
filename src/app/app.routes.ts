import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./pages/dashboard/dashboard-layout/dashboard-layout.component').then(
                (m) => m.DashboardLayoutComponent,
            ),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./pages/dashboard/overview/overview.component').then(
                        (m) => m.OverviewComponent,
                    ),
            },
            {
                path: 'plans',
                loadComponent: () =>
                    import('./pages/dashboard/meal-plans/meal-plans.component').then(
                        (m) => m.MealPlansComponent,
                    ),
            },
            {
                path: 'daily-log',
                loadComponent: () =>
                    import('./pages/dashboard/daily-log/daily-log.component').then(
                        (m) => m.DailyLogComponent,
                    ),
            },
            {
                path: 'plans/new',
                loadComponent: () =>
                    import('./pages/dashboard/add-plan/add-plan.component').then(
                        (m) => m.AddPlanComponent,
                    ),
            },
            {
                path: 'plans/edit/:id',
                loadComponent: () =>
                    import('./pages/dashboard/add-plan/add-plan.component').then(
                        (m) => m.AddPlanComponent,
                    ),
            },
            {
                path: 'goals',
                loadComponent: () =>
                    import('./pages/dashboard/goals/goals.component').then((m) => m.GoalsComponent),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
