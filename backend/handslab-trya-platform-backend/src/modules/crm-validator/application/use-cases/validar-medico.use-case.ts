import { Logger, Inject, Injectable } from '@nestjs/common';
import { CfmValidationResult } from '../../domain/entities/cfm-validation-result.entity';
import type { ICfmClient } from '../../domain/interfaces/cfm-client.interface';
import {
  IValidarMedicoRequest,
  CFM_CLIENT_TOKEN,
} from '../../domain/interfaces/cfm-client.interface';

/**
 * Use case para validar um médico contra o web service do CFM
 */
@Injectable()
export class ValidarMedicoUseCase {
  private readonly logger = new Logger(ValidarMedicoUseCase.name);

  constructor(
    @Inject(CFM_CLIENT_TOKEN) private cfmClient: ICfmClient,
  ) {}

  async execute(dto: ValidarMedicoRequest): Promise<CfmValidationResult> {
    this.logger.log(`Validando médico CRM: ${dto.crm}, UF: ${dto.uf}`);

    const resultado = await this.cfmClient.validarMedico({
      crm: dto.crm,
      uf: dto.uf,
      cpf: dto.cpf,
      dataNascimento: dto.dataNascimento,
      chave: dto.chave,
    });

    if (resultado.isValid) {
      this.logger.log(`Médico validado com sucesso: CRM ${dto.crm}`);
    } else {
      this.logger.warn(
        `Validação falhou para CRM ${dto.crm}: ${resultado.erro}`,
      );
    }

    return resultado;
  }
}

/**
 * DTO para execução do use case
 */
export interface ValidarMedicoRequest {
  crm: string;
  uf: string;
  cpf: string;
  dataNascimento: string; // DD/MM/YYYY
  chave: string;
}
