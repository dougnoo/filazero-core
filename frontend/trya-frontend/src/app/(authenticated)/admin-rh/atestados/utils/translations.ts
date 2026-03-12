/**
 * Traduções para os termos da análise de atestados
 */

export const analysisStatusTranslations: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

export const certificateStatusTranslations: Record<string, string> = {
  PENDING: 'Pendente',
  VIEWED: 'Visualizado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

export const validationResultTranslations: Record<string, string> = {
  VALID: 'Válido',
  WARNING: 'Atenção',
  INVALID: 'Inválido',
};

/**
 * Traduz o status da análise para português
 */
export const translateAnalysisStatus = (status: string): string => {
  return analysisStatusTranslations[status] || status;
};

/**
 * Traduz o resultado da validação para português
 */
export const translateValidationResult = (result: string): string => {
  return validationResultTranslations[result] || result;
};

/**
 * Traduz o status do atestado para português
 */
export const translateCertificateStatus = (status: string): string => {
  return certificateStatusTranslations[status] || status;
};

/**
 * Traduz a conclusão da IA substituindo termos em inglês
 */
export const translateConclusion = (conclusion: string): string => {
  if (!conclusion) return conclusion;
  
  return conclusion
    .replace(/\blegibility\b/gi, 'legibilidade')
    .replace(/\bauthenticity\b/gi, 'autenticidade')
    .replace(/\bsignature\b/gi, 'assinatura')
    .replace(/\bdate\b/gi, 'data')
    .replace(/\bCRM\b/g, 'CRM')
    .replace(/\bVALID\b/gi, 'VÁLIDO')
    .replace(/\bINVALID\b/gi, 'INVÁLIDO')
    .replace(/\bWARNING\b/gi, 'ATENÇÃO')
    .replace(/\bCOMPLETED\b/gi, 'CONCLUÍDO')
    .replace(/\bPENDING\b/gi, 'PENDENTE')
    .replace(/\bVIEWED\b/gi, 'VISUALIZADO')
    .replace(/\bPROCESSING\b/gi, 'PROCESSANDO')
    .replace(/\bFAILED\b/gi, 'FALHOU');
};
