# Design Document

## Overview

The Users Module implements a comprehensive user management system for the Trya Platform API following Clean Architecture principles. The module manages two types of users (ADMIN and DOCTOR) with dual persistence in AWS Cognito (authentication) and PostgreSQL (application data). The design ensures transactional consistency between both systems, provides configurable notification services, and exposes RESTful APIs for user and doctor management.

### Key Design Principles

- **Clean Architecture**: Clear separation between domain, application, infrastructure, and presentation layers
- **Dual Persistence**: Synchronization between Cognito (auth) and PostgreSQL (data) with rollback mechanisms
- **Transactional Consistency**: Atomic operations across both persistence layers
- **Dependency Inversion**: Domain layer defines interfaces, infrastructure provides implementations
- **Single Responsibility**: Each use case handles one specific business operation
- **Configurable Services**: Environment-based selection of notification providers

## Architecture

### Layer Structure

```
modules/users/
├── domain/                          # Business logic and interfaces
│   ├── entities/                    # Domain entities
│   │   ├── user.entity.ts          # User domain entity
│   │   └── doctor.entity.ts        # Doctor domain entity
│   ├── repositories/                # Repository interfaces
│   │   ├── user.repository.interface.ts
│   │   ├── user.repository.token.ts
│   │   ├── user-db.repository.interface.ts
│   │   ├── user-db.repository.token.ts
│   │   ├── doctor.repository.interface.ts
│   │   ├── doctor.repository.token.ts
│   │   ├── notification.repository.interface.ts
│   │   └── notification.repository.token.ts
│   └── errors/                      # Domain-specific errors
│       ├── user-already-exists.error.ts
│       ├── user-not-found.error.ts
│       ├── doctor-not-found.error.ts
│       └── database-save-failed.error.ts
│
├── application/                     # Use cases and services
│   ├── use-cases/
│   │   ├── create-admin/
│   │   │   ├── create-admin.dto.ts
│   │   │   ├── create-admin-response.dto.ts
│   │   │   └── create-admin.use-case.ts
│   │   ├── create-doctor/
│   │   │   ├── create-doctor.dto.ts
│   │   │   ├── create-doctor-response.dto.ts
│   │   │   └── create-doctor.use-case.ts
│   │   ├── list-users/
│   │   │   ├── list-users.dto.ts
│   │   │   ├── list-users-response.dto.ts
│   │   │   └── list-users.use-case.ts
│   │   ├── get-user/
│   │   │   ├── get-user-response.dto.ts
│   │   │   └── get-user.use-case.ts
│   │   ├── list-doctors/
│   │   │   ├── list-doctors.dto.ts
│   │   │   ├── list-doctors-response.dto.ts
│   │   │   └── list-doctors.use-case.ts
│   │   ├── get-doctor/
│   │   │   ├── get-doctor-response.dto.ts
│   │   │   └── get-doctor.use-case.ts
│   │   ├── update-doctor/
│   │   │   ├── update-doctor.dto.ts
│   │   │   ├── update-doctor-response.dto.ts
│   │   │   └── update-doctor.use-case.ts
│   │   └── deactivate-user/
│   │       └── deactivate-user.use-case.ts
│   └── services/
│       └── password-generator.service.ts
│
├── infrastructure/                  # External services and implementations
│   ├── repositories/
│   │   ├── cognito-user.repository.ts
│   │   ├── typeorm-user-db.repository.ts
│   │   ├── typeorm-doctor.repository.ts
│   │   ├── console-notification.repository.ts
│   │   └── ses-notification.repository.ts
│   ├── mappers/
│   │   ├── user.mapper.ts
│   │   └── doctor.mapper.ts
│   └── entities/                    # TypeORM entities
│       ├── user.entity.ts
│       └── doctor.entity.ts
│
├── presentation/                    # API layer
│   ├── controllers/
│   │   ├── users.controller.ts
│   │   └── doctors.controller.ts
│   └── dtos/                        # API request/response DTOs
│       └── (DTOs are in use-case folders)
│
└── users.module.ts                  # NestJS module definition
```

### Data Flow

```
Client Request
    ↓
Controller (Presentation Layer)
    ↓
Use Case (Application Layer)
    ↓
Repository Interface (Domain Layer)
    ↓
Repository Implementation (Infrastructure Layer)
    ↓
External Service (Cognito/PostgreSQL/SES)
```

## Components and Interfaces

### Domain Layer

#### Entities

**User Entity** (Domain Model)
```typescript
class User {
  id: string;
  cognitoId: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  doctor?: Doctor;  // Optional relation
}
```

**Doctor Entity** (Domain Model)
```typescript
class Doctor {
  id: string;
  userId: string;
  crm: string;
  specialty: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;  // Required relation
}
```

#### Repository Interfaces

**IUserRepository** (Cognito Operations)
```typescript
interface IUserRepository {
  userExists(email: string): Promise<boolean>;
  createUser(data: CreateCognitoUserDto): Promise<CognitoUser>;
  assignRole(username: string, role: UserRole): Promise<void>;
  updateCustomAttribute(email: string, attributeName: string, value: string): Promise<void>;
  deleteUser(email: string): Promise<void>;
  disableUser(email: string): Promise<void>;
}
```

**IUserDbRepository** (PostgreSQL User Operations)
```typescript
interface IUserDbRepository {
  create(data: CreateUserDbDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(filters: UserFilters, pagination: Pagination): Promise<PaginatedResult<User>>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  deactivate(id: string): Promise<void>;
}
```

**IDoctorRepository** (PostgreSQL Doctor Operations)
```typescript
interface IDoctorRepository {
  create(data: CreateDoctorDbDto): Promise<Doctor>;
  findById(id: string): Promise<Doctor | null>;
  findAll(filters: DoctorFilters, pagination: Pagination): Promise<PaginatedResult<Doctor>>;
  update(id: string, data: UpdateDoctorDto): Promise<Doctor>;
}
```

**INotificationRepository** (Notification Operations)
```typescript
interface INotificationRepository {
  sendWelcomeDoctorEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
    crm: string,
    specialty: string
  ): Promise<void>;
  sendAdminNotification(
    adminEmail: string,
    doctorName: string,
    doctorEmail: string
  ): Promise<void>;
}
```

#### Domain Errors

```typescript
class UserAlreadyExistsError extends Error
class UserNotFoundError extends Error
class DoctorNotFoundError extends Error
class DatabaseSaveFailedError extends Error
class CognitoServiceError extends Error
```

### Application Layer

#### Use Cases

**CreateDoctorUseCase**
- Validates email uniqueness in Cognito
- Generates or uses provided temporary password
- Creates user in Cognito with DOCTOR role
- Creates User and Doctor records in PostgreSQL
- Updates Cognito with PostgreSQL user_id
- Handles rollback on failure
- Sends welcome email notification
- Returns doctor profile with credentials

**CreateAdminUseCase**
- Similar flow to CreateDoctorUseCase but for ADMIN role
- No Doctor record creation
- Used primarily for seeding

**ListUsersUseCase**
- Retrieves paginated user list from PostgreSQL
- Supports filtering by role, active status
- Supports search by name or email
- Returns pagination metadata

**GetUserUseCase**
- Retrieves single user by ID
- Includes doctor profile if user is DOCTOR
- Throws UserNotFoundError if not found

**ListDoctorsUseCase**
- Retrieves paginated doctor list with user data
- Supports filtering by specialty, active status
- Supports search by name, email, or crm
- Returns pagination metadata

**GetDoctorUseCase**
- Retrieves single doctor by ID with user data
- Throws DoctorNotFoundError if not found

**UpdateDoctorUseCase**
- Updates User and Doctor records in transaction
- Validates doctor exists
- Allows updating: name, phone, crm, specialty

**DeactivateUserUseCase**
- Sets active=false in PostgreSQL
- Disables user in Cognito
- Handles rollback if Cognito fails
- Idempotent operation

#### Services

**PasswordGeneratorService**
```typescript
class PasswordGeneratorService {
  generateTemporaryPassword(): string;
  // Generates secure random password meeting Cognito requirements
  // Min 8 chars, uppercase, lowercase, number, special char
}
```

### Infrastructure Layer

#### TypeORM Entities

**User Entity** (Database Model)
```typescript
@Entity('users')
class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  cognitoId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => DoctorEntity, doctor => doctor.user, { cascade: true })
  doctor: DoctorEntity;
}
```

**Doctor Entity** (Database Model)
```typescript
@Entity('doctors')
class DoctorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  crm: string;

  @Column()
  specialty: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserEntity, user => user.doctor)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
```

#### Repository Implementations

**CognitoUserRepository**
- Uses AWS SDK CognitoIdentityProviderClient
- Implements IUserRepository interface
- Handles Cognito-specific operations
- Maps Cognito responses to domain models

**TypeORMUserDbRepository**
- Uses TypeORM Repository<UserEntity>
- Implements IUserDbRepository interface
- Handles PostgreSQL User operations
- Uses QueryBuilder for complex queries
- Maps database entities to domain models

**TypeORMDoctorRepository**
- Uses TypeORM Repository<DoctorEntity>
- Implements IDoctorRepository interface
- Handles PostgreSQL Doctor operations
- Includes user relations in queries
- Maps database entities to domain models

**ConsoleNotificationRepository**
- Implements INotificationRepository interface
- Logs formatted notification content to console
- Used in development environment
- Displays recipient, subject, and body clearly

**SESNotificationRepository**
- Implements INotificationRepository interface
- Uses AWS SDK SESClient
- Sends HTML emails via AWS SES
- Uses email templates for consistent formatting
- Handles SES-specific errors gracefully

#### Mappers

**UserMapper**
```typescript
class UserMapper {
  static toDomain(entity: UserEntity): User;
  static toEntity(domain: User): UserEntity;
  static toResponse(domain: User): UserResponseDto;
}
```

**DoctorMapper**
```typescript
class DoctorMapper {
  static toDomain(entity: DoctorEntity): Doctor;
  static toEntity(domain: Doctor): DoctorEntity;
  static toResponse(domain: Doctor): DoctorResponseDto;
}
```

### Presentation Layer

#### Controllers

**UsersController**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
class UsersController {
  @Post()
  createAdmin(@Body() dto: CreateAdminDto): Promise<CreateAdminResponseDto>;

  @Get()
  listUsers(@Query() query: ListUsersDto): Promise<ListUsersResponseDto>;

  @Get(':id')
  getUser(@Param('id') id: string): Promise<GetUserResponseDto>;

  @Delete(':id')
  deactivateUser(@Param('id') id: string): Promise<void>;
}
```

**DoctorsController**
```typescript
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
class DoctorsController {
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto): Promise<CreateDoctorResponseDto>;

  @Get()
  listDoctors(@Query() query: ListDoctorsDto): Promise<ListDoctorsResponseDto>;

  @Get(':id')
  getDoctor(@Param('id') id: string): Promise<GetDoctorResponseDto>;

  @Put(':id')
  updateDoctor(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto
  ): Promise<UpdateDoctorResponseDto>;
}
```

## Data Models

### DTOs

**CreateDoctorDto**
```typescript
class CreateDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  crm: string;

  @IsString()
  specialty: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  temporaryPassword?: string;
}
```

**CreateDoctorResponseDto**
```typescript
class CreateDoctorResponseDto {
  id: string;
  email: string;
  name: string;
  crm: string;
  specialty: string;
}
```

**ListUsersDto**
```typescript
class ListUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
```

**ListUsersResponseDto**
```typescript
class ListUsersResponseDto {
  data: UserResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**UpdateDoctorDto**
```typescript
class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  crm?: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}
```

### Database Schema

**users table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR')),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_cognito_id ON users(cognito_id);
```

**doctors table**
```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crm VARCHAR(50) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: Only cognito_id has an index on the users table for performance optimization.

## Error Handling

### Error Flow

```
Use Case Error
    ↓
Domain Error (thrown)
    ↓
HTTP Exception Filter (catches)
    ↓
Formatted Error Response
```

### Error Mapping

| Domain Error | HTTP Status | Response |
|--------------|-------------|----------|
| UserAlreadyExistsError | 409 Conflict | { message: "User with this email already exists" } |
| UserNotFoundError | 404 Not Found | { message: "User not found" } |
| DoctorNotFoundError | 404 Not Found | { message: "Doctor not found" } |
| DatabaseSaveFailedError | 500 Internal Server Error | { message: "Failed to save user data" } |
| CognitoServiceError | 502 Bad Gateway | { message: "Authentication service error" } |
| ValidationError | 400 Bad Request | { message: "Validation failed", errors: [...] } |

### Rollback Strategy

**Create Doctor Flow with Rollback**
```
1. Check email exists in Cognito → UserAlreadyExistsError if exists
2. Create user in Cognito → CognitoServiceError if fails
3. Assign role in Cognito → CognitoServiceError if fails
4. Create User in PostgreSQL → DatabaseSaveFailedError if fails
   ↓ (on failure)
   Rollback: Delete Cognito user
   ↓ (if rollback fails)
   Log critical error with manual cleanup instructions
5. Create Doctor in PostgreSQL → DatabaseSaveFailedError if fails
   ↓ (on failure)
   Rollback: Delete Cognito user (User cascade deletes Doctor)
6. Update Cognito custom attribute → Log warning if fails (non-critical)
7. Send notification → Log error if fails (non-critical)
```

**Deactivate User Flow with Rollback**
```
1. Find user in PostgreSQL → UserNotFoundError if not found
2. Set active=false in PostgreSQL
3. Disable user in Cognito → CognitoServiceError if fails
   ↓ (on failure)
   Rollback: Set active=true in PostgreSQL
```

## Testing Strategy

### Unit Tests

**Domain Layer**
- Entity validation logic
- Error class instantiation

**Application Layer**
- Use case business logic
- Mock all repository dependencies
- Test success and failure paths
- Test rollback scenarios
- Test validation logic

**Infrastructure Layer**
- Repository implementations with test database
- Mapper transformations
- Cognito client mocking
- SES client mocking

**Presentation Layer**
- Controller request/response handling
- DTO validation
- Guard behavior
- Exception filter mapping

### Integration Tests

**Database Integration**
- TypeORM repository operations
- Transaction handling
- Cascade behavior
- Query performance

**Cognito Integration**
- User creation and deletion
- Role assignment
- Custom attribute updates
- User disable operations

**End-to-End Flows**
- Complete doctor creation flow
- User listing with filters
- Doctor profile update
- User deactivation

### Test Data

**Test Users**
```typescript
const testAdmin = {
  email: 'admin@test.com',
  name: 'Test Admin',
  role: UserRole.ADMIN,
  phone: '+5511999999999'
};

const testDoctor = {
  email: 'doctor@test.com',
  name: 'Dr. Test',
  role: UserRole.DOCTOR,
  phone: '+5511888888888',
  crm: '123456',
  specialty: 'Cardiology'
};
```

## Configuration

### Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=trya_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# AWS Cognito
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Notification
NOTIFICATION_PROVIDER=console  # or 'ses'

# AWS SES (if NOTIFICATION_PROVIDER=ses)
AWS_SES_FROM_EMAIL=noreply@tryaplatform.com
AWS_REGION=us-east-1

# Application
FRONTEND_URL=http://localhost:3000/login
```

### Module Configuration

**UsersModule**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DoctorEntity]),
    ConfigModule,
  ],
  providers: [
    // Cognito Repository
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: CognitoUserRepository,
    },
    // PostgreSQL Repositories
    {
      provide: USER_DB_REPOSITORY_TOKEN,
      useClass: TypeORMUserDbRepository,
    },
    {
      provide: DOCTOR_REPOSITORY_TOKEN,
      useClass: TypeORMDoctorRepository,
    },
    // Notification Repository (conditional)
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get('NOTIFICATION_PROVIDER', 'console');
        return provider === 'ses'
          ? new SESNotificationRepository(configService)
          : new ConsoleNotificationRepository();
      },
      inject: [ConfigService],
    },
    // Services
    PasswordGeneratorService,
    // Use Cases
    CreateAdminUseCase,
    CreateDoctorUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    ListDoctorsUseCase,
    GetDoctorUseCase,
    UpdateDoctorUseCase,
    DeactivateUserUseCase,
  ],
  controllers: [UsersController, DoctorsController],
  exports: [
    USER_REPOSITORY_TOKEN,
    USER_DB_REPOSITORY_TOKEN,
    DOCTOR_REPOSITORY_TOKEN,
  ],
})
export class UsersModule {}
```

## Security Considerations

### Authentication & Authorization

- All endpoints require JWT authentication via JwtAuthGuard
- All endpoints require ADMIN role via RolesGuard
- JWT tokens validated against Cognito user pool
- Role information stored in JWT claims

### Data Protection

- Passwords never stored in PostgreSQL
- Temporary passwords generated with cryptographic randomness
- CognitoId not exposed in API responses
- Sensitive Cognito attributes protected

### Input Validation

- All DTOs use class-validator decorators
- Email format validation
- Phone number format validation (E.164)
- String length constraints
- Enum validation for roles

### Audit Trail

- CreatedAt and UpdatedAt timestamps on all entities
- Soft delete via active flag
- Detailed error logging for rollback scenarios
- Critical error logging for manual intervention

## API Documentation

### Swagger Configuration

All endpoints documented with:
- @ApiTags for grouping
- @ApiOperation for descriptions
- @ApiResponse for status codes
- @ApiBody for request schemas
- @ApiBearerAuth for authentication
- @ApiSecurity for role requirements

### Example Swagger Annotations

```typescript
@ApiTags('doctors')
@ApiBearerAuth()
@ApiSecurity('roles', ['ADMIN'])
@Controller('doctors')
export class DoctorsController {
  @Post()
  @ApiOperation({ summary: 'Create a new doctor user' })
  @ApiResponse({ status: 201, type: CreateDoctorResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 500, description: 'Database save failed' })
  createDoctor(@Body() dto: CreateDoctorDto) { }
}
```

## Seeding Strategy

### Admin User Seed

**Location**: `src/database/seeds/create-admin-user.seed.ts`

**Flow**:
1. Check if admin exists in Cognito by email
2. If not exists, create in Cognito with generated password
3. Create in PostgreSQL with cognitoId
4. Update Cognito with PostgreSQL user_id
5. Log credentials for initial access

**Execution**: Run via npm script `npm run seed:admin`

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (email, role, active, specialty)
- Eager loading of relations when needed
- Pagination for list endpoints
- Query result caching for read-heavy operations

### Cognito Optimization

- Batch operations where possible
- Caching of Cognito client instances
- Connection pooling for AWS SDK

### API Response Times

- Target: < 200ms for read operations
- Target: < 500ms for write operations
- Target: < 1s for doctor creation (includes Cognito + DB + email)

## Monitoring and Logging

### Log Levels

- **ERROR**: Rollback failures, critical errors requiring manual intervention
- **WARN**: Non-critical failures (email sending, Cognito attribute updates)
- **INFO**: Successful operations, user creation events
- **DEBUG**: Detailed flow information for troubleshooting

### Key Metrics

- Doctor creation success rate
- Rollback occurrence rate
- Average response times per endpoint
- Cognito API error rate
- Database query performance

### Alerts

- Critical: Rollback failure requiring manual cleanup
- Warning: High rate of DatabaseSaveFailedError
- Warning: Cognito service unavailability
- Info: New doctor user created
