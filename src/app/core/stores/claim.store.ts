import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { CLAIM_API } from '../api/claim.api';
import { Claim, ClaimStatus, ClaimAction } from '../models/claim.model';
import { FilterState } from '../models/dashboard.model';
import { Policy } from '../models/policy.model';
import { ClaimStateMachine } from '../claims/claim-state-machine';
import { Role } from '../models/common.model';
import { ActivityStore } from './activity.store';
import { ActivityEvent } from '../models/activity.model';
@Injectable({ providedIn: 'root' })
export class ClaimStore {
  private readonly api = inject(CLAIM_API); private readonly activityStore = inject(ActivityStore); private readonly claimState = signal<Claim[]>([]); private readonly loadingState = signal(false); private readonly errorState = signal<string | null>(null);
  readonly claims = this.claimState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly error = this.errorState.asReadonly();
  readonly byStatus = computed(() => {
    const map = new Map<string, Claim[]>();
    for (const c of this.claimState()) { const arr = map.get(c.status) ?? []; arr.push(c); map.set(c.status, arr); }
    return map;
  });
  constructor() { this.load().subscribe(); }
  load(): Observable<Claim[]> { this.loadingState.set(true); return this.api.list().pipe(tap((claims) => { this.claimState.set(claims); this.loadingState.set(false); this.errorState.set(null); }), catchError(() => { this.loadingState.set(false); this.errorState.set('Unable to load claims.'); return of([]); })); }
  search(filter: FilterState, query: string, status: ClaimStatus | 'ALL', priority: Claim['priority'] | 'ALL', policies: Policy[]): Observable<Claim[]> { const policyIds = new Set(policies.filter((policy) => filter.line === 'ALL' || policy.line === filter.line).map((policy) => policy.id)); return this.api.list().pipe(map((claims) => claims.filter((claim) => (!query || `${claim.claimNumber} ${claim.title}`.toLowerCase().includes(query.toLowerCase())) && (filter.countryId === 'ALL' || claim.countryId === filter.countryId) && (filter.line === 'ALL' || policyIds.has(claim.localPolicyId)) && (status === 'ALL' || claim.status === status) && (priority === 'ALL' || claim.priority === priority))), tap((claims) => this.claimState.set(claims))); }
  addClaim(claim: Claim): void {
    this.claimState.update((claims) => [claim, ...claims]);
  }
  transitionClaim(claimId: string, action: ClaimAction, role: Role): void {
    const idx = this.claimState().findIndex((c) => c.id === claimId);
    if (idx === -1) return;
    const claim = this.claimState()[idx];
    const nextStatus = ClaimStateMachine.nextStatus(claim.status, action, role);
    if (!nextStatus) return;
    const updated = { ...claim, status: nextStatus, updatedAt: new Date().toISOString() };
    this.claimState.update((claims) => { const n = [...claims]; n[idx] = updated; return n; });
    // Append activity event
    this.activityStore.addEvent({
      id: crypto.randomUUID(),
      type: 'CLAIM_STATUS_CHANGED',
      entity: { kind: 'CLAIM', id: claimId, ref: claim.claimNumber },
      summary: `Claim ${claim.claimNumber} moved ${claim.status} → ${nextStatus}`,
      actorRole: role,
      createdAt: new Date().toISOString(),
      meta: { fromStatus: claim.status, toStatus: nextStatus, action }
    });
  }
}
