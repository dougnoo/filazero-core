# Development Guidelines - Trya Backend

## Code Quality Standards

### Formatting and Structure
- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Keep lines under 100 characters when practical
- **Semicolons**: Always use semicolons at statement ends
- **Quotes**: Single quotes for strings, except in JSON
- **Trailing Commas**: Use trailing commas in multi-line objects and arrays
- **Blank Lines**: Single blank line between methods, double blank line between classes

### Naming Conventions
- **Classes**: PascalCase (e.g., `CognitoAuthRepository`, `SignInUseCase`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IAuthRepository`, `IUserRepository`)
- **Methods/Functions**: camelCase (e.g., `getUserInfo`, `generateSecretHash`)
- **Variables**: camelCase (e.g., `accessToken`, `userPoolId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `USER_REPOSITORY_TOKEN`, `COGNITO_SYNC_SERVICE_TOKEN`)
- **Private Methods**: camelCase with `private` keyword (e.g., `private generateUsername()`)
- **Files**: kebab-case for files (e.g., `cognito-auth.repository.ts`, `sign-in.use-case.ts`)

### TypeScript Standards
- **Type Annotations**: Explicit return types on all public methods
- **Strict Null Checks**: Enabled - use `!` operator or null checks
- **Any Type**: Avoid `any` - use specific types or `unknown`
- **Optional Parameters**: Use `?` for optional parameters (e.g., `state?: string`)
- **Readonly**: Use `readonly` for class properties that don't change
- **Interfaces vs Types**: Prefer interfaces for object shapes, types for unions/intersections

## Architectural Patterns

### Clean Architecture Layers

#### Domain Layer
- **Entities**: Pure business objects with validation logic
  ```typescript
  export class User {
    private constructor(
      public readonly id: string,
      public readonly email: string,
      public readonly name: string,
      public readonly role: UserRole,
      public readonly tenantId: string,
    ) {}
    
    static create(...): User {
      // Validation logic here
      return new User(...);
    }
  }
  ```

- **Value Objects**: Immutable objects representing domain concepts
  ```typescript
  export class AuthTokens {
    private constructor(
      public readonly accessToken: string,
      public readonly refreshToken: string,
      public readonly idToken: string,
      public readonly expiresIn: number,
    ) {}
    
    static create(...): AuthTokens {
      return new AuthTokens(...);
    }
  }
  ```

- **Repository Interfaces**: Define contracts in domain
  ```typescript
  export interface IAuthRepository {
    signIn(credentials: Credentials): Promise<SignInResult>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    signOut(accessToken: string): Promise<void>;
  }
  ```

- **Dependency Injection Tokens**: String constants for DI
  ```typescript
  export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';
  export const COGNITO_SYNC_SERVICE_TOKEN = 'COGNITO_SYNC_SERVICE_TOKEN';
  ```

#### Application Layer
- **Use Cases**: Single responsibility business logic orchestration
  ```typescript
  @Injectable()
  export class SignInUseCase {
    constructor(
      @Inject(AUTH_REPOSITORY_TOKEN)
      private readonly authRepository: IAuthRepository,
    ) {}
    
    async execute(dto: SignInDto): Promise<SignInResultDto> {
      // Business logic here
    }
  }
  ```

- **DTOs**: Data transfer objects with validation decorators
  ```typescript
  export class SignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @MinLength(8)
    password: string;
    
    @IsOptional()
    @IsUUID()
    tenantId?: string;
  }
  ```

#### Infrastructure Layer
- **Repository Implementations**: Concrete data access implementations
  ```typescript
  @Injectable()
  export class CognitoAuthRepository implements IAuthRepository {
    private readonly cognitoClient: CognitoIdentityProviderClient;
    
    constructor(
      private readonly configService: ConfigService,
      private readonly userMapper: UserMapper,
    ) {
      // Initialize AWS clients
    }
    
    async signIn(credentials: Credentials): Promise<SignInResult> {
      // AWS Cognito implementation
    }
  }
  ```

- **Mappers**: Transform between layers
  ```typescript
  @Injectable()
  export class UserMapper {
    static toDomain(data: any): User {
      return User.create(...);
    }
    
    static toDto(user: User): UserDto {
      return { ... };
    }
  }
  ```

#### Presentation Layer
- **Controllers**: HTTP request handlers with decorators
  ```typescript
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly signInUseCase: SignInUseCase) {}
    
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    async login(@Body() dto: SignInDto) {
      return await this.signInUseCase.execute(dto);
    }
  }
  ```

- **Guards**: Route protection with clear order
  ```typescript
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
      // Check if route is public
      const isPublic = this.reflector.get<boolean>('isPublic', ...);
      if (isPublic) return true;
      
      return super.canActivate(context);
    }
  }
  ```

### Dependency Injection Pattern

#### Token-Based Injection
```typescript
// Define token in domain
export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

// Register in module
@Module({
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: CognitoUserRepository,
    },
  ],
})

// Inject in use case
constructor(
  @Inject(USER_REPOSITORY_TOKEN)
  private readonly userRepository: IUserRepository,
) {}
```

#### Service Injection
```typescript
// Direct class injection for services
constructor(
  private readonly configService: ConfigService,
  private readonly jwtService: JwtService,
) {}
```

## Error Handling

### Custom Domain Errors
```typescript
export class InvalidCredentialsError extends Error {
  constructor(message: string = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
```

### Error Handling in Repositories
```typescript
async signIn(credentials: Credentials): Promise<SignInResult> {
  try {
    // AWS operation
  } catch (error: any) {
    if (error.name === 'NotAuthorizedException') {
      throw new InvalidCredentialsError('Email or password incorrect');
    }
    if (error.name === 'UserNotConfirmedException') {
      throw new UserNotConfirmedError('Please confirm your email');
    }
    throw new AuthenticationError(`Authentication error: ${error.message}`);
  }
}
```

### Global Exception Filter
```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // Handle different error types
    if (exception instanceof HttpException) {
      // Handle HTTP exceptions
    } else {
      // Handle unknown errors
    }
  }
}
```

## AWS Integration Patterns

### AWS Client Configuration
```typescript
constructor(private readonly configService: ConfigService) {
  const profile = this.configService.get<string>('aws.profile');
  const accessKeyId = this.configService.get<string>('aws.credentials.accessKeyId');
  const secretAccessKey = this.configService.get<string>('aws.credentials.secretAccessKey');
  
  this.cognitoClient = new CognitoIdentityProviderClient({
    region: this.region,
    ...(profile ? { profile } : {}),
    ...(accessKeyId && secretAccessKey ? {
      credentials: { accessKeyId, secretAccessKey }
    } : {}),
  });
}
```

### AWS Command Pattern
```typescript
const command = new InitiateAuthCommand({
  AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
  ClientId: this.clientId,
  AuthParameters: authParams,
});

const response = await this.cognitoClient.send(command);
```

### AWS Error Handling
```typescript
catch (error: any) {
  if (error instanceof UserNotFoundException) {
    throw new UserNotFoundError();
  }
  if (error instanceof UsernameExistsException) {
    throw new UserAlreadyExistsError();
  }
  throw new Error(`AWS error: ${error.message}`);
}
```

## Multi-Tenancy Patterns

### Tenant ID Extraction
```typescript
// From JWT payload
const tenantId = user.tenantId;

// From header
@Headers('x-tenant-id') headerTenantId?: string

// From body
@Body() dto: { tenantId?: string }

// Merge strategy
private mergeTenantId(dto: { tenantId?: string }, headerTenantId?: string): void {
  if (headerTenantId && !dto.tenantId) {
    dto.tenantId = headerTenantId;
  }
}
```

### Tenant Guard
```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'] || request.body?.tenantId;
    
    // Validate tenant access
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Tenant access denied');
    }
    
    return true;
  }
}
```

### Tenant Filtering in Queries
```typescript
private buildFilter(filters: ListUsersFilters): string {
  const conditions: string[] = [];
  
  if (filters.tenantId) {
    conditions.push(`custom:tenant_id = "${filters.tenantId}"`);
  }
  
  return conditions.join(' AND ');
}
```

## Security Best Practices

### Authentication Flow
1. **JWT Validation**: Always validate JWT tokens in guards
2. **Refresh Token Rotation**: Use Cognito native rotation
3. **Role-Based Access**: Validate roles with RolesGuard
4. **Tenant Isolation**: Enforce tenant boundaries in all operations

### Password Management
```typescript
// Generate secure temporary password
private generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  // Implementation
}

// Validate password requirements
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
password: string;
```

### Token Management
```typescript
// Only BENEFICIARY gets refresh token
const isBeneficiary = user.role === 'BENEFICIARY';
const finalRefreshToken = isBeneficiary ? RefreshToken : '';

console.log('[signIn] Role:', user.role, '| Refresh token:', 
  isBeneficiary ? 'allowed' : 'blocked');
```

### Security Headers (in main.ts)
```typescript
app.use((req: any, res: any, next: any) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

## Logging and Debugging

### Console Logging Pattern
```typescript
// Structured logging with context
console.log('[methodName] Description:', {
  key1: value1,
  key2: value2,
});

// Success logging
console.log('✅ Operation successful:', details);

// Error logging
console.error('❌ Error occurred:', {
  name: error.name,
  message: error.message,
  code: error.code,
});

// Debug logging with emojis
console.log('🔍 Searching for user:', email);
console.log('📊 Query results:', results);
```

### Token Debugging
```typescript
console.log('[getUserInfo] Token received:', {
  length: accessToken?.length || 0,
  starts: accessToken?.substring(0, 20) || 'undefined',
  ends: accessToken?.substring(accessToken.length - 20) || 'undefined',
});
```

## API Documentation (Swagger)

### Controller Documentation
```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticates user via AWS Cognito. Supports multi-tenancy.'
  })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns JWT tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 428, description: 'New password required. OTP sent.' })
  async login(@Body() dto: SignInDto) {
    return await this.signInUseCase.execute(dto);
  }
}
```

### DTO Documentation
```typescript
export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string;
  
  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;
  
  @ApiPropertyOptional({ example: 'uuid-tenant-id', description: 'Tenant ID' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
```

## Module Organization

### Module Structure
```typescript
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, UserPlan]),
    AuthModule, // Import for guards and shared services
  ],
  controllers: [UserManagementController],
  providers: [
    // Use Cases
    CreateAdminUseCase,
    ListUsersUseCase,
    
    // Mappers
    UserMapper,
    
    // Services with tokens
    {
      provide: COGNITO_SYNC_SERVICE_TOKEN,
      useClass: CognitoSyncService,
    },
    
    // Repositories with tokens
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: CognitoUserRepository,
    },
  ],
  exports: [
    CreateAdminUseCase,
    UserMapper,
    USER_REPOSITORY_TOKEN,
  ],
})
export class UserManagementModule {}
```

## Template and Email Patterns

### Template Service Pattern
```typescript
@Injectable()
export class EmailTemplateService {
  private readonly templateCache = new Map<string, string>();
  
  constructor(private readonly configService: ConfigService) {
    this.templatesPath = __dirname;
  }
  
  getOtpEmailHtml(otp: string, greeting: string): string {
    const template = this.loadTemplate('first-login-email.html');
    return this.replaceVariables(template, {
      GREETING: greeting,
      OTP_CODE: otp,
      YEAR: new Date().getFullYear().toString(),
    });
  }
  
  private loadTemplate(fileName: string): string {
    if (this.templateCache.has(fileName)) {
      return this.templateCache.get(fileName)!;
    }
    
    const filePath = join(this.templatesPath, fileName);
    const content = readFileSync(filePath, 'utf-8');
    this.templateCache.set(fileName, content);
    
    return content;
  }
  
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}
```

## Testing Patterns

### Unit Test Structure
```typescript
describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;
  
  beforeEach(() => {
    authRepository = {
      signIn: jest.fn(),
    } as any;
    
    useCase = new SignInUseCase(authRepository);
  });
  
  it('should authenticate user successfully', async () => {
    // Arrange
    const dto = { email: 'test@example.com', password: 'Password123!' };
    authRepository.signIn.mockResolvedValue({ tokens: mockTokens, user: mockUser });
    
    // Act
    const result = await useCase.execute(dto);
    
    // Assert
    expect(result).toBeDefined();
    expect(authRepository.signIn).toHaveBeenCalledWith(expect.any(Credentials));
  });
});
```

## Configuration Management

### Nested Configuration
```typescript
export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    profile: process.env.AWS_PROFILE,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      region: process.env.COGNITO_REGION || 'us-east-1',
    },
  },
});
```

### Type-Safe Config Access
```typescript
this.userPoolId = this.configService.get<string>('aws.cognito.userPoolId')!;
this.region = this.configService.get<string>('aws.cognito.region', 'us-east-1');
```

## Common Code Idioms

### Optional Chaining and Nullish Coalescing
```typescript
const email = user.Attributes?.find(attr => attr.Name === 'email')?.Value;
const port = configService.get('app.port') ?? 3000;
```

### Spread Operator for Conditional Properties
```typescript
const config = {
  region: this.region,
  ...(profile ? { profile } : {}),
  ...(accessKeyId && secretAccessKey ? {
    credentials: { accessKeyId, secretAccessKey }
  } : {}),
};
```

### Array Methods for Data Transformation
```typescript
const users = (response.Users || []).map(user => 
  UserMapper.toDomain({
    id: user.Username,
    email: user.Attributes?.find(attr => attr.Name === 'email')?.Value,
  })
);
```

### Async/Await Pattern
```typescript
async execute(dto: SignInDto): Promise<SignInResultDto> {
  const credentials = Credentials.create(dto.email, dto.password);
  const result = await this.authRepository.signIn(credentials);
  return this.mapToDto(result);
}
```

## Performance Optimization

### Caching Strategy
```typescript
private readonly templateCache = new Map<string, string>();

private loadTemplate(fileName: string): string {
  if (this.templateCache.has(fileName)) {
    return this.templateCache.get(fileName)!;
  }
  // Load and cache
}
```

### Lazy Loading
```typescript
// Load templates on-demand, not at startup
getOtpEmailHtml(otp: string): string {
  const template = this.loadTemplate('otp-email.html');
  return this.replaceVariables(template, { OTP_CODE: otp });
}
```

### Efficient Queries
```typescript
// Use filters to reduce data transfer
const command = new ListUsersCommand({
  UserPoolId: this.userPoolId,
  Limit: 20,
  Filter: `custom:tenant_id = "${tenantId}"`,
});
```
