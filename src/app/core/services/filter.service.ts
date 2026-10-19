import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, shareReplay } from 'rxjs';
import { DEFAULT_FILTER, FilterState } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly filterSubject = new BehaviorSubject<FilterState>(DEFAULT_FILTER);
  // shareReplay(1) caches the last filter state so multiple consumers
  // (dashboard, policy list, claim list) all see the same stream without
  // redundant API calls — each screen derives locally from the shared source.
  readonly filter$ = this.filterSubject.asObservable().pipe(shareReplay(1));
  readonly filter = toSignal(this.filter$, { initialValue: DEFAULT_FILTER });

  update(patch: Partial<FilterState>): void {
    this.filterSubject.next({ ...this.filterSubject.value, ...patch });
  }
}
