# Design Document

## Overview

The webhook integration feature implements a REST API endpoint that receives medical consultation data from the trya-backend system. The design follows Clean Architecture principles with clear separation between domain, application, infrastructure, and presentation layers. The system uses API key authentication, comprehensive payload validation, and transactional database operations to ensure data integrity.

The feature introduces a new module `medical-approval-requests` that manages the storage and retrieval of medical consultation data submitted by the external trya-backend system.

## Architecture

### Module Structure

```
src/modules/medical-approval-requests/
├── domain/
│   ├── entities/
│   │   ├── medical-approval-request.entity.ts
│   │   ├── image-analysis.entity.ts
│   │   └── attachment.entity.ts
│   ├── enums/
│   │   ├── approval-status.enum.ts
│   │   └── urgency-level.enum.ts
│   ├── errors/
│   │   ├── session-already-exists.error.ts
│   │   └── medical-approval-request-not-found.error.ts
│   └── repositories/
│       ├── medical-approval-request.repository.interface.ts
│       └── medical-approval-request.repository.token.ts
├── application/
│   └── use-cases/
│       └── create-medical-approval-request/
│           ├── create-medical-approval-request.use-case.ts
│           ├── create-medical-approval-request.dto.ts
│           └── create-medical-approval-request-response.dto.ts
├── infrastructure/
│   ├── entities/
│   │   ├── medical-approval-request.entity.ts
│   │   ├── image-analysis.entity.ts
│   │   └── attachment.entity.ts
│   ├── mappers/
│   │   ├── medical-approval-request.mapper.ts
│   │   ├── image-analysis.mapper.ts
│   │   └── attachment.mapper.ts
│   └── repositories/
│       └── typeorm-medical-approval-request.repository.ts
├── presentation/
│   └── controllers/
│       └── medical-approval-requests.controller.ts
└── medical-approval-requests.module.ts
```

### Layer Responsibilities

**Domain Layer:**
- Defines business entities (MedicalApprovalRequest, ImageAnalysis, Attachment)
- Defines enums for status and urgency levels
- Defines repository interfaces
- Defines domain-specific errors

**Application Layer:**
- Implements use case for creating medical approval requests
- Defines DTOs for input validation and response formatting
- Orchestrates business logic and repository operations

**Infrastructure Layer:**
- Implements TypeORM entities with database mappings
- Implements repository using TypeORM
- Implements mappers to convert between domain and infrastructure entities

**Presentation Layer:**
- Implements REST controller with POST endpoint
- Applies API key guard for authentication
- Handles HTTP request/response formatting

## Components and Interfaces

### Domain Entities

#### MedicalApprovalRequest (Domain Entity)

```typescript
export class MedicalApprovalRequest {
  id: string;
  sessionId: string;
  userId: string;
  tenantId: string;
  patientName: string;
  status: ApprovalStatus;
  assignedDoctorId?: string;
  urgencyLevel: UrgencyLevel;
  chiefComplaint: string;
  conversationSummary: string;
  careRecommendation: string;
  doctorNotes?: string;
  symptoms: Symptom[];
  suggestedExams: SuggestedExam[];
  careInstructions: CareInstruction[];
  imageAnalyses: ImageAnalysis[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### ImageAnalysis (Domain Entity)

```typescript
export class ImageAnalysis {
  id: string;
  medicalApprovalRequestId: string;
  timestamp: Date;
  numImages: number;
  context?: string;
  userResponse: string;
  detailedAnalysis: string;
  createdAt: Date;
}
```

#### Attachment (Domain Entity)

```typescript
export class Attachment {
  id: string;
  medicalApprovalRequestId: string;
  s3Key: string;
  originalName: string;
  fileType: string;
  createdAt: Date;
}
```

#### Symptom (Domain Entity)

```typescript
export class Symptom {
  id: string;
  medicalApprovalRequestId: string;
  description: string;
  isMain: boolean;
  createdAt: Date;
}
```

#### SuggestedExam (Domain Entity)

```typescript
export class SuggestedExam {
  id: string;
  medicalApprovalRequestId: string;
  examName: string;
  suggestedBy: ExamSuggestedBy; // 'AI' or 'DOCTOR'
  createdAt: Date;
}
```

#### CareInstruction (Domain Entity)

```typescript
export class CareInstruction {
  id: string;
  medicalApprovalRequestId: string;
  instruction: string;
  providedBy: InstructionProvidedBy; // 'AI' or 'DOCTOR'
  createdAt: Date;
}
```

### Enums

#### ApprovalStatus

```typescript
export enum ApprovalStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  ADJUSTED = 'ADJUSTED',
}
```

#### UrgencyLevel (Manchester Triage System)

```typescript
export enum UrgencyLevel {
  EMERGENCY = 'EMERGENCY',           // Red - Immediate
  VERY_URGENT = 'VERY_URGENT',       // Orange - 10 minutes
  URGENT = 'URGENT',                 // Yellow - 60 minutes
  STANDARD = 'STANDARD',             // Green - 120 minutes
  NON_URGENT = 'NON_URGENT',         // Blue - 240 minutes
}
```

#### ExamSuggestedBy

```typescript
export enum ExamSuggestedBy {
  AI = 'AI',
  DOCTOR = 'DOCTOR',
}
```

#### InstructionProvidedBy

```typescript
export enum InstructionProvidedBy {
  AI = 'AI',
  DOCTOR = 'DOCTOR',
}
```

### Repository Interface

```typescript
export interface IMedicalApprovalRequestRepository {
  findBySessionId(sessionId: string): Promise<MedicalApprovalRequest | null>;
  create(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
  save(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
}
```

### DTOs

#### CreateMedicalApprovalRequestDto

```typescript
export class CreateMedicalApprovalRequestDto {
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ValidateNested()
  @Type(() => PatientDataDto)
  patient_data: PatientDataDto;

  @IsString()
  @MinLength(2)
  patient_name: string; // Duplicated for convenience at root level

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  tenant_id: string;

  @IsISO8601()
  updated_at: string;
}

export class PatientDataDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  symptoms: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageAnalysisDto)
  @IsOptional()
  image_analyses?: ImageAnalysisDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ValidateNested()
  @Type(() => MedicalSummaryDto)
  medical_summary: MedicalSummaryDto;
}
```

#### CreateMedicalApprovalRequestResponseDto

```typescript
export class CreateMedicalApprovalRequestResponseDto {
  id: string;
  session_id: string;
  patient_name: string;
  status: string;
  urgency_level: string;
  created_at: string;
}
```

## Data Models

### Database Schema

#### medical_approval_requests Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| session_id | VARCHAR(255) | NOT NULL, UNIQUE | External session identifier |
| user_id | VARCHAR(255) | NOT NULL | Patient user identifier |
| tenant_id | VARCHAR(255) | NOT NULL | Company/tenant identifier |
| patient_name | VARCHAR(255) | NOT NULL | Patient full name |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'PENDENTE' | Approval status |
| assigned_doctor_id | UUID | NULL, FK to users(id) | Assigned doctor |
| urgency_level | VARCHAR(50) | NOT NULL | Urgency classification |
| chief_complaint | TEXT | NOT NULL | Main patient complaint |
| conversation_summary | TEXT | NOT NULL | AI conversation summary |
| care_recommendation | TEXT | NOT NULL | AI care recommendation |
| doctor_notes | TEXT | NULL | Doctor's notes |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_mar_status` on `status`
- `idx_mar_urgency` on `urgency_level`
- `idx_mar_created` on `created_at DESC`
- `idx_mar_session` on `session_id`

**Constraints:**
- `chk_status`: status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'ADJUSTED')
- `chk_urgency`: urgency_level IN ('EMERGENCY', 'VERY_URGENT', 'URGENT', 'STANDARD', 'NON_URGENT')

#### image_analyses Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| medical_approval_request_id | UUID | NOT NULL, FK | Reference to parent request |
| timestamp | TIMESTAMP | NOT NULL | Analysis timestamp |
| num_images | INT | NOT NULL | Number of images analyzed |
| context | TEXT | NULL | Analysis context |
| user_response | TEXT | NOT NULL | User's response |
| detailed_analysis | TEXT | NOT NULL | AI detailed analysis |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_ia_request` on `medical_approval_request_id`

**Foreign Keys:**
- `medical_approval_request_id` REFERENCES `medical_approval_requests(id)` ON DELETE CASCADE

#### attachments Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| medical_approval_request_id | UUID | NOT NULL, FK | Reference to parent request |
| s3_key | VARCHAR(500) | NOT NULL | S3 object key |
| original_name | VARCHAR(255) | NOT NULL | Original filename |
| file_type | VARCHAR(50) | DEFAULT 'image' | File type |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_att_request` on `medical_approval_request_id`

**Foreign Keys:**
- `medical_approval_request_id` REFERENCES `medical_approval_requests(id)` ON DELETE CASCADE

#### symptoms Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| medical_approval_request_id | UUID | NOT NULL, FK | Reference to parent request |
| description | VARCHAR(255) | NOT NULL | Symptom description |
| is_main | BOOLEAN | NOT NULL, DEFAULT false | True if main symptom |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_symptoms_request` on `medical_approval_request_id`

**Foreign Keys:**
- `medical_approval_request_id` REFERENCES `medical_approval_requests(id)` ON DELETE CASCADE

#### suggested_exams Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| medical_approval_request_id | UUID | NOT NULL, FK | Reference to parent request |
| exam_name | VARCHAR(255) | NOT NULL | Name of the exam |
| suggested_by | VARCHAR(20) | NOT NULL | 'AI' or 'DOCTOR' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_suggested_exams_request` on `medical_approval_request_id`

**Foreign Keys:**
- `medical_approval_request_id` REFERENCES `medical_approval_requests(id)` ON DELETE CASCADE

#### care_instructions Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| medical_approval_request_id | UUID | NOT NULL, FK | Reference to parent request |
| instruction | TEXT | NOT NULL | Instruction text |
| provided_by | VARCHAR(20) | NOT NULL | 'AI' or 'DOCTOR' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_care_instructions_request` on `medical_approval_request_id`

**Foreign Keys:**
- `medical_approval_request_id` REFERENCES `medical_approval_requests(id)` ON DELETE CASCADE

### TypeORM Entity Relationships

```typescript
@Entity('medical_approval_requests')
export class MedicalApprovalRequestEntity {
  // ... columns ...
  
  @OneToMany(() => ImageAnalysisEntity, (analysis) => analysis.medicalApprovalRequest, {
    cascade: true,
  })
  imageAnalyses: ImageAnalysisEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.medicalApprovalRequest, {
    cascade: true,
  })
  attachments: AttachmentEntity[];

  @OneToMany(() => SymptomEntity, (symptom) => symptom.medicalApprovalRequest, {
    cascade: true,
  })
  symptoms: SymptomEntity[];

  @OneToMany(() => SuggestedExamEntity, (exam) => exam.medicalApprovalRequest, {
    cascade: true,
  })
  suggestedExams: SuggestedExamEntity[];

  @OneToMany(() => CareInstructionEntity, (instruction) => instruction.medicalApprovalRequest, {
    cascade: true,
  })
  careInstructions: CareInstructionEntity[];

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'assigned_doctor_id' })
  assignedDoctor?: UserEntity;
}

@Entity('image_analyses')
export class ImageAnalysisEntity {
  // ... columns ...
  
  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.imageAnalyses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}

@Entity('attachments')
export class AttachmentEntity {
  // ... columns ...
  
  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}

@Entity('symptoms')
export class SymptomEntity {
  // ... columns ...
  
  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.symptoms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}

@Entity('suggested_exams')
export class SuggestedExamEntity {
  // ... columns ...
  
  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.suggestedExams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}

@Entity('care_instructions')
export class CareInstructionEntity {
  // ... columns ...
  
  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.careInstructions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
```

## Error Handling

### Domain Errors

#### SessionAlreadyExistsError

```typescript
export class SessionAlreadyExistsError extends Error {
  constructor(sessionId: string) {
    super(`Medical approval request with session_id '${sessionId}' already exists`);
    this.name = 'SessionAlreadyExistsError';
  }
}
```

#### MedicalApprovalRequestNotFoundError

```typescript
export class MedicalApprovalRequestNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Medical approval request '${identifier}' not found`);
    this.name = 'MedicalApprovalRequestNotFoundError';
  }
}
```

### HTTP Error Mapping

The controller will map domain errors to appropriate HTTP responses:

- `SessionAlreadyExistsError` → 409 Conflict
- `ValidationError` (class-validator) → 400 Bad Request
- `UnauthorizedException` (API key) → 401 Unauthorized
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

### Endpoint

**POST** `/medical-approval-requests`

### Authentication

Uses the existing `ApiKeyGuard` from `src/shared/presentation/guards/api-key.guard.ts`.

The guard validates the `x-api-key` header against the `TRYA_PLATFORM_API_KEY` environment variable.

### Request Headers

```
Content-Type: application/json
x-api-key: <api-key-value>
```

### Request Body

See `CreateMedicalApprovalRequestDto` structure in Components section.

**Example:**
```json
{
  "session_id": "local-session-user-5",
  "patient_data": {
    "name": "João da Silva",
    "symptoms": ["febre"],
    "image_analyses": [
      {
        "timestamp": "2025-12-03T13:08:54.846440",
        "num_images": 1,
        "context": "Imagem anexada",
        "user_response": "Obrigado por compartilhar seu exame de sangue...",
        "detailed_analysis": "1. Exame de sangue do paciente João da Silva..."
      }
    ],
    "attachments": [
      {
        "original_name": "exame_sangue-page-00001.jpg",
        "s3_key": "20251203_130853_16aee208-4241-49ba-936f-8bc066f6792b.jpeg"
      }
    ],
    "medical_summary": {
      "conversation_summary": "João relatou febre de 38°C que começou de madrugada...",
      "main_symptoms": ["Febre de 38°C"],
      "chief_complaint": "Febre que começou de madrugada",
      "suggested_exams": ["Hemograma completo de controle", "Proteína C reativa"],
      "urgency_level": "URGENT",
      "care_recommendation": "Direcionar para atendimento urgente para avaliação da febre...",
      "basic_care_instructions": [
        "Continue se hidratando bem",
        "Descanse bastante",
        "Monitore a temperatura corporal"
      ]
    }
  },
  "patient_name": "João da Silva",
  "user_id": "user-5",
  "tenant_id": "tenant-123",
  "updated_at": "2025-12-03T13:12:27.632227"
}
```

### Response Codes

- **201 Created**: Request successfully created
- **400 Bad Request**: Invalid payload or validation errors
- **401 Unauthorized**: Missing or invalid API key
- **409 Conflict**: Session ID already exists
- **500 Internal Server Error**: Database or server error

### Success Response (201)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "session_123",
  "patient_name": "João Silva",
  "status": "PENDENTE",
  "urgency_level": "UPA",
  "created_at": "2025-06-12T10:30:00.000Z"
}
```

### Error Response Examples

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "patient_name must be longer than or equal to 2 characters",
    "symptoms must contain at least 1 elements"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid API Key",
  "error": "Unauthorized"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Medical approval request with session_id 'session_123' already exists",
  "error": "Conflict"
}
```

## Testing Strategy

### Unit Tests

#### Use Case Tests
- Test successful creation with valid data
- Test validation of required fields
- Test session ID uniqueness check
- Test error handling for duplicate session IDs
- Test transaction rollback on failure
- Test mapping between DTOs and domain entities

#### Repository Tests
- Test findBySessionId with existing and non-existing sessions
- Test create operation
- Test cascade creation of related entities (image analyses, attachments)
- Test transaction handling

### Integration Tests

#### Controller Tests (E2E)
- Test POST endpoint with valid payload returns 201
- Test POST endpoint with missing API key returns 401
- Test POST endpoint with invalid API key returns 401
- Test POST endpoint with invalid payload returns 400
- Test POST endpoint with duplicate session_id returns 409
- Test POST endpoint creates all related records (request, analyses, attachments)
- Test POST endpoint response format matches specification

### Test Data

Create fixtures with:
- Valid complete payload with all optional fields
- Valid minimal payload without optional fields
- Invalid payloads for each validation rule
- Duplicate session_id scenarios

## Configuration

### Environment Variables

```env
# API Key for webhook authentication
TRYA_PLATFORM_API_KEY=your-secure-api-key-here
```

### Module Configuration

The module will be registered in `app.module.ts`:

```typescript
@Module({
  imports: [
    // ... existing imports
    MedicalApprovalRequestsModule,
  ],
})
export class AppModule {}
```

## Dependencies

### External Dependencies
- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - ORM for database operations
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `pg` - PostgreSQL driver

### Internal Dependencies
- `ApiKeyGuard` from `src/shared/presentation/guards/api-key.guard.ts`
- `UserEntity` from `src/modules/users/infrastructure/entities/user.entity.ts` (for doctor reference)

## Migration Strategy

### Database Migration

Create a single migration file that:
1. Creates `medical_approval_requests` table with all columns, indexes, and constraints
2. Creates `image_analyses` table with foreign key to medical_approval_requests
3. Creates `attachments` table with foreign key to medical_approval_requests
4. Creates `symptoms` table with foreign key to medical_approval_requests
5. Creates `suggested_exams` table with foreign key to medical_approval_requests
6. Creates `care_instructions` table with foreign key to medical_approval_requests

Migration naming: `{timestamp}-CreateMedicalApprovalRequestsTables.ts`

### Rollback Strategy

The migration should include a `down` method that:
1. Drops `care_instructions` table
2. Drops `suggested_exams` table
3. Drops `symptoms` table
4. Drops `attachments` table
5. Drops `image_analyses` table
6. Drops `medical_approval_requests` table

### Data Structure Change

**Note:** The original design used JSON/JSONB columns for storing arrays of symptoms, exams, and instructions. This has been changed to use proper relational tables for better data integrity, querying capabilities, and audit trails.

**Benefits of Relational Structure:**
- Each symptom, exam, and instruction has its own unique ID and timestamp
- The `is_main` flag in symptoms replaces the separate `main_symptoms` array
- The `suggested_by` and `provided_by` fields track whether data came from AI or a doctor
- Easier to query, filter, and analyze individual items
- Better support for future features like symptom tracking or exam history

## Security Considerations

1. **API Key Storage**: API key stored in environment variable, never in code
2. **Input Validation**: All inputs validated using class-validator decorators
3. **SQL Injection**: Protected by TypeORM parameterized queries
4. **Data Immutability**: AI-generated fields cannot be modified after creation
5. **Cascade Deletion**: Related records automatically deleted when parent is deleted
6. **HTTPS**: Endpoint should only be accessible via HTTPS in production

## Performance Considerations

1. **Database Indexes**: Indexes on frequently queried columns (status, urgency_level, created_at, session_id)
2. **Transaction Scope**: Single transaction for all related inserts to ensure atomicity
3. **JSONB Storage**: Use JSONB for array fields to enable efficient querying if needed in future
4. **Cascade Operations**: TypeORM cascade saves reduce number of explicit save calls
5. **Connection Pooling**: Leverage TypeORM connection pooling for concurrent requests

## Future Enhancements

1. **Webhook Retry Mechanism**: Implement retry logic in trya-backend for failed requests
2. **Idempotency**: Consider adding idempotency keys for safer retries
3. **Audit Logging**: Add comprehensive audit trail for all operations
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Batch Operations**: Support bulk creation of multiple requests
6. **Webhook Signatures**: Add HMAC signature verification for enhanced security
