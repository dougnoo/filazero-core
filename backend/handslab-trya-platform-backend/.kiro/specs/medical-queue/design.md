# Design Document

## Overview

The medical queue feature extends the medical-approval-requests module to provide doctors with a comprehensive interface for reviewing and approving patient consultation requests. This design builds upon the webhook-integration spec, which created the database schema and entities for storing medical approval requests.

The feature implements six REST API endpoints that enable doctors to list, view, assign, and approve medical consultation requests, as well as retrieve beneficiary details and file download URLs from the external trya-backend system. All endpoints are protected by JWT authentication and restricted to users with the DOCTOR role.

## Architecture

### Module Extension

The feature extends the existing `medical-approval-requests` module:

```
src/modules/medical-approval-requests/
├── domain/
│   ├── entities/ (existing)
│   ├── enums/ (existing)
│   ├── errors/
│   │   ├── session-already-exists.error.ts (existing)
│   │   ├── medical-approval-request-not-found.error.ts (existing)
│   │   ├── invalid-status-transition.error.ts (new)
│   │   └── unauthorized-approval.error.ts (new)
│   └── repositories/
│       ├── medical-approval-request.repository.interface.ts (extend)
│       └── medical-approval-request.repository.token.ts (existing)
├── application/
│   ├── use-cases/
│   │   ├── create-medical-approval-request/ (existing)
│   │   ├── list-medical-approval-requests/ (new)
│   │   ├── get-medical-approval-request/ (new)
│   │   ├── assign-medical-approval-request/ (new)
│   │   ├── approve-medical-approval-request/ (new)
│   │   ├── get-attachment-download-url/ (new)
│   │   └── get-beneficiary-details/ (new)
│   └── services/
│       └── trya-backend-integration.service.ts (new)
├── infrastructure/
│   ├── entities/ (existing)
│   ├── mappers/ (existing)
│   ├── repositories/
│   │   └── typeorm-medical-approval-request.repository.ts (extend)
│   └── http/
│       └── trya-backend.client.ts (new)
└── presentation/
    └── controllers/
        └── medical-approval-requests.controller.ts (extend with doctor endpoints)
```

### Layer Responsibilities

**Domain Layer:**
- Add new domain errors for status transitions and authorization
- Extend repository interface with query methods

**Application Layer:**
- Implement six new use cases for doctor operations
- Create service for trya-backend integration
- Define DTOs for filtering, pagination, and approval

**Infrastructure Layer:**
- Extend TypeORM repository with query methods
- Implement HTTP client for trya-backend API calls

**Presentation Layer:**
- Extend existing controller with doctor-facing endpoints
- Apply JWT authentication and role guards to new endpoints
- Add Swagger documentation for new endpoints

## Components and Interfaces

### Extended Repository Interface

```typescript
export interface IMedicalApprovalRequestRepository {
  // Existing methods
  findBySessionId(sessionId: string): Promise<MedicalApprovalRequest | null>;
  create(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
  save(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
  
  // New methods for medical queue
  findById(id: string): Promise<MedicalApprovalRequest | null>;
  findAll(filters: ListFilters, pagination: Pagination): Promise<{
    items: MedicalApprovalRequest[];
    total: number;
  }>;
}

export interface ListFilters {
  status?: ApprovalStatus;
  urgencyLevel?: UrgencyLevel;
  dateFrom?: Date;
  dateTo?: Date;
  patientName?: string;
}

export interface Pagination {
  limit: number;
  offset: number;
}
```

### New Domain Errors

```typescript
export class InvalidStatusTransitionError extends Error {
  constructor(currentStatus: string, attemptedStatus: string) {
    super(`Cannot transition from ${currentStatus} to ${attemptedStatus}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class UnauthorizedApprovalError extends Error {
  constructor(doctorId: string, assignedDoctorId: string) {
    super(`Doctor ${doctorId} is not authorized to approve this request (assigned to ${assignedDoctorId})`);
    this.name = 'UnauthorizedApprovalError';
  }
}
```

### DTOs

#### ListMedicalApprovalRequestsDto

```typescript
export class ListMedicalApprovalRequestsDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency_level?: UrgencyLevel;

  @IsOptional()
  @IsISO8601()
  date_from?: string;

  @IsOptional()
  @IsISO8601()
  date_to?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  patient_name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
```

#### ListMedicalApprovalRequestsResponseDto

```typescript
export class MedicalApprovalRequestListItemDto {
  id: string;
  patient_name: string;
  urgency_level: string;
  chief_complaint: string;
  status: string;
  created_at: string;
  assigned_doctor?: {
    id: string;
    name: string;
  };
}

export class ListMedicalApprovalRequestsResponseDto {
  items: MedicalApprovalRequestListItemDto[];
  total: number;
  limit: number;
  offset: number;
}
```

#### GetMedicalApprovalRequestResponseDto

```typescript
export class GetMedicalApprovalRequestResponseDto {
  id: string;
  session_id: string;
  user_id: string;
  tenant_id: string;
  patient_name: string;
  status: string;
  urgency_level: string;
  chief_complaint: string;
  conversation_summary: string;
  care_recommendation: string;
  symptoms: Symptom[];
  suggestedExams: SuggestedExam[];
  careInstructions: CareInstruction[];
  doctor_notes?: string;
  image_analyses: ImageAnalysisDto[];
  attachments: AttachmentDto[];
  assigned_doctor?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}
```

#### ApproveMedicalApprovalRequestDto

```typescript
export class ApproveMedicalApprovalRequestDto {
  @IsEnum(['APPROVED', 'ADJUSTED'])
  status: 'APPROVED' | 'ADJUSTED';

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  doctor_notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doctor_suggested_exams?: string[]; // Will be converted to SuggestedExam entities with suggestedBy='DOCTOR'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doctor_care_instructions?: string[]; // Will be converted to CareInstruction entities with providedBy='DOCTOR'
}
```

#### GetAttachmentDownloadUrlResponseDto

```typescript
export class GetAttachmentDownloadUrlResponseDto {
  url: string;
  expires_at: string;
}
```

#### GetBeneficiaryDetailsResponseDto

```typescript
export class GetBeneficiaryDetailsResponseDto {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  health_plan?: {
    provider: string;
    plan_number: string;
  };
  chronic_conditions?: string[];
  medications?: string[];
  allergies?: string[];
}
```

### Trya Backend Integration Service

```typescript
export interface ITryaBackendIntegrationService {
  getBeneficiaryDetails(userId: string): Promise<any>;
  getFileDownloadUrl(userId: string, s3Key: string): Promise<{ url: string; expiresAt: Date }>;
}

@Injectable()
export class TryaBackendIntegrationService implements ITryaBackendIntegrationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getBeneficiaryDetails(userId: string): Promise<any> {
    const baseUrl = this.configService.get<string>('TRYA_BACKEND_URL');
    const apiKey = this.configService.get<string>('TRYA_BACKEND_API_KEY');
    
    const response = await this.httpService.axiosRef.get(
      `${baseUrl}/platform/beneficiaries/${userId}`,
      {
        headers: { 'x-api-key': apiKey },
      },
    );
    
    return response.data;
  }

  async getFileDownloadUrl(userId: string, s3Key: string): Promise<{ url: string; expiresAt: Date }> {
    const baseUrl = this.configService.get<string>('TRYA_BACKEND_URL');
    const apiKey = this.configService.get<string>('TRYA_BACKEND_API_KEY');
    
    const response = await this.httpService.axiosRef.get(
      `${baseUrl}/platform/beneficiaries/${userId}/files/${s3Key}`,
      {
        headers: { 'x-api-key': apiKey },
      },
    );
    
    return {
      url: response.data.url,
      expiresAt: new Date(response.data.expires_at),
    };
  }
}
```

## Data Models

The feature uses the existing database schema from webhook-integration. No new tables are required.

### Query Patterns

#### List Query with Filters

```sql
SELECT 
  mar.id,
  mar.patient_name,
  mar.urgency_level,
  mar.chief_complaint,
  mar.status,
  mar.created_at,
  u.id as doctor_id,
  u.name as doctor_name
FROM medical_approval_requests mar
LEFT JOIN users u ON mar.assigned_doctor_id = u.id
WHERE 
  (mar.status = $1 OR $1 IS NULL)
  AND (mar.urgency_level = $2 OR $2 IS NULL)
  AND (mar.created_at >= $3 OR $3 IS NULL)
  AND (mar.created_at <= $4 OR $4 IS NULL)
  AND (LOWER(mar.patient_name) LIKE LOWER($5) OR $5 IS NULL)
ORDER BY 
  CASE 
    WHEN mar.status = 'PENDENTE' THEN mar.created_at ASC
    ELSE mar.created_at DESC
  END
LIMIT $6 OFFSET $7;
```

#### Get Details Query

```sql
SELECT 
  mar.*,
  u.id as doctor_id,
  u.name as doctor_name
FROM medical_approval_requests mar
LEFT JOIN users u ON mar.assigned_doctor_id = u.id
WHERE mar.id = $1;

-- Fetch related image analyses
SELECT * FROM image_analyses WHERE medical_approval_request_id = $1;

-- Fetch related attachments
SELECT * FROM attachments WHERE medical_approval_request_id = $1;
```

## Error Handling

### HTTP Error Mapping

- `MedicalApprovalRequestNotFoundError` → 404 Not Found
- `InvalidStatusTransitionError` → 400 Bad Request
- `UnauthorizedApprovalError` → 403 Forbidden
- `ValidationError` (class-validator) → 400 Bad Request
- `UnauthorizedException` (JWT) → 401 Unauthorized
- Trya-backend API errors → 502 Bad Gateway or 500 Internal Server Error
- Database errors → 500 Internal Server Error

### Error Response Format

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```

## API Design

### Endpoints

#### 1. List Medical Approval Requests

**GET** `/medical-approval-requests`

**Authentication:** JWT (DOCTOR role)

**Query Parameters:**
- `status` (optional): Filter by approval status
- `urgency_level` (optional): Filter by urgency level
- `date_from` (optional): Filter by creation date (ISO 8601)
- `date_to` (optional): Filter by creation date (ISO 8601)
- `patient_name` (optional): Filter by patient name (case-insensitive partial match)
- `limit` (optional, default: 20, max: 100): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "patient_name": "João Silva",
      "urgency_level": "URGENT",
      "chief_complaint": "Febre alta e dor de cabeça",
      "status": "PENDING",
      "created_at": "2025-06-12T10:30:00.000Z",
      "assigned_doctor": null
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### 2. Get Medical Approval Request Details

**GET** `/medical-approval-requests/:id`

**Authentication:** JWT (DOCTOR role)

**Response (200):**
```json
{
  "id": "uuid",
  "session_id": "session_123",
  "user_id": "user_456",
  "tenant_id": "tenant_789",
  "patient_name": "João Silva",
  "status": "PENDING",
  "urgency_level": "URGENT",
  "chief_complaint": "Febre alta e dor de cabeça",
  "conversation_summary": "...",
  "care_recommendation": "...",
  "symptoms": [
    { "id": "uuid", "description": "febre", "is_main": false },
    { "id": "uuid", "description": "dor de cabeça", "is_main": false },
    { "id": "uuid", "description": "febre alta", "is_main": true }
  ],
  "suggested_exams": [
    { "id": "uuid", "exam_name": "Hemograma", "suggested_by": "AI" },
    { "id": "uuid", "exam_name": "Dengue", "suggested_by": "AI" }
  ],
  "care_instructions": [
    { "id": "uuid", "instruction": "Repouso", "provided_by": "AI" },
    { "id": "uuid", "instruction": "Hidratação", "provided_by": "AI" }
  ],
  "doctor_notes": null,
  "image_analyses": [],
  "attachments": [],
  "assigned_doctor": null,
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

#### 3. Assign Medical Approval Request

**POST** `/medical-approval-requests/:id/assign`

**Authentication:** JWT (DOCTOR role)

**Response (200):**
```json
{
  "id": "uuid",
  "status": "IN_REVIEW",
  "assigned_doctor": {
    "id": "doctor_uuid",
    "name": "Dr. Maria Santos"
  }
}
```

#### 4. Approve Medical Approval Request

**POST** `/medical-approval-requests/:id/approve`

**Authentication:** JWT (DOCTOR role)

**Request Body:**
```json
{
  "status": "ADJUSTED",
  "doctor_notes": "Adicionei mais exames por precaução",
  "doctor_suggested_exams": ["Chikungunya", "Plaquetas"],
  "doctor_care_instructions": ["Evitar AAS", "Retornar se sangramento"]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "ADJUSTED",
  "doctor_notes": "Adicionei mais exames por precaução",
  "suggested_exams": [
    { "id": "uuid", "exam_name": "Hemograma", "suggested_by": "AI" },
    { "id": "uuid", "exam_name": "Dengue", "suggested_by": "AI" },
    { "id": "uuid", "exam_name": "Chikungunya", "suggested_by": "DOCTOR" },
    { "id": "uuid", "exam_name": "Plaquetas", "suggested_by": "DOCTOR" }
  ],
  "care_instructions": [
    { "id": "uuid", "instruction": "Repouso", "provided_by": "AI" },
    { "id": "uuid", "instruction": "Hidratação", "provided_by": "AI" },
    { "id": "uuid", "instruction": "Evitar AAS", "provided_by": "DOCTOR" },
    { "id": "uuid", "instruction": "Retornar se sangramento", "provided_by": "DOCTOR" }
  ],
  "updated_at": "2025-06-12T11:00:00.000Z"
}
```

#### 5. Get Attachment Download URL

**GET** `/medical-approval-requests/:id/attachments/:attachmentId/download-url`

**Authentication:** JWT (DOCTOR role)

**Response (200):**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "expires_at": "2025-06-12T12:00:00.000Z"
}
```

#### 6. Get Beneficiary Details

**GET** `/medical-approval-requests/:id/beneficiary-details`

**Authentication:** JWT (DOCTOR role)

**Response (200):**
```json
{
  "user_id": "user_456",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+5511999999999",
  "birth_date": "1985-03-15",
  "health_plan": {
    "provider": "Unimed",
    "plan_number": "123456789"
  },
  "chronic_conditions": ["Hipertensão"],
  "medications": ["Losartana 50mg"],
  "allergies": ["Penicilina"]
}
```

## Business Logic

### Status Workflow

```
PENDING → IN_REVIEW → APPROVED
                    → ADJUSTED
```

**Rules:**
1. Only PENDING requests can be assigned
2. Assignment changes status to IN_REVIEW
3. Only IN_REVIEW requests can be approved
4. Approval changes status to APPROVED or ADJUSTED
5. No backward transitions allowed
6. assigned_doctor_id cannot be changed after assignment

### Data Structure Notes

**Symptoms, Exams, and Instructions:**
- Stored in relational tables (not JSON arrays)
- Each item has its own ID, timestamp, and source tracking
- Symptoms have an `is_main` flag to distinguish main symptoms
- Exams have `suggested_by` field ('AI' or 'DOCTOR')
- Instructions have `provided_by` field ('AI' or 'DOCTOR')
- When doctors add exams/instructions, new records are created with source='DOCTOR'
- AI-generated items remain immutable

### Authorization Rules

1. Any authenticated doctor can list requests
2. Any authenticated doctor can view request details
3. Any authenticated doctor can assign a PENDING request to themselves
4. Only the assigned doctor can approve their assigned request

### Ordering Logic

```typescript
function getOrderDirection(status?: ApprovalStatus): 'ASC' | 'DESC' {
  return status === ApprovalStatus.PENDING ? 'ASC' : 'DESC';
}
```

## Testing Strategy

### Unit Tests

#### Use Case Tests
- List: Test filtering, pagination, ordering logic
- Get: Test retrieval with relations
- Assign: Test status transition, doctor assignment
- Approve: Test authorization, status transition, data persistence
- Get Download URL: Test trya-backend integration
- Get Beneficiary: Test trya-backend integration

#### Service Tests
- TryaBackendIntegrationService: Mock HTTP calls, test error handling

### Integration Tests

#### Controller Tests (E2E)
- Test all endpoints with valid JWT tokens
- Test endpoints without authentication return 401
- Test endpoints with non-DOCTOR role return 403
- Test list endpoint with various filter combinations
- Test assign endpoint with PENDING and non-PENDING requests
- Test approve endpoint with authorized and unauthorized doctors
- Test approve endpoint with invalid status transitions
- Test trya-backend integration endpoints with mocked external API

## Configuration

### Environment Variables

```env
# Existing
TRYA_PLATFORM_API_KEY=your-secure-api-key-here

# New
TRYA_BACKEND_URL=http://localhost:3000
TRYA_BACKEND_API_KEY=your-trya-backend-api-key
```

## Dependencies

### New External Dependencies
- `@nestjs/axios` - HTTP client for trya-backend integration
- `axios` - HTTP library (peer dependency)

### Internal Dependencies
- Existing auth module (JWT strategy, guards, decorators)
- Existing users module (UserEntity for doctor reference)
- Existing medical-approval-requests entities and repository

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Role-Based Access**: Endpoints restricted to DOCTOR role
3. **Authorization**: Doctors can only approve requests assigned to them
4. **API Key Security**: Trya-backend API key stored in environment variable
5. **Pre-signed URLs**: File access through time-limited pre-signed URLs
6. **Input Validation**: All inputs validated using class-validator
7. **SQL Injection**: Protected by TypeORM parameterized queries

## Performance Considerations

1. **Database Indexes**: Leverage existing indexes on status, urgency_level, created_at
2. **Pagination**: Limit maximum page size to 100 items
3. **Eager Loading**: Load related entities (doctor, image analyses, attachments) efficiently
4. **Conditional Ordering**: Use CASE statement for status-based ordering
5. **HTTP Timeouts**: Configure reasonable timeouts for trya-backend API calls
6. **Caching**: Consider caching beneficiary details if accessed frequently

## Future Enhancements

1. **Real-time Updates**: WebSocket notifications for queue changes
2. **Bulk Operations**: Assign or approve multiple requests at once
3. **Advanced Filtering**: Search by patient name, symptoms, etc.
4. **Analytics Dashboard**: Queue metrics and doctor performance
5. **Audit Trail**: Comprehensive logging of all doctor actions
6. **File Preview**: Generate thumbnails for image attachments
7. **Priority Queue**: Automatic prioritization based on urgency and wait time
