import { CurrencyCode, Uuid } from './common.model';

export const REGIONS = ['EMEA', 'AMERICAS', 'APAC'] as const;
export type Region = (typeof REGIONS)[number];

export interface Country {
  id: Uuid;
  code: string;
  name: string;
  region: Region;
  currency: CurrencyCode;
  requiresLocalPolicy: boolean;
  flag?: string;
}
