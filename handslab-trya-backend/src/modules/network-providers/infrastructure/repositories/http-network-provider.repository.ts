import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import {
  GetProvidersByFiltersParams,
  ProviderListResponse,
  NearbyProviderListResponse,
  SearchNearbyProvidersParams,
} from '../../domain/types/providers';

@Injectable()
export class HttpNetworkProviderRepository
  implements INetworkProviderApiRepository
{
  private readonly logger = new Logger(HttpNetworkProviderRepository.name);
  private readonly baseUrl: string;
  private readonly apiPlatformKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiUrl = this.configService.get<string>('app.tryaPlatform.apiUrl');
    const apiKey = this.configService.get<string>('app.tryaPlatform.apiKey');
    this.apiPlatformKey = apiKey || '';
    if (!apiUrl) {
      throw new Error('API URL is not defined in configuration');
    }
    this.baseUrl = apiUrl;
  }

  async getStatesByProvider(providerName: string, planName?: string): Promise<string[]> {
    try {
      this.logger.log(
        `[getStatesByProvider] Fetching states for provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/states`;
      const response = await firstValueFrom(
        this.httpService.get<{ data: string[] }>(url, {
          params: {
            providerName,
            ...(planName && { planName }),
          },
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
        }),
      );

      const states = response.data.data;

      this.logger.log(
        `[getStatesByProvider] Found ${states.length} states for provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      return states;
    } catch (error) {
      this.logger.error(
        `[getStatesByProvider] Error fetching states for provider ${providerName}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch states for provider: ${providerName}`);
    }
  }

  async getMunicipalitiesByState(state: string, providerName: string, planName?: string): Promise<string[]> {
    try {
      this.logger.log(
        `[getMunicipalitiesByState] Fetching municipalities for state: ${state}, provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/states/${state}/cities`;
      const response = await firstValueFrom(
        this.httpService.get<{ data: string[] }>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            providerName,
            planName
          },
        }),
      );

      const municipalities = response.data.data;

      this.logger.log(
        `[getMunicipalitiesByState] Found ${municipalities.length} municipalities for state: ${state}, provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      return municipalities;
    } catch (error) {
      this.logger.error(
        `[getMunicipalitiesByState] Error fetching municipalities for state ${state}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch municipalities for state: ${state}`);
    }
  }

  async getNeighborhoodsByMunicipality(state: string, municipality: string, providerName: string, planName?: string): Promise<string[]> {
    try {
      this.logger.log(
        `[getNeighborhoodsByMunicipality] Fetching neighborhoods for state: ${state}, municipality: ${municipality}, provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/states/${state}/cities/${municipality}/neighborhoods`;
      const response = await firstValueFrom(
        this.httpService.get<{ data: string[] }>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            providerName,
            planName
          },
        }),
      );

      const neighborhoods = response.data.data;

      this.logger.log(
        `[getNeighborhoodsByMunicipality] Found ${neighborhoods.length} neighborhoods for state: ${state}, municipality: ${municipality}, provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      return neighborhoods;
    } catch (error) {
      this.logger.error(
        `[getNeighborhoodsByMunicipality] Error fetching neighborhoods for state ${state}, municipality ${municipality}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch neighborhoods for state: ${state}, municipality: ${municipality}`);
    }
  }

  async getCategoriesByProvider(
    providerName: string,
    state: string,
    city: string,
    neighborhood?: string,
    planName?: string,
  ): Promise<string[]> {
    try {
      this.logger.log(
        `[getCategoriesByProvider] Fetching categories for provider: ${providerName}, state: ${state}, city: ${city}${planName ? `, plan: ${planName}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/categories`;
      const response = await firstValueFrom(
        this.httpService.get<{ data: string[] }>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            providerName,
            state,
            city,
            neighborhood,
            planName,
          },
        }),
      );

      const categories = response.data.data;

      this.logger.log(
        `[getCategoriesByProvider] Found ${categories.length} categories for provider: ${providerName}, state: ${state}, city: ${city}${planName ? `, plan: ${planName}` : ''}`,
      );

      return categories;
    } catch (error) {
      this.logger.error(
        `[getCategoriesByProvider] Error fetching categories for provider ${providerName}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch categories for provider: ${providerName}`);
    }
  }

  async getSpecialtiesByFilters(
    providerName: string,
    state: string,
    city: string,
    neighborhood?: string,
    category?: string,
    planName?: string,
  ): Promise<string[]> {
    try {
      this.logger.log(
        `[getSpecialtiesByFilters] Fetching specialties provider: ${providerName}, state: ${state}, city: ${city}${neighborhood ? `, neighborhood: ${neighborhood}` : ''}${category ? `, category: ${category}` : ''}${planName ? `, plan: ${planName}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/specialties`;
      const response = await firstValueFrom(
        this.httpService.get<{ data: string[] }>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            providerName,
            state,
            city,
            neighborhood,
            category,
            planName
          },
        }),
      );

      const specialties = response.data.data;

      this.logger.log(
        `[getSpecialtiesByFilters] Found ${specialties.length} specialties for provider: ${providerName}, state: ${state}, city: ${city}${planName ? `, plan: ${planName}` : ''}`,
      );

      return specialties;
    } catch (error) {
      this.logger.error(
        `[getSpecialtiesByFilters] Error fetching specialties for provider ${providerName}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch specialties for provider: ${providerName}`);
    }
  }

  async getProvidersByFilters(params: GetProvidersByFiltersParams): Promise<ProviderListResponse> {
    const { providerName, state, city, category, specialty, neighborhood, page, limit, planName } = params;
    try {
      this.logger.log(
        `[getProvidersByFilters] Fetching providers provider: ${providerName}, state: ${state}, city: ${city}${category ? `, category: ${category}` : ''}${specialty ? `, specialty: ${specialty}` : ''}${neighborhood ? `, neighborhood: ${neighborhood}` : ''}${planName ? `, plan: ${planName}` : ''}${page ? `, page: ${page}` : ''}${limit ? `, limit: ${limit}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/providers`;
      const response = await firstValueFrom(
        this.httpService.get<ProviderListResponse>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            //providerName,
            state,
            city,
            category,
            specialty,
            neighborhood,
            planName,
            page,
            limit,
          },
        }),
      );

      this.logger.log(
        `[getProvidersByFilters] Found ${response.data?.data?.length ?? 0} providers for provider: ${providerName}${planName ? `, plan: ${planName}` : ''}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `[getProvidersByFilters] Error fetching providers for provider ${providerName}:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch providers for provider: ${providerName}`);
    }
  }

  async searchNearbyProviders(params: SearchNearbyProvidersParams): Promise<NearbyProviderListResponse> {
    const { latitude, longitude, providerName, searchText, distanceKm, page, limit, planName } = params;
    try {
      this.logger.log(
        `[searchNearbyProviders] Fetching nearby providers with latitude: ${latitude}, longitude: ${longitude}, provider: ${providerName}${planName ? `, plan: ${planName}` : ''}${searchText ? `, searchText: ${searchText}` : ''}${distanceKm ? `, distanceKm: ${distanceKm}` : ''}`,
      );

      const url = `${this.baseUrl}/api/network-providers/providers/search/nearby`;
      const response = await firstValueFrom(
        this.httpService.get<NearbyProviderListResponse>(url, {
          headers: {
            'x-api-key': this.apiPlatformKey,
          },
          params: {
            latitude,
            longitude,
            providerName,
            planName,
            searchText,
            distanceKm,
            page: page || 1,
            limit: limit || 10,
          },
        }),
      );

      this.logger.log(
        `[searchNearbyProviders] Found ${response.data?.count ?? 0} nearby providers`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `[searchNearbyProviders] Error fetching nearby providers:`,
        error.response?.data || error.message,
      );
      throw new Error(`Failed to fetch nearby providers`);
    }
  }
}
