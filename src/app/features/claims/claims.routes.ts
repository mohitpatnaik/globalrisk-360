import { Routes } from '@angular/router';
export const CLAIM_ROUTES: Routes = [{ path: '', loadComponent: () => import('./claim-list.component').then((module) => module.ClaimListComponent) }, { path: ':id', loadComponent: () => import('./claim-list.component').then((module) => module.ClaimListComponent) }];
