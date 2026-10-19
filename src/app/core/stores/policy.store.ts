import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { POLICY_API } from '../api/policy.api';
import { FilterState } from '../models/dashboard.model';
import { Policy, PolicyLine, PolicyStatus } from '../models/policy.model';
@Injectable({ providedIn: 'root' })
export class PolicyStore {
  private readonly api = inject(POLICY_API); private readonly policyState = signal<Policy[]>([]); private readonly loadingState = signal(false); private readonly errorState = signal<string | null>(null);
  readonly policies = this.policyState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly error = this.errorState.asReadonly();
  constructor() { this.load().subscribe(); }
  load(): Observable<Policy[]> { this.loadingState.set(true); return this.api.list().pipe(tap((policies) => { this.policyState.set(policies); this.loadingState.set(false); this.errorState.set(null); }), catchError(() => { this.loadingState.set(false); this.errorState.set('Unable to load policies.'); return of([]); })); }
  search(filter: FilterState, query: string, status: PolicyStatus | 'ALL', kind: 'MASTER' | 'LOCAL' | 'ALL', line: PolicyLine | 'ALL'): Observable<Policy[]> {
    return this.api.list().pipe(map((policies) => policies.filter((policy) => (!query || policy.policyNumber.toLowerCase().includes(query.toLowerCase())) && (filter.countryId === 'ALL' || (policy.kind === 'LOCAL' ? policy.countryId : policy.issuingCountryId) === filter.countryId) && (filter.line === 'ALL' || policy.line === filter.line) && (status === 'ALL' || policy.status === status) && (kind === 'ALL' || policy.kind === kind) && (line === 'ALL' || policy.line === line))), tap((policies) => this.policyState.set(policies)));
  }
}
