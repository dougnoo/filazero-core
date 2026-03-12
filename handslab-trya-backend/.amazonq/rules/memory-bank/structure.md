# Project Structure - Trya Backend

## Directory Organization

```
handslab-trya-backend/
├── src/                          # Source code
│   ├── config/                   # Application and AWS configuration
│   ├── database/                 # Database layer
│   │   ├── entities/            # TypeORM entities
│   │   ├── migrations/          # Database migrations
│   │   └── seeds/               # Database seed scripts
│   ├── modules/                  # Feature modules
│   │   ├── auth/                # Authentication module
│   │   ├── health-operators/    # Health operator management
│   │   ├── health-plans/        # Health plan management
│   │   ├── onboard/             # User onboarding
│   │   ├── public-config/       # Public configuration
│   │   ├── tenant/              # Tenant management
│   │   └── user-management/     # User CRUD operations
│   ├── shared/                   # Shared code across modules
│   │   ├── application/         # Shared use cases
│   │   ├── domain/              # Shared domain entities
│   │   ├── pipes/               # Custom pipes
│   │   ├── presentation/        # Shared controllers/guards
│   │   └── validators/          # Custom validators
│   ├── app.module.ts            # Root application module
│   └── main.ts                  # Application entry point
├── test/                         # E2E tests
├── docs/                         # Documentation
├── public/                       # Static assets
└── logs/                         # Application logs
```

## Clean Architecture Layers

Each module follows Clean Architecture with four distinct layers:

### 1. Domain Layer (`domain/`)
- **Entities**: Core business objects with business logic
- **Value Objects**: Immutable objects representing domain concepts
- **Interfaces**: Repository and service contracts
- **Tokens**: Dependency injection tokens
- **Enums**: Domain-specific enumerations

### 2. Application Layer (`application/`)
- **Use Cases**: Business logic orchestration
- **DTOs**: Data transfer objects for use case inputs/outputs
- **Mappers**: Transform between domain entities and DTOs
- **Services**: Application-level services

### 3. Infrastructure Layer (`infrastructure/`)
- **Repositories**: Data access implementations (Cognito, TypeORM, DynamoDB)
- **Services**: External service integrations (AWS, email)
- **Mappers**: Transform between entities and persistence models
- **Templates**: Email and notification templates

### 4. Presentation Layer (`presentation/`)
- **Controllers**: HTTP request handlers
- **DTOs**: API request/response objects
- **Guards**: Route protection (JWT, Tenant, Roles)
- **Decorators**: Custom parameter decorators
- **Filters**: Exception handling

## Core Modules

### Auth Module
**Purpose**: Authentication and authorization
- Login/logout flows
- Token management (access + refresh)
- Password management
- OAuth integration
- User session handling

### User Management Module
**Purpose**: User CRUD operations
- Create users by role (Admin, Doctor, HR, Beneficiary)
- List and filter users
- Update user profiles
- Delete users
- Cognito-database synchronization

### Tenant Module
**Purpose**: Multi-tenant management
- Tenant creation and configuration
- Tenant isolation enforcement
- Tenant-scoped queries

### Health Plans Module
**Purpose**: Health insurance plan management
- Plan CRUD operations
- Plan-user associations
- Coverage management

### Health Operators Module
**Purpose**: Health insurance operator management
- Operator registration
- Operator-plan relationships

### Onboard Module
**Purpose**: User onboarding workflows
- New user registration
- Profile completion
- Initial setup

### Public Config Module
**Purpose**: Public configuration data
- Chronic conditions
- Medications
- System configurations

## Shared Components

### Guards
- **JwtAuthGuard**: Validates JWT tokens
- **TenantGuard**: Enforces tenant isolation
- **RolesGuard**: Validates user permissions
- **PublicGuard**: Marks routes as public

### Decorators
- **@CurrentUser()**: Extracts authenticated user
- **@TenantId()**: Extracts tenant ID
- **@Roles()**: Defines required roles
- **@Public()**: Marks route as public

### Pipes
- **ValidationPipe**: DTO validation
- **TransformPipe**: Data transformation

### Filters
- **HttpExceptionFilter**: Global exception handling
- **AllExceptionsFilter**: Catch-all error handler

## Architectural Patterns

### Dependency Injection
- Token-based injection for loose coupling
- Interface-driven design
- Repository pattern for data access

### Multi-Tenancy Pattern
- Tenant ID in JWT payload
- Automatic tenant filtering in repositories
- Guard-based tenant validation
- Tenant-scoped database queries

### Repository Pattern
- Abstract repository interfaces in domain
- Concrete implementations in infrastructure
- Support for multiple data sources (Cognito, TypeORM, DynamoDB)

### Use Case Pattern
- Single responsibility per use case
- Input/output DTOs
- Dependency injection of repositories
- Business logic encapsulation

### Module Organization
- Feature-based modules
- Clear module boundaries
- Explicit exports for reusability
- Shared module for cross-cutting concerns

## Data Flow

1. **Request** → Controller (Presentation)
2. **Validation** → DTOs + Pipes
3. **Authorization** → Guards (JWT, Tenant, Roles)
4. **Business Logic** → Use Case (Application)
5. **Data Access** → Repository (Infrastructure)
6. **External Services** → AWS Services (Infrastructure)
7. **Response** → Mapper → DTO → Controller

## Configuration Management

### Environment-Based Config
- `.env` files for environment variables
- `ConfigModule` for centralized configuration
- Type-safe configuration objects
- Separate configs for app and AWS

### Database Configuration
- TypeORM DataSource configuration
- Migration management
- Seed scripts for initial data
- Entity auto-loading

## Testing Structure

- **Unit Tests**: `*.spec.ts` files alongside source
- **E2E Tests**: `test/` directory
- **Jest Configuration**: In package.json
- **Coverage Reports**: Generated in `coverage/`
