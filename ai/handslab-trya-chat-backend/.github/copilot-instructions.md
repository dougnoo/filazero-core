
# Copilot instructions for AI coding agents

## One-line goal
Build multi-tenant healthcare chat features with NestJS, AWS Bedrock, WebSockets, and multimodal input (text/audio/images) following Clean Architecture and this repo's concrete conventions.

## Big picture (architecture & data flows)

### Core Architecture
- **NestJS backend** with feature modules under `src/modules/` organized by Clean Architecture (domain/application/infrastructure/interfaces).
- **Multi-tenant WebSocket architecture**: Each tenant has isolated sessions, rate limits, and AWS Agent configs. See `TenantService` for tenant registry pattern (hardcoded Map, production would use DB).
- **Hybrid processing model** (AUDIO-ARCHITECTURE.md):
  - Text messages → Bedrock Agent (preserves context, functions, session history)
  - Audio messages → Amazon Transcribe → Bedrock Agent (transcribed text)
  - Images → Claude 3.5 Sonnet direct (multimodal vision, requires `medicalConsent`)

### Request Flow Examples
1. **WebSocket text**: Client → `ChatGateway` → `CleanChatService` → `AwsbedrockService.invokeForTenant()` → Bedrock Agent → response via `chat-response` event
2. **WebSocket audio**: Client sends base64 → `ChatGateway` → `TranscriptionService` → Transcribe Streaming → text → Bedrock Agent
3. **REST endpoint**: `POST /chat` → `ChatController` → `ChatService` → `AwsbedrockService.invoke()` → response through `TransformInterceptor`

### Multi-Tenancy Pattern
- Tenant validation via `TenantValidationMiddleware` (checks `x-tenant-id` header or `tenantId` in body/query).
- Per-tenant AWS Agent IDs, rate limits, and vector store namespaces defined in `TenantService`.
- WebSocket clients join `tenant-{tenantId}` rooms; sessions tracked in `SessionRepository` (in-memory implementation at `chat/infrastructure`).

## Key files to read first
- `src/main.ts` — bootstrap, global Zod validation pipe, static file serving for demo HTML pages.
- `src/modules/chat/chat.gateway.ts` — WebSocket lifecycle, tenant validation, heartbeat management, session creation.
- `src/modules/awsbedrock/awsbedrock.service.ts` — Bedrock Agent invocation, hybrid audio/text routing, rate limiting with `RateLimitService`, retry logic.
- `src/modules/chat/dto/new-message.dto.ts` — Zod schemas for message validation (text/audio/image/geolocation support).
- `src/modules/tenant/tenant.service.ts` — multi-tenant config registry (Map-based, see comments for production DB pattern).
- `AUDIO-ARCHITECTURE.md` — explains why audio uses Transcribe then Agent (not direct Claude audio API).

## Project conventions & patterns

### Clean Architecture Layers
- **domain/**: Pure entities and interfaces (e.g., `TenantSession`, `RateLimitConfig`, `ISessionRepository`). No NestJS imports.
- **application/**: Use cases and service orchestration (e.g., `BedrockService` in `awsbedrock/application/services/`).
- **infrastructure/**: Adapters for external systems (e.g., `BedrockClientAdapter`, `RateLimitService`, session repos). This is where AWS SDK clients live.
- **interfaces/**: DTOs and response shapes that cross boundaries.

### Validation & DTOs
- All DTOs use **Zod** via `nestjs-zod` (`createZodDto`). Example: `NewMessageDto` validates message/audio/image presence with `.refine()` chaining.
- Models enum in DTO: `["amazon.titan-text-lite-v1", "anthropic.claude-3-5-haiku-20241022-v1:0", "anthropic.claude-3-5-sonnet-20241022-v2:0"]`.
- Custom refinements: audio/image require corresponding mimeType; images require `medicalConsent: true`.

### Rate Limiting
- Configured via `BEDROCK_REQUESTS_PER_MINUTE` env var (default 4, dynamically converted to `requestDelayMs`).
- `RateLimitService` (infrastructure) enforces both global and per-tenant rate limits. Check `awsbedrock/infrastructure/rate-limit.service.ts` for queue pattern.
- Medical image analysis has separate rate limiting (4/min) in `MedicalImageService`.

### Path Aliases (tsconfig.json)
- `@helpers/*` → `src/helpers/*`
- `@middleware/*` → `src/middleware/*`
- `@modules/*` → `src/modules/*`
Always use these imports instead of relative paths across module boundaries.

### Response Shapes
- REST endpoints: `TransformInterceptor` wraps responses with `{ status, data, timestamp }`.
- WebSocket events: emit structured events like `chat-response`, `session-created`, `connection-error` with consistent payloads.

## Tests & mocks

### Running Tests
- Unit: `npm run test` (Jest, tests in `*.spec.ts` files)
- E2E: `npm run test:e2e` (Supertest against HTTP server, see `test/app.e2e-spec.ts`)
- Coverage: `npm run test:cov`

### Mocking AWS SDKs
- Use `aws-sdk-client-mock` to mock Bedrock/Transcribe clients. Example pattern in `awsbedrock.service.spec.ts` (currently minimal — expand when adding real integration tests).
- Mock `AwsbedrockService` in `ChatService` tests: `mockAwsbedrockService.invoke.mockResolvedValue({ answer: '...', model: '...' })`.
- **Never make live AWS calls in tests**. Mock at the client command level (`InvokeAgentCommand`, `InvokeModelCommand`, `StartStreamTranscriptionCommand`).

## Developer workflows

### Local Development
```bash
npm install
npm run start:dev  # Hot reload on port 3000
```
Demo pages: http://localhost:3000/chat-with-audio.html, `/chat-websocket.html`, `/chat-debug.html`, `/setup-transcribe.html`

### Docker
- Dev: `npm run docker:dev` (docker-compose with hot reload)
- Prod: `npm run docker:prod` (docker-compose.prod.yml with optimized build)
- Logs: `npm run docker:logs`
- Stop: `npm run docker:stop`
See `DOCKER.md` for AWS ECS/EC2/Lambda deployment patterns.

### Environment Variables
Required for AWS integration:
- `AWS_REGION`, `AWS_PROFILE` (local only), `AWS_RUNTIME` (local/aws)
- `AWS_AGENT_ID`, `AWS_AGENT_ALIAS_ID` (Bedrock Agent)
- Optional: `AWS_AGENT_ID_TENANT_1`, `AWS_AGENT_ALIAS_ID_TENANT_1` (per-tenant overrides)
- `BEDROCK_REQUESTS_PER_MINUTE` (rate limit, default 4)
- `PORT` (default 3000)

### Linting & Formatting
```bash
npm run lint       # ESLint with auto-fix
npm run format     # Prettier
```

## Common tasks checklist

### Add a new chat model
1. Update enum in `dto/new-message.dto.ts` Zod schema.
2. Add model mapping in `chat.service.ts` or `chat.gateway.ts` if special handling needed.
3. Add unit test case in `chat.service.spec.ts` with mocked Bedrock response.

### Add a new tenant
1. Add entry to `TenantService.tenants` Map with `awsAgentId`, `awsAgentAliasId`, rate limits, plan.
2. Optionally add env vars `AWS_AGENT_ID_TENANT_X` for per-tenant AWS resources.
3. Test WebSocket connection with `?tenantId=tenant-new` query param.

### Add new audio/image processing
1. Update `NewMessageDto` schema if new fields needed (e.g., video mimeType).
2. Modify `AwsbedrockService.invoke()` or `invokeForTenant()` to detect new media type and route accordingly (see hybrid model pattern).
3. If calling a new AWS service, create adapter in `awsbedrock/infrastructure/` or new module.
4. Update `AUDIO-ARCHITECTURE.md` or add new doc in `docs/`.

### Implement new WebSocket event
1. Add `@SubscribeMessage('new-event')` handler in `ChatGateway`.
2. Validate incoming data against Zod DTO (can reuse `NewMessageDto` or create new).
3. Emit response with `client.emit('response-event', payload)` or `this.server.to(room).emit(...)`.
4. Document event in gateway comments or `docs/` markdown.

## Editing & testing tips for AI agents

- **Respect module boundaries**: Keep changes within a module's folder (chat, awsbedrock, tenant, etc.). Cross-module calls go through public interfaces exported in `index.ts` barrel files.
- **Test after edits**: Run `npm run test` and `npm run test:e2e`. Fix any TypeScript/ESLint errors before committing.
- **Mock AWS clients thoroughly**: Use `aws-sdk-client-mock` patterns. Check existing tests for reference.
- **Path aliases**: When adding new modules or moving files, update `tsconfig.json` paths and `package.json` Jest `moduleNameMapper`.
- **WebSocket debugging**: Use browser console with demo HTML pages. Check `ChatGateway` logs for connection/session lifecycle.
- **Rate limiting**: Test with low `BEDROCK_REQUESTS_PER_MINUTE` (e.g., 2) to see queueing behavior. Check `/chat/rate-limit-status` endpoint.

## Additional resources
- **Transcription details**: `docs/realtime-transcription.md` (Amazon Transcribe Streaming configuration, event types)
- **Docker deployment**: `DOCKER.md` (ECS, EC2, Lambda patterns)
- **Medical images**: `src/modules/medical-image/README.md` (triaging, consent requirements)
