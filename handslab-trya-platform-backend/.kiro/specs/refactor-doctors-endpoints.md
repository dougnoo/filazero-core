---
title: Refactor Doctor Endpoints - Move CRUD to Users Controller
status: completed
---

# Refactor Doctor Endpoints

## Overview

Consolidate doctor CRUD operations into the Users controller, keeping the Doctors controller focused only on doctor-specific workflows (like approval queues). This aligns with the architecture where doctors are users with a specific role.

## Current State

- **DoctorsController** (`/doctors`) - Handles all doctor CRUD operations
  - POST `/doctors` - Create doctor
  - GET `/doctors` - List doctors
  - GET `/doctors/:id` - Get doctor details
  - PUT `/doctors/:id` - Update doctor

- **UsersController** (`/users`) - Handles admin user operations
  - POST `/users` - Create admin
  - GET `/users` - List users
  - GET `/users/:id` - Get user details
  - DELETE `/users/:id` - Deactivate user
  - PATCH `/users/:id/activate` - Activate user

## Target State

### UsersController (`/users`)

Move all doctor CRUD operations to nested routes under `/users`:

- POST `/users/admins` - Create admin user
- POST `/users/doctors` - Create doctor user
- GET `/users` - List all users (with role filter)
- GET `/users/doctors` - List only doctors
- GET `/users/:id` - Get user details (includes doctor profile if applicable)
- PUT `/users/:id` - Update user (includes doctor fields if applicable)
- DELETE `/users/:id` - Deactivate user
- PATCH `/users/:id/activate` - Activate user

### DoctorsController (`/doctors`)

Remove completely - will be recreated in a separate spec for doctor-specific workflows.

## Implementation Tasks

### 1. Update UsersController

- [x] Move `CreateDoctorUseCase` injection to UsersController
- [x] Move `ListDoctorsUseCase` injection to UsersController
- [x] Move `UpdateDoctorUseCase` injection to UsersController
- [x] Add POST `/users/doctors` endpoint (use CreateDoctorUseCase)
- [x] Add GET `/users/doctors` endpoint (use ListDoctorsUseCase)
- [x] Update PUT `/users/:id` to handle doctor fields (use UpdateDoctorUseCase when user is doctor)
- [x] Refactor POST `/users` to POST `/users/admins` for clarity
- [x] Update Swagger documentation for all endpoints

### 2. Remove DoctorsController

- [x] Delete `src/modules/users/presentation/controllers/doctors.controller.ts`
- [x] Remove DoctorsController from UsersModule controllers array
- [x] Remove all doctor CRUD use case injections from DoctorsController

### 3. Update Use Cases (if needed)

- [x] Review if any use case logic needs adjustment
- [x] Ensure use cases remain role-agnostic and reusable

### 4. Update Module Configuration

- [x] Ensure all use cases are still provided in UsersModule
- [x] Update controller exports if needed

### 5. Update Tests

- [x] Update controller tests to reflect new routes
- [x] Update e2e tests for new endpoint structure
- [x] Ensure all existing functionality still works

### 6. Update API Documentation

- [x] Update Swagger tags
- [x] Update endpoint descriptions
- [x] Ensure examples reflect new routes

## API Changes Summary

### Breaking Changes

| Old Endpoint       | New Endpoint          | Method | Notes                              |
| ------------------ | --------------------- | ------ | ---------------------------------- |
| POST `/doctors`    | POST `/users/doctors` | POST   | Create doctor                      |
| GET `/doctors`     | GET `/users/doctors`  | GET    | List doctors                       |
| GET `/doctors/:id` | GET `/users/:id`      | GET    | Get doctor details                 |
| PUT `/doctors/:id` | PUT `/users/:id`      | PUT    | Update doctor                      |
| POST `/users`      | POST `/users/admins`  | POST   | Create admin (renamed for clarity) |

### New Endpoints

- POST `/users/admins` - Explicitly create admin users
- POST `/users/doctors` - Create doctor users
- GET `/users/doctors` - List only doctors (shortcut for GET `/users?role=DOCTOR`)

## Benefits

1. **Consistency** - All user management in one place
2. **Clarity** - Doctors controller focused on doctor-specific workflows
3. **Scalability** - Easy to add more user types (e.g., brokers) in the future
4. **RESTful** - Better resource hierarchy (`/users/doctors` vs `/doctors`)

## Notes

- The `GetUserUseCase` already returns doctor profile when applicable
- The `ListUsersUseCase` already supports role filtering
- Need to create a generic `UpdateUserUseCase` or keep separate use cases for admin/doctor updates
- Consider if we need a generic `CreateUserUseCase` or keep role-specific use cases
