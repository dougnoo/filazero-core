import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PublicConfigController } from './presentation/controllers/public-config.controller';
import { GetBrokerThemeUseCase } from './application/use-cases/get-broker-theme/get-broker-theme.use-case';
import { DynamoConfigRepository } from './infrastructure/repositories/dynamo-config.repository';
import { CONFIG_REPOSITORY_TOKEN } from './domain/repositories/config.repository.token';
import { ImageBase64ConverterService } from './infrastructure/services/image-base64-converter.service';

@Module({
  imports: [ConfigModule],
  controllers: [PublicConfigController],
  providers: [
    // Use Cases
    GetBrokerThemeUseCase,

    // Services
    ImageBase64ConverterService,

    // Repositories
    {
      provide: CONFIG_REPOSITORY_TOKEN,
      useClass: DynamoConfigRepository,
    },
  ],
  exports: [GetBrokerThemeUseCase, CONFIG_REPOSITORY_TOKEN],
})
export class PublicConfigModule {}
