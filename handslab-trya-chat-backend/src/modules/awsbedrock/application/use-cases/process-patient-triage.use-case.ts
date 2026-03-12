import { Injectable, Logger } from '@nestjs/common';

interface TriageParams {
  [key: string]: string;
}

interface TriageResult {
  status: string;
  protocolo: string;
  classificacao: string;
  prioridade: string;
  tempo_espera: string;
}

/**
 * Use Case: Processar Triagem de Paciente
 * 
 * Responsabilidade: Realizar triagem médica baseada em sintomas
 * Camada: Application (Clean Architecture)
 * 
 * Princípios SOLID:
 * - SRP: Responsabilidade única de processar triagem
 * - OCP: Aberto para extensão (novos critérios de triagem)
 * - LSP: Pode ser substituído por implementações mais complexas
 * - ISP: Interface específica para triagem
 * - DIP: Depende de abstrações (poderia injetar serviço de triagem)
 */
@Injectable()
export class ProcessPatientTriageUseCase {
  private readonly logger = new Logger(ProcessPatientTriageUseCase.name);

  /**
   * Executa a triagem de paciente
   * 
   * @param params Parâmetros extraídos do Bedrock Agent
   * @returns Resultado da triagem com protocolo e classificação
   */
  async execute(params: TriageParams): Promise<TriageResult> {
    this.logger.log('🏥 Processando triagem de paciente');
    this.logger.debug('Parâmetros recebidos:', params);

    // Simular processamento de triagem médica
    // Em produção, isso poderia integrar com sistema de triagem real
    const triagem = {
      protocolo: `TRIAGE-${Date.now()}`,
      classificacao: this.determineClassification(params),
      prioridade: this.determinePriority(params),
      tempo_espera_estimado: this.estimateWaitingTime(params),
      recomendacoes: this.generateRecommendations(params),
      observacoes: this.generateObservations(params),
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`✅ Triagem concluída: ${triagem.protocolo} - ${triagem.classificacao}`);

    // Retornar resultado em formato simples para evitar problemas de serialização
    return {
      status: 'AGUARDANDO_MEDICO',
      protocolo: triagem.protocolo,
      classificacao: triagem.classificacao,
      prioridade: triagem.prioridade,
      tempo_espera: triagem.tempo_espera_estimado,
    };
  }

  /**
   * Determina a classificação de risco (Manchester Triage System)
   */
  private determineClassification(params: TriageParams): string {
    // Lógica simplificada - em produção, usar protocolo de triagem real
    const sintomas = this.extractSymptoms(params);

    // Verificar sintomas de alta prioridade
    if (this.hasEmergencySymptoms(sintomas)) {
      return 'VERMELHO'; // Emergência
    }

    if (this.hasUrgentSymptoms(sintomas)) {
      return 'AMARELO'; // Urgente
    }

    if (this.hasModerateSymptoms(sintomas)) {
      return 'VERDE'; // Pouco urgente
    }

    return 'AZUL'; // Não urgente
  }

  /**
   * Determina a prioridade de atendimento
   */
  private determinePriority(params: TriageParams): string {
    const classificacao = this.determineClassification(params);

    const priorityMap: Record<string, string> = {
      VERMELHO: 'CRÍTICA',
      AMARELO: 'ALTA',
      VERDE: 'MÉDIA',
      AZUL: 'BAIXA',
    };

    return priorityMap[classificacao] || 'BAIXA';
  }

  /**
   * Estima tempo de espera baseado na classificação
   */
  private estimateWaitingTime(params: TriageParams): string {
    const classificacao = this.determineClassification(params);

    const waitingTimeMap: Record<string, string> = {
      VERMELHO: 'Imediato',
      AMARELO: '10-30 minutos',
      VERDE: '30-60 minutos',
      AZUL: '60-120 minutos',
    };

    return waitingTimeMap[classificacao] || '60-120 minutos';
  }

  /**
   * Gera recomendações baseadas nos sintomas
   */
  private generateRecommendations(params: TriageParams): string[] {
    const classificacao = this.determineClassification(params);

    if (classificacao === 'VERMELHO') {
      return [
        'Atendimento médico imediato',
        'Monitoramento contínuo de sinais vitais',
        'Preparar para possível intervenção de emergência',
      ];
    }

    if (classificacao === 'AMARELO') {
      return [
        'Avaliação médica prioritária',
        'Monitoramento de sinais vitais',
        'Preparar exames complementares',
      ];
    }

    return [
      'Avaliação clínica de rotina',
      'Monitoramento de sinais vitais',
      'Investigação de sintomas reportados',
    ];
  }

  /**
   * Gera observações médicas
   */
  private generateObservations(params: TriageParams): string {
    const sintomas = this.extractSymptoms(params);
    const condicoes = this.extractConditions(params);

    let observacoes = 'Paciente apresenta: ' + sintomas.join(', ');

    if (condicoes.length > 0) {
      observacoes += '. Condições pré-existentes: ' + condicoes.join(', ');
    }

    return observacoes;
  }

  /**
   * Extrai sintomas dos parâmetros
   */
  private extractSymptoms(params: TriageParams): string[] {
    const sintomas: string[] = [];

    // Extrair sintomas comuns
    if (params.dor) sintomas.push(`dor (${params.dor})`);
    if (params.febre) sintomas.push('febre');
    if (params.tosse) sintomas.push('tosse');
    if (params.falta_ar) sintomas.push('falta de ar');
    if (params.cefaleia) sintomas.push('cefaleia');
    if (params.nausea) sintomas.push('náusea');
    if (params.vomito) sintomas.push('vômito');

    // Sintoma genérico
    if (params.sintoma) sintomas.push(params.sintoma);
    if (params.sintomas) sintomas.push(params.sintomas);

    return sintomas.length > 0 ? sintomas : ['sintomas não especificados'];
  }

  /**
   * Extrai condições pré-existentes
   */
  private extractConditions(params: TriageParams): string[] {
    const condicoes: string[] = [];

    if (params.diabetes) condicoes.push('diabetes');
    if (params.hipertensao) condicoes.push('hipertensão');
    if (params.cardiopatia) condicoes.push('cardiopatia');
    if (params.asma) condicoes.push('asma');
    if (params.condicao) condicoes.push(params.condicao);

    return condicoes;
  }

  /**
   * Verifica sintomas de emergência
   */
  private hasEmergencySymptoms(sintomas: string[]): boolean {
    const emergencyKeywords = [
      'dor no peito',
      'dificuldade respiratória severa',
      'perda de consciência',
      'convulsão',
      'hemorragia severa',
      'queimadura grave',
      'trauma craniano',
    ];

    return sintomas.some((s) => emergencyKeywords.some((k) => s.toLowerCase().includes(k.toLowerCase())));
  }

  /**
   * Verifica sintomas urgentes
   */
  private hasUrgentSymptoms(sintomas: string[]): boolean {
    const urgentKeywords = ['febre alta', 'vômito persistente', 'dor intensa', 'falta de ar'];

    return sintomas.some((s) => urgentKeywords.some((k) => s.toLowerCase().includes(k.toLowerCase())));
  }

  /**
   * Verifica sintomas moderados
   */
  private hasModerateSymptoms(sintomas: string[]): boolean {
    const moderateKeywords = ['febre', 'tosse', 'cefaleia', 'dor leve', 'náusea'];

    return sintomas.some((s) => moderateKeywords.some((k) => s.toLowerCase().includes(k.toLowerCase())));
  }
}

