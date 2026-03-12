/**
 * Domain Entity - Zelo Patient
 * Representa um paciente na plataforma Zelo Saúde
 */
export class ZeloPatient {
  // Campos obrigatórios
  name: string;
  cpf: string;

  // Campos opcionais
  email?: string;
  birthDate?: string; // Formato: YYYY-MM-DD
  phone?: string;
  insuranceCardNumber?: string;
  insurancePlanCode?: string;
  planAdherenceDate?: string; // Formato: YYYY-MM-DD
  planExpiryDate?: string; // Formato: YYYY-MM-DD

  // Campos customizados
  extraFields?: Record<string, any>;

  // Endereço
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };

  constructor(partial: Partial<ZeloPatient>) {
    Object.assign(this, partial);
  }

  /**
   * Valida se os campos obrigatórios estão presentes
   */
  validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Patient name is required');
    }
    if (!this.cpf || this.cpf.trim() === '') {
      throw new Error('Patient CPF is required');
    }
  }

  /**
   * Valida formato do CPF
   */
  isValidCpf(): boolean {
    const cleanCpf = this.cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  }
}
