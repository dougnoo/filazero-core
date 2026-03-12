import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { SendContactMessageUseCase } from '../../application/use-cases/send-contact-message.use-case';
import {
  SendContactMessageDto,
  SendContactMessageResponseDto,
} from '../dtos/send-contact-message.dto';

@ApiTags('contact')
@Controller('contact')
@ApiBearerAuth('JWT-auth')
export class ContactController {
  constructor(
    private readonly sendContactMessageUseCase: SendContactMessageUseCase,
  ) {}

  @Post()
  @Roles(UserRole.BENEFICIARY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar mensagem de contato',
    description:
      'Permite que beneficiários enviem mensagens de contato/dúvidas para a Trya.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensagem enviada com sucesso',
    type: SendContactMessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (não é beneficiário)' })
  async sendMessage(
    @Body() dto: SendContactMessageDto,
    @CurrentUser() user: User,
  ): Promise<SendContactMessageResponseDto> {
    return await this.sendContactMessageUseCase.execute({
      dto,
      userName: user.name,
      userEmail: user.email,
      tenantId: user.tenantId,
    });
  }
}
