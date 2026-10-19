import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GrCardComponent } from '../../shared/ui/gr-card/gr-card.component';
import { GrStatusIndicatorComponent } from '../../shared/ui/gr-status-indicator/gr-status-indicator.component';
import { GrChartComponent } from '../../shared/ui/gr-chart/gr-chart.component';
import { FilterService } from '../../core/services/filter.service';
import { ClaimStore } from '../../core/stores/claim.store';
import { DashboardStore } from '../../core/stores/dashboard.store';
import { PolicyStore } from '../../core/stores/policy.store';
import { Money } from '../../core/models/common.model';
import { DashboardStats } from '../../core/models/dashboard.model';
import { barChart, lineChart, pieChart } from './dashboard-chart.mapper';

@Component({ selector: 'app-dashboard', imports: [CurrencyPipe, PercentPipe, GrCardComponent, GrStatusIndicatorComponent, GrChartComponent], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardComponent {
  private readonly filters = inject(FilterService); private readonly dashboard = inject(DashboardStore); private readonly claims = inject(ClaimStore); private readonly policies = inject(PolicyStore);
  // takeUntilDestroyed: safe subscription cleanup when the component is destroyed
  readonly stats = toSignal(this.filters.filter$.pipe(
    switchMap((filter: any) => this.dashboard.load(filter)),
    takeUntilDestroyed()
  ), { initialValue: null as DashboardStats | null });
  readonly activePolicies = computed(() => this.numberTile('active-policies')); readonly openClaims = computed(() => this.numberTile('open-claims')); readonly approvalRate = computed(() => this.numberTile('approval-rate')); readonly totalPremium = computed(() => this.moneyTile('total-premium')); readonly totalExposure = computed(() => this.moneyTile('total-exposure'));
  readonly recentClaims = computed(() => { const filter = this.filters.filter(); const policyIds = new Set(this.policies.policies().filter((policy) => filter.line === 'ALL' || policy.line === filter.line).map((policy) => policy.id)); return this.claims.claims().filter((claim) => (filter.countryId === 'ALL' || claim.countryId === filter.countryId) && (filter.line === 'ALL' || policyIds.has(claim.localPolicyId))).sort((a, b) => b.reportedDate.localeCompare(a.reportedDate)).slice(0, 4); });
  readonly premiumOption = computed(() => barChart(this.stats()?.premiumByCountry ?? [], 'Premium', '#2563eb')); readonly claimsStatusOption = computed(() => pieChart(this.stats()?.claimsByStatus ?? [])); readonly exposureOption = computed(() => barChart(this.stats()?.exposureByCategory ?? [], 'Exposure', '#0891b2')); readonly claimsOverTimeOption = computed(() => lineChart(this.stats()?.claimsOverTime ?? []));
  private numberTile(key: string): number { const value = this.stats()?.tiles.find((tile) => tile.key === key)?.value; return typeof value === 'number' ? value : 0; }
  private moneyTile(key: string): Money { const value = this.stats()?.tiles.find((tile) => tile.key === key)?.value; return typeof value === 'object' ? value : { amountMinor: 0, currency: 'EUR' }; }
}
