import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Inject,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { SignInUseCase } from '../../application/use-cases/sign-in/sign-in.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { SignOutUseCase } from '../../application/use-cases/sign-out/sign-out.use-case';
import { CompleteNewPasswordUseCase } from '../../application/use-cases/complete-new-password/complete-new-password.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password/reset-password.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/verify-otp/verify-otp.use-case';
import { GetUserInfoUseCase } from '../../application/use-cases/get-user-info/get-user-info.use-case';
import { GetUserInfoByIdUseCase } from '../../application/use-cases/get-user-info/get-user-info-by-id.use-case';
import { VerifyCpfUseCase } from '../../application/use-cases/verify-cpf/verify-cpf.use-case';
import { VerifyBirthdateUseCase } from '../../application/use-cases/verify-birthdate/verify-birthdate.use-case';
import { CompleteRegistrationUseCase } from '../../application/use-cases/complete-registration/complete-registration.use-case';
import { SignInDto } from '../../application/use-cases/sign-in/sign-in.dto';
import { RefreshTokenDto } from '../../application/use-cases/refresh-token/refresh-token.dto';
import { CompleteNewPasswordDto } from '../../application/use-cases/complete-new-password/complete-new-password.dto';
import { ForgotPasswordDto } from '../../application/use-cases/forgot-password/forgot-password.dto';
import { ResetPasswordDto } from '../../application/use-cases/reset-password/reset-password.dto';
import { VerifyOtpDto } from '../../application/use-cases/verify-otp/verify-otp.dto';
import {
  VerifyCpfDto,
  VerifyCpfResponseDto,
} from '../../application/use-cases/verify-cpf/verify-cpf.dto';
import {
  VerifyBirthdateDto,
  VerifyBirthdateResponseDto,
} from '../../application/use-cases/verify-birthdate/verify-birthdate.dto';
import {
  CompleteRegistrationDto,
  CompleteRegistrationResponseDto,
} from '../../application/use-cases/complete-registration/complete-registration.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';
import { Roles } from 'src/shared/presentation';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../shared/domain/repositories/notification.repository.token';
import type { INotificationRepository } from '../../../../shared/domain/repositories/notification.repository.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly getUserInfoUseCase: GetUserInfoUseCase,
    private readonly getUserInfoByIdUseCase: GetUserInfoByIdUseCase,
    private readonly completeNewPasswordUseCase: CompleteNewPasswordUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    @Inject('VERIFY_CPF_USE_CASE')
    private readonly verifyCpfUseCase: VerifyCpfUseCase,
    @Inject('VERIFY_BIRTHDATE_USE_CASE')
    private readonly verifyBirthdateUseCase: VerifyBirthdateUseCase,
    @Inject('COMPLETE_REGISTRATION_USE_CASE')
    private readonly completeRegistrationUseCase: CompleteRegistrationUseCase,
  ) {}

  /**
   * Rota de login (mantida para compatibilidade com USER_PASSWORD_AUTH)
   * POST /auth/login
   *
   * Suporta multi-tenancy:
   * - Pode incluir tenantId no body para validação
   * - Pode incluir header X-Tenant-Id
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login com email e senha',
    description:
      'Autentica usuário com email e senha via AWS Cognito. Suporta multi-tenancy.',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    required: false,
    description: 'ID do tenant (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna tokens JWT.',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({
    status: 428,
    description:
      'Nova senha requerida (primeiro login). OTP enviado por email.',
  })
  async login(
    @Body() signInDto: SignInDto,
    @Headers('x-tenant-id') headerTenantId?: string,
  ) {
    console.log(
      '[AuthController.login] DTO recebido:',
      signInDto.email,
    );
    this.mergeTenantId(signInDto, headerTenantId);
    return await this.signInUseCase.execute(signInDto);
  }

  /**
   * Rota para completar mudança de senha obrigatória (first login)
   * POST /auth/complete-new-password
   *
   * Usado quando o usuário faz login pela primeira vez com senha temporária
   */
  @Public()
  @Post('complete-new-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar troca de senha obrigatória',
    description:
      'Completa o fluxo de primeira senha após receber OTP por email',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    required: false,
    description: 'ID do tenant (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso. Retorna tokens JWT.',
  })
  @ApiResponse({ status: 400, description: 'OTP inválido ou expirado' })
  @ApiResponse({ status: 401, description: 'Session inválida' })
  async completeNewPassword(
    @Body() completeNewPasswordDto: CompleteNewPasswordDto,
    @Headers('x-tenant-id') headerTenantId?: string,
  ) {
    this.mergeTenantId(completeNewPasswordDto, headerTenantId);
    return await this.completeNewPasswordUseCase.execute(
      completeNewPasswordDto,
    );
  }

  /**
   * Rota de refresh token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @Roles(UserRole.BENEFICIARY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Renova o access token usando um refresh token válido',
  })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  /**
   * Rota de logout
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout',
    description: 'Invalida o access token atual no Cognito',
  })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logout(@Headers('authorization') authorization: string) {
    const token = this.extractTokenFromHeader(authorization);
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }
    await this.signOutUseCase.execute(token);
  }

  /**
   * Rota para obter informações do usuário autenticado
   * GET /auth/me
   *
   * Retorna informações do usuário incluindo seu tenant
   */
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter informações do usuário',
    description: 'Retorna informações do usuário autenticado do banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário retornadas',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMe(@CurrentUser() user: User) {
    if (user.dbId) {
      return await this.getUserInfoByIdUseCase.execute(user.dbId);
    }

    return await this.getUserInfoUseCase.executeDto(user.email);
  }

  /**
   * Rota para solicitar redefinição de senha
   * POST /auth/forgot-password
   *
   * Envia um código de verificação por email para redefinir a senha
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description: 'Envia código de verificação por email para redefinir senha',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    required: false,
    description: 'ID do tenant (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Código de verificação enviado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Headers('x-tenant-id') headerTenantId?: string,
  ) {
    this.mergeTenantId(forgotPasswordDto, headerTenantId);
    return await this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  /**
   * Rota para confirmar redefinição de senha
   * POST /auth/reset-password
   *
   * Confirma a nova senha usando o código de verificação
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar redefinição de senha',
    description: 'Confirma nova senha usando código de verificação',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    required: false,
    description: 'ID do tenant (opcional)',
  })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Código de verificação inválido ou expirado',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('x-tenant-id') headerTenantId?: string,
  ) {
    this.mergeTenantId(resetPasswordDto, headerTenantId);
    return await this.resetPasswordUseCase.execute(resetPasswordDto);
  }

  /**
   * ONBOARDING - Etapa 1: Verificar CPF
   * POST /auth/onboard/verify-cpf
   */
  @Public()
  @Post('verify-cpf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar CPF para iniciar cadastro',
    description:
      'Verifica se o CPF existe e se o usuário pode prosseguir com o cadastro',
  })
  @ApiResponse({ status: 200, type: VerifyCpfResponseDto })
  @ApiResponse({
    status: 400,
    description: 'CPF inválido ou usuário já cadastrado',
  })
  async onboardVerifyCpf(
    @Body() dto: VerifyCpfDto,
  ): Promise<VerifyCpfResponseDto> {
    const result = await this.verifyCpfUseCase.execute(dto);
    return result;
  }

  /**
   * ONBOARDING - Etapa 2: Verificar data de nascimento
   * POST /auth/onboard/verify-birthdate
   */
  @Public()
  @Post('verify-birthdate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar data de nascimento',
    description: 'Valida a data de nascimento do usuário',
  })
  @ApiResponse({ status: 200, type: VerifyBirthdateResponseDto })
  @ApiResponse({ status: 400, description: 'Data inválida ou hash expirado' })
  async onboardVerifyBirthdate(
    @Body() dto: VerifyBirthdateDto,
  ): Promise<VerifyBirthdateResponseDto> {
    const result = await this.verifyBirthdateUseCase.execute(dto);
    return result;
  }

  /**
   * ONBOARDING - Etapa 3: Completar cadastro com email
   * POST /auth/onboard/complete-registration
   */
  @Public()
  @Post('complete-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar cadastro com email',
    description:
      'Finaliza o cadastro criando usuário no Cognito e enviando OTP',
  })
  @ApiResponse({ status: 200, type: CompleteRegistrationResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou hash expirado' })
  async onboardCompleteRegistration(
    @Body() dto: CompleteRegistrationDto,
  ): Promise<CompleteRegistrationResponseDto> {
    return await this.completeRegistrationUseCase.execute(dto);
  }

  /**
   * Rota para verificar se um OTP é válido (sem consumir)
   * POST /auth/verify-otp
   *
   * Verifica se o código OTP é válido sem consumi-lo
   */
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código OTP',
    description:
      'Verifica se um código OTP é válido sem consumi-lo. Opcionalmente especifica o tipo esperado para validação mais rigorosa.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP válido',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Código OTP válido' },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          example: '2023-10-23T15:00:00.000Z',
        },
        type: { type: 'string', example: 'FIRST_LOGIN' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP inválido, expirado ou tipo incorreto',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Código OTP inválido ou expirado' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.verifyOtpUseCase.execute(verifyOtpDto);
  }

  /**
   * Merge tenantId do header com o DTO
   * Se o header tiver tenantId mas o DTO não tiver, usa o do header
   */
  private mergeTenantId(
    dto: { tenantId?: string },
    headerTenantId?: string,
  ): void {
    if (headerTenantId && !dto.tenantId) {
      dto.tenantId = headerTenantId;
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  private extractTokenFromHeader(authorization: string): string | null {
    if (!authorization) {
      return null;
    }
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
