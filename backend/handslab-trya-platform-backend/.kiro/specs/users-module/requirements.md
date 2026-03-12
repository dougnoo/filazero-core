# Requirements Document

## Introduction

This feature introduces a comprehensive users module for the Trya Platform API that manages both generic users and doctor-specific profiles. The module implements Clean Architecture principles and ensures data consistency between AWS Cognito (authentication) and PostgreSQL (application data). The system supports two primary user roles: ADMIN and DOCTOR, with role-specific functionality and data models. The module provides transactional consistency, email notifications, and comprehensive CRUD operations with pagination and filtering capabilities.

## Requirements

### Requirement 1: User and Doctor Entity Management

**User Story:** As a platform architect, I want separate User and Doctor entities with proper relationships, so that the system maintains clean separation between generic user data and doctor-specific information.

#### Acceptance Criteria

1. WHEN the system is initialized THEN the User entity SHALL contain fields: id, cognitoId, email, name, role, phone, active, createdAt, updatedAt
2. WHEN the system is initialized THEN the Doctor entity SHALL contain fields: id, userId (foreign key), crm, specialty, createdAt, updatedAt
3. WHEN a Doctor entity is created THEN it SHALL have a one-to-one relationship with a User entity
4. WHEN a User entity is queried THEN the system SHALL support optional eager loading of related Doctor data
5. WHEN a Doctor entity is deleted THEN the system SHALL handle the cascade behavior appropriately
6. WHEN the database is indexed THEN only cognitoId SHALL have a unique index on the users table for performance

### Requirement 2: Admin User Creation and Seeding

**User Story:** As a system administrator, I want to create initial ADMIN users through seeding, so that the platform has administrative access from the start.

#### Acceptance Criteria

1. WHEN the database is seeded THEN the system SHALL create at least one ADMIN user in both Cognito and PostgreSQL
2. WHEN creating a seeded ADMIN user THEN the system SHALL generate a secure temporary password
3. WHEN the ADMIN user is created THEN the system SHALL store the cognitoId in PostgreSQL for reference
4. IF the ADMIN user already exists in Cognito THEN the system SHALL skip creation and log the event
5. WHEN the seed operation completes THEN the system SHALL verify the ADMIN user exists in both systems

### Requirement 3: Doctor User Creation with Dual Persistence

**User Story:** As an ADMIN, I want to create DOCTOR users with their profiles, so that medical professionals can access the platform with their credentials and specialty information.

#### Acceptance Criteria

1. WHEN an ADMIN creates a DOCTOR user THEN the system SHALL validate the email doesn't exist in Cognito using userExists method
2. IF the email already exists THEN the system SHALL throw UserAlreadyExistsError
3. WHEN creating a DOCTOR user THEN the system SHALL accept optional temporaryPassword or generate one using PasswordGeneratorService
4. WHEN creating a DOCTOR user THEN the system SHALL create the user in Cognito with email, name, role, phoneNumber, and temporaryPassword
5. WHEN the Cognito user is created THEN the system SHALL assign the DOCTOR role using assignRole method
6. WHEN Cognito creation succeeds THEN the system SHALL create User record in PostgreSQL with cognitoId, email, name, phone, and role fields
7. WHEN User is created in PostgreSQL THEN the system SHALL create Doctor record with userId, crm, and specialty fields
8. WHEN PostgreSQL User is created THEN the system SHALL update Cognito custom attribute 'user_id' with the PostgreSQL user ID
9. IF PostgreSQL creation fails THEN the system SHALL delete the Cognito user and throw DatabaseSaveFailedError
10. IF Cognito rollback fails THEN the system SHALL log critical error with manual cleanup instructions including email, cognitoId, and username
11. WHEN a DOCTOR user is successfully created THEN the system SHALL return id, email, name, crm, and specialty
12. WHEN creating a DOCTOR user THEN the system SHALL require email, name, crm, specialty, and phoneNumber fields

### Requirement 4: Notification System with Multiple Providers

**User Story:** As a platform administrator, I want automated notifications sent when users are created with configurable providers, so that I can use console logging in development and AWS SES in production.

#### Acceptance Criteria

1. WHEN a DOCTOR user is created THEN the system SHALL call sendWelcomeDoctorEmail with email, name, temporaryPassword, loginUrl, crm, and specialty
2. WHEN sending welcome notification THEN the system SHALL retrieve frontendUrl from ConfigService (default: 'http://localhost:3000/login')
3. WHEN the notification provider is set to "console" THEN the system SHALL log notification content to console
4. WHEN the notification provider is set to "ses" THEN the system SHALL send emails via AWS SES
5. WHEN the system starts THEN it SHALL read the notification provider from environment configuration (NOTIFICATION_PROVIDER: "console" or "ses")
6. IF notification sending fails THEN the system SHALL log the error to console but NOT rollback the user creation
7. WHEN using console provider THEN the system SHALL format output to clearly show email recipient, subject, and body
8. WHEN notification fails THEN the system SHALL continue execution and return successful response

### Requirement 5: User Listing with Pagination and Filtering

**User Story:** As an ADMIN, I want to list all users with pagination and filtering options, so that I can efficiently browse and search through the user base.

#### Acceptance Criteria

1. WHEN requesting GET /users THEN the system SHALL return a paginated list of all users
2. WHEN requesting user list THEN the system SHALL support pagination parameters: page and limit
3. WHEN requesting user list THEN the system SHALL support filtering by role (ADMIN, DOCTOR)
4. WHEN requesting user list THEN the system SHALL support filtering by active status (true/false)
5. WHEN requesting user list THEN the system SHALL support search by name or email
6. WHEN returning user list THEN the system SHALL include pagination metadata: total, page, limit, totalPages
7. WHEN listing users THEN the system SHALL NOT expose sensitive data like cognitoId in the response

### Requirement 6: Individual User Retrieval

**User Story:** As an ADMIN, I want to retrieve individual user details by ID, so that I can view complete user information.

#### Acceptance Criteria

1. WHEN requesting GET /users/:id THEN the system SHALL return the user details if found
2. IF the user ID doesn't exist THEN the system SHALL return a 404 error
3. WHEN retrieving a DOCTOR user THEN the system SHALL include related doctor profile information
4. WHEN retrieving user details THEN the system SHALL include all user fields except sensitive data

### Requirement 7: Doctor-Specific Listing

**User Story:** As an ADMIN, I want to list all doctors with their medical credentials, so that I can manage the medical professional roster.

#### Acceptance Criteria

1. WHEN requesting GET /doctors THEN the system SHALL return a paginated list of all doctors with their user information
2. WHEN requesting doctor list THEN the system SHALL support pagination parameters: page and limit
3. WHEN requesting doctor list THEN the system SHALL support filtering by specialty
4. WHEN requesting doctor list THEN the system SHALL support filtering by active status
5. WHEN requesting doctor list THEN the system SHALL support search by name, email, or crm
6. WHEN returning doctor list THEN the system SHALL include both user and doctor-specific fields (crm, specialty)
7. WHEN returning doctor list THEN the system SHALL include pagination metadata

### Requirement 8: Individual Doctor Retrieval

**User Story:** As an ADMIN, I want to retrieve individual doctor details by ID, so that I can view complete doctor profile and credentials.

#### Acceptance Criteria

1. WHEN requesting GET /doctors/:id THEN the system SHALL return the doctor details with user information if found
2. IF the doctor ID doesn't exist THEN the system SHALL return a 404 error
3. WHEN retrieving doctor details THEN the system SHALL include user fields (email, name, phone, role, active) and doctor fields (crm, specialty)

### Requirement 9: Doctor Profile Update

**User Story:** As an ADMIN, I want to update doctor profiles, so that I can maintain accurate medical credentials and contact information.

#### Acceptance Criteria

1. WHEN requesting PUT /doctors/:id THEN the system SHALL update the doctor profile if found
2. WHEN updating a doctor THEN the system SHALL allow modification of: name, phone, crm, specialty
3. IF the doctor ID doesn't exist THEN the system SHALL return a 404 error
4. WHEN updating doctor information THEN the system SHALL update both User and Doctor tables within a transaction
5. WHEN the update succeeds THEN the system SHALL return the updated doctor profile with user information
6. IF validation fails THEN the system SHALL return appropriate error messages without applying changes

### Requirement 10: User Deactivation

**User Story:** As an ADMIN, I want to deactivate users instead of deleting them, so that I can maintain audit trails and prevent unauthorized access.

#### Acceptance Criteria

1. WHEN requesting deactivation of a user THEN the system SHALL set the active field to false in PostgreSQL
2. WHEN deactivating a user THEN the system SHALL disable the user in AWS Cognito
3. WHEN deactivating a user THEN the system SHALL perform both operations within a transactional context
4. IF Cognito deactivation fails THEN the system SHALL rollback the PostgreSQL change
5. IF the user is already deactivated THEN the system SHALL return success without modification
6. WHEN a user is deactivated THEN the system SHALL prevent authentication attempts
7. IF the user ID doesn't exist THEN the system SHALL return a 404 error

### Requirement 11: Transactional Consistency and Rollback

**User Story:** As a platform architect, I want transactional consistency between Cognito and PostgreSQL, so that the system never has orphaned or inconsistent user data.

#### Acceptance Criteria

1. WHEN creating a user THEN the system SHALL use database transactions for PostgreSQL operations
2. IF PostgreSQL transaction fails THEN the system SHALL delete the created Cognito user
3. IF Cognito user creation fails THEN the system SHALL NOT create PostgreSQL records
4. WHEN updating user data THEN the system SHALL ensure both Cognito and PostgreSQL are updated or neither is updated
5. WHEN an error occurs during multi-step operations THEN the system SHALL log detailed error information
6. WHEN rollback occurs THEN the system SHALL return appropriate error messages to the client

### Requirement 12: Repository Pattern Implementation

**User Story:** As a developer, I want repository interfaces in the domain layer with implementations in infrastructure, so that the system follows Clean Architecture principles.

#### Acceptance Criteria

1. WHEN the domain layer is defined THEN it SHALL include IUserRepository interface with methods: userExists, createUser, assignRole, updateCustomAttribute, deleteUser, disableUser
2. WHEN the domain layer is defined THEN it SHALL include IUserDbRepository interface with create, findById, findAll, update, deactivate methods
3. WHEN the domain layer is defined THEN it SHALL include IDoctorRepository interface with create, findById, findAll, update methods
4. WHEN the domain layer is defined THEN it SHALL include INotificationRepository interface with sendWelcomeDoctorEmail, sendAdminNotification methods
5. WHEN the infrastructure layer is implemented THEN it SHALL provide CognitoUserRepository implementing IUserRepository
6. WHEN the infrastructure layer is implemented THEN it SHALL provide TypeORMUserDbRepository implementing IUserDbRepository
7. WHEN the infrastructure layer is implemented THEN it SHALL provide TypeORMDoctorRepository implementing IDoctorRepository
8. WHEN the infrastructure layer is implemented THEN it SHALL provide ConsoleNotificationRepository implementing INotificationRepository
9. WHEN the infrastructure layer is implemented THEN it SHALL provide SESNotificationRepository implementing INotificationRepository
10. WHEN the module initializes THEN it SHALL select the notification repository implementation based on environment configuration
11. WHEN repositories are used THEN they SHALL be injected via dependency injection tokens (USER_REPOSITORY_TOKEN, USER_DB_REPOSITORY_TOKEN, DOCTOR_REPOSITORY_TOKEN, NOTIFICATION_REPOSITORY_TOKEN)
12. WHEN the application layer is defined THEN it SHALL include PasswordGeneratorService for generating temporary passwords

### Requirement 13: Error Handling and Domain Errors

**User Story:** As a developer, I want domain-specific error classes, so that the system provides clear and consistent error handling.

#### Acceptance Criteria

1. WHEN email already exists THEN the system SHALL throw UserAlreadyExistsError
2. WHEN user is not found THEN the system SHALL throw UserNotFoundError
3. WHEN doctor is not found THEN the system SHALL throw DoctorNotFoundError
4. WHEN validation fails THEN the system SHALL throw ValidationError with field details
5. WHEN Cognito operations fail THEN the system SHALL throw CognitoServiceError
6. WHEN database operations fail THEN the system SHALL throw RepositoryError
7. WHEN errors occur THEN the system SHALL log error details for debugging

### Requirement 14: API Documentation with Swagger

**User Story:** As an API consumer, I want comprehensive Swagger documentation for all user endpoints, so that I can understand and integrate with the API easily.

#### Acceptance Criteria

1. WHEN accessing Swagger docs THEN all user endpoints SHALL be documented with descriptions
2. WHEN viewing endpoint documentation THEN request DTOs SHALL include field descriptions and validation rules
3. WHEN viewing endpoint documentation THEN response DTOs SHALL include example values
4. WHEN viewing endpoint documentation THEN error responses SHALL be documented with status codes
5. WHEN viewing endpoint documentation THEN authentication requirements SHALL be clearly indicated
6. WHEN viewing endpoint documentation THEN role requirements SHALL be specified using @ApiSecurity decorators

### Requirement 15: Authorization and Access Control

**User Story:** As a security architect, I want role-based access control on user management endpoints, so that only authorized users can perform administrative operations.

#### Acceptance Criteria

1. WHEN accessing any user management endpoint THEN the system SHALL require authentication
2. WHEN creating users THEN only ADMIN role SHALL be authorized
3. WHEN listing users THEN only ADMIN role SHALL be authorized
4. WHEN updating users THEN only ADMIN role SHALL be authorized
5. WHEN deactivating users THEN only ADMIN role SHALL be authorized
6. IF an unauthorized user attempts access THEN the system SHALL return 403 Forbidden
7. IF an unauthenticated user attempts access THEN the system SHALL return 401 Unauthorized
