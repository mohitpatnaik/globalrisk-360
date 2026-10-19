import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityEvent } from '../models/activity.model';
export interface ActivityApi { list(): Observable<ActivityEvent[]> }
export const ACTIVITY_API = new InjectionToken<ActivityApi>('ACTIVITY_API');
