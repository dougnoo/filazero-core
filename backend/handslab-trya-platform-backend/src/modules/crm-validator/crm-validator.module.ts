import { Module } from '@nestjs/common';
import { CfmSoapClient } from './infrastructure/cfm-soap.client';
import { ValidarMedicoUseCase } from './application/use-cases/validar-medico.use-case';
import { ConsultarMedicoUseCase } from './application/use-cases/consultar-medico.use-case';
import { CrmValidatorController } from './presentation/crm-validator.controller';
import { CFM_CLIENT_TOKEN } from './domain/interfaces/cfm-client.interface';

@Module({
  imports: [],
  controllers: [CrmValidatorController],
  providers: [
    {
      provide: CFM_CLIENT_TOKEN,
      useClass: CfmSoapClient,
    },
    ValidarMedicoUseCase,
    ConsultarMedicoUseCase,
  ],
  exports: [ValidarMedicoUseCase, ConsultarMedicoUseCase],
})
export class CrmValidatorModule {}
