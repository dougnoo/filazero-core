# FilaZero — Backend Integration Guide (Phase 5)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│   (CaseDetailPage, ClinicalReview, Dashboard, Intake, etc.) │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  CaseStore  │  (state + mutations — untouched)
                    └──────┬──────┘
                           │
                ┌──────────▼──────────┐
                │  Service Adapters   │  ← THIS LAYER
                │  (ICaseService, etc)│
                └────┬───────────┬────┘
                     │           │
              ┌──────▼──┐  ┌────▼──────┐
              │  Mock    │  │  API      │
              │  Impl    │  │  Impl     │
              │ (current)│  │ (future)  │
              └─────────┘  └───────────┘
```

## Entity → Endpoint Mapping

| Frontend Entity   | Backend        | Endpoint                                    | Method |
|-------------------|----------------|---------------------------------------------|--------|
| Case (list)       | trya-backend   | `/api/cases`                                | GET    |
| Case (detail)     | trya-backend   | `/api/cases/:id`                            | GET    |
| Case (counts)     | trya-backend   | `/api/cases/counts`                         | GET    |
| Intake (chat)     | chat-backend   | `/api/clinical-chat`                        | POST   |
| Intake (result)   | chat-backend   | `/api/clinical-result`                      | POST   |
| Journey (list)    | trya-backend   | `/api/citizens/:citizenId/journeys`         | GET    |
| Journey (detail)  | trya-backend   | `/api/journeys/:journeyId`                  | GET    |
| Intake (read)     | trya-backend   | `/api/intakes/:intakeId`                    | GET    |
| ClinicalPackage   | trya-backend   | `/api/professional/clinical-packages`       | GET    |
| Validation        | trya-backend   | `/api/professional/validate`                | POST   |
| Dashboard (full)  | platform-bknd  | `/api/manager/dashboard`                    | GET    |
| Dashboard (KPIs)  | platform-bknd  | `/api/manager/dashboard/kpis`               | GET    |
| Bottlenecks       | platform-bknd  | `/api/manager/dashboard/bottlenecks`        | GET    |
| Weekly Trend      | platform-bknd  | `/api/manager/dashboard/weekly-trend`       | GET    |
| Auth (CPF)        | Cognito        | Custom Auth Challenge                       | SDK    |
| Auth (email)      | Cognito        | USER_PASSWORD_AUTH                          | SDK    |

## How to Activate a Real Service

### Step 1: Environment Variables
```env
VITE_DEMO_MODE=false
VITE_ENABLE_REAL_TRYA=true
VITE_TRYA_BACKEND_URL=https://api.filazero.com/v1
```

### Step 2: Implement API Adapter
Create a class in `src/services/adapters/api/` that implements the interface:

```typescript
// src/services/adapters/api/case-service.api.ts
import { tryaApi } from '@/lib/api-client';
import type { ICaseService } from '../types';

export class ApiCaseService implements ICaseService {
  async getCases(filters) {
    const { data } = await tryaApi.get('/api/cases', { params: filters });
    return data;
  }
  // ...
}
```

### Step 3: Update Factory
```typescript
// In factory.ts
import { ApiCaseService } from './api/case-service.api';

export function createCaseService(): ICaseService {
  if (!isTryaMockMode()) {
    return new ApiCaseService();
  }
  return new MockCaseService();
}
```

### Step 4: Wire to Components
Replace direct service imports with adapter factory calls.

## Mixed Mode Support

The system supports running some services in mock mode and others against real backends:

```env
VITE_DEMO_MODE=false
VITE_ENABLE_REAL_TRYA=true     # Cases, Journeys, Clinical Review → real
VITE_ENABLE_REAL_PLATFORM=false # Dashboard → still mock
VITE_ENABLE_REAL_CHAT=false     # Intake → still mock
VITE_ENABLE_REAL_AUTH=false     # Auth → still mock
```

## Required Backend Headers

All API requests include (via `api-client.ts`):
- `Authorization: Bearer <JWT>` — from auth service
- `X-Municipality-Id: <uuid>` — tenant scope
- `X-Unit-Id: <uuid>` — sub-tenant scope (optional)
- `Content-Type: application/json`

## CaseStore Integration Note

The CaseStore manages **local state and mutations** (demo mode).
When real backends are active, mutations should:
1. Call the API adapter (e.g., `PATCH /api/cases/:id/status`)
2. On success, update CaseStore optimistically or refetch
3. On failure, rollback CaseStore state

The CaseStore itself is NOT modified during integration — it becomes a
local cache layer that syncs with the backend.
