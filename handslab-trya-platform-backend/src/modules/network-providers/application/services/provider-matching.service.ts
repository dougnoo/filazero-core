import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderEntity } from '../../infrastructure/entities/provider.entity';

export interface MatchResult {
  providerId: string | null;
  providerName: string | null;
  confidence: number;
  matchMethod: 'exact' | 'fuzzy' | 'manual' | 'none';
  normalizedInput: string;
}

/**
 * Service para matching fuzzy de nomes de prestadores
 * Usa Levenshtein distance e normalização de texto
 */
@Injectable()
export class ProviderMatchingService {
  private readonly logger = new Logger(ProviderMatchingService.name);
  private readonly CONFIDENCE_THRESHOLD = 80; // Mínimo 80% de similaridade
  private readonly manualMappings: Map<string, string> = new Map();

  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
  ) {}

  /**
   * Encontra o provider correspondente ao nome raw do CSV
   * Usa cache de mapeamentos manuais e fuzzy matching
   */
  async findMatchingProvider(
    rawName: string,
    city?: string,
    state?: string,
  ): Promise<MatchResult> {
    // 1. Normaliza input
    const normalized = this.normalizeName(rawName);

    // 2. Verifica cache de mapeamentos manuais
    const manualMatch = this.manualMappings.get(normalized);
    if (manualMatch) {
      const provider = await this.providerRepository.findOne({
        where: { id: manualMatch },
      });
      if (provider) {
        return {
          providerId: provider.id,
          providerName: provider.name,
          confidence: 100,
          matchMethod: 'manual',
          normalizedInput: normalized,
        };
      }
    }

    // 3. Busca exata (case-insensitive)
    const exactMatch = await this.findExactMatch(normalized, city, state);
    if (exactMatch) {
      return {
        providerId: exactMatch.id,
        providerName: exactMatch.name,
        confidence: 100,
        matchMethod: 'exact',
        normalizedInput: normalized,
      };
    }

    // 4. Fuzzy matching
    const fuzzyMatch = await this.findFuzzyMatch(normalized, city, state);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    // 5. Sem match
    return {
      providerId: null,
      providerName: null,
      confidence: 0,
      matchMethod: 'none',
      normalizedInput: normalized,
    };
  }

  /**
   * Busca exata no banco (normalizado)
   */
  private async findExactMatch(
    normalizedName: string,
    city?: string,
    state?: string,
  ): Promise<ProviderEntity | null> {
    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .where('LOWER(REGEXP_REPLACE(provider.name, \'[^a-zA-Z0-9 ]\', \'\', \'g\')) = :name', {
        name: normalizedName.toLowerCase(),
      });

    // Filtro adicional por localização se disponível
    if (city) {
      queryBuilder
        .innerJoin('provider.location', 'location')
        .andWhere('LOWER(location.city) = :city', { city: city.toLowerCase() });
    }

    const result = await queryBuilder.getOne();
    return result;
  }

  /**
   * Busca fuzzy usando Levenshtein distance
   */
  private async findFuzzyMatch(
    normalizedName: string,
    city?: string,
    state?: string,
  ): Promise<MatchResult | null> {
    // Busca candidatos (providers na mesma cidade ou estado)
    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .innerJoin('provider.location', 'location')
      .select([
        'provider.id',
        'provider.name',
        'location.city',
        'location.state',
      ])
      .limit(500); // Limita para performance

    if (city) {
      queryBuilder.andWhere('LOWER(location.city) = :city', {
        city: city.toLowerCase(),
      });
    } else if (state) {
      queryBuilder.andWhere('location.state = :state', { state });
    }

    const candidates = await queryBuilder.getMany();

    // Calcula similaridade para cada candidato
    let bestMatch: MatchResult | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateNormalized = this.normalizeName(candidate.name);
      const similarity = this.calculateSimilarity(
        normalizedName,
        candidateNormalized,
      );

      if (similarity > bestScore && similarity >= this.CONFIDENCE_THRESHOLD) {
        bestScore = similarity;
        bestMatch = {
          providerId: candidate.id,
          providerName: candidate.name,
          confidence: Math.round(similarity * 100) / 100,
          matchMethod: 'fuzzy',
          normalizedInput: normalizedName,
        };
      }
    }

    if (bestMatch) {
      this.logger.log(
        `Fuzzy match: "${normalizedName}" -> "${bestMatch.providerName}" (${bestMatch.confidence}%)`,
      );
    }

    return bestMatch;
  }

  /**
   * Normaliza nome de prestador para comparação
   * Remove pontuação, acentos, palavras comuns, etc.
   */
  private normalizeName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .toUpperCase()
      .replace(/\bLTDA\b\.?/gi, '')
      .replace(/\bS\.A\b\.?/gi, '')
      .replace(/\bS\/A\b/gi, '')
      .replace(/\bME\b\.?/gi, '')
      .replace(/\bEIRELI\b\.?/gi, '')
      .replace(/\bDE MISERIC(?:ORDIA)?\b\.?/gi, 'MISERICORDIA')
      .replace(/\bMISERIC\b\.?/gi, 'MISERICORDIA')
      .replace(/\bHOSP(?:ITAL)?\b\.?/gi, 'HOSPITAL')
      .replace(/\bCENTRO MED(?:ICO)?\b\.?/gi, 'CENTRO MEDICO')
      .replace(/\bLAB(?:ORATORIO)?\b\.?/gi, 'LABORATORIO')
      .replace(/\bCLIN(?:ICA)?\b\.?/gi, 'CLINICA')
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Calcula similaridade usando Levenshtein distance
   * Retorna valor de 0 a 100
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 100;

    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, similarity);
  }

  /**
   * Implementação de Levenshtein distance (distância de edição)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Adiciona mapeamento manual (override)
   */
  addManualMapping(rawName: string, providerId: string): void {
    const normalized = this.normalizeName(rawName);
    this.manualMappings.set(normalized, providerId);
    this.logger.log(`Manual mapping added: ${rawName} -> ${providerId}`);
  }

  /**
   * Carrega mapeamentos manuais do banco (provider_name_mappings)
   */
  async loadManualMappings(): Promise<void> {
    // TODO: Implementar quando tabela provider_name_mappings tiver entity
    this.logger.log('Manual mappings loaded');
  }

  /**
   * Batch matching para múltiplos nomes
   */
  async batchMatch(
    names: Array<{ rawName: string; city?: string; state?: string }>,
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const { rawName, city, state } of names) {
      const match = await this.findMatchingProvider(rawName, city, state);
      results.push(match);
    }

    return results;
  }
}
