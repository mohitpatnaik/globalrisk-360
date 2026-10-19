import { ActivityEvent } from '../models/activity.model';
import { Claim, ClaimStatus } from '../models/claim.model';
import { CurrencyCode, Money } from '../models/common.model';
import { Country } from '../models/country.model';
import { Insured, RiskCategory } from '../models/insured.model';
import { LocalPolicy, MasterPolicy, Policy, PolicyLine } from '../models/policy.model';

const uuid = (value: number): string => `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`;
const money = (amountMinor: number, currency: CurrencyCode): Money => ({ amountMinor, currency });

export const SYNTHETIC_COUNTRIES: Country[] = [
  { id: uuid(1), code: 'DE', name: 'Germany', region: 'EMEA', currency: 'EUR', requiresLocalPolicy: true, flag: '🇩🇪' },
  { id: uuid(2), code: 'FR', name: 'France', region: 'EMEA', currency: 'EUR', requiresLocalPolicy: true, flag: '🇫🇷' },
  { id: uuid(3), code: 'PL', name: 'Poland', region: 'EMEA', currency: 'PLN', requiresLocalPolicy: true, flag: '🇵🇱' },
  { id: uuid(4), code: 'US', name: 'United States', region: 'AMERICAS', currency: 'USD', requiresLocalPolicy: false, flag: '🇺🇸' },
];

export const SYNTHETIC_INSUREDS: Insured[] = [
  { id: uuid(10), legalName: 'NordWerk Industries SE', countryId: uuid(1), industry: 'Advanced Manufacturing', headcount: 18200 },
  { id: uuid(11), legalName: 'Aurelia Logistics Group SA', countryId: uuid(2), industry: 'Transport & Logistics', headcount: 9400 },
  { id: uuid(12), legalName: 'Vistula Energy Holdings', countryId: uuid(3), industry: 'Renewable Energy', headcount: 6100 },
  { id: uuid(13), legalName: 'Meridian Digital Systems Inc.', countryId: uuid(4), industry: 'Technology', headcount: 12700 },
];

const lines: PolicyLine[] = ['PROPERTY', 'CASUALTY', 'MARINE', 'CYBER'];
const riskCategoryByLine: Record<PolicyLine, RiskCategory> = {
  PROPERTY: 'PROPERTY', CASUALTY: 'LIABILITY', MARINE: 'MARINE', CYBER: 'CYBER',
  FINANCIAL_LINES: 'DIRECTORS_OFFICERS', MOTOR: 'MOTOR_FLEET',
};
const masterPolicies: MasterPolicy[] = lines.map((line, index) => {
  const id = uuid(100 + index);
  return {
    id,
    kind: 'MASTER',
    policyNumber: `MP-2026-000${index + 1}`,
    programName: `${['Global Property', 'Worldwide Casualty', 'International Marine', 'Enterprise Cyber'][index]} Program 2026`,
    line,
    status: 'ACTIVE',
    insuredId: uuid(10 + index),
    issuingCountryId: uuid((index % 4) + 1),
    inceptionDate: '2026-01-01',
    expiryDate: '2026-12-31',
    coverages: [{ id: uuid(200 + index), category: riskCategoryByLine[line], limit: money(25_000_000_00, 'EUR'), deductible: money(100_000_00, 'EUR'), premium: money(420_000_00 + index * 35_000_00, 'EUR') }],
    totalPremium: money(420_000_00 + index * 35_000_00, 'EUR'),
    localPolicyIds: [0, 1, 2, 3].map((countryIndex) => uuid(300 + index * 4 + countryIndex)),
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: `2026-10-${String(10 + index).padStart(2, '0')}T08:30:00Z`,
  };
});

const localPolicies: LocalPolicy[] = masterPolicies.flatMap((master, masterIndex) =>
  SYNTHETIC_COUNTRIES.map((country, countryIndex) => ({
    id: uuid(300 + masterIndex * 4 + countryIndex),
    kind: 'LOCAL' as const,
    policyNumber: `LP-${country.code}-2026-${String(masterIndex + 1).padStart(3, '0')}`,
    masterPolicyId: master.id,
    countryId: country.id,
    admitted: country.code !== 'US' || master.line !== 'MARINE',
    localCurrency: country.currency,
    line: master.line,
    status: masterIndex === 3 && countryIndex === 1 ? 'DRAFT' as const : 'ACTIVE' as const,
    insuredId: master.insuredId,
    inceptionDate: '2026-01-01',
    expiryDate: '2026-12-31',
    coverages: master.coverages.map((coverage, coverageIndex) => ({ ...coverage, id: uuid(500 + masterIndex * 10 + countryIndex * 2 + coverageIndex), limit: money(8_000_000_00 + countryIndex * 500_000_00, country.currency), deductible: money(50_000_00, country.currency), premium: money(120_000_00 + masterIndex * 15_000_00, country.currency) })),
    totalPremium: money(120_000_00 + masterIndex * 15_000_00, country.currency),
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: `2026-10-${String(14 + countryIndex).padStart(2, '0')}T11:00:00Z`,
  })),
);

export const SYNTHETIC_POLICIES: Policy[] = [...masterPolicies, ...localPolicies];

const claimStatuses: ClaimStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED'];
export const SYNTHETIC_CLAIMS: Claim[] = claimStatuses.map((status, index) => {
  const local = localPolicies[(index * 2 + 1) % localPolicies.length];
  const currency = local.localCurrency;
  const amount = 85_000_00 + index * 42_500_00;
  return {
    id: uuid(700 + index),
    claimNumber: `CLM-2026-${String(index + 1).padStart(4, '0')}`,
    status,
    localPolicyId: local.id,
    masterPolicyId: local.masterPolicyId,
    countryId: local.countryId,
    insuredId: local.insuredId,
    title: ['Warehouse water damage', 'Cargo handling incident', 'Production line fire', 'Ransomware interruption', 'Third-party injury', 'Storm roof damage', 'Port equipment loss', 'Network restoration'][index],
    description: 'Synthetic claim created for the GlobalRisk 360 demonstration environment.',
    lossDate: `2026-0${(index % 8) + 1}-12`,
    reportedDate: `2026-0${(index % 8) + 1}-14`,
    lineItems: [{ id: uuid(800 + index), riskCategory: riskCategoryByLine[local.line], description: 'Primary insured loss and response costs', claimedAmount: money(amount, currency), ...(index >= 4 ? { approvedAmount: money(Math.round(amount * 0.82), currency) } : {}) }],
    claimedTotal: money(amount, currency),
    ...(index >= 2 ? { reserveAmount: money(Math.round(amount * 0.9), currency) } : {}),
    ...(status === 'SETTLED' || status === 'CLOSED' ? { settledAmount: money(Math.round(amount * 0.8), currency) } : {}),
    priority: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
    assignedTo: uuid(900 + (index % 3)),
    createdAt: `2026-0${(index % 8) + 1}-14T10:00:00Z`,
    updatedAt: `2026-10-${String(10 + index).padStart(2, '0')}T14:30:00Z`,
  };
});

export const SYNTHETIC_ACTIVITY: ActivityEvent[] = Array.from({ length: 15 }, (_, index) => {
  const claim = SYNTHETIC_CLAIMS[index % SYNTHETIC_CLAIMS.length];
  return {
    id: uuid(1000 + index),
    type: index % 4 === 0 ? 'CLAIM_CREATED' : index % 4 === 1 ? 'CLAIM_STATUS_CHANGED' : index % 4 === 2 ? 'CLAIM_NOTE_ADDED' : 'POLICY_UPDATED',
    entity: index % 4 === 3
      ? { kind: 'POLICY', id: localPolicies[index % localPolicies.length].id, ref: localPolicies[index % localPolicies.length].policyNumber }
      : { kind: 'CLAIM', id: claim.id, ref: claim.claimNumber },
    summary: index % 4 === 3 ? 'Local policy compliance details updated' : `${claim.claimNumber} activity recorded in the governed lifecycle`,
    actorRole: index % 3 === 0 ? 'MANAGER' : index % 3 === 1 ? 'UNDERWRITER' : 'ADJUSTER',
    actorName: ['Elena Fischer', 'Marc Dubois', 'Katarzyna Nowak'][index % 3],
    countryId: claim.countryId,
    createdAt: `2026-10-${String(19 - Math.floor(index / 2)).padStart(2, '0')}T${String(18 - (index % 8)).padStart(2, '0')}:00:00Z`,
  };
});
