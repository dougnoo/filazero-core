import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/presentation/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import { Request, Response, NextFunction } from 'express';

interface HttpsOptions {
  key: Buffer;
  cert: Buffer;
}

async function bootstrap(): Promise<void> {
  // Verificar se certificados SSL existem (para HTTPS local em desenvolvimento)
  const certPath = path.join(__dirname, '..', 'certs', 'localhost+2.pem');
  const keyPath = path.join(__dirname, '..', 'certs', 'localhost+2-key.pem');

  let httpsOptions: HttpsOptions | undefined = undefined;
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  // Get config service
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.environment', 'development');

  // Debug middleware para login
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      console.log('[DEBUG MIDDLEWARE] Raw body:', JSON.stringify(req.body));
    }
    next();
  });

  // Security: Force HTTPS in production (only behind a proxy like ALB, CloudFront, Nginx)
  if (nodeEnv === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Só redireciona se x-forwarded-proto existir (indica que está atrás de um proxy)
      // E se não for HTTPS
      const forwardedProto = req.header('x-forwarded-proto');
      if (forwardedProto && forwardedProto !== 'https') {
        res.redirect(`https://${req.header('host') ?? ''}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Security: Add security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    // HSTS - Force HTTPS for 1 year
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Enable CORS
  const corsOrigin = configService.get<string>(
    'app.cors.origin',
    'http://localhost:3000',
  );
  // Permitir múltiplas origens (separadas por vírgula) ou uma única origem
  const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
  // Verificar se wildcard está habilitado
  const allowAllOrigins = allowedOrigins.includes('*');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir requisições sem origem (ex: Postman, mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Permitir localhost em qualquer ambiente (útil quando frontend dev roda em porta dinâmica, ex: 3001)
      // Observação: isso só afeta browsers (CORS) e não abre acesso server-to-server.
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:')
      ) {
        callback(null, true);
        return;
      }
      if (
        origin.startsWith('http://127.') ||
        origin.startsWith('https://127.')
      ) {
        callback(null, true);
        return;
      }
      // Se wildcard '*' está configurado, permitir todas as origens
      if (allowAllOrigins) {
        callback(null, true);
        return;
      }
      // Verificar se a origem está na lista de permitidas
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Permitir qualquer subdomínio de trya.ai
      if (origin.endsWith('.trya.ai')) {
        callback(null, true);
        return;
      }
      // Em desenvolvimento, permitir localhost em qualquer porta
      if (
        nodeEnv === 'development' &&
        (origin.startsWith('http://localhost:') ||
          origin.startsWith('https://localhost:') ||
          origin.startsWith('http://127.') ||
          origin.startsWith('https://127.'))
      ) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: configService.get<boolean>('app.cors.credentials', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Id',
      'x-tenant-id',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Trya API - HandsLab')
    .setDescription(
      'API REST para gestão hospitalar multi-tenant com AWS Cognito, DynamoDB e Clean Architecture',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('health', 'Health checks e status')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT obtido no login',
        name: 'Authorization',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development HTTP')
    .addServer('https://localhost:3000', 'Development HTTPS')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Trya API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Get port from config
  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);

  const protocol = httpsOptions ? 'https' : 'http';
  console.log('');
  console.log('🚀 Application is running!');
  console.log(`📍 API: ${protocol}://localhost:${port}/api`);
  console.log(`📚 Swagger Docs: ${protocol}://localhost:${port}/api/docs`);
  console.log(`🔒 Environment: ${nodeEnv}`);
  console.log('');

  if (httpsOptions) {
    console.log('HTTPS enabled with local certificates');
  }

  if (nodeEnv === 'production') {
    console.log('Security headers enabled');
    console.log('HTTPS enforcement enabled');
  }
}

void bootstrap();
