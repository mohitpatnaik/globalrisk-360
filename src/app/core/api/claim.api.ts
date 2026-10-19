import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Claim } from '../models/claim.model';
export interface ClaimApi { list(): Observable<Claim[]> }
export const CLAIM_API = new InjectionToken<ClaimApi>('CLAIM_API');
