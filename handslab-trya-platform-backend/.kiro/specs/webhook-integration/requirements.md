# Requirements Document

## Introduction

The webhook integration feature enables the trya-backend system to send medical consultation data to the Trya Platform API for storage and subsequent medical review. When a patient completes a conversation with the AI chat system, the trya-backend will send a comprehensive payload containing the conversation summary, AI analysis, uploaded medical exams, and patient information. This data will be stored in the platform's database and made available for doctors to review through the medical approval queue.

The integration uses API key authentication to ensure secure communication between systems and maintains data integrity through transactional operations.

## Requirements

### Requirement 1: API Endpoint for Receiving Medical Approval Requests

**User Story:** As the trya-backend system, I want to send medical consultation data via a REST API endpoint, so that patient consultations can be stored and made available for medical review.

#### Acceptance Criteria

1. WHEN the trya-backend sends a POST request to `/medical-approval-requests` THEN the system SHALL accept the request with proper authentication
2. WHEN the request includes a valid API key in the `x-api-key` header THEN the system SHALL process the request
3. WHEN the request does not include a valid API key THEN the system SHALL return a 401 Unauthorized response
4. WHEN the request payload is valid THEN the system SHALL return a 201 Created response with the created resource details
5. WHEN the request payload is invalid THEN the system SHALL return a 400 Bad Request response with validation error details

### Requirement 2: Payload Validation

**User Story:** As the platform, I want to validate all incoming webhook data, so that only complete and correctly formatted data is stored in the database.

#### Acceptance Criteria

1. WHEN the payload is received THEN the system SHALL validate that `session_id` is present and is a non-empty string
2. WHEN the payload is received THEN the system SHALL validate that `patient_data` object is present
3. WHEN the payload is received THEN the system SHALL validate that `patient_data.name` is present and has a minimum length of 2 characters
4. WHEN the payload is received THEN the system SHALL validate that `patient_name` at root level is present and has a minimum length of 2 characters
5. WHEN the payload is received THEN the system SHALL validate that `user_id` and `tenant_id` are present and are non-empty strings
6. WHEN the payload is received THEN the system SHALL validate that `updated_at` is present and is a valid ISO8601 timestamp
7. WHEN the payload is received THEN the system SHALL validate that `patient_data.symptoms` is an array with at least one element
8. WHEN the payload contains `patient_data.medical_summary` THEN the system SHALL validate that all required fields are present: `conversation_summary`, `main_symptoms`, `chief_complaint`, `suggested_exams`, `urgency_level`, `care_recommendation`, and `basic_care_instructions`
9. WHEN `urgency_level` is provided THEN the system SHALL validate it is one of: `EMERGENCY`, `VERY_URGENT`, `URGENT`, `STANDARD`, or `NON_URGENT` (Manchester Triage System)
10. WHEN the payload contains `patient_data.image_analyses` THEN the system SHALL validate each analysis has required fields: `timestamp`, `num_images`, `user_response`, and `detailed_analysis`
11. WHEN the payload contains `patient_data.attachments` THEN the system SHALL validate each attachment has required fields: `s3_key` and `original_name`
12. WHEN validation fails for any field THEN the system SHALL return a 400 Bad Request response with specific validation error messages

### Requirement 3: Session ID Uniqueness

**User Story:** As the platform, I want to ensure each session_id is unique, so that duplicate consultation submissions are prevented.

#### Acceptance Criteria

1. WHEN a request is received with a `session_id` THEN the system SHALL check if that `session_id` already exists in the database
2. WHEN the `session_id` already exists THEN the system SHALL return a 409 Conflict response
3. WHEN the `session_id` already exists THEN the system SHALL include an error message indicating the session already exists
4. WHEN the `session_id` is unique THEN the system SHALL proceed with creating the medical approval request

### Requirement 4: Data Persistence

**User Story:** As the platform, I want to store all consultation data in a structured database, so that it can be retrieved and reviewed by medical professionals.

#### Acceptance Criteria

1. WHEN a valid request is received THEN the system SHALL create a record in the `medical_approval_requests` table
2. WHEN creating the medical approval request THEN the system SHALL set the initial status to `PENDING`
3. WHEN creating the medical approval request THEN the system SHALL store all patient information: `session_id`, `user_id`, `tenant_id`, and `patient_name`
4. WHEN creating the medical approval request THEN the system SHALL store all AI-generated data: `urgency_level`, `chief_complaint`, `conversation_summary`, and `care_recommendation`
5. WHEN the payload contains symptoms THEN the system SHALL create corresponding records in the `symptoms` table with `is_main` flag set appropriately
6. WHEN the payload contains suggested exams THEN the system SHALL create corresponding records in the `suggested_exams` table with `suggested_by` set to 'AI'
7. WHEN the payload contains care instructions THEN the system SHALL create corresponding records in the `care_instructions` table with `provided_by` set to 'AI'
8. WHEN the payload contains `image_analyses` THEN the system SHALL create corresponding records in the `image_analyses` table linked to the medical approval request
9. WHEN the payload contains `attachments` THEN the system SHALL create corresponding records in the `attachments` table linked to the medical approval request
10. WHEN creating records THEN the system SHALL automatically set `created_at` and `updated_at` timestamps
11. WHEN the medical approval request is created THEN the system SHALL leave doctor-specific fields (`assigned_doctor_id`, `doctor_notes`) as NULL
12. WHEN doctors add exams or instructions later THEN the system SHALL create new records in `suggested_exams` and `care_instructions` tables with `suggested_by`/`provided_by` set to 'DOCTOR'

### Requirement 5: Transactional Integrity

**User Story:** As the platform, I want all database operations to be transactional, so that partial data is never stored if any operation fails.

#### Acceptance Criteria

1. WHEN processing a request THEN the system SHALL execute all database operations within a single transaction
2. WHEN any database operation fails THEN the system SHALL rollback all changes made in the transaction
3. WHEN a rollback occurs THEN the system SHALL return a 500 Internal Server Error response
4. WHEN all operations succeed THEN the system SHALL commit the transaction
5. WHEN the transaction is committed THEN the system SHALL return a 201 Created response

### Requirement 6: Response Format

**User Story:** As the trya-backend system, I want to receive a structured response after submitting consultation data, so that I can confirm the data was stored successfully and track the created resource.

#### Acceptance Criteria

1. WHEN a medical approval request is successfully created THEN the system SHALL return a 201 Created status code
2. WHEN returning a success response THEN the system SHALL include the following fields: `id`, `session_id`, `patient_name`, `status`, `urgency_level`, and `created_at`
3. WHEN returning a success response THEN the `status` field SHALL be `PENDING`
4. WHEN returning a success response THEN the `created_at` field SHALL be in ISO8601 format
5. WHEN an error occurs THEN the system SHALL return an appropriate HTTP status code (400, 401, 409, or 500)
6. WHEN an error occurs THEN the system SHALL include an error message describing the issue

### Requirement 7: Data Immutability

**User Story:** As the platform, I want to ensure that data received from the webhook is immutable, so that the original AI analysis and patient information remains unchanged for audit purposes.

#### Acceptance Criteria

1. WHEN data is stored via the webhook endpoint THEN the system SHALL NOT provide any mechanism to modify the AI-generated fields through this endpoint
2. WHEN data is stored THEN the fields `urgency_level`, `chief_complaint`, `conversation_summary`, and `care_recommendation` SHALL be marked as immutable
3. WHEN data is stored THEN AI-generated symptoms, exams, and instructions (with `suggested_by`/`provided_by` = 'AI') SHALL be immutable
4. WHEN data is stored THEN only the doctor-specific fields (`assigned_doctor_id`, `doctor_notes`) SHALL be modifiable through other endpoints
5. WHEN doctors review consultations THEN they MAY add new symptoms, exams, and instructions (with `suggested_by`/`provided_by` = 'DOCTOR') but SHALL NOT modify AI-generated items
6. WHEN data is stored THEN the `status` field SHALL only be modifiable through the medical queue workflow endpoints

### Requirement 8: API Key Configuration

**User Story:** As a system administrator, I want to configure the API key through environment variables, so that the authentication credentials can be managed securely.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL read the API key from the `TRYA_PLATFORM_API_KEY` environment variable
2. WHEN the environment variable is not set THEN the system SHALL log a warning or error
3. WHEN a request is received THEN the system SHALL compare the provided API key with the configured value
4. WHEN the API keys match THEN the system SHALL allow the request to proceed
5. WHEN the API keys do not match THEN the system SHALL return a 401 Unauthorized response
