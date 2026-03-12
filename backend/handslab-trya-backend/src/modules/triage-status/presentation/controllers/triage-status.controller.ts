import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetTriageValidationStatusUseCase } from '../../application/use-cases/get-triage-validation-status.use-case';
import { TriageValidationStatusResponseDto } from '../../application/dtos/triage-validation-status-response.dto';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@ApiTags('triage-status')
@Controller('triage-status')
@Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
export class TriageStatusController {
  constructor(
    private readonly getTriageValidationStatusUseCase: GetTriageValidationStatusUseCase,
  ) {}

  @Get('validation')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter status de validação médica da triagem',
    description:
      'Retorna o status atual da validação médica da última triagem do usuário. ' +
      'Inclui informações sobre o médico responsável, se houver.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status de validação retornado com sucesso',
    type: TriageValidationStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getValidationStatus(
    @CurrentUser() user: User,
  ): Promise<TriageValidationStatusResponseDto> {
    return this.getTriageValidationStatusUseCase.execute(
      user.id,
      user.tenantId,
    );
  }
}
