export type Uuid = string;
export type IsoDateTime = string;
export type IsoDate = string;
export type CurrencyCode = 'EUR' | 'USD' | 'PLN' | 'GBP';

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Named {
  id: Uuid;
  name: string;
}

export const ROLES = ['VIEWER', 'ADJUSTER', 'UNDERWRITER', 'MANAGER'] as const;
export type Role = (typeof ROLES)[number];
export type Period = 'MTD' | 'QTD' | 'YTD' | 'LAST_12M' | 'ALL';
