# Technology Stack

## Core Framework

- **NestJS** - Node.js framework with TypeScript
- **TypeScript** - Language (ES2023 target)
- **Node.js** - Runtime environment

## Database & Storage

- **PostgreSQL** - Primary database with TypeORM
- **TypeORM** - ORM with migrations support
- **AWS S3** - File storage for medical certificates and documents

## AWS Services

- **AWS Cognito** - User authentication and management

## Key Libraries

- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Authentication strategies
- `@nestjs/swagger` - API documentation
- `class-validator` - DTO validation
- `class-transformer` - Object transformation
- `bcrypt` - Password hashing
- `uuidv7` - UUID generation

## Development Tools

- **ESLint** - Linting with TypeScript support
- **Prettier** - Code formatting (single quotes, trailing commas)
- **Jest** - Testing framework
- **Docker** - Containerization

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run typeorm:migration:generate  # Generate migration
npm run typeorm:migration:run       # Run migrations
npm run typeorm:migration:revert    # Revert last migration

# Seeds
npm run seed:all           # Run all seeds

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run with coverage
npm run test:e2e           # Run e2e tests

# Code Quality
npm run lint               # Lint and fix
npm run format             # Format code with Prettier

# Docker
docker-compose up -d                    # Production
docker-compose -f docker-compose.dev.yml up  # Development
```

## API Documentation

Swagger UI available at `/api/docs` when running locally.