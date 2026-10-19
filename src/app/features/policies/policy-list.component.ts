import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FilterService } from '../../core/services/filter.service';
import { PolicyStore } from '../../core/stores/policy.store';
import { ReferenceDataStore } from '../../core/stores/reference-data.store';
import { Policy, PolicyLine, PolicyStatus } from '../../core/models/policy.model';
import { GrBadgeComponent } from '../../shared/ui/gr-badge/gr-badge.component';
import { GrButtonComponent } from '../../shared/ui/gr-button/gr-button.component';
import { GrCardComponent } from '../../shared/ui/gr-card/gr-card.component';
import { GrStatusIndicatorComponent } from '../../shared/ui/gr-status-indicator/gr-status-indicator.component';
import { GrTableComponent, TableColumn } from '../../shared/ui/gr-table/gr-table.component';
type PolicySort = 'policyNumber' | 'line' | 'status' | 'updatedAt' | 'premium';
@Component({ selector: 'app-policy-list', imports: [CurrencyPipe, DatePipe, GrBadgeComponent, GrButtonComponent, GrCardComponent, GrStatusIndicatorComponent, GrTableComponent], templateUrl: './policy-list.component.html', styleUrl: './policy-list.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class PolicyListComponent {
  readonly columns: TableColumn[] = [{ key: 'policyNumber', label: 'Policy #' }, { key: 'kind', label: 'Kind' }, { key: 'line', label: 'Line' }, { key: 'insured', label: 'Insured' }, { key: 'country', label: 'Country' }, { key: 'status', label: 'Status' }, { key: 'premium', label: 'Premium', numeric: true }, { key: 'updatedAt', label: 'Updated' }];
  private readonly store = inject(PolicyStore); private readonly references = inject(ReferenceDataStore); private readonly filters = inject(FilterService); readonly query = signal(''); readonly status = signal<PolicyStatus | 'ALL'>('ALL'); readonly kind = signal<'MASTER' | 'LOCAL' | 'ALL'>('ALL'); readonly line = signal<PolicyLine | 'ALL'>('ALL'); readonly sort = signal<PolicySort>('updatedAt'); readonly descending = signal(true); readonly page = signal(1); readonly pageSize = 5; readonly selected = signal<Policy | null>(null);
  private readonly results = toSignal(combineLatest([this.filters.filter$, toObservable(this.query).pipe(debounceTime(250), distinctUntilChanged()), toObservable(this.status), toObservable(this.kind), toObservable(this.line)]).pipe(switchMap(([filter, query, status, kind, line]) => this.store.search(filter, query, status, kind, line))), { initialValue: [] });
  readonly filtered = computed(() => [...this.results()].sort((a, b) => this.compare(a, b)));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize))); readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  setQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); this.page.set(1); } setStatus(event: Event): void { this.status.set((event.target as HTMLSelectElement).value as PolicyStatus | 'ALL'); this.page.set(1); } setKind(event: Event): void { this.kind.set((event.target as HTMLSelectElement).value as 'MASTER' | 'LOCAL' | 'ALL'); this.page.set(1); } setLine(event: Event): void { this.line.set((event.target as HTMLSelectElement).value as PolicyLine | 'ALL'); this.page.set(1); } setSort(event: Event): void { this.sort.set((event.target as HTMLSelectElement).value as PolicySort); } previous(): void { this.page.update((value) => Math.max(1, value - 1)); } next(): void { this.page.update((value) => Math.min(this.totalPages(), value + 1)); }
  countryName(policy: Policy): string { return this.references.countryName(policy.kind === 'LOCAL' ? policy.countryId : policy.issuingCountryId); } insuredName(id: string): string { return this.references.insuredName(id); }
  private compare(a: Policy, b: Policy): number { const key = this.sort(); const left = key === 'premium' ? a.totalPremium.amountMinor : a[key]; const right = key === 'premium' ? b.totalPremium.amountMinor : b[key]; return String(left).localeCompare(String(right), undefined, { numeric: true }) * (this.descending() ? -1 : 1); }
}
