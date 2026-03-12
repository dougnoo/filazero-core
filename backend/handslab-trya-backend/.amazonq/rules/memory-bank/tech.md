# Technology Stack - Trya Backend

## Core Technologies

### Runtime & Language
- **Node.js**: JavaScript runtime
- **TypeScript 5.7.3**: Statically typed JavaScript
  - Target: ES2023
  - Module: NodeNext
  - Strict null checks enabled
  - Decorator support enabled

### Framework
- **NestJS 11.0.1**: Progressive Node.js framework
  - Modular architecture
  - Dependency injection
  - Decorator-based routing
  - Built-in testing support

## AWS Services Integration

### Authentication
- **AWS Cognito**: User authentication and management
  - User pools for authentication
  - JWT token generation
  - MFA support
  - OAuth 2.0 flows

### Database
- **AWS DynamoDB**: NoSQL database
  - Multi-tenant data storage
  - Scalable performance
  - Document-based storage
- **PostgreSQL (via TypeORM)**: Relational database
  - User and beneficiary data
  - Health plans and operators
  - Structured healthcare data

### Storage & Communication
- **AWS S3**: Object storage for files and images
- **AWS SES**: Email service for notifications
- **AWS Bedrock**: AI services for healthcare triage

## Key Dependencies

### NestJS Ecosystem
- `@nestjs/common` 11.0.1 - Core framework
- `@nestjs/core` 11.0.1 - Core functionality
- `@nestjs/config` 4.0.2 - Configuration management
- `@nestjs/jwt` 11.0.1 - JWT utilities
- `@nestjs/passport` 11.0.5 - Authentication strategies
- `@nestjs/platform-express` 11.0.1 - Express adapter
- `@nestjs/swagger` 11.2.1 - API documentation
- `@nestjs/typeorm` 11.0.0 - TypeORM integration

### AWS SDK
- `@aws-sdk/client-cognito-identity-provider` 3.914.0
- `@aws-sdk/client-dynamodb` 3.914.0
- `@aws-sdk/client-s3` 3.917.0
- `@aws-sdk/client-ses` 3.914.0
- `@aws-sdk/lib-dynamodb` 3.914.0

### Database & ORM
- `typeorm` 0.3.20 - ORM for TypeScript
- `pg` 8.13.1 - PostgreSQL client

### Authentication & Security
- `passport` 0.7.0 - Authentication middleware
- `passport-jwt` 4.0.1 - JWT strategy
- `bcrypt` 6.0.0 - Password hashing

### Validation & Transformation
- `class-validator` 0.14.2 - DTO validation
- `class-transformer` 0.5.1 - Object transformation

### Utilities
- `axios` 1.12.2 - HTTP client
- `rxjs` 7.8.1 - Reactive programming
- `reflect-metadata` 0.2.2 - Metadata reflection

### API Documentation
- `swagger-ui-express` 5.0.1 - Swagger UI

## Development Tools

### Code Quality
- **ESLint 9.18.0**: Linting
  - `@eslint/js` 9.18.0
  - `@eslint/eslintrc` 3.2.0
  - `typescript-eslint` 8.20.0
  - `eslint-config-prettier` 10.0.1
  - `eslint-plugin-prettier` 5.2.2
- **Prettier 3.4.2**: Code formatting
  - Configuration in `.prettierrc`

### Testing
- **Jest 30.0.0**: Testing framework
  - `ts-jest` 29.2.5 - TypeScript support
  - `@nestjs/testing` 11.0.1 - NestJS testing utilities
  - `supertest` 7.0.0 - HTTP assertions

### Build Tools
- **TypeScript Compiler**: Transpilation
- **ts-node 10.9.2**: TypeScript execution
- **ts-loader 9.5.2**: Webpack TypeScript loader
- **tsconfig-paths 4.2.0**: Path mapping support

### Type Definitions
- `@types/express` 5.0.0
- `@types/jest` 30.0.0
- `@types/node` 22.10.7
- `@types/passport-jwt` 4.0.1
- `@types/bcrypt` 6.0.0
- `@types/supertest` 6.0.2

## Development Commands

### Application Lifecycle
```bash
npm run start          # Start application
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger
npm run start:prod     # Start production build
npm run build          # Build for production
```

### Code Quality
```bash
npm run format         # Format code with Prettier
npm run lint           # Lint and fix with ESLint
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:debug     # Run tests with debugger
npm run test:e2e       # Run end-to-end tests
```

### Database Operations
```bash
# Migrations
npm run typeorm:migration:generate  # Generate migration
npm run typeorm:migration:run       # Run migrations
npm run typeorm:migration:revert    # Revert last migration

# Seeds
npm run seed:tenants               # Seed tenants (required first)
npm run seed:chronic-conditions    # Seed chronic conditions
npm run seed:medications           # Seed medications
npm run seed:health-operators      # Seed health operators
npm run seed:health-plans          # Seed health plans
npm run seed:initial-config        # Seed initial configuration
npm run seed:all                   # Run all seeds in order
```

## Build Configuration

### TypeScript Config
- **Module System**: NodeNext (ESM support)
- **Target**: ES2023
- **Decorators**: Enabled (experimental)
- **Source Maps**: Enabled
- **Output**: `./dist`
- **Strict Checks**: Partial (null checks enabled)

### NestJS CLI Config
- Configuration in `nest-cli.json`
- Source root: `src`
- Compiler: TypeScript
- Asset watching enabled

### Jest Config
- Test regex: `.*\.spec\.ts$`
- Transform: ts-jest
- Coverage directory: `coverage/`
- Test environment: Node

## Docker Support

### Images
- **Development**: `Dockerfile.dev` with hot reload
- **Production**: `Dockerfile` with optimized build

### Compose Files
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development with volume mounts
- `docker-compose.local.yml` - Local testing

### Helper Scripts
- `docker.bat` - Windows Docker commands

## Environment Variables

### Application
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - CORS allowed origins

### AWS Configuration
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Cognito
- `COGNITO_USER_POOL_ID` - User pool ID
- `COGNITO_CLIENT_ID` - App client ID
- `COGNITO_CLIENT_SECRET` - App client secret
- `COGNITO_REGION` - Cognito region

### Database
- `DYNAMODB_TENANTS_TABLE` - Tenants table name
- `DYNAMODB_USERS_TABLE` - Users table name
- TypeORM connection settings for PostgreSQL

## API Documentation

### Swagger/OpenAPI
- **Endpoint**: `/api/docs`
- **Features**:
  - Interactive API testing
  - JWT authentication support
  - Request/response schemas
  - Example payloads
  - Endpoint grouping by module

## Performance & Optimization

### Production Optimizations
- Compiled TypeScript output
- Minified bundles
- Source map generation
- Dead code elimination
- Tree shaking enabled

### Caching Strategies
- JWT token caching
- Configuration caching
- Repository-level caching support
