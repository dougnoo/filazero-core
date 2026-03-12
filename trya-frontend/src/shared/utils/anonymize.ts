/**
 * Utility functions for anonymizing sensitive data
 */

/**
 * Anonymize CPF keeping only last 5 digits visible
 * Example: 12345678901 -> ***.***. 789-01
 * 
 * @param cpf - CPF string (can be formatted or not)
 * @returns Anonymized CPF string
 */
export function anonymizeCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  
  // Remove all non-digit characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Apply anonymization pattern: ***.***. XXX-XX
  return cleanCPF.replace(/^\d{6}(\d{3})(\d{2})$/, '***.***.$1-$2');
}
