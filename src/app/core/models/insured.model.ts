import { Money, Uuid } from './common.model';

export interface Insured {
  id: Uuid;
  legalName: string;
  countryId: Uuid;
  industry: string;
  headcount?: number;
}

export const RISK_CATEGORIES = [
  'PROPERTY',
  'LIABILITY',
  'MARINE',
  'CYBER',
  'DIRECTORS_OFFICERS',
  'MOTOR_FLEET',
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export interface Risk {
  id: Uuid;
  category: RiskCategory;
  description: string;
  insuredValue: Money;
  countryId: Uuid;
  location?: string;
}
