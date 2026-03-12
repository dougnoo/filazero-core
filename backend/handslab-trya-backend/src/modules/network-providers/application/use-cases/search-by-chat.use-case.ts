import { Injectable, Inject } from '@nestjs/common';
import { SPECIALTY_EXTRACTOR_TOKEN } from '../../domain/ports/specialty-extractor.interface';
import type { ISpecialtyExtractor } from '../../domain/ports/specialty-extractor.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider.repository.interface';
import type { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider-api.repository.interface';
import type { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import { SearchByChatDto } from '../dtos/search-by-chat.dto';
import { SearchByChatResponseDto } from '../dtos/search-by-chat-response.dto';

@Injectable()
export class SearchByChatUseCase {
  constructor(
    @Inject(SPECIALTY_EXTRACTOR_TOKEN)
    private readonly specialtyExtractor: ISpecialtyExtractor,
    @Inject(NETWORK_PROVIDER_REPOSITORY_TOKEN)
    private readonly networkProviderRepository: INetworkProviderRepository,
    @Inject(NETWORK_PROVIDER_API_REPOSITORY_TOKEN)
    private readonly networkProviderApiRepository: INetworkProviderApiRepository,
  ) {}

  async execute(
    userId: string,
    dto: SearchByChatDto,
  ): Promise<SearchByChatResponseDto> {
    // Validação básica
    if (!userId) {
      throw new Error('User ID is required');
    }

    // 1. Extrair especialidade da mensagem usando LLM
    const extractionResult = await this.specialtyExtractor.extractSpecialty(
      dto.message,
    );

    // Se não identificou especialidade, retorna mensagem da IA
    if (!extractionResult.specialty) {
      return {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        message: extractionResult.message,
        extractedSpecialty: undefined,
      };
    }

    // 2. Buscar provedor e plano do usuário
    const { providerName, planName } = 
      await this.networkProviderRepository.getProviderAndPlanNameByUserId(userId);

    // 3. Buscar prestadores próximos usando a especialidade extraída
    const searchResult = await this.networkProviderApiRepository.searchNearbyProviders({
      latitude: dto.latitude,
      longitude: dto.longitude,
      providerName,
      planName,
      searchText: extractionResult.specialty || undefined,
      distanceKm: 50, // 50km de raio por padrão
      page: 1,
      limit: 10, // Limitar a 10 resultados
    });

    // 4. Construir mensagem de resposta final
    const message = searchResult.count > 0
      ? `${extractionResult.message} Encontrei ${searchResult.count} locais próximos a você. Veja abaixo.`
      : `${extractionResult.message} Mas não encontrei prestadores próximos no momento.`;

    // 5. Retornar resposta no formato padrão
    return {
      data: searchResult.data,
      count: searchResult.count,
      pagination: searchResult.pagination,
      message,
      extractedSpecialty: extractionResult.specialty || undefined,
    };
  }
}
