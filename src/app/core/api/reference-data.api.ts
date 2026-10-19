import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../models/country.model';
import { Insured } from '../models/insured.model';
export interface ReferenceDataApi { countries(): Observable<Country[]>; insureds(): Observable<Insured[]> }
export const REFERENCE_DATA_API = new InjectionToken<ReferenceDataApi>('REFERENCE_DATA_API');
