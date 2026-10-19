import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivityEvent } from '../models/activity.model';
import { Claim } from '../models/claim.model';
import { Country } from '../models/country.model';
import { Policy } from '../models/policy.model';
import { Insured } from '../models/insured.model';
import { SYNTHETIC_ACTIVITY, SYNTHETIC_CLAIMS, SYNTHETIC_COUNTRIES, SYNTHETIC_INSUREDS, SYNTHETIC_POLICIES } from './synthetic-data';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService {
  private readonly policyState = signal<Policy[]>(structuredClone(SYNTHETIC_POLICIES));
  private readonly claimState = signal<Claim[]>(structuredClone(SYNTHETIC_CLAIMS));
  private readonly activityState = signal<ActivityEvent[]>(structuredClone(SYNTHETIC_ACTIVITY));

  readonly policies = this.policyState.asReadonly();
  readonly claims = this.claimState.asReadonly();
  readonly activity = this.activityState.asReadonly();

  getCountries(): Observable<Country[]> { return of(structuredClone(SYNTHETIC_COUNTRIES)); }
  getInsureds(): Observable<Insured[]> { return of(structuredClone(SYNTHETIC_INSUREDS)); }
  getPolicies(): Observable<Policy[]> { return of(structuredClone(this.policyState())); }
  getClaims(): Observable<Claim[]> { return of(structuredClone(this.claimState())); }
  getActivity(): Observable<ActivityEvent[]> { return of(structuredClone(this.activityState())); }
}
