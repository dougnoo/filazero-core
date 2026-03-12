import { registerAs } from '@nestjs/config';
import { getBucketForTenant, getBucketUrl } from './buckets.config';

// Re-export bucket utilities for convenience
export { getBucketForTenant, getBucketUrl };

type BucketEnvironment = 'dev' | 'hml' | 'prod';

function getEnvSuffix(): BucketEnvironment {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envMap: Record<string, BucketEnvironment> = {
    development: 'dev',
    staging: 'hml',
    production: 'prod',
  };
  return envMap[nodeEnv] || 'dev';
}

export default registerAs('aws', () => {
  const env = getEnvSuffix();

  const localstackEndpoint = process.env.LOCALSTACK_ENDPOINT_URL;

  return {
    region: process.env.AWS_REGION || 'us-east-1',
    endpointUrl: localstackEndpoint || undefined,
    profile: process.env.AWS_PROFILE, // Profile do AWS SSO
    credentials: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID ||
        (localstackEndpoint ? 'test' : undefined),
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY ||
        (localstackEndpoint ? 'test' : undefined),
    },
    dynamodb: {
      tenantsTable: process.env.DYNAMODB_TENANTS_TABLE || 'trya-tenants',
      usersTable: process.env.DYNAMODB_USERS_TABLE || 'trya-users',
      triageTable: process.env.DYNAMODB_TRIAGE_TABLE || 'trya-triage',
      medicalRecordsTable:
        process.env.DYNAMODB_MEDICAL_RECORDS_TABLE || 'trya-medical-records',
      otpTableName: process.env.DYNAMODB_OTP_TABLE_NAME || 'trya-otp',
      configTable: process.env.DYNAMODB_CONFIG_TABLE || 'trya-config',
      sessionsTable:
        process.env.DYNAMODB_SESSIONS_TABLE || `triagem-sessions-${env}`,
    },
    s3: {
      // Bucket principal (legado - usar buckets.config.ts para novos usos)
      bucketName: process.env.S3_BUCKET_NAME || `trya-assets-${env}`,
      bucketChatName: process.env.S3_BUCKET_CHAT_NAME || `trya-chat-${env}`,
      bucketRegion: process.env.S3_BUCKET_REGION || 'us-east-1',
      // URL pública para S3 (LocalStack/Docker: browser usa localhost:4566)
      publicUrl: process.env.S3_PUBLIC_URL,
    },
    cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      region: process.env.COGNITO_REGION || 'us-east-1',
      domain: process.env.COGNITO_DOMAIN,
      redirectUri:
        process.env.COGNITO_REDIRECT_URI ||
        'http://localhost:3000/auth/callback',
      endpointUrl: process.env.COGNITO_ENDPOINT_URL,
    },
    bedrock: {
      modelId:
        process.env.BEDROCK_MODEL_ID ||
        'anthropic.claude-3-haiku-20240307-v1:0',
      faqModelId:
        process.env.BEDROCK_FAQ_MODEL_ID ||
        'anthropic.claude-3-haiku-20240307-v1:0',
      region: process.env.BEDROCK_REGION || 'us-east-1',
    },
    ses: {
      fromEmail: process.env.SES_FROM_EMAIL || 'noreply@trya.health',
      fromName: process.env.SES_FROM_NAME || 'HandsLab',
      region: process.env.SES_REGION || 'us-east-1',
    },
    sns: {
      region: process.env.SNS_REGION || 'us-east-1',
    },
    lambda: {
      chatFunction:
        process.env.LAMBDA_CHAT_FUNCTION_NAME || 'trya-chat-function',
    },
    elasticache: {
      host: process.env.ELASTICACHE_HOST,
      port: parseInt(process.env.ELASTICACHE_PORT || '6379', 10),
      tls: process.env.ELASTICACHE_TLS === 'true',
    },
    opensearch: {
      enabled: process.env.OPENSEARCH_ENABLED === 'true',
      endpoint: process.env.OPENSEARCH_ENDPOINT,
      region: process.env.OPENSEARCH_REGION || 'us-east-1',
    },
  };
});
