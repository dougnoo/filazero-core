---
inclusion: always
---

# Development Principles

## SOLID Principles

This project strictly follows SOLID principles:

- **Single Responsibility**: Each class has one reason to change
  - Use Cases orchestrate only one business operation
  - Repositories handle only data persistence
  - Controllers only receive requests and delegate to use cases

- **Open/Closed**: Open for extension, closed for modification
  - Always use interfaces for abstractions (`IAuthRepository`, `IUserRepository`)
  - Use DI tokens (`AUTH_REPOSITORY_TOKEN`) to allow implementation swapping
  - Use decorators (`@Public()`, `@Roles()`) to add behavior without modifying code

- **Liskov Substitution**: Implementations must respect interface contracts
  - All repository implementations must fully implement their interfaces
  - Maintain expected behavior and error handling across implementations

- **Interface Segregation**: Focused, specific interfaces
  - Separate interfaces by context (`IAuthRepository`, `IUserDbRepository`, `IDoctorRepository`)
  - No "god interfaces" with dozens of methods

- **Dependency Inversion**: Depend on abstractions, not concretions
  - Use Cases depend on interfaces via tokens, never on concrete implementations
  - Controllers depend on Use Cases, never on Repositories directly
  - Dependency flow: Presentation → Application → Domain ← Infrastructure

## Clean Architecture

- **Domain Layer**: Business entities, interfaces, errors (no external dependencies)
- **Application Layer**: Use cases orchestrate domain logic
- **Infrastructure Layer**: External services, repositories, mappers
- **Presentation Layer**: Controllers, DTOs, guards, decorators

Dependencies flow inward: Presentation → Application → Domain ← Infrastructure

## Clean Code Principles

### Naming Conventions

- Use clear, descriptive names that reveal intent
- Follow consistent naming patterns across the codebase
- Use business terminology that stakeholders understand
- Examples: `MedicalApprovalRequest`, `approveConsultation()`, `Beneficiary`

### Functions and Methods

- Keep functions small and focused on a single task
- Functions should do one thing and do it well
- Avoid side effects when possible
- Use descriptive parameter names

### Error Handling

- Use domain-specific errors that extend base error classes
- Errors should be descriptive and actionable
- Located in `domain/errors/` per module
- Never return null, throw meaningful errors instead

### Comments

- Code should be self-documenting through clear naming
- Use comments only when necessary to explain "why", not "what"
- Keep comments up to date with code changes
- Remove commented-out code

### Code Organization

- Group related functionality together
- Keep files small and focused
- One class per file
- Organize imports: external libraries → internal modules → relative imports

### DRY (Don't Repeat Yourself)

- Extract common logic into reusable functions
- Use shared modules for cross-cutting concerns
- Avoid copy-paste programming
- Shared code lives in `src/shared/`

### Separation of Concerns

- Each layer has a specific responsibility
- Domain entities are data structures with identity
- Use cases contain business logic orchestration
- Repositories handle data persistence
- Controllers handle HTTP concerns only
- DTOs define API contracts

### Mappers

- Use mappers to translate between layers
  - `domain/entities` ↔ `infrastructure/entities` (TypeORM)
  - Prevents external concerns from polluting domain model
  - Located in `infrastructure/mappers/`

### Validation Strategy

- **DTO validation**: Input format and structure using `class-validator`
  - Example: "email must be valid format", "field is required"
- **Business validation**: Logic validation in use cases
  - Example: "user already exists", "consultation must have beneficiary data"
- Domain entities throw domain-specific errors when rules are violated
