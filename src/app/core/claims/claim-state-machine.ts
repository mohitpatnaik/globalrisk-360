import { ClaimAction, ClaimStatus, ClaimTransition } from '../models/claim.model';
import { Role } from '../models/common.model';

export const CLAIM_TRANSITIONS: ClaimTransition[] = [
  { from: 'DRAFT', action: 'SUBMIT', to: 'SUBMITTED', roles: ['ADJUSTER', 'UNDERWRITER', 'MANAGER'] },
  { from: 'SUBMITTED', action: 'START_REVIEW', to: 'UNDER_REVIEW', roles: ['UNDERWRITER', 'MANAGER'] },
  { from: 'UNDER_REVIEW', action: 'REQUEST_INFO', to: 'INFO_REQUESTED', roles: ['UNDERWRITER', 'MANAGER'] },
  { from: 'UNDER_REVIEW', action: 'APPROVE', to: 'APPROVED', roles: ['UNDERWRITER', 'MANAGER'] },
  { from: 'UNDER_REVIEW', action: 'REJECT', to: 'REJECTED', roles: ['UNDERWRITER', 'MANAGER'] },
  { from: 'INFO_REQUESTED', action: 'RESUBMIT', to: 'UNDER_REVIEW', roles: ['ADJUSTER', 'MANAGER'] },
  { from: 'APPROVED', action: 'SETTLE', to: 'SETTLED', roles: ['UNDERWRITER', 'MANAGER'] },
  { from: 'REJECTED', action: 'CLOSE', to: 'CLOSED', roles: ['MANAGER'] },
  { from: 'SETTLED', action: 'CLOSE', to: 'CLOSED', roles: ['MANAGER'] },
  { from: 'CLOSED', action: 'REOPEN', to: 'REOPENED', roles: ['MANAGER'] },
  { from: 'REOPENED', action: 'START_REVIEW', to: 'UNDER_REVIEW', roles: ['UNDERWRITER', 'MANAGER'] },
];

export class ClaimStateMachine {
  static canTransition(status: ClaimStatus, action: ClaimAction, role: Role): boolean {
    return CLAIM_TRANSITIONS.some(
      (transition) => transition.from === status && transition.action === action && transition.roles.includes(role),
    );
  }

  static nextStatus(status: ClaimStatus, action: ClaimAction, role: Role): ClaimStatus | null {
    return CLAIM_TRANSITIONS.find(
      (transition) => transition.from === status && transition.action === action && transition.roles.includes(role),
    )?.to ?? null;
  }

  static actionsFor(status: ClaimStatus, role: Role): ClaimAction[] {
    return CLAIM_TRANSITIONS
      .filter((transition) => transition.from === status && transition.roles.includes(role))
      .map((transition) => transition.action);
  }
}
