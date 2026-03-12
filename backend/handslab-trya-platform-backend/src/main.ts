import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/presentation/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Increase body size limit for large file uploads (50MB)
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Get config service
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get('app.environment', 'development');

  // Security: Force HTTPS in production (only behind a proxy like ALB, CloudFront, Nginx)
  if (nodeEnv === 'production') {
    app.use((req: any, res: any, next: any) => {
      // Só redireciona se x-forwarded-proto existir (indica que está atrás de um proxy)
      // E se não for HTTPS
      const forwardedProto = req.header('x-forwarded-proto');
      if (forwardedProto && forwardedProto !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Security: Add security headers
  app.use((req: any, res: any, next: any) => {
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

  // Enable CORS with explicit configuration
  const corsOrigin = configService.get(
    'app.cors.origin',
    'http://localhost:3000',
  );
  const corsCredentials = configService.get('app.cors.credentials', true);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // In development, allow all localhost origins
      if (nodeEnv === 'development' && origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      if (nodeEnv !== 'production' && origin.endsWith('.trya.ai')) {
        return callback(null, true);
      }

      // Check if origin is allowed
      const allowedOrigins = corsOrigin.split(',').map((o: string) => o.trim());
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 3600, // Cache preflight requests for 1 hour
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

  // Get port from config
  const port = configService.get('app.port', 3000);

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Trya Platform API')
    .setDescription(
      'Healthcare platform administration system API with AWS Cognito and Clean Architecture',
    )
    .setVersion('1.0')
    .addTag('Health', 'Health checks e status')
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Users', 'Usuários')
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
    .addServer(`http://localhost:${port}`, 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs/json',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Trya Platform API Docs',
  });

  await app.listen(port);

  console.log('');
  console.log('🚀 Application is running!');
  console.log(`API: http://localhost:${port}/api`);
  console.log(`Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`Environment: ${nodeEnv}`);
  console.log('');

  if (nodeEnv === 'production') {
    console.log('✅ Security headers enabled');
    console.log('✅ HTTPS enforcement enabled (behind proxy)');
  }
}
bootstrap();
