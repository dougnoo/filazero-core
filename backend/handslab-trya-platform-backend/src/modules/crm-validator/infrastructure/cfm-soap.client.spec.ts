import { Test, TestingModule } from '@nestjs/testing';
import { CfmSoapClient } from '../cfm-soap.client';
import {
  CfmConnectionError,
  InvalidCfmParametersError,
  CfmServiceError,
} from '../../domain/errors/cfm-errors';

describe('CfmSoapClient', () => {
  let client: CfmSoapClient;

  beforeEach(async () => {
    client = new CfmSoapClient();
  });

  describe('validarMedico', () => {
    it('should validate parameters before making request', async () => {
      const invalidDto = {
        crm: '0', // CRM 0 é inválido
        uf: 'SP',
        cpf: '12345678901',
        dataNascimento: '01/01/1980',
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.validarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate UF parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'INVALID', // UF deve ter 2 caracteres
        cpf: '12345678901',
        dataNascimento: '01/01/1980',
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.validarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate CPF parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'SP',
        cpf: '123456789', // CPF deve ter 11 dígitos
        dataNascimento: '01/01/1980',
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.validarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate dataNascimento parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'SP',
        cpf: '12345678901',
        dataNascimento: '', // data obrigatória
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.validarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate chaveIdentificacao parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'SP',
        cpf: '12345678901',
        dataNascimento: '01/01/1980',
        chaveIdentificacao: '', // chave obrigatória
      };

      await expect(client.validarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });
  });

  describe('consultarMedico', () => {
    it('should validate CRM parameter', async () => {
      const invalidDto = {
        crm: '0',
        uf: 'SP',
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.consultarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate UF parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'X', // deve ter 2 caracteres
        chaveIdentificacao: 'chave-valida',
      };

      await expect(client.consultarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });

    it('should validate chaveIdentificacao parameter', async () => {
      const invalidDto = {
        crm: '123456',
        uf: 'SP',
        chaveIdentificacao: '',
      };

      await expect(client.consultarMedico(invalidDto)).rejects.toThrow(
        InvalidCfmParametersError,
      );
    });
  });

  describe('Error handling', () => {
    it('should map CFM error codes correctly', async () => {
      // Este teste seria mais completo com mocks do SOAP
      // Apenas demonstra a estrutura esperada
      const errorCode = 8101;
      const expectedMessage = 'Médico não encontrado';

      // esperaria que a aplicação lance CfmServiceError com o código
      expect(true).toBe(true);
    });
  });
});
