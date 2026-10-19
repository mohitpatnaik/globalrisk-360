import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ActivityApi } from './activity.api';
import { ClaimApi } from './claim.api';
import { DashboardApi } from './dashboard.api';
import { PolicyApi } from './policy.api';
import { ReferenceDataApi } from './reference-data.api';
import { InMemoryDataService } from '../data/in-memory-data.service';
import { ActivityEvent } from '../models/activity.model';
import { Claim } from '../models/claim.model';
import { Country } from '../models/country.model';
import { DashboardStats, FilterState } from '../models/dashboard.model';
import { Insured } from '../models/insured.model';
import { Policy } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class InMemoryApi implements DashboardApi, ReferenceDataApi {
  private readonly data = inject(InMemoryDataService);
  policies(): Observable<Policy[]> { return this.data.getPolicies(); }
  claims(): Observable<Claim[]> { return this.data.getClaims(); }
  activities(): Observable<ActivityEvent[]> { return this.data.getActivity(); }
  countries(): Observable<Country[]> { return this.data.getCountries(); }
  insureds(): Observable<Insured[]> { return this.data.getInsureds(); }
  stats(filter: FilterState): Observable<DashboardStats> {
    return combineLatest([this.data.getPolicies(), this.data.getClaims(), this.data.getCountries()]).pipe(map(([policies, claims, countries]) => this.buildStats(policies, claims, countries, filter)));
  }
  private buildStats(policies: Policy[], claims: Claim[], countries: Country[], filter: FilterState): DashboardStats {
    const selectedPolicies = policies.filter((policy) => (filter.countryId === 'ALL' || (policy.kind === 'LOCAL' ? policy.countryId : policy.issuingCountryId) === filter.countryId) && (filter.line === 'ALL' || policy.line === filter.line));
    const ids = new Set(selectedPolicies.map((policy) => policy.id));
    const selectedClaims = claims.filter((claim) => filter.countryId === 'ALL' || claim.countryId === filter.countryId).filter((claim) => filter.line === 'ALL' || ids.has(claim.localPolicyId));
    const countryNames = new Map(countries.map((country) => [country.id, country.name]));
    const group = (values: string[]): Array<{ label: string; value: number }> => Array.from(new Set(values)).map((label) => ({ label, value: values.filter((value) => value === label).length }));
    const premiumByCountry = Array.from(countryNames.entries()).map(([id, label]) => ({ label, value: selectedPolicies.filter((policy) => policy.kind === 'LOCAL' && policy.countryId === id).reduce((sum, policy) => sum + policy.totalPremium.amountMinor / 100, 0) }));
    const totalPremium = selectedPolicies.reduce((sum, policy) => sum + policy.totalPremium.amountMinor, 0);
    const approved = selectedClaims.filter((claim) => ['APPROVED', 'SETTLED', 'CLOSED'].includes(claim.status)).length;
    return { tiles: [
      { key: 'active-policies', label: 'Active Policies', value: selectedPolicies.filter((policy) => policy.status === 'ACTIVE').length },
      { key: 'total-premium', label: 'Total Premium', value: { amountMinor: totalPremium, currency: 'EUR' } },
      { key: 'open-claims', label: 'Open Claims', value: selectedClaims.filter((claim) => !['CLOSED', 'SETTLED'].includes(claim.status)).length },
      { key: 'approval-rate', label: 'Approval Rate', value: selectedClaims.length ? Math.round(approved / selectedClaims.length * 100) : 0 },
      { key: 'total-exposure', label: 'Total Exposure', value: { amountMinor: selectedPolicies.reduce((sum, policy) => sum + policy.coverages.reduce((coverageSum, coverage) => coverageSum + coverage.limit.amountMinor, 0), 0), currency: 'EUR' } },
    ], premiumByCountry, claimsByStatus: group(selectedClaims.map((claim) => claim.status)), exposureByCategory: selectedPolicies.flatMap((policy) => policy.coverages).reduce<Array<{ label: string; value: number }>>((series, coverage) => { const existing = series.find((point) => point.label === coverage.category); if (existing) existing.value += coverage.limit.amountMinor / 100; else series.push({ label: coverage.category, value: coverage.limit.amountMinor / 100 }); return series; }, []), claimsOverTime: group(selectedClaims.map((claim) => claim.reportedDate.slice(0, 7))), generatedAt: new Date().toISOString() };
  }
}

@Injectable({ providedIn: 'root' }) export class InMemoryPolicyApi implements PolicyApi { private readonly api = inject(InMemoryApi); list(): Observable<Policy[]> { return this.api.policies(); } }
@Injectable({ providedIn: 'root' }) export class InMemoryClaimApi implements ClaimApi { private readonly api = inject(InMemoryApi); list(): Observable<Claim[]> { return this.api.claims(); } }
@Injectable({ providedIn: 'root' }) export class InMemoryActivityApi implements ActivityApi { private readonly api = inject(InMemoryApi); list(): Observable<ActivityEvent[]> { return this.api.activities(); } }
