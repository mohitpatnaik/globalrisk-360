import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Claim, ClaimStatus } from '../../core/models/claim.model';
import { FilterService } from '../../core/services/filter.service';
import { ClaimStore } from '../../core/stores/claim.store';
import { PolicyStore } from '../../core/stores/policy.store';
import { ReferenceDataStore } from '../../core/stores/reference-data.store';
import { GrBadgeComponent } from '../../shared/ui/gr-badge/gr-badge.component';
import { GrButtonComponent } from '../../shared/ui/gr-button/gr-button.component';
import { GrCardComponent } from '../../shared/ui/gr-card/gr-card.component';
import { GrStatusIndicatorComponent } from '../../shared/ui/gr-status-indicator/gr-status-indicator.component';
import { GrTableComponent, TableColumn } from '../../shared/ui/gr-table/gr-table.component';
@Component({ selector: 'app-claim-list', imports: [CurrencyPipe, DatePipe, GrBadgeComponent, GrButtonComponent, GrCardComponent, GrStatusIndicatorComponent, GrTableComponent], templateUrl: './claim-list.component.html', styleUrl: './claim-list.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ClaimListComponent {
  readonly columns: TableColumn[] = [{ key: 'claimNumber', label: 'Claim #' }, { key: 'title', label: 'Title' }, { key: 'country', label: 'Country' }, { key: 'policyNumber', label: 'Policy #' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'claimed', label: 'Claimed', numeric: true }, { key: 'reported', label: 'Reported' }];
  private readonly store = inject(ClaimStore); private readonly policyStore = inject(PolicyStore); private readonly references = inject(ReferenceDataStore); private readonly filters = inject(FilterService); private readonly route = inject(ActivatedRoute); readonly query = signal(''); readonly status = signal<ClaimStatus | 'ALL'>('ALL'); readonly priority = signal<Claim['priority'] | 'ALL'>('ALL'); readonly page = signal(1); readonly pageSize = 5;
  readonly selected = signal<Claim | null>(this.store.claims().find((claim) => claim.id === this.route.snapshot.paramMap.get('id')) ?? null);
  private readonly results = toSignal(combineLatest([this.filters.filter$, toObservable(this.query).pipe(debounceTime(250), distinctUntilChanged()), toObservable(this.status), toObservable(this.priority)]).pipe(switchMap(([filter, query, status, priority]) => this.store.search(filter, query, status, priority, this.policyStore.policies()))), { initialValue: [] });
  readonly filtered = computed(() => [...this.results()].sort((a, b) => b.reportedDate.localeCompare(a.reportedDate)));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize))); readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  setQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); this.page.set(1); } setStatus(event: Event): void { this.status.set((event.target as HTMLSelectElement).value as ClaimStatus | 'ALL'); this.page.set(1); } setPriority(event: Event): void { this.priority.set((event.target as HTMLSelectElement).value as Claim['priority'] | 'ALL'); this.page.set(1); } previous(): void { this.page.update((value) => Math.max(1, value - 1)); } next(): void { this.page.update((value) => Math.min(this.totalPages(), value + 1)); }
  countryName(id: string): string { return this.references.countryName(id); } policyNumber(id: string): string { return this.policyStore.policies().find((policy) => policy.id === id)?.policyNumber ?? '—'; } insuredName(id: string): string { return this.references.insuredName(id); }
}
