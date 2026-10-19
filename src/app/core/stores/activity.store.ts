import { Injectable, inject, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { ACTIVITY_API } from '../api/activity.api';
import { ActivityEvent } from '../models/activity.model';
@Injectable({ providedIn: 'root' })
export class ActivityStore {
  private readonly api = inject(ACTIVITY_API); private readonly activityState = signal<ActivityEvent[]>([]); private readonly errorState = signal<string | null>(null);
  readonly activity = this.activityState.asReadonly(); readonly error = this.errorState.asReadonly();
  constructor() { this.load().subscribe(); }
  load(): Observable<ActivityEvent[]> { return this.api.list().pipe(tap((activity) => { this.activityState.set(activity); this.errorState.set(null); }), catchError(() => { this.errorState.set('Unable to load activity.'); return of([]); })); }
  addEvent(event: ActivityEvent): void {
    this.activityState.update((acts) => [event, ...acts]);
  }
}
