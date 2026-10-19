# GlobalRisk 360 — REST API Contracts

> Contract between the Angular client (`core/api/*`) and the **FastAPI** backend
> (Phase 5). Mirrors `data-model.md`. The client codes to this contract; the
> demo-mode `InMemoryDataService` honors the same shapes so screens behave
> identically with or without a live server.

---

## 1. Conventions

- **Base path**: `/api/v1`. Client prefixes with `API_BASE_URL` (env/config).
- **Format**: JSON, UTF-8. `Content-Type: application/json`.
- **IDs**: UUID strings. **Money**: `{ amountMinor, currency }`. **Timestamps**:
  ISO-8601 UTC.
- **Casing**: `camelCase` on the wire (FastAPI configured with camelCase aliases).
- **Auth**: `Authorization: Bearer <token>` (demo accepts any; role via
  `X-Role` header for the demo role switch). Not security-critical in Phase 1.
- **Idempotency**: `PUT` replaces; `PATCH`-style partials use `PUT` with full
  object in this version (kept simple). Claim transitions use a dedicated verb
  endpoint (§5.3) rather than status `PUT`.

### HTTP status usage

| Code | Meaning |
|---|---|
| 200 | OK (GET, PUT, action) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation / bad transition |
| 401 / 403 | Unauthenticated / role not permitted |
| 404 | Not found |
| 409 | Conflict (e.g. illegal state transition, version conflict) |
| 422 | FastAPI request-body validation error |
| 500 | Server error |

---

## 2. Error envelope

All non-2xx responses (except raw 422 from FastAPI validation, which the client
normalizes) use:

```jsonc
{
  "error": {
    "code": "CLAIM_INVALID_TRANSITION",   // stable machine code (SCREAMING_SNAKE)
    "message": "Cannot APPROVE a claim in status SUBMITTED.",
    "details": { "from": "SUBMITTED", "action": "APPROVE" }, // optional, shape varies
    "traceId": "req_9f2c…"                 // for support correlation
  }
}
```

TypeScript:

```ts
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    traceId?: string;
  };
}
```

`httpErrorInterceptor` unwraps this, shows `message` via `ToastService`, and
rethrows a typed `ApiError`.

---

## 3. Pagination, sorting, filtering

List endpoints accept query params:

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int ≥ 1 | 1 | 1-based |
| `pageSize` | int 1–100 | 20 | |
| `sort` | string | resource default | `field` or `-field` (desc). e.g. `-updatedAt` |
| `q` | string | — | free-text search |
| `countryId` | uuid | — | filter |
| `line` | enum | — | policies/claims |
| `status` | enum | — | policies/claims |
| `period` | enum | — | `MTD\|QTD\|YTD\|LAST_12M\|ALL` |

Response is always the `Paginated<T>` envelope:

```jsonc
{ "items": [ /* T */ ], "total": 137, "page": 1, "pageSize": 20 }
```

---

## 4. Policies

### 4.1 List
`GET /api/v1/policies` → `200 Paginated<Policy>`
Query: `page,pageSize,sort,q,countryId,line,status,kind` (`kind=MASTER|LOCAL`).
Default sort `-updatedAt`.

### 4.2 Get one
`GET /api/v1/policies/{id}` → `200 Policy` | `404`.
For a master, `localPolicyIds` is populated; `?expand=locals` inlines the local
policies as `locals: LocalPolicy[]`.

### 4.3 Create
`POST /api/v1/policies` body `CreatePolicyRequest` → `201 Policy`.

```ts
export type CreatePolicyRequest =
  | (Omit<MasterPolicy, 'id'|'createdAt'|'updatedAt'|'totalPremium'|'localPolicyIds'>)
  | (Omit<LocalPolicy,  'id'|'createdAt'|'updatedAt'|'totalPremium'>);
```

### 4.4 Update
`PUT /api/v1/policies/{id}` body full `Policy` (minus server-managed fields) →
`200 Policy` | `404` | `409` (status rule, e.g. cannot edit `CANCELLED`).

### 4.5 Delete
`DELETE /api/v1/policies/{id}` → `204` | `404` | `409` (has claims).
Only `DRAFT` policies are hard-deletable; others are `CANCELLED` via update.

---

## 5. Claims

### 5.1 List
`GET /api/v1/claims` → `200 Paginated<Claim>`
Query: `page,pageSize,sort,q,countryId,status,priority,policyId`.
Default sort `-reportedDate`.

### 5.2 Get one
`GET /api/v1/claims/{id}` → `200 Claim` | `404`.
`?expand=notes,activity` inlines `notes: ReviewNote[]` and
`activity: ActivityEvent[]`.

### 5.3 Create
`POST /api/v1/claims` body `CreateClaimRequest` → `201 Claim` (status `DRAFT`).

```ts
export interface CreateClaimRequest {
  localPolicyId: Uuid;
  title: string;
  description: string;
  lossDate: IsoDate;
  reportedDate: IsoDate;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  lineItems: Array<Omit<ClaimLineItem, 'id' | 'approvedAmount'>>;
}
```
Server derives `claimNumber`, `masterPolicyId`, `countryId`, `insuredId`,
`claimedTotal`, timestamps.

### 5.4 Update draft
`PUT /api/v1/claims/{id}` → `200 Claim` | `409` if not in `DRAFT`/`INFO_REQUESTED`.
Allows editing title/description/lineItems/priority only.

### 5.5 Transition (state machine)
`POST /api/v1/claims/{id}/transition` body `TransitionRequest` →
`200 Claim` | `409 CLAIM_INVALID_TRANSITION` | `403 ROLE_NOT_PERMITTED`.

```ts
export interface TransitionRequest {
  action: ClaimAction;
  note?: string;              // becomes a ReviewNote
  reserveAmount?: Money;      // on START_REVIEW/APPROVE
  settledAmount?: Money;      // required on SETTLE
  approvedAmounts?: Array<{ lineItemId: Uuid; approvedAmount: Money }>; // on APPROVE
}
```
Backend validates `(status, action, role)` against the same transition table in
`data-model.md` §6.2, applies amounts, appends an `ActivityEvent` and a
`ReviewNote` if `note` present, returns the updated claim.

### 5.6 Notes
`GET  /api/v1/claims/{id}/notes` → `200 ReviewNote[]`
`POST /api/v1/claims/{id}/notes` body `{ body: string }` → `201 ReviewNote`
(also appends a `CLAIM_NOTE_ADDED` activity event).

### 5.7 Delete
`DELETE /api/v1/claims/{id}` → `204` only when `DRAFT`; else `409`.

---

## 6. Activity

`GET /api/v1/activity` → `200 Paginated<ActivityEvent>`
Query: `page,pageSize,countryId,type,entityId,sort` (default `-createdAt`).
Read-only feed; events are produced as side effects of policy/claim changes.

---

## 7. Dashboard

`GET /api/v1/dashboard/stats` → `200 DashboardStats`
Query: `countryId,line,period` (the global `FilterState`, minus `query`).
Server computes tiles + series for the requested slice.

Suggested tiles (`StatTile[]`): Active Policies, Total Premium (Money),
Open Claims, Claims Approved Rate, Total Exposure (Money).

---

## 8. Reference data

`GET /api/v1/countries`  → `200 Country[]`
`GET /api/v1/insureds`   → `200 Paginated<Insured>` (or full list in demo)
These are small and may be cached by the client for the session.

---

## 9. Health / meta

`GET /api/v1/health` → `200 { status: 'ok', demoMode: boolean, version: string }`
Client uses `demoMode` only for display; the actual demo/live decision is a build
config, not a server round-trip.

---

## 10. Endpoint summary

| Method | Path | Returns |
|---|---|---|
| GET | `/policies` | `Paginated<Policy>` |
| GET | `/policies/{id}` | `Policy` |
| POST | `/policies` | `Policy` (201) |
| PUT | `/policies/{id}` | `Policy` |
| DELETE | `/policies/{id}` | — (204) |
| GET | `/claims` | `Paginated<Claim>` |
| GET | `/claims/{id}` | `Claim` |
| POST | `/claims` | `Claim` (201) |
| PUT | `/claims/{id}` | `Claim` |
| POST | `/claims/{id}/transition` | `Claim` |
| GET | `/claims/{id}/notes` | `ReviewNote[]` |
| POST | `/claims/{id}/notes` | `ReviewNote` (201) |
| DELETE | `/claims/{id}` | — (204) |
| GET | `/activity` | `Paginated<ActivityEvent>` |
| GET | `/dashboard/stats` | `DashboardStats` |
| GET | `/countries` | `Country[]` |
| GET | `/insureds` | `Paginated<Insured>` |
| GET | `/health` | meta |

All `*Api` client services expose one method per row above, returning
`Observable<T>`.
