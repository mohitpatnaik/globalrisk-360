import { Routes } from '@angular/router';
export const POLICY_ROUTES: Routes = [{ path: '', loadComponent: () => import('./policy-list.component').then((module) => module.PolicyListComponent) }, { path: ':id', loadComponent: () => import('./policy-list.component').then((module) => module.PolicyListComponent) }];
