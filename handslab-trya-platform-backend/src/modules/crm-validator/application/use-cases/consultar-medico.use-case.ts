import { Logger, Inject, Injectable } from '@nestjs/common';
import { CfmConsultaResponse } from '../../domain/entities/cfm-validation-result.entity';
import type { ICfmClient } from '../../domain/interfaces/cfm-client.interface';
import {
  IConsultarMedicoRequest,
  CFM_CLIENT_TOKEN,
} from '../../domain/interfaces/cfm-client.interface';

/**
 * Use case para consultar dados de um médico no web service do CFM
 */
@Injectable()
export class ConsultarMedicoUseCase {
  private readonly logger = new Logger(ConsultarMedicoUseCase.name);

  constructor(
    @Inject(CFM_CLIENT_TOKEN) private cfmClient: ICfmClient,
  ) {}

  async execute(dto: ConsultarMedicoRequest): Promise<CfmConsultaResponse> {
    this.logger.log(`Consultando médico CRM: ${dto.crm}, UF: ${dto.uf}`);

    const resultado = await this.cfmClient.consultarMedico({
      crm: dto.crm,
      uf: dto.uf,
      chave: dto.chave,
    });

    if (resultado.isValid) {
      this.logger.log(
        `Médico encontrado: ${resultado.nome} (CRM ${dto.crm}) - Estado: ${resultado.uf}`,
      );
    } else {
      this.logger.warn(`Médico não encontrado/valido: CRM ${dto.crm}`);
    }

    return resultado;
  }
}

/**
 * DTO para execução do use case
 */
export interface ConsultarMedicoRequest {
  crm: string;
  uf: string;
  chave: string;
}
