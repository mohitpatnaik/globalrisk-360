import { IsoDateTime, Money, Period, Uuid } from './common.model';
import { PolicyLine } from './policy.model';

export interface FilterState {
  countryId: Uuid | 'ALL';
  line: PolicyLine | 'ALL';
  period: Period;
  query: string;
}

export const DEFAULT_FILTER: FilterState = {
  countryId: 'ALL', line: 'ALL', period: 'YTD', query: '',
};

export interface StatTile {
  key: string;
  label: string;
  value: number | Money;
  deltaPct?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface SeriesPoint { label: string; value: number }
export interface DashboardStats {
  tiles: StatTile[];
  premiumByCountry: SeriesPoint[];
  claimsByStatus: SeriesPoint[];
  exposureByCategory: SeriesPoint[];
  claimsOverTime: SeriesPoint[];
  generatedAt: IsoDateTime;
}
