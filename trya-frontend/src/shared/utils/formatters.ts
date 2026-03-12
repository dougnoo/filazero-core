/**
 * Utilitários de formatação e máscaras
 */

/**
 * Formata CPF com máscara ###.###.###-##
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9, 11)}`;
}

/**
 * Formata telefone brasileiro com máscara
 * Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
 * Formato: (##) ####-#### ou (##) #####-####
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

  // Telefone fixo (10 dígitos): (##) ####-####
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
      6,
      10
    )}`;
  }

  // Celular (11 dígitos): (##) #####-####
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
    7,
    11
  )}`;
}

/**
 * Remove formatação de CPF, retornando apenas números
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Remove formatação de telefone, retornando apenas números
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
