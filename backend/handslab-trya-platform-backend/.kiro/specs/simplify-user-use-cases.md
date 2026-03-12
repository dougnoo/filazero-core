---
title: Simplify User Use Cases - Unify Doctor and Admin Operations
status: completed
---

# Simplify User Use Cases

## Overview

Now that all user CRUD operations are centralized in the UsersController, we can remove redundant use cases that duplicate functionality already available in generic use cases. Keep role-specific use cases for creation and updates since they handle different data structures and business logic.

## Current State

**Separate use cases for each role:**

- `CreateAdminUseCase` - Creates admin users
- `CreateDoctorUseCase` - Creates doctor users
- `GetUserUseCase` - Gets any user (already generic)
- `GetDoctorUseCase` - Gets doctor with profile (redundant)
- `ListUsersUseCase` - Lists all users with filters (already generic)
- `ListDoctorsUseCase` - Lists only doctors (can be replaced with filter)
- `UpdateDoctorUseCase` - Updates doctor profile
- `ActivateUserUseCase` - Activates user (already generic)
- `DeactivateUserUseCase` - Deactivates user (already generic)

## Target State

**Keep role-specific use cases for creation/updates (different DTOs and logic):**

- `CreateAdminUseCase` - Creates admin users (simple user data)
- `CreateDoctorUseCase` - Creates doctor users (user + doctor profile with CRM, specialty)
- `UpdateDoctorUseCase` - Updates doctor profile (user + doctor fields)
- `GetUserUseCase` - Gets any user with profile (keep as is)
- `ListUsersUseCase` - Lists users with basic filters only (keep as is)
- `ActivateUserUseCase` - Activates user (keep as is)
- `DeactivateUserUseCase` - Deactivates user (keep as is)

**Keep but refactor to use user repository:**

- `GetDoctorUseCase` - Keep for flat response structure, refactor to use user repository
- `ListDoctorsUseCase` - Keep for doctor-specific filters (crm, specialty), refactor to use user repository

**Rationale for keeping GetDoctorUseCase and ListDoctorsUseCase:**

- **GetDoctorUseCase**: Different response structure (flat vs nested), specific validation, better semantics
- **ListDoctorsUseCase**: Doctor-specific filters (crm, specialty) that don't belong in generic ListUsersUseCase
- Both refactored to use USER_DB_REPOSITORY instead of DOCTOR_REPOSITORY to reduce dependencies

## Implementation Tasks

### 1. Refactor GetDoctorUseCase to Use User Repository

- [x] Change injection from `DOCTOR_REPOSITORY_TOKEN` to `USER_DB_REPOSITORY_TOKEN`
- [x] Update logic to use `userDbRepository.findById(userId)`
- [x] Add validation: throw `UserNotFoundError` if user not found
- [x] Add validation: throw `DoctorNotFoundError` if user.doctor is null
- [x] Keep flat response structure (doctor + user fields at same level)
- [x] Update imports to use user repository interface

### 2. Keep ListUsersUseCase Simple

- [x] Keep only basic filters in `ListUsersDto`: role, active, search, page, limit
- [x] No doctor-specific filters in ListUsersUseCase
- [x] This use case remains generic for all user types

### 3. Refactor ListDoctorsUseCase to Use User Repository

- [x] Change injection from `DOCTOR_REPOSITORY_TOKEN` to `USER_DB_REPOSITORY_TOKEN`
- [x] Update logic to use `userDbRepository.findAll()` with role=DOCTOR filter
- [x] Add `crm` filter to `ListDoctorsDto`
- [x] Keep doctor-specific filters in `ListDoctorsDto`: specialty, crm, active, search, page, limit
- [x] Keep flat response structure for consistency
- [x] Update imports to use user repository interface
- [x] Add `crm` and `specialty` filters to `UserFilters` interface
- [x] Update repository to LEFT JOIN doctor table and filter by doctor fields

### 4. Update UsersController

- [x] Keep both `GetDoctorUseCase` and `ListDoctorsUseCase` injections (refactored versions)
- [x] No changes needed to endpoints
- [x] Verify Swagger docs are still accurate

### 5. Update UsersModule

- [x] No changes needed - all use cases remain in providers
- [x] Verify dependency injection works correctly with refactored use cases

### 6. Verify Functionality

- [x] Build passes successfully
- [ ] Test that GET `/users/:id` returns nested doctor profile correctly
- [ ] Test that GET `/users/doctors/:id` returns flat doctor data correctly
- [ ] Test that GET `/users/doctors` filters doctors correctly
- [ ] Test doctor-specific filters: `?crm=12345` and `?specialty=Cardiologia`
- [ ] Ensure no breaking changes to API responses
- [ ] Verify error handling: UserNotFoundError and DoctorNotFoundError

## Benefits

1. **Less Code** - Remove duplicate functionality
2. **Easier Maintenance** - Fewer use cases to maintain
3. **Consistency** - Use generic use cases where possible
4. **Keep Specificity** - Maintain role-specific use cases for creation/updates with different DTOs

## Rationale for Keeping Separate Creation/Update Use Cases

**Why keep CreateAdminUseCase and CreateDoctorUseCase separate:**

- Different DTOs: Admin has basic user fields, Doctor has additional CRM and specialty
- Different business logic: Doctor creation involves creating both User and Doctor entities
- Clear separation of concerns: Each use case handles its specific role requirements

**Why keep UpdateDoctorUseCase separate:**

- Handles both user fields and doctor-specific fields (CRM, specialty)
- Different validation rules for doctor fields
- May need to create UpdateAdminUseCase in the future if admin-specific fields are added

**Why keep GetDoctorUseCase and ListDoctorsUseCase:**

- Different response structures needed by frontend:
  - `GetUserUseCase`: nested structure `{ id, email, doctor: { crm, specialty } }`
  - `GetDoctorUseCase`: flat structure `{ id, email, crm, specialty }`
- Specific validation and error handling for doctor-only endpoints
- Better API semantics: `/users/doctors/:id` guarantees doctor data
- Refactor to use user repository to reduce dependencies and improve maintainability

## DTOs Structure

### ListUsersDto (Basic filters only)

```typescript
export class ListUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Search by name or email

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

### ListDoctorsDto (Keep doctor-specific filters)

```typescript
export class ListDoctorsDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Search by name, email, or CRM

  @IsOptional()
  @IsString()
  crm?: string; // Filter by CRM

  @IsOptional()
  @IsString()
  specialty?: string; // Filter by specialty

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

## Controller Endpoints After Simplification

```typescript
// Create users (keep separate use cases)
POST /users/admins -> CreateAdminUseCase(dto)
POST /users/doctors -> CreateDoctorUseCase(dto)

// List users (basic filters only)
GET /users -> ListUsersUseCase(query)
  // Examples:
  // GET /users?role=DOCTOR
  // GET /users?active=true
  // GET /users?search=john

// List doctors (with doctor-specific filters)
GET /users/doctors -> ListDoctorsUseCase(query)
  // Examples:
  // GET /users/doctors?specialty=Cardiologia
  // GET /users/doctors?crm=12345
  // GET /users/doctors?search=john

// Get user (nested structure)
GET /users/:id -> GetUserUseCase(id) // returns { id, email, doctor: { crm, specialty } }

// Get doctor (flat structure)
GET /users/doctors/:id -> GetDoctorUseCase(id) // returns { id, email, crm, specialty }

// Update user (keep specific for now)
PUT /users/:id -> UpdateDoctorUseCase(id, dto) // handles both user and doctor fields
```

## Notes

- `GetUserUseCase` returns nested structure: `{ id, email, doctor: { crm, specialty } }`
- `GetDoctorUseCase` returns flat structure: `{ id, email, crm, specialty }`
- `ListUsersUseCase` keeps basic filters only (role, active, search)
- `ListDoctorsUseCase` keeps doctor-specific filters (crm, specialty) and uses user repository
- Keep role-specific creation use cases due to different DTOs and business logic
- Controller provides clear API endpoints with appropriate use cases
- Both GetDoctorUseCase and ListDoctorsUseCase refactored to use USER_DB_REPOSITORY instead of DOCTOR_REPOSITORY
