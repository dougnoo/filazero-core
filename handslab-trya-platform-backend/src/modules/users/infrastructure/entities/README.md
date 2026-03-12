# Users Module - TypeORM Entities

This directory contains the TypeORM entity definitions for the Users module.

## Entities

### UserEntity
**File:** `user.entity.ts`

Represents a user in the system with authentication and profile information.

**Fields:**
- `id` - UUID primary key
- `cognitoId` - AWS Cognito user identifier (unique, indexed)
- `email` - User email address (unique, indexed)
- `name` - User full name
- `role` - User role (ADMIN or DOCTOR, indexed)
- `phone` - User phone number (optional)
- `active` - User active status (indexed)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `doctor` - Optional one-to-one relationship with DoctorEntity

**Indexes:**
- cognitoId

**Relationships:**
- One-to-One with DoctorEntity (cascade enabled)

### DoctorEntity
**File:** `doctor.entity.ts`

Represents a doctor profile with medical credentials.

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to UserEntity (unique, indexed)
- `crm` - Medical license number
- `specialty` - Medical specialty (indexed)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `user` - Required one-to-one relationship with UserEntity

**Indexes:**
- userId

**Relationships:**
- One-to-One with UserEntity (uses JoinColumn)

## Database Schema

The entities map to the following database tables:
- `users` - User accounts and profiles
- `doctors` - Doctor-specific information

See `src/database/migrations/README.md` for detailed schema information.

## Usage

These entities are used by:
- TypeORM repositories in the infrastructure layer
- Mappers to convert between domain entities and database entities
- NestJS TypeOrmModule for dependency injection

## Notes

- The UserEntity uses cascade: true, so deleting a user will automatically delete the associated doctor profile
- The DoctorEntity uses @JoinColumn to specify the foreign key column name
- All entities use snake_case for database column names (e.g., `cognito_id`, `created_at`)
- UUID generation is handled by PostgreSQL's uuid_generate_v4() function
