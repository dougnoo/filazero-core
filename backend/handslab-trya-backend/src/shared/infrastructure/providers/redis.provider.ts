import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT_TOKEN,
  useFactory: async (
    configService: ConfigService,
  ): Promise<RedisClientType | null> => {
    const host = configService.get<string>('aws.elasticache.host');
    const port = configService.get<number>('aws.elasticache.port');
    const tls = configService.get<boolean>('aws.elasticache.tls');

    // Se não configurado, retorna null (graceful degradation)
    if (!host) {
      console.log('⚠️ ElastiCache não configurado - usando apenas DynamoDB');
      return null;
    }

    try {
      const client = createClient({
        socket: {
          host,
          port,
          connectTimeout: 5000,
          reconnectStrategy: false,
          ...(tls
            ? {
                tls: true,
                rejectUnauthorized: false,
              }
            : {}),
        },
      });

      client.on('error', (err) => {
        console.error('❌ ElastiCache error:', err.message);
      });

      client.on('ready', () => {
        console.log('✅ ElastiCache conectado e pronto');
      });

      await client.connect();

      return client as RedisClientType;
    } catch (error) {
      console.warn('⚠️ ElastiCache não disponível:', error);
      console.warn('💡 Sistema continuará funcionando usando apenas DynamoDB');

      return null;
    }
  },
  inject: [ConfigService],
};
