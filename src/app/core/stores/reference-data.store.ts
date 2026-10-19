import { Injectable, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';
import { REFERENCE_DATA_API } from '../api/reference-data.api';
import { Country } from '../models/country.model';
import { Insured } from '../models/insured.model';
@Injectable({ providedIn: 'root' })
export class ReferenceDataStore {
  private readonly api = inject(REFERENCE_DATA_API); private readonly countryState = signal<Country[]>([]); private readonly insuredState = signal<Insured[]>([]);
  readonly countries = this.countryState.asReadonly(); readonly insureds = this.insuredState.asReadonly();
  constructor() { combineLatest([this.api.countries(), this.api.insureds()]).subscribe(([countries, insureds]) => { this.countryState.set(countries); this.insuredState.set(insureds); }); }
  countryName(id: string): string { return this.countryState().find((country) => country.id === id)?.name ?? '—'; }
  insuredName(id: string): string { return this.insuredState().find((insured) => insured.id === id)?.legalName ?? '—'; }
}
