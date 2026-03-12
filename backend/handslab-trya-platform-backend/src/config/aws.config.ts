import { registerAs } from '@nestjs/config';
import {
  getBucketForTenant,
  getBucketUrl,
  getPlatformBucket,
} from './buckets.config';

// Re-export bucket utilities for convenience
export { getBucketForTenant, getBucketUrl, getPlatformBucket };

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
  const region = process.env.AWS_REGION || 'us-east-1';

  return {
    region,
    profile: process.env.AWS_PROFILE,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    cognito: {
      // Cognito pode estar em região diferente (ex: us-east-1) do restante da app (ex: sa-east-1)
      region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
    },
    ses: {
      region,
      fromEmail: process.env.AWS_SES_FROM_EMAIL,
      fromName: process.env.AWS_SES_FROM_NAME,
    },
    s3: {
      // Bucket principal da plataforma (profile pictures, uploads)
      bucketName: process.env.AWS_S3_BUCKET_NAME || `trya-platform-assets-${env}`,
      region,
    },
  };
});
