import { ApiProperty } from '@nestjs/swagger';
import { HealthOperatorStatus } from '../../../../shared/domain/enums/health-operator-status.enum';

export class CreateHealthOperatorResponseDto {
  @ApiProperty({ description: 'ID da operadora', example: 'uuid-xxxx' })
  id: string;

  @ApiProperty({ description: 'Nome da operadora', example: 'Bradesco Saúde' })
  name: string;

  @ApiProperty({
    description: 'Status da operadora',
    enum: HealthOperatorStatus,
    example: HealthOperatorStatus.CADASTRADA,
  })
  status: HealthOperatorStatus;
}
