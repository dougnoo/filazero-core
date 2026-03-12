/**
 * Mapeamento oficial de situações de médicos conforme CFM
 * Fonte: CFM - Conselho Federal de Medicina
 * 
 * Cada código representa o status profissional do médico no registro
 */

export const CFM_SITUACOES_MAP: Record<string, string> = {
  A: 'Regular',
  B: 'Suspensão parcial permanente',
  C: 'Cassado',
  E: 'Inoperante',
  F: 'Falecido',
  G: 'Sem o exercício da profissão na UF',
  I: 'Interdição cautelar - total',
  J: 'Suspenso por ordem judicial - parcial',
  L: 'Cancelado',
  M: 'Suspensão total temporária',
  N: 'Interdição cautelar - parcial',
  O: 'Suspenso por ordem judicial - total',
  P: 'Aposentado',
  R: 'Suspensão temporária',
  S: 'Suspenso - total',
  T: 'Transferido',
  X: 'Suspenso - parcial',
};

/**
 * Mapeamento detalhado de situações de médicos conforme especificação oficial CFM
 */
export const CFM_SITUACOES_DETALHADAS_MAP: Record<string, string> = {
  A: 'Médico que está regularmente inscrito no Conselho Regional de Medicina e se encontra apto ao exercício da medicina.',
  B: 'Médico suspenso parcialmente de exercer determinada atividade médica por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  C: 'Médico apenado com cassação do exercício trabalhista em decorrência de processo ético-profissional (artigo 22, letra "e" da Lei 3.238/57) e, com sentença judicial transitada em julgado.',
  E: 'Médico que não recolhe anuidades há mais de cinco anos ou com paradeiro desconhecido.',
  F: 'Médico falecido.',
  G: 'Sem o exercício da profissão na UF.',
  I: 'Médico interditado para o exercício trabalhista por decisão administrativa do Conselho Regional/Federal de Medicina.',
  J: 'Médico suspenso parcialmente de exercer determinada atividade médica em decorrência de decisão judicial.',
  L: 'Médico que teve sua inscrição cancelada por não apresentar diploma médico no CRM no prazo de 120 dias ou a pedido próprio, em decorrência de viagem ao exterior ou encerramento da atividade profissional.',
  M: 'Médico suspenso do exercício da medicina por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  N: 'Médico interditado parcialmente de exercer determinada atividade médica em decorrência de decisão administrativa do Conselho Regional de Medicina.',
  O: 'Médico suspenso do exercício da medicina em decorrência de decisão judicial.',
  P: 'Médico com inscrição cancelada por aposentadoria.',
  R: 'Médico suspenso por tempo determinado, de até trinta dias, do exercício da medicina por ter sido apenado em processo ético-profissional (artigo 22, letra "d" da Lei 3.268/57).',
  S: 'Médico suspenso do exercício da medicina por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  T: 'Médico que solicitou transferência de Conselho Regional de Medicina (CRM) de seu estado de origem para outros estados.',
  X: 'Médico suspenso parcialmente de exercer determinada atividade médica por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
};

/**
 * Classificação de situações por risco/validade
 * Usado para determinar se a validação deve ser VALID, WARNING ou INVALID
 */
export const CFM_SITUATION_CLASSIFICATION: Record<
  string,
  'VALID' | 'WARNING' | 'INVALID'
> = {
  A: 'VALID', // Regular - OK
  B: 'WARNING', // Suspensão parcial permanente
  C: 'INVALID', // Cassado - não pode exercer
  E: 'INVALID', // Inoperante - situação suspeita
  F: 'INVALID', // Falecido
  G: 'INVALID', // Sem exercício na UF
  I: 'INVALID', // Interdição total
  J: 'WARNING', // Suspenso por ordem judicial - parcial
  L: 'INVALID', // Cancelado
  M: 'WARNING', // Suspensão total temporária
  N: 'WARNING', // Interdição parcial
  O: 'INVALID', // Suspenso por ordem judicial - total
  P: 'WARNING', // Aposentado - pode ou não estar ativo
  R: 'WARNING', // Suspensão temporária
  S: 'INVALID', // Suspenso - total
  T: 'WARNING', // Transferido - pode estar em transição
  X: 'WARNING', // Suspenso - parcial
};

/**
 * Obtém a situação descritiva a partir da resposta da API
 */
export function getDescricaoSituacao(
  situationDescription?: string,
): string {
  if (!situationDescription) return 'Descrição não disponível';

  // Tenta encontrar no mapa curto
  const chaveAbreVida = Object.keys(CFM_SITUACOES_MAP).find(
    (key) =>
      CFM_SITUACOES_MAP[key].toLowerCase() ===
      situationDescription.toLowerCase(),
  );

  if (chaveAbreVida) {
    return CFM_SITUACOES_DETALHADAS_MAP[chaveAbreVida] || situationDescription;
  }

  return situationDescription;
}

/**
 * Classifica a situação como válida, com ressalva ou inválida
 */
export function classificaSituacao(
  situationDescription?: string,
): 'VALID' | 'WARNING' | 'INVALID' {
  if (!situationDescription) return 'INVALID';

  // Tenta encontrar no mapa
  const chaveAbreVida = Object.keys(CFM_SITUACOES_MAP).find(
    (key) =>
      CFM_SITUACOES_MAP[key].toLowerCase() ===
      situationDescription.toLowerCase(),
  );

  return CFM_SITUATION_CLASSIFICATION[chaveAbreVida ?? 'A'] ?? 'INVALID';
}

/**
 * Valida se um CRM de determinada situação pode ser aceito
 */
export function isValidadoCFM(
  isValid: boolean,
  situationDescription?: string,
): boolean {
  if (!isValid) return false;

  const classification = classificaSituacao(situationDescription);
  return classification === 'VALID';
}

/**
 * Retorna emoji e ícone representativo da situação
 */
export function getEmojiSituacao(
  situationDescription?: string,
): { emoji: string; icone: string } {
  const classification = classificaSituacao(situationDescription);

  switch (classification) {
    case 'VALID':
      return { emoji: '✅', icone: 'check' };
    case 'WARNING':
      return { emoji: '⚠️', icone: 'warning' };
    case 'INVALID':
      return { emoji: '❌', icone: 'error' };
  }
}
