# Requirements Document

## Introduction

This feature implements a medical approval queue system where doctors can view, assign, and approve patient consultation requests. The system integrates with an external backend (trya-backend) to retrieve beneficiary details and file download URLs. Doctors will be able to filter and paginate through pending requests, assign requests to themselves, review AI-generated analysis along with uploaded medical documents, and approve consultations with optional additional recommendations.

The feature supports role-based access control (doctors only), multi-tenancy tracking, and maintains a clear status workflow from pending to in-analysis to approved states.

## Requirements

### Requirement 1: List Medical Approval Requests

**User Story:** As a doctor, I want to view a paginated and filterable list of medical approval requests, so that I can efficiently find and select cases to review.

#### Acceptance Criteria

1. WHEN a doctor requests the list of medical approval requests with PENDING status THEN the system SHALL return results ordered by creation date (oldest first - FIFO)
2. WHEN a doctor requests the list of medical approval requests with any status other than PENDING THEN the system SHALL return results ordered by creation date (most recent first)
3. WHEN a doctor provides pagination parameters (limit, offset) THEN the system SHALL return results according to those parameters
4. WHEN a doctor provides filter parameters (status, urgency_level, date range, patient_name) THEN the system SHALL return only requests matching all provided filters
5. WHEN a doctor provides a patient_name filter THEN the system SHALL perform a case-insensitive partial match search on the patient_name field
6. WHEN the system returns the list THEN each item SHALL include: id, patient_name, urgency_level, chief_complaint, status, created_at, and assigned_doctor information
7. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
8. WHEN the database query fails THEN the system SHALL return an appropriate error response

### Requirement 2: View Medical Approval Request Details

**User Story:** As a doctor, I want to view complete details of a specific medical approval request, so that I can thoroughly analyze the case before making a decision.

#### Acceptance Criteria

1. WHEN a doctor requests details for a specific approval request ID THEN the system SHALL return all available information for that request
2. WHEN the system returns request details THEN it SHALL include patient information, AI-generated data (symptoms with is_main flag, suggested_exams with suggested_by field, care_instructions with provided_by field, initial_analysis), doctor data (if assigned), image analysis results, and attachment information
3. WHEN the requested approval request does not exist THEN the system SHALL return a not found error
4. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
5. WHEN the database query fails THEN the system SHALL return an appropriate error response

### Requirement 3: Assign Medical Approval Request

**User Story:** As a doctor, I want to assign a pending medical approval request to myself, so that I can take ownership of reviewing that case.

#### Acceptance Criteria

1. WHEN a doctor requests to assign a pending approval request THEN the system SHALL update the assigned_doctor_id to the authenticated doctor's ID
2. WHEN a doctor assigns a pending request THEN the system SHALL change the status from PENDING to IN_REVIEW
3. WHEN a doctor attempts to assign a request that is not in PENDING status THEN the system SHALL reject the request with a validation error
4. WHEN the requested approval request does not exist THEN the system SHALL return a not found error
5. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
6. WHEN the database update fails THEN the system SHALL return an appropriate error response

### Requirement 4: Approve Medical Approval Request

**User Story:** As a doctor, I want to approve a medical approval request with optional additional recommendations, so that I can finalize the consultation with or without adjustments to the AI suggestions.

#### Acceptance Criteria

1. WHEN a doctor submits an approval with status "APPROVED" or "ADJUSTED" THEN the system SHALL update the request status accordingly
2. WHEN a doctor submits an approval with doctor_suggested_exams THEN the system SHALL create new SuggestedExam records with suggested_by='DOCTOR'
3. WHEN a doctor submits an approval with doctor_care_instructions THEN the system SHALL create new CareInstruction records with provided_by='DOCTOR'
4. WHEN a doctor submits an approval THEN the system SHALL save optional doctor_notes
5. WHEN a doctor attempts to approve a request they are not assigned to THEN the system SHALL reject the request with an authorization error
6. WHEN a doctor attempts to approve a request not in IN_REVIEW status THEN the system SHALL reject the request with a validation error
7. WHEN the approval is successful THEN the system SHALL persist all doctor-provided data along with the status update
8. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
9. WHEN the requested approval request does not exist THEN the system SHALL return a not found error
10. WHEN the database update fails THEN the system SHALL return an appropriate error response

### Requirement 5: Get Attachment Download URL

**User Story:** As a doctor, I want to obtain a pre-signed download URL for medical attachments, so that I can securely view uploaded exams and images.

#### Acceptance Criteria

1. WHEN a doctor requests a download URL for a specific attachment THEN the system SHALL call the trya-backend API with the beneficiary user ID and S3 key
2. WHEN the trya-backend API returns a pre-signed URL THEN the system SHALL return that URL to the doctor
3. WHEN the trya-backend API call fails THEN the system SHALL return an appropriate error response
4. WHEN the requested approval request does not exist THEN the system SHALL return a not found error
5. WHEN the requested attachment does not exist in the approval request THEN the system SHALL return a not found error
6. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
7. WHEN the system calls trya-backend THEN it SHALL include the x-api-key header for authentication

### Requirement 6: Get Beneficiary Details

**User Story:** As a doctor, I want to retrieve detailed beneficiary information from the external system, so that I have complete patient context for my medical review.

#### Acceptance Criteria

1. WHEN a doctor requests beneficiary details for a specific approval request THEN the system SHALL call the trya-backend API with the beneficiary user ID
2. WHEN the trya-backend API returns beneficiary data THEN the system SHALL return personal data, health plan information, chronic conditions, medications, and allergies
3. WHEN the trya-backend API call fails THEN the system SHALL return an appropriate error response
4. WHEN the requested approval request does not exist THEN the system SHALL return a not found error
5. WHEN a doctor is not authenticated THEN the system SHALL reject the request with an authentication error
6. WHEN the system calls trya-backend THEN it SHALL include the x-api-key header for authentication

### Requirement 7: Status Workflow Management

**User Story:** As the system, I want to enforce a strict status workflow for medical approval requests, so that the approval process follows proper medical review procedures.

#### Acceptance Criteria

1. WHEN a request is created THEN the system SHALL set the initial status to PENDING
2. WHEN a request transitions from PENDING to IN_REVIEW THEN the system SHALL allow the transition only via the assign operation
3. WHEN a request transitions from IN_REVIEW to APPROVED or ADJUSTED THEN the system SHALL allow the transition only via the approve operation
4. WHEN a request is in any status THEN the system SHALL NOT allow backward status transitions
5. WHEN a status transition is attempted that violates the workflow THEN the system SHALL reject the operation with a validation error

### Requirement 8: Doctor Assignment Rules

**User Story:** As the system, I want to enforce assignment rules for medical approval requests, so that only properly assigned doctors can approve cases.

#### Acceptance Criteria

1. WHEN a request is assigned to a doctor THEN the system SHALL NOT allow reassignment to a different doctor
2. WHEN a doctor attempts to approve a request THEN the system SHALL verify the doctor is the assigned_doctor_id
3. WHEN a doctor who is not assigned attempts to approve a request THEN the system SHALL reject the operation with an authorization error
4. WHEN a request is in PENDING status THEN the system SHALL allow any authenticated doctor to assign it to themselves
5. WHEN AI-generated symptoms, exams, or instructions exist THEN the system SHALL NOT allow modification of those records
6. WHEN doctors add new exams or instructions THEN the system SHALL create new records with appropriate source tracking (suggested_by='DOCTOR' or provided_by='DOCTOR')

### Requirement 9: Multi-tenancy Support

**User Story:** As the system, I want to track tenant information for all medical approval requests, so that we maintain proper data segregation and audit trails.

#### Acceptance Criteria

1. WHEN a medical approval request is created THEN the system SHALL store the tenant_id for traceability
2. WHEN doctors query the approval queue THEN the system SHALL return requests from all tenants
3. WHEN the system persists any approval request data THEN it SHALL include the tenant_id

### Requirement 10: External System Integration

**User Story:** As the system, I want to securely integrate with the trya-backend API, so that I can retrieve beneficiary details and file download URLs.

#### Acceptance Criteria

1. WHEN the system calls any trya-backend endpoint THEN it SHALL include the x-api-key header with the configured API key
2. WHEN the system calls trya-backend THEN it SHALL use the base URL from the TRYA_BACKEND_URL environment variable
3. WHEN the system calls trya-backend THEN it SHALL use the API key from the TRYA_BACKEND_API_KEY environment variable
4. WHEN the trya-backend API returns an error THEN the system SHALL handle the error gracefully and return an appropriate response
5. WHEN the trya-backend API is unavailable THEN the system SHALL return a service unavailable error
