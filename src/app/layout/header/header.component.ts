import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LucideGlobe2, LucideMenu } from '@lucide/angular';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { POLICY_LINES, PolicyLine } from '../../core/models/policy.model';
import { Period, Role, ROLES } from '../../core/models/common.model';
import { FilterService } from '../../core/services/filter.service';
import { RoleService } from '../../core/services/role.service';
import { ReferenceDataStore } from '../../core/stores/reference-data.store';

@Component({
  selector: 'app-header',
  imports: [LucideGlobe2, LucideMenu],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly filters = inject(FilterService);
  readonly roles = inject(RoleService);
  private readonly references = inject(ReferenceDataStore);
  readonly countries = this.references.countries;
  readonly policyLines = POLICY_LINES;
  readonly roleOptions = ROLES;
  readonly breadcrumb = toSignal(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), map((event) => this.labelFor(event.urlAfterRedirects))), { initialValue: this.labelFor(this.router.url) });
  @Output() readonly menuOpened = new EventEmitter<void>();

  setCountry(event: Event): void { this.filters.update({ countryId: (event.target as HTMLSelectElement).value }); }
  setLine(event: Event): void { this.filters.update({ line: (event.target as HTMLSelectElement).value as PolicyLine | 'ALL' }); }
  setPeriod(event: Event): void { this.filters.update({ period: (event.target as HTMLSelectElement).value as Period }); }
  setRole(event: Event): void { this.roles.setRole((event.target as HTMLSelectElement).value as Role); }
  private labelFor(url: string): string { return url.split('?')[0].split('/').filter(Boolean).map((part) => part === 'new' ? 'Submit claim' : part[0].toUpperCase() + part.slice(1)).join(' / ') || 'Dashboard'; }
}
