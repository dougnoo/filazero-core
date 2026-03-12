import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const DYNAMODB_CLIENT_TOKEN = 'DYNAMODB_CLIENT';

export const DynamoDBProvider: Provider = {
  provide: DYNAMODB_CLIENT_TOKEN,
  useFactory: (configService: ConfigService) => {
    const region = configService.get<string>('aws.region');
    const endpointUrl = configService.get<string>('aws.endpointUrl');
    const profile = configService.get<string>('aws.profile');
    const accessKeyId = configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    const client = new DynamoDBClient({
      region,
      ...(endpointUrl
        ? {
            endpoint: endpointUrl,
            credentials: { accessKeyId: accessKeyId || 'test', secretAccessKey: secretAccessKey || 'test' },
          }
        : {
            ...(profile ? { profile } : {}),
            ...(accessKeyId && secretAccessKey
              ? {
                  credentials: { accessKeyId, secretAccessKey },
                }
              : {}),
          }),
    });

    return DynamoDBDocumentClient.from(client);
  },
  inject: [ConfigService],
};
