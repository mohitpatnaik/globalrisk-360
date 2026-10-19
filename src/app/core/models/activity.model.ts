import { ClaimAction, ClaimStatus } from './claim.model';
import { IsoDateTime, Role, Uuid } from './common.model';

export const ACTIVITY_TYPES = [
  'CLAIM_CREATED', 'CLAIM_STATUS_CHANGED', 'CLAIM_NOTE_ADDED',
  'POLICY_CREATED', 'POLICY_UPDATED', 'INFO_REQUESTED', 'SYSTEM',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityEvent {
  id: Uuid;
  type: ActivityType;
  entity: { kind: 'CLAIM' | 'POLICY'; id: Uuid; ref: string };
  summary: string;
  actorRole: Role;
  actorName?: string;
  countryId?: Uuid;
  meta?: { fromStatus?: ClaimStatus; toStatus?: ClaimStatus; action?: ClaimAction };
  createdAt: IsoDateTime;
}

export interface ReviewNote {
  id: Uuid;
  claimId: Uuid;
  authorRole: Role;
  authorName?: string;
  body: string;
  action?: ClaimAction;
  createdAt: IsoDateTime;
}
