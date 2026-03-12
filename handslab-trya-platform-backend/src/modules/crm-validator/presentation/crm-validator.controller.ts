import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { ValidarMedicoUseCase, ValidarMedicoRequest } from '../application/use-cases/validar-medico.use-case';
import { ConsultarMedicoUseCase, ConsultarMedicoRequest } from '../application/use-cases/consultar-medico.use-case';
import { CfmValidationResult, CfmConsultaResponse } from '../domain/entities/cfm-validation-result.entity';
import { Public } from 'src/modules/auth/presentation/decorators/public.decorator';
import { ValidarMedicoResponseDto, ConsultarMedicoResponseDto, CFM_SITUACOES_MAP, CFM_SITUACOES_DETALHADAS_MAP, CFM_TIPO_INSCRICAO_MAP } from './dtos/cfm-response.dto';
import { ApiKeyGuard } from 'src/shared/presentation/guards/api-key.guard';

/**
 * DTO para validação de médico (entrada)
 */
export class ValidarMedicoDto {
  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsString()
  @IsNotEmpty()
  uf: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  dataNascimento: string; // DD/MM/YYYY
}

/**
 * DTO para consulta de médico (entrada)
 */
export class ConsultarMedicoDto {
  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsString()
  @IsNotEmpty()
  uf: string;
}

@Controller('crm-validator')
export class CrmValidatorController {
  constructor(
    private readonly validarMedicoUseCase: ValidarMedicoUseCase,
    private readonly consultarMedicoUseCase: ConsultarMedicoUseCase,
  ) {}

  /**
   * Valida dados de um médico contra o CFM
   * @param dto Dados para validação (CRM, UF, CPF, data de nascimento, chave CFM)
   * @returns ValidarMedicoResponseDto - Resultado da validação (true/false)
   */
  @Public()
  @Post('validate')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async validar(
    @Body() dto: ValidarMedicoDto,
  ): Promise<ValidarMedicoResponseDto> {
    const resultado = await this.validarMedicoUseCase.execute({
      crm: dto.crm,
      uf: dto.uf,
      cpf: dto.cpf,
      dataNascimento: dto.dataNascimento,
      chave: '',
    } as ValidarMedicoRequest);

    return {
      isValid: resultado.isValid,
      crm: resultado.crm,
      uf: resultado.uf,
      operationCode: resultado.codigoOperacao ?? 0,
      error: resultado.erro,
    };
  }

  /**
   * Consulta dados completos de um médico no CFM
   * @param dto Dados para consulta (CRM, UF, chave CFM)
   * @returns ConsultarMedicoResponseDto - Dados completos do médico
   */
  @Post('consult')
  @Public()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async consultar(
    @Body() dto: ConsultarMedicoDto,
  ): Promise<ConsultarMedicoResponseDto> {
    const resultado = await this.consultarMedicoUseCase.execute({
      crm: dto.crm,
      uf: dto.uf,
      chave: '',
    } as ConsultarMedicoRequest);

    return {
      isValid: resultado.isValid,
      crm: resultado.crm,
      uf: resultado.uf,
      name: resultado.nome,      
      situationDescription: CFM_SITUACOES_MAP[resultado.situacao] || resultado.situacao,
      situationDetailedDescription: CFM_SITUACOES_DETALHADAS_MAP[resultado.situacao] || 'Descrição não disponível',      
      registrationTypeDescription: CFM_TIPO_INSCRICAO_MAP[resultado.tipoInscricao] || resultado.tipoInscricao,      
      specialties: resultado.especialidades,      
      operationCode: resultado.codigoOperacao ?? 0,
      error: resultado.erro,
    };
  }
}
