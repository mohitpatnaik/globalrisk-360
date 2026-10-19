import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
export const routes: Routes = [{ path: '', loadComponent: () => import('./layout/shell/shell.component').then((module) => module.ShellComponent), children: [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent) },
  { path: 'policies', loadChildren: () => import('./features/policies/policies.routes').then((module) => module.POLICY_ROUTES) },
  { path: 'claims/new', loadComponent: () => import('./features/claim-submission/claim-submission.component').then((module) => module.ClaimSubmissionComponent), canDeactivate: [unsavedChangesGuard] },
  { path: 'claims', loadChildren: () => import('./features/claims/claims.routes').then((module) => module.CLAIM_ROUTES) },
  { path: 'activity', loadComponent: () => import('./features/activity/activity.component').then((module) => module.ActivityComponent) },
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then((module) => module.NotFoundComponent) },
] }];
