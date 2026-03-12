import { isValidCPF } from './is-cpf.validator';

describe('CPF Validator', () => {
  describe('isValidCPF', () => {
    it('deve validar CPF válido sem formatação', () => {
      expect(isValidCPF('12345678909')).toBe(true);
      expect(isValidCPF('11144477735')).toBe(true);
    });

    it('deve validar CPF válido com formatação', () => {
      expect(isValidCPF('123.456.789-09')).toBe(true);
      expect(isValidCPF('111.444.777-35')).toBe(true);
    });

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      expect(isValidCPF('11111111111')).toBe(false);
      expect(isValidCPF('22222222222')).toBe(false);
      expect(isValidCPF('00000000000')).toBe(false);
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(isValidCPF('123')).toBe(false);
      expect(isValidCPF('123456789')).toBe(false);
      expect(isValidCPF('123456789012')).toBe(false);
    });

    it('deve rejeitar CPF com dígitos verificadores inválidos', () => {
      expect(isValidCPF('12345678900')).toBe(false);
      expect(isValidCPF('11144477736')).toBe(false);
    });

    it('deve rejeitar valores vazios ou nulos', () => {
      expect(isValidCPF('')).toBe(false);
      expect(isValidCPF(null as any)).toBe(false);
      expect(isValidCPF(undefined as any)).toBe(false);
    });

    it('deve validar CPFs conhecidos como válidos', () => {
      // CPFs válidos gerados corretamente
      const validCPFs = [
        '52998224725',
        '52998224725',
        '111.444.777-35',
        '123.456.789-09',
        '529.982.247-25',
      ];

      validCPFs.forEach((cpf) => {
        expect(isValidCPF(cpf)).toBe(true);
      });
    });
  });
});
