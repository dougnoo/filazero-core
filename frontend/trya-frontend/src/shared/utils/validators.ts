/**
 * Utilitários de validação
 */

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 * @param cpf - CPF com ou sem formatação
 * @returns true se CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se não é uma sequência repetida (111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;

  return true;
}

/**
 * Valida email usando regex
 * @param email - Email a ser validado
 * @returns true se email é válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos com DDD)
 * @param phone - Telefone com ou sem formatação
 * @returns true se telefone é válido
 */
export function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, "");
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return numbers.length === 10 || numbers.length === 11;
}

/**
 * Valida data de nascimento
 * @param date - Data no formato YYYY-MM-DD
 * @returns true se data é válida e não é futura
 */
export function validateBirthDate(date: string): boolean {
  if (!date) return false;
  
  const birthDateObj = new Date(date);
  const today = new Date();
  
  // Não pode ser futura
  if (birthDateObj > today) return false;
  
  return true;
}
