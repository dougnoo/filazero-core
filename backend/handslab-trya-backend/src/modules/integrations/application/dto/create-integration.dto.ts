import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationType } from '../../domain/enums/integration-type.enum';
import { IntegrationProvider } from '../../domain/enums/integration-provider.enum';

export class CreateIntegrationDto {
  @ApiPropertyOptional({ example: 'padrao', description: 'Integration alias' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({ enum: IntegrationProvider, example: IntegrationProvider.ZELO })
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @ApiProperty({ enum: IntegrationType, example: IntegrationType.TELEMEDICINE })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiProperty({
    example: 'your-api-key-here',
    description: 'API Key for integration',
  })
  @IsNotEmpty()
  @IsString()
  apiKey: string;
}
