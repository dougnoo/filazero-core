import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  otp: {
    storage: process.env.OTP_STORAGE || 'memory',
  },
  notification: {
    service: process.env.NOTIFICATION_SERVICE || 'console',
  },
  parentApi: {
    apiKey: process.env.TRYA_PLATFORM_API_KEY || 'default-parent-api-key',
  },
  chatApi: {
    apiKey: process.env.TENANT_CHAT_API_KEY || 'default-tenant-api-key',
  },
  contact: {
    toEmail: process.env.CONTACT_TO_EMAIL || 'contato@trya.health',
  },
  tryaPlatform: {
    apiUrl: process.env.TRYA_PLATFORM_API_URL,
    apiKey: process.env.TRYA_PLATFORM_API_KEY,
  },
}));
