import { Injectable, inject, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { DASHBOARD_API } from '../api/dashboard.api';
import { DashboardStats, FilterState } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly api = inject(DASHBOARD_API); private readonly statsState = signal<DashboardStats | null>(null); private readonly loadingState = signal(false); private readonly errorState = signal<string | null>(null);
  readonly stats = this.statsState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly error = this.errorState.asReadonly();
  load(filter: FilterState): Observable<DashboardStats | null> { this.loadingState.set(true); return this.api.stats(filter).pipe(tap((stats) => { this.statsState.set(stats); this.loadingState.set(false); this.errorState.set(null); }), catchError(() => { this.loadingState.set(false); this.errorState.set('Unable to load dashboard.'); return of(null); })); }
}
