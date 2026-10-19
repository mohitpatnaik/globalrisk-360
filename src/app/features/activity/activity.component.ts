import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ACTIVITY_TYPES, ActivityType } from '../../core/models/activity.model';
import { FilterService } from '../../core/services/filter.service';
import { ActivityStore } from '../../core/stores/activity.store';
import { ReferenceDataStore } from '../../core/stores/reference-data.store';
import { GrCardComponent } from '../../shared/ui/gr-card/gr-card.component';
import { GrBadgeComponent } from '../../shared/ui/gr-badge/gr-badge.component';
@Component({ selector: 'app-activity', imports: [DatePipe, GrCardComponent, GrBadgeComponent], templateUrl: './activity.component.html', styleUrl: './activity.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ActivityComponent {
  private readonly store = inject(ActivityStore); private readonly references = inject(ReferenceDataStore); private readonly globalFilters = inject(FilterService); readonly countries = this.references.countries; readonly types = ACTIVITY_TYPES; readonly country = signal('ALL'); readonly type = signal<ActivityType | 'ALL'>('ALL');
  readonly events = computed(() => { const globalCountry = this.globalFilters.filter().countryId; return this.store.activity().filter((event) => (globalCountry === 'ALL' || event.countryId === globalCountry) && (this.country() === 'ALL' || event.countryId === this.country()) && (this.type() === 'ALL' || event.type === this.type())).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); });
  setCountry(event: Event): void { this.country.set((event.target as HTMLSelectElement).value); } setType(event: Event): void { this.type.set((event.target as HTMLSelectElement).value as ActivityType | 'ALL'); }
  countryName(id?: string): string { return id ? this.references.countryName(id) : 'Global'; }
}
