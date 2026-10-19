import { CurrencyCode, IsoDate, IsoDateTime, Money, Uuid } from './common.model';
import { RiskCategory } from './insured.model';

export interface Coverage {
  id: Uuid;
  category: RiskCategory;
  limit: Money;
  deductible: Money;
  premium: Money;
  attachmentPoint?: Money;
}

export const POLICY_STATUSES = ['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];
export const POLICY_LINES = [
  'PROPERTY', 'CASUALTY', 'MARINE', 'CYBER', 'FINANCIAL_LINES', 'MOTOR',
] as const;
export type PolicyLine = (typeof POLICY_LINES)[number];

interface PolicyBase {
  id: Uuid;
  policyNumber: string;
  line: PolicyLine;
  status: PolicyStatus;
  insuredId: Uuid;
  inceptionDate: IsoDate;
  expiryDate: IsoDate;
  coverages: Coverage[];
  totalPremium: Money;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface MasterPolicy extends PolicyBase {
  kind: 'MASTER';
  programName: string;
  issuingCountryId: Uuid;
  localPolicyIds: Uuid[];
}

export interface LocalPolicy extends PolicyBase {
  kind: 'LOCAL';
  masterPolicyId: Uuid;
  countryId: Uuid;
  admitted: boolean;
  localCurrency: CurrencyCode;
}

export type Policy = MasterPolicy | LocalPolicy;
export const isMaster = (policy: Policy): policy is MasterPolicy => policy.kind === 'MASTER';
export const isLocal = (policy: Policy): policy is LocalPolicy => policy.kind === 'LOCAL';
