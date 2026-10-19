import { Injectable, signal, computed } from '@angular/core';
import { Role } from '../models/common.model';

const ROLE_NAMES: Record<Role, string> = {
  VIEWER: 'Viewer User',
  ADJUSTER: 'Katarzyna Nowak',
  UNDERWRITER: 'Elena Fischer',
  MANAGER: 'Marc Dubois'
};

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly roleState = signal<Role>('MANAGER');
  readonly role = this.roleState.asReadonly();
  readonly userName = computed(() => ROLE_NAMES[this.roleState()]);
  setRole(role: Role): void { this.roleState.set(role); }
}
