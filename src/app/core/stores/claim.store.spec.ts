import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaimStore } from './claim.store';
import { CLAIM_API } from '../api/claim.api';
import { ACTIVITY_API } from '../api/activity.api';
import { ActivityStore } from './activity.store';
import { Claim } from '../models/claim.model';
import { DEFAULT_FILTER } from '../models/dashboard.model';

function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    id: overrides.id ?? 'c-new',
    claimNumber: overrides.claimNumber ?? 'CLM-2026-9999',
    status: overrides.status ?? 'DRAFT',
    localPolicyId: 'lp-1',
    masterPolicyId: 'mp-1',
    countryId: 'pl',
    insuredId: 'ins-1',
    title: overrides.title ?? 'Poland warehouse flood',
    description: 'Synthetic test claim',
    lossDate: '2026-03-10',
    reportedDate: '2026-03-12',
    lineItems: [],
    claimedTotal: { amountMinor: 18_000_000, currency: 'PLN' },
    priority: 'HIGH',
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
    ...overrides,
  };
}

describe('ClaimStore (persistence + transitions)', () => {
  const seed: Claim[] = [makeClaim({ id: 'seed-1', claimNumber: 'CLM-2026-0001', status: 'APPROVED', title: 'Seed claim' })];

  function setup(): ClaimStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: CLAIM_API, useValue: { list: () => of(seed) } },
        { provide: ACTIVITY_API, useValue: { list: () => of([]) } },
        ActivityStore,
        ClaimStore,
      ],
    });
    return TestBed.inject(ClaimStore);
  }

  it('keeps an added claim after search() (no destructive refetch)', (done) => {
    const store = setup();
    const added = makeClaim({ id: 'c-new', title: 'Poland warehouse flood' });
    store.addClaim(added);
    expect(store.claims().some((c) => c.id === 'c-new')).toBe(true);

    store.search(DEFAULT_FILTER, '', 'ALL', 'ALL', []).subscribe((result) => {
      // The added claim must survive filtering — previously search() refetched
      // from the API and overwrote the store, dropping it.
      expect(result.some((c) => c.id === 'c-new')).toBe(true);
      expect(store.claims().some((c) => c.id === 'c-new')).toBe(true);
      done();
    });
  });

  it('persists a state-machine transition and logs an activity event', () => {
    const store = setup();
    const activity = TestBed.inject(ActivityStore);
    const draft = makeClaim({ id: 'c-x', status: 'DRAFT' });
    store.addClaim(draft);

    store.transitionClaim('c-x', 'SUBMIT', 'MANAGER');

    const updated = store.claims().find((c) => c.id === 'c-x');
    expect(updated?.status).toBe('SUBMITTED');
    expect(activity.activity().some((e) => e.type === 'CLAIM_STATUS_CHANGED' && e.entity.id === 'c-x')).toBe(true);
  });

  it('filterClaims narrows by query and status without mutating input', () => {
    const store = setup();
    const claims = [
      makeClaim({ id: 'a', claimNumber: 'CLM-A', status: 'SUBMITTED', title: 'Fire' }),
      makeClaim({ id: 'b', claimNumber: 'CLM-B', status: 'APPROVED', title: 'Flood' }),
    ];
    const byStatus = store.filterClaims(claims, DEFAULT_FILTER, '', 'APPROVED', 'ALL', []);
    expect(byStatus.map((c) => c.id)).toEqual(['b']);
    const byQuery = store.filterClaims(claims, DEFAULT_FILTER, 'fire', 'ALL', 'ALL', []);
    expect(byQuery.map((c) => c.id)).toEqual(['a']);
    expect(claims.length).toBe(2); // input untouched
  });
});
