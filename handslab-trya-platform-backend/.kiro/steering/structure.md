# Project Structure

## Architecture Pattern

This project follows **Clean Architecture** with clear separation of concerns across four layers:

1. **Domain** - Business entities, value objects, interfaces, errors
2. **Application** - Use cases, business logic orchestration
3. **Infrastructure** - External services, repositories, mappers
4. **Presentation** - Controllers, DTOs, guards, decorators

## Folder Organization

```
src/
├── config/                    # Application configuration
│   ├── app.config.ts         # App settings
│   └── aws.config.ts         # AWS credentials
│
├── database/                  # Database layer
│   ├── entities/             # TypeORM entities
│   ├── migrations/           # Database migrations
│   └── seeds/                # Seed data scripts
│
├── modules/                   # Feature modules
│   └── [module-name]/
│       ├── domain/           # Business logic layer
│       │   ├── entities/     # Domain entities
│       │   ├── errors/       # Domain-specific errors
│       │   ├── repositories/ # Repository interfaces
│       │   └── value-objects/# Value objects
│       │
│       ├── application/      # Use case layer
│       │   └── use-cases/    # Business use cases
│       │       └── [use-case-name]/
│       │           ├── *.use-case.ts
│       │           ├── *.dto.ts
│       │           └── *-response.dto.ts
│       │
│       ├── infrastructure/   # External services layer
│       │   ├── repositories/ # Repository implementations
│       │   ├── mappers/      # Data mappers
│       │   └── services/     # External service integrations
│       │
│       ├── presentation/     # API layer
│       │   ├── controllers/  # REST controllers
│       │   ├── dtos/         # Request/response DTOs
│       │   ├── guards/       # Route guards
│       │   └── decorators/   # Custom decorators
│       │
│       └── [module].module.ts # NestJS module definition
│
└── shared/                    # Shared code
    ├── domain/               # Shared domain logic
    │   ├── enums/           # Common enums
    │   ├── errors/          # Base error classes
    │   └── repositories/    # Shared repository interfaces
    ├── presentation/         # Shared presentation layer
    │   ├── guards/          # Global guards
    │   ├── decorators/      # Global decorators
    │   └── filters/         # Exception filters
    └── validators/           # Custom validators
```

## Module Structure Rules

1. **Each module is self-contained** with its own domain, application, infrastructure, and presentation layers
2. **Dependencies flow inward** - presentation → application → domain
3. **Domain layer has no dependencies** on other layers
4. **Use cases are in application layer** and orchestrate domain logic
5. **Repository interfaces in domain**, implementations in infrastructure
6. **DTOs in presentation layer** for API contracts
7. **Errors are domain-specific** and extend base error classes

## Naming Conventions

- **Entities**: `[name].entity.ts` (e.g., `user.entity.ts`)
- **Use Cases**: `[action]-[resource].use-case.ts` (e.g., `sign-in.use-case.ts`)
- **DTOs**: `[action]-[resource].dto.ts` (e.g., `sign-in.dto.ts`)
- **Response DTOs**: `[action]-[resource]-response.dto.ts`
- **Controllers**: `[resource].controller.ts` (e.g., `auth.controller.ts`)
- **Repositories**: `[implementation]-[resource].repository.ts` (e.g., `cognito-auth.repository.ts`)
- **Guards**: `[name].guard.ts` (e.g., `jwt-auth.guard.ts`)
- **Errors**: `[error-name].error.ts` (e.g., `user-not-found.error.ts`)

## Dependency Injection

- Use **tokens** for repository injection (e.g., `AUTH_REPOSITORY_TOKEN`)
- Repositories are provided in module with `useClass` or `useFactory`
- Use cases are injected with repositories via constructor
- Controllers inject use cases directly

## Global Guards (Applied in Order)

1. `JwtAuthGuard` - Validates JWT token
2. `RolesGuard` - Validates user roles

Use `@Public()` decorator to bypass authentication on specific routes.
