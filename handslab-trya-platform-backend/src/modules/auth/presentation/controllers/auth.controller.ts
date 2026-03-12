import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SignInUseCase } from '../../application/use-cases/sign-in/sign-in.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password/forgot-password.use-case';
import { ConfirmForgotPasswordUseCase } from '../../application/use-cases/confirm-forgot-password/confirm-forgot-password.use-case';
import { CompleteNewPasswordUseCase } from '../../application/use-cases/complete-new-password/complete-new-password.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile/update-profile.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/verify-otp/verify-otp.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password/change-password.use-case';
import { UpdatePasswordUseCase } from '../../application/use-cases/update-password/update-password.use-case';
import { SignInDto } from '../../application/use-cases/sign-in/sign-in.dto';
import { SignInResponseDto } from '../../application/use-cases/sign-in/sign-in-response.dto';
import { RefreshTokenDto } from '../../application/use-cases/refresh-token/refresh-token.dto';
import { RefreshTokenResponseDto } from '../../application/use-cases/refresh-token/refresh-token-response.dto';
import { ForgotPasswordDto } from '../../application/use-cases/forgot-password/forgot-password.dto';
import { ConfirmForgotPasswordDto } from '../../application/use-cases/confirm-forgot-password/confirm-forgot-password.dto';
import { CompleteNewPasswordDto } from '../../application/use-cases/complete-new-password/complete-new-password.dto';
import { CompleteNewPasswordResponseDto } from '../../application/use-cases/complete-new-password/complete-new-password-response.dto';
import { ProfileResponseDto } from '../../application/use-cases/get-current-user/profile-response.dto';
import { UpdateAdminProfileDto } from '../../application/use-cases/update-profile/update-admin-profile.dto';
import { UpdateDoctorProfileDto } from '../../application/use-cases/update-profile/update-doctor-profile.dto';
import { VerifyOtpDto } from '../../application/use-cases/verify-otp/verify-otp.dto';
import { VerifyOtpResponseDto } from '../../application/use-cases/verify-otp/verify-otp-response.dto';
import { ChangePasswordDto } from '../../application/use-cases/change-password/change-password.dto';
import { UpdatePasswordDto } from '../../application/use-cases/update-password/update-password.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AccessToken } from '../decorators/access-token.decorator';
import { NewPasswordRequiredFilter } from '../filters/new-password-required.filter';
import type { JwtUser } from '../../domain/interfaces/jwt-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
    private readonly completeNewPasswordUseCase: CompleteNewPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UseFilters(NewPasswordRequiredFilter)
  @ApiOperation({
    summary: 'Fazer login com email e senha',
    description:
      'Autentica um usuário existente usando email e senha. Retorna tokens JWT para acesso à API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticado com sucesso. Retorna tokens de acesso e refresh.',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos ou erro de validação.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas. Email ou senha incorretos.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Email não confirmado. O usuário precisa verificar o email antes de fazer login.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: 428,
    description:
      'Nova senha requerida. Retorna session para completar o desafio.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 428 },
        message: { type: 'string', example: 'New password required' },
        challengeName: { type: 'string', example: 'NEW_PASSWORD_REQUIRED' },
        session: { type: 'string', example: 'AYABeD...' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async signIn(@Body() dto: SignInDto): Promise<SignInResponseDto> {
    return this.signInUseCase.execute(dto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar token de acesso',
    description:
      'Gera um novo token de acesso usando o refresh token. Permite manter a sessão do usuário sem fazer login novamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso. Retorna novos tokens.',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado.',
  })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar reset de senha',
    description:
      'Inicia o processo de recuperação de senha. Um código OTP de 6 dígitos será enviado para o email do usuário.',
  })
  @ApiResponse({
    status: 200,
    description: 'Código OTP de reset de senha enviado por email.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Public()
  @Post('confirm-forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar reset de senha com código OTP',
    description:
      'Completa o processo de recuperação de senha usando o código OTP de 6 dígitos enviado por email e define uma nova senha. O código OTP é validado antes de confirmar a nova senha.',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso. O usuário pode fazer login.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Código OTP inválido, expirado, ou senha não atende aos requisitos de complexidade.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async confirmForgotPassword(
    @Body() dto: ConfirmForgotPasswordDto,
  ): Promise<void> {
    return this.confirmForgotPasswordUseCase.execute(dto);
  }

  @Public()
  @Post('complete-new-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar troca de senha obrigatória',
    description:
      'Completa o desafio NEW_PASSWORD_REQUIRED após primeiro login com senha temporária. Requer validação de código OTP enviado por email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso. Retorna tokens JWT.',
    type: CompleteNewPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Session inválida, OTP inválido/expirado ou senha não atende aos requisitos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
  })
  async completeNewPassword(
    @Body() dto: CompleteNewPasswordDto,
  ): Promise<CompleteNewPasswordResponseDto> {
    return this.completeNewPasswordUseCase.execute(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código OTP',
    description:
      'Valida um código OTP de 6 dígitos enviado por email. Usado para primeiro acesso ou redefinição de senha.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP válido.',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Código OTP inválido ou expirado.',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.verifyOtpUseCase.execute(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter informações do usuário atual',
    description:
      'Retorna as informações de perfil do usuário autenticado com campos específicos baseados na role. ' +
      'ADMIN recebe campos básicos (id, email, name, role, phone, active, createdAt, updatedAt). ' +
      'DOCTOR recebe os mesmos campos básicos mais campos adicionais (crm, specialty).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Informações do usuário obtidas com sucesso. ' +
      'Para ADMIN: retorna apenas campos básicos. ' +
      'Para DOCTOR: retorna campos básicos + crm e specialty.',
    type: ProfileResponseDto,
    schema: {
      oneOf: [
        {
          title: 'Admin Profile',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '01234567-89ab-cdef-0123-456789abcdef',
            },
            email: { type: 'string', example: 'admin@trya.com' },
            name: { type: 'string', example: 'João Silva' },
            role: { type: 'string', example: 'ADMIN' },
            phone: {
              type: 'string',
              example: '+5511999999999',
              nullable: true,
            },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            profilePictureUrl: {
              type: 'string',
              example:
                'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
              nullable: true,
            },
          },
        },
        {
          title: 'Doctor Profile',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '01234567-89ab-cdef-0123-456789abcdef',
            },
            email: { type: 'string', example: 'doctor@trya.com' },
            name: { type: 'string', example: 'Dr. Maria Santos' },
            role: { type: 'string', example: 'DOCTOR' },
            phone: {
              type: 'string',
              example: '+5511888888888',
              nullable: true,
            },
            active: { type: 'boolean', example: true },
            crm: { type: 'string', example: '123456-SP' },
            specialty: { type: 'string', example: 'Cardiologia' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            profilePictureUrl: {
              type: 'string',
              example:
                'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
              nullable: true,
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado no banco de dados.',
  })
  async getCurrentUser(
    @CurrentUser() user: JwtUser,
  ): Promise<ProfileResponseDto> {
    // O guard validou o JWT e extraiu o cognitoId
    // Buscamos os detalhes completos no banco de dados usando o cognitoId
    return this.getCurrentUserUseCase.executeDtoByCognitoId(user.cognitoId);
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description:
      'Atualiza os atributos do perfil do usuário autenticado baseado na role. ' +
      'ADMIN pode atualizar: name, phone. ' +
      'DOCTOR pode atualizar: name, phone, crm, specialty. ' +
      'Campos não permitidos para a role são ignorados silenciosamente. ' +
      'Email, role e outros campos imutáveis não podem ser alterados.',
  })
  @ApiBody({
    description:
      'Dados para atualização do perfil. Todos os campos são opcionais. ' +
      'ADMIN pode enviar name e phone. ' +
      'DOCTOR pode enviar name, phone, crm e specialty.',
    schema: {
      oneOf: [
        {
          title: 'Admin Update Request',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'João Silva Atualizado',
              description: 'Nome completo (mínimo 3 caracteres)',
            },
            phone: {
              type: 'string',
              example: '+5511988888888',
              description: 'Telefone no formato E.164',
            },
          },
        },
        {
          title: 'Doctor Update Request',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Dr. Maria Santos Atualizada',
              description: 'Nome completo (mínimo 3 caracteres)',
            },
            phone: {
              type: 'string',
              example: '+5511977777777',
              description: 'Telefone no formato E.164',
            },
            crm: {
              type: 'string',
              example: '654321-RJ',
              description: 'CRM do médico com UF',
            },
            specialty: {
              type: 'string',
              example: 'Neurologia',
              description: 'Especialidade médica',
            },
          },
        },
      ],
    },
    examples: {
      adminUpdate: {
        summary: 'Exemplo ADMIN - Atualizar nome e telefone',
        value: {
          name: 'João Silva Atualizado',
          phone: '+5511988888888',
        },
      },
      adminUpdateNameOnly: {
        summary: 'Exemplo ADMIN - Atualizar apenas nome',
        value: {
          name: 'João Silva Novo Nome',
        },
      },
      doctorUpdate: {
        summary: 'Exemplo DOCTOR - Atualizar todos os campos',
        value: {
          name: 'Dr. Maria Santos Atualizada',
          phone: '+5511977777777',
          crm: '654321-RJ',
          specialty: 'Neurologia',
        },
      },
      doctorUpdatePartial: {
        summary: 'Exemplo DOCTOR - Atualizar apenas CRM e especialidade',
        value: {
          crm: '789012-MG',
          specialty: 'Pediatria',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Perfil atualizado com sucesso. ' +
      'Para ADMIN: retorna apenas campos básicos. ' +
      'Para DOCTOR: retorna campos básicos + crm e specialty.',
    type: ProfileResponseDto,
    schema: {
      oneOf: [
        {
          title: 'Admin Profile Updated',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '01234567-89ab-cdef-0123-456789abcdef',
            },
            email: { type: 'string', example: 'admin@trya.com' },
            name: { type: 'string', example: 'João Silva Atualizado' },
            role: { type: 'string', example: 'ADMIN' },
            phone: {
              type: 'string',
              example: '+5511988888888',
              nullable: true,
            },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-02-12T10:30:00.000Z' },
            profilePictureUrl: {
              type: 'string',
              example:
                'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
              nullable: true,
            },
          },
        },
        {
          title: 'Doctor Profile Updated',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '01234567-89ab-cdef-0123-456789abcdef',
            },
            email: { type: 'string', example: 'doctor@trya.com' },
            name: { type: 'string', example: 'Dr. Maria Santos Atualizada' },
            role: { type: 'string', example: 'DOCTOR' },
            phone: {
              type: 'string',
              example: '+5511977777777',
              nullable: true,
            },
            active: { type: 'boolean', example: true },
            crm: { type: 'string', example: '654321-RJ' },
            specialty: { type: 'string', example: 'Neurologia' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-02-12T10:30:00.000Z' },
            profilePictureUrl: {
              type: 'string',
              example:
                'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
              nullable: true,
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro de validação nos dados fornecidos. ' +
      'Exemplos: nome muito curto (mínimo 3 caracteres), telefone em formato inválido (deve ser E.164).',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          example: [
            'Nome deve ter no mínimo 3 caracteres',
            'Telefone deve estar no formato E.164 (+5511999999999)',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado no banco de dados.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao atualizar perfil no banco de dados.',
  })
  async updateProfile(
    @AccessToken() accessToken: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<ProfileResponseDto> {
    // Usa cognitoId ao invés de email para buscar o usuário
    return this.updateProfileUseCase.execute(accessToken, user.cognitoId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Alterar senha do usuário autenticado',
    description:
      'Permite ao usuário autenticado alterar sua senha informando a senha atual e a nova senha.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 204,
    description: 'Senha alterada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Senha atual incorreta ou nova senha não atende aos requisitos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado.',
  })
  async changePassword(
    @AccessToken() accessToken: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.changePasswordUseCase.execute(accessToken, dto);
  }

  @Post('update-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar senha do usuário autenticado',
    description:
      'Permite ao usuário autenticado atualizar sua senha sem informar a senha atual (usa Admin API do Cognito).',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 204,
    description: 'Senha atualizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Nova senha não atende aos requisitos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado.',
  })
  async updatePassword(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdatePasswordDto,
  ): Promise<void> {
    await this.updatePasswordUseCase.execute(user.username, dto);
  }
}
