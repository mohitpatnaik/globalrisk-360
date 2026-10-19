import { IsoDate, IsoDateTime, Money, Role, Uuid } from './common.model';
import { RiskCategory } from './insured.model';

export const CLAIM_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED',
  'REJECTED', 'SETTLED', 'CLOSED', 'REOPENED',
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export const CLAIM_ACTIONS = [
  'SUBMIT', 'START_REVIEW', 'REQUEST_INFO', 'RESUBMIT', 'APPROVE',
  'REJECT', 'SETTLE', 'CLOSE', 'REOPEN',
] as const;
export type ClaimAction = (typeof CLAIM_ACTIONS)[number];

export interface ClaimTransition {
  from: ClaimStatus;
  action: ClaimAction;
  to: ClaimStatus;
  roles: Role[];
}

export interface ClaimLineItem {
  id: Uuid;
  riskCategory: RiskCategory;
  description: string;
  claimedAmount: Money;
  approvedAmount?: Money;
}

export interface Claim {
  id: Uuid;
  claimNumber: string;
  status: ClaimStatus;
  localPolicyId: Uuid;
  masterPolicyId: Uuid;
  countryId: Uuid;
  insuredId: Uuid;
  title: string;
  description: string;
  lossDate: IsoDate;
  reportedDate: IsoDate;
  lineItems: ClaimLineItem[];
  claimedTotal: Money;
  reserveAmount?: Money;
  settledAmount?: Money;
  assignedTo?: Uuid;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
