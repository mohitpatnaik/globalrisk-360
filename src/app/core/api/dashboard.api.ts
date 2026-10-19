import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, FilterState } from '../models/dashboard.model';
export interface DashboardApi { stats(filter: FilterState): Observable<DashboardStats> }
export const DASHBOARD_API = new InjectionToken<DashboardApi>('DASHBOARD_API');
