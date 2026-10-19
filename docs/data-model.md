# GlobalRisk 360 — Data Model

> TypeScript domain interfaces. These are the contract shared by the Angular
> front-end (`core/models/*`) and mirrored by the FastAPI Pydantic models.
> All IDs are string UUIDs. All money is stored as integer **minor units**
> (cents) plus an ISO-4217 currency code to avoid float drift. All timestamps
> are ISO-8601 UTC strings (`2026-10-19T12:00:00Z`).

Conventions:
- `readonly` omitted here for brevity; models are treated as immutable in the UI
  (replace, don't mutate).
- Enums are modeled as **string union types** (`as const`) for ergonomic
  serialization, with companion `const` arrays for iteration.

---

## 1. Common / primitives

```ts
export type Uuid = string;
export type IsoDateTime = string; // ISO-8601 UTC
export type IsoDate = string;     // YYYY-MM-DD
export type CurrencyCode = 'EUR' | 'USD' | 'PLN' | 'GBP';

/** Money as integer minor units + currency. 1050 EUR cents = €10.50 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;      // 1-based
  pageSize: number;
}

export interface Named { id: Uuid; name: string; }
```

---

## 2. Geography

```ts
export const REGIONS = ['EMEA', 'AMERICAS', 'APAC'] as const;
export type Region = (typeof REGIONS)[number];

export interface Country {
  id: Uuid;
  /** ISO-3166 alpha-2, e.g. 'DE', 'FR', 'PL', 'US' */
  code: string;
  name: string;            // 'Germany'
  region: Region;
  currency: CurrencyCode;
  /** Local regulatory regime requires an admitted local policy. */
  requiresLocalPolicy: boolean;
  /** Flag emoji or asset key for UI. */
  flag?: string;
}
```

Seed set (Phase 2): Germany `DE`/EUR/EMEA, France `FR`/EUR/EMEA,
Poland `PL`/PLN/EMEA, United States `US`/USD/AMERICAS.

---

## 3. Insured & Risk

```ts
export interface Insured {
  id: Uuid;
  legalName: string;
  countryId: Uuid;         // domicile
  industry: string;        // e.g. 'Manufacturing'
  headcount?: number;
}

export const RISK_CATEGORIES = [
  'PROPERTY', 'LIABILITY', 'MARINE', 'CYBER', 'DIRECTORS_OFFICERS', 'MOTOR_FLEET',
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export interface Risk {
  id: Uuid;
  category: RiskCategory;
  description: string;
  insuredValue: Money;     // TIV / exposure
  countryId: Uuid;
  location?: string;
}
```

---

## 4. Coverage

```ts
export interface Coverage {
  id: Uuid;
  category: RiskCategory;
  limit: Money;            // policy limit
  deductible: Money;
  premium: Money;          // annual
  /** Where this coverage sits in the program tower, optional. */
  attachmentPoint?: Money;
}
```

---

## 5. Policy (Master / Local)

A **MasterPolicy** is the global program. **LocalPolicy** entities implement it
in a country. Both share a base.

```ts
export const POLICY_STATUSES = ['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export const POLICY_LINES = [
  'PROPERTY', 'CASUALTY', 'MARINE', 'CYBER', 'FINANCIAL_LINES', 'MOTOR',
] as const;
export type PolicyLine = (typeof POLICY_LINES)[number];

interface PolicyBase {
  id: Uuid;
  policyNumber: string;        // human reference, e.g. 'MP-2026-0001'
  line: PolicyLine;
  status: PolicyStatus;
  insuredId: Uuid;
  inceptionDate: IsoDate;
  expiryDate: IsoDate;
  coverages: Coverage[];
  totalPremium: Money;         // sum of coverage premiums (derived server-side)
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface MasterPolicy extends PolicyBase {
  kind: 'MASTER';
  programName: string;         // 'Global Property Program 2026'
  /** Country where the master is issued (HQ). */
  issuingCountryId: Uuid;
  localPolicyIds: Uuid[];
}

export interface LocalPolicy extends PolicyBase {
  kind: 'LOCAL';
  masterPolicyId: Uuid;
  countryId: Uuid;             // country this local policy covers
  admitted: boolean;           // locally admitted / compliant
  localCurrency: CurrencyCode;
}

export type Policy = MasterPolicy | LocalPolicy;

/** Narrowing helpers */
export const isMaster = (p: Policy): p is MasterPolicy => p.kind === 'MASTER';
export const isLocal  = (p: Policy): p is LocalPolicy  => p.kind === 'LOCAL';
```

---

## 6. Claim + state machine

### 6.1 Status & actions

```ts
export const CLAIM_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED',
  'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED', 'REOPENED',
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_ACTIONS = [
  'SUBMIT', 'START_REVIEW', 'REQUEST_INFO', 'RESUBMIT',
  'APPROVE', 'REJECT', 'SETTLE', 'CLOSE', 'REOPEN',
] as const;
export type ClaimAction = (typeof CLAIM_ACTIONS)[number];
```

### 6.2 Transition table (authoritative)

`ClaimStateMachine` (`core/claims/claim-state-machine.ts`) is the single source of
truth; the backend mirrors it. A transition is allowed only if the `(from, action)`
pair appears below **and** the role is permitted.

| From | Action | To | Allowed roles |
|---|---|---|---|
| `DRAFT` | `SUBMIT` | `SUBMITTED` | ADJUSTER, UNDERWRITER, MANAGER |
| `SUBMITTED` | `START_REVIEW` | `UNDER_REVIEW` | UNDERWRITER, MANAGER |
| `UNDER_REVIEW` | `REQUEST_INFO` | `INFO_REQUESTED` | UNDERWRITER, MANAGER |
| `UNDER_REVIEW` | `APPROVE` | `APPROVED` | UNDERWRITER, MANAGER |
| `UNDER_REVIEW` | `REJECT` | `REJECTED` | UNDERWRITER, MANAGER |
| `INFO_REQUESTED` | `RESUBMIT` | `UNDER_REVIEW` | ADJUSTER, MANAGER |
| `APPROVED` | `SETTLE` | `SETTLED` | UNDERWRITER, MANAGER |
| `REJECTED` | `CLOSE` | `CLOSED` | MANAGER |
| `SETTLED` | `CLOSE` | `CLOSED` | MANAGER |
| `CLOSED` | `REOPEN` | `REOPENED` | MANAGER |
| `REOPENED` | `START_REVIEW` | `UNDER_REVIEW` | UNDERWRITER, MANAGER |

Terminal state: `CLOSED` (reopenable by MANAGER only). Every transition appends an
`ActivityEvent` and may carry a `ReviewNote`.

```ts
export interface ClaimTransition {
  from: ClaimStatus;
  action: ClaimAction;
  to: ClaimStatus;
  roles: Role[];
}
```

### 6.3 Claim entity

```ts
export interface ClaimLineItem {
  id: Uuid;
  riskCategory: RiskCategory;
  description: string;
  claimedAmount: Money;
  approvedAmount?: Money;
}

export interface Claim {
  id: Uuid;
  claimNumber: string;          // 'CLM-2026-0007'
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
  claimedTotal: Money;          // derived from line items
  reserveAmount?: Money;        // set during review
  settledAmount?: Money;        // set on SETTLE

  assignedTo?: Uuid;            // adjuster/underwriter user id
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
```

---

## 7. Activity & review

```ts
export const ACTIVITY_TYPES = [
  'CLAIM_CREATED', 'CLAIM_STATUS_CHANGED', 'CLAIM_NOTE_ADDED',
  'POLICY_CREATED', 'POLICY_UPDATED', 'INFO_REQUESTED', 'SYSTEM',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityEvent {
  id: Uuid;
  type: ActivityType;
  /** Entity the event is about. */
  entity: { kind: 'CLAIM' | 'POLICY'; id: Uuid; ref: string }; // ref = claimNumber/policyNumber
  summary: string;              // 'Claim CLM-2026-0007 moved SUBMITTED → UNDER_REVIEW'
  actorRole: Role;
  actorName?: string;
  countryId?: Uuid;
  /** Structured delta for status changes. */
  meta?: { fromStatus?: ClaimStatus; toStatus?: ClaimStatus; action?: ClaimAction };
  createdAt: IsoDateTime;
}

export interface ReviewNote {
  id: Uuid;
  claimId: Uuid;
  authorRole: Role;
  authorName?: string;
  body: string;
  /** If this note accompanied a transition. */
  action?: ClaimAction;
  createdAt: IsoDateTime;
}
```

---

## 8. Dashboard & filtering

```ts
export interface Role {} // placeholder; see below
```
```ts
export const ROLES = ['VIEWER', 'ADJUSTER', 'UNDERWRITER', 'MANAGER'] as const;
export type Role = (typeof ROLES)[number];

export type Period = 'MTD' | 'QTD' | 'YTD' | 'LAST_12M' | 'ALL';

export interface FilterState {
  countryId: Uuid | 'ALL';
  line: PolicyLine | 'ALL';
  period: Period;
  /** Free-text search applied within list screens. */
  query: string;
}

export const DEFAULT_FILTER: FilterState = {
  countryId: 'ALL', line: 'ALL', period: 'YTD', query: '',
};

export interface StatTile {
  key: string;                  // 'active-policies'
  label: string;                // 'Active Policies'
  value: number | Money;
  /** Percentage change vs. previous period, optional. */
  deltaPct?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface SeriesPoint { label: string; value: number; }

export interface DashboardStats {
  tiles: StatTile[];
  /** Premium by country (bar). */
  premiumByCountry: SeriesPoint[];
  /** Claims by status (donut). */
  claimsByStatus: SeriesPoint[];
  /** Exposure / TIV by risk category (bar). */
  exposureByCategory: SeriesPoint[];
  /** Claims volume over time (line). */
  claimsOverTime: SeriesPoint[];
  generatedAt: IsoDateTime;
}
```

> Note: `Role` is defined once (the `const ROLES` block). The placeholder line
> above is illustrative ordering only — in code, `common.model.ts` declares
> `Role` before it is referenced by `ActivityEvent`/`ReviewNote`. Keep the real
> declaration order: primitives → geography → roles → entities → dashboard.

---

## 9. File mapping (`core/models/`)

| File | Exports |
|---|---|
| `common.model.ts` | `Uuid`, `Money`, `Paginated`, `Role`/`ROLES`, `CurrencyCode`, `Period` |
| `country.model.ts` | `Country`, `Region`/`REGIONS` |
| `insured.model.ts` | `Insured`, `Risk`/`RISK_CATEGORIES` |
| `policy.model.ts` | `Coverage`, `Policy`, `MasterPolicy`, `LocalPolicy`, statuses, lines, guards |
| `claim.model.ts` | `Claim`, `ClaimLineItem`, statuses, actions, `ClaimTransition` |
| `activity.model.ts` | `ActivityEvent`, `ReviewNote`, `ACTIVITY_TYPES` |
| `dashboard.model.ts` | `DashboardStats`, `StatTile`, `SeriesPoint`, `FilterState`, `DEFAULT_FILTER` |

All derived totals (`totalPremium`, `claimedTotal`, `DashboardStats`) are computed
server-side and treated as read-only by the client; the client may recompute for
demo mode but never persists its own version.
