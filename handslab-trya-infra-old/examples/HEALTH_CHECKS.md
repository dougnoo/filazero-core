# Exemplos de Health Check Endpoints

## Backend (NestJS)

### src/health/health.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check database connection
      () => this.db.pingCheck('database'),
    ]);
  }

  // Simple liveness probe
  @Get('live')
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // Readiness probe
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### Instalar dependências:

```bash
npm install --save @nestjs/terminus @nestjs/typeorm
```

## Frontend (Next.js)

### pages/api/health.ts (se usar API routes)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'

type HealthResponse = {
  status: string
  timestamp: string
  environment: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENV || 'unknown'
  })
}
```

### public/health.html (para static export)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
</head>
<body>
    <h1>OK</h1>
    <script>
        document.write(new Date().toISOString());
    </script>
</body>
</html>
```

## Testando

```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost:3001/api/health
# ou
curl http://localhost:3001/health.html
```
