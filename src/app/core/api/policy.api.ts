import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Policy } from '../models/policy.model';
export interface PolicyApi { list(): Observable<Policy[]> }
export const POLICY_API = new InjectionToken<PolicyApi>('POLICY_API');
